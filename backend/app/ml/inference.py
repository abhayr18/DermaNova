"""
DermaNova Neural Inference Engine
===================================
Executes PyTorch forward pass, verifies outputs, applies sigmoid for multi-label condition heads,
and extracts Grad-CAM saliency heatmaps.
"""

from __future__ import annotations
import logging
from typing import Dict, Any, Tuple, Optional, Union
import numpy as np
from PIL import Image

try:
    import torch
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    torch = None
    F = None
    HAS_TORCH = False

from backend.app.ml.model_loader import model_loader, ModelLoader
from backend.app.ml.class_mapping import (
    DERMANOVA_CONDITION_KEYS,
    INDEX_TO_CONDITION_KEY,
    INDEX_TO_SEVERITY,
    INDEX_TO_SKIN_TYPE,
    SeverityLevelEnum,
    SkinTypeEnum
)

logger = logging.getLogger("dermanova.ml.inference")


class InferenceEngine:
    """Handles raw tensor inference and multi-task output decoding."""

    def __init__(self, loader: Optional[ModelLoader] = None):
        self.loader = loader or model_loader

    def predict_tensor(
        self,
        input_tensor: Any,
        compute_gradcam: bool = True
    ) -> Dict[str, Any]:
        """
        Executes inference on a preprocessed image tensor (1, 3, 224, 224).
        Falls back to ONNX Runtime if PyTorch is not installed in the environment.
        """
        if not HAS_TORCH or torch is None:
            logger.info("PyTorch is not available; routing tensor inference to ONNX Runtime Engine.")
            from ml_pipeline.inference.predictor import predictor_service
            if isinstance(input_tensor, np.ndarray):
                arr = input_tensor
            else:
                arr = np.array(input_tensor)
            if arr.ndim == 4:
                arr = arr.squeeze(0)
            if arr.shape[0] == 3 and arr.shape[1] == 224:
                arr = np.transpose(arr, (1, 2, 0))
            pil_img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
            pred = predictor_service.predict(pil_img)
            cond_map = {k: v.probability for k, v in pred.conditions.items()}
            return {
                "condition_probabilities": cond_map,
                "severity_grade": pred.severity_grade.value if hasattr(pred.severity_grade, "value") else str(pred.severity_grade),
                "skin_type": pred.detected_skin_type.value if hasattr(pred.detected_skin_type, "value") else str(pred.detected_skin_type),
                "saliency_map": None,
                "model_version": pred.model_version
            }
        if not self.loader.is_loaded:
            # Attempt lazy load
            self.loader.load()

        model = self.loader.model
        device = self.loader.device

        if model is None:
            raise RuntimeError("Model is not initialized.")

        # Ensure tensor is on device and has batch dimension
        if input_tensor.dim() == 3:
            input_tensor = input_tensor.unsqueeze(0)

        if input_tensor.shape[1:] != (3, 256, 256) and input_tensor.shape[1:] != (3, 224, 224):
            raise ValueError(
                f"Expected input tensor of shape (1, 3, 256, 256), got {input_tensor.shape}"
            )

        tensor_device = input_tensor.to(device)

        # 1. Forward pass
        with torch.no_grad():
            logits_cond, logits_sev, logits_type = model(tensor_device)

            # Validate finite values
            if not torch.isfinite(logits_cond).all():
                raise RuntimeError("Non-finite logits detected in condition head.")
            if not torch.isfinite(logits_sev).all():
                raise RuntimeError("Non-finite logits detected in severity head.")
            if not torch.isfinite(logits_type).all():
                raise RuntimeError("Non-finite logits detected in skin type head.")

            # Decode condition probabilities (Multi-label sigmoid)
            probs_cond = torch.sigmoid(logits_cond).squeeze(0).cpu().numpy()

            # Decode severity grade
            acne_prob = float(probs_cond[0])
            if acne_prob < 0.65:
                # If acne is below calibrated detection threshold, clinical grade is Clear / Minimal
                sev_grade = SeverityLevelEnum.CLEAR
                sev_idx = 0
            elif logits_sev.shape[1] == 2:
                # Ordinal cumulative 2-logit severity decoding
                p_gt_mild = float(torch.sigmoid(logits_sev[0, 0]).item())
                p_gt_mod = float(torch.sigmoid(logits_sev[0, 1]).item())
                if p_gt_mod >= 0.50:
                    sev_grade = SeverityLevelEnum.SEVERE
                    sev_idx = 2
                elif p_gt_mild >= 0.50:
                    sev_grade = SeverityLevelEnum.MODERATE
                    sev_idx = 1
                else:
                    sev_grade = SeverityLevelEnum.MILD
                    sev_idx = 0
            else:
                sev_idx = int(torch.argmax(logits_sev, dim=1).item())
                sev_grade = INDEX_TO_SEVERITY.get(sev_idx, SeverityLevelEnum.MILD)

            # Decode skin type (5 classes: Normal, Oily, Dry, Combination, Sensitive)
            type_probs = F.softmax(logits_type, dim=1).squeeze(0).cpu().numpy()
            type_idx = int(torch.argmax(logits_type, dim=1).item())
            skin_type = INDEX_TO_SKIN_TYPE.get(type_idx, SkinTypeEnum.NORMAL)

        condition_scores: Dict[str, float] = {}
        for idx, key in enumerate(DERMANOVA_CONDITION_KEYS):
            condition_scores[key] = float(probs_cond[idx])

        # 2. Authentic Grad-CAM Saliency Map
        saliency_map: Optional[np.ndarray] = None
        if compute_gradcam:
            saliency_map = self._compute_gradcam(model, tensor_device, condition_scores)

        return {
            "condition_probabilities": condition_scores,
            "severity_index": sev_idx,
            "severity_grade": sev_grade,
            "skin_type_index": type_idx,
            "skin_type": skin_type,
            "skin_type_probabilities": [float(p) for p in type_probs],
            "saliency_map": saliency_map,
            "model_version": self.loader.model_version
        }

    def _compute_gradcam(
        self,
        model: Any,
        tensor_device: Any,
        condition_scores: Dict[str, float]
    ) -> Optional[np.ndarray]:
        """Compute backward gradients on top predicted condition for authentic spatial saliency."""
        try:
            # Find top condition index
            top_key = max(condition_scores, key=condition_scores.get)
            top_idx = DERMANOVA_CONDITION_KEYS.index(top_key)

            # Requires autograd for backward pass
            tensor_clone = tensor_device.clone().detach().requires_grad_(True)
            model.zero_grad()
            logits_c, _, _ = model(tensor_clone)
            target_score = logits_c[0, top_idx]
            target_score.backward()

            cam = model.get_gradcam_weights()
            if cam is not None:
                cam_np = cam.cpu().numpy()
                cam_np = np.maximum(cam_np, 0)
                denom = np.max(cam_np) - np.min(cam_np)
                if denom > 1e-6:
                    cam_np = (cam_np - np.min(cam_np)) / denom
                return np.clip(cam_np, 0.0, 1.0)
        except Exception as e:
            logger.warning(f"Grad-CAM generation notice: {e}")
        return None


# Global inference instance
inference_engine = InferenceEngine()
