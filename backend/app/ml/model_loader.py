"""
DermaNova Model Loader & Lifecycle Manager
===========================================
Responsible for:
1. Safe checkpoint loading with weights_only=True
2. Strict state-dict verification against DermaNovaMultiTaskModel
3. Device selection (CPU or CUDA) with graceful fallback
4. Model warm-up and output verification (finite values, expected dimensions)
5. Singleton worker lifecycle (loaded once at startup)
"""

import os
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from pathlib import Path

try:
    import torch
    HAS_TORCH = True
except ImportError:
    torch = None
    HAS_TORCH = False

from backend.app.ml.model_factory import create_dermanova_model, DermaNovaMultiTaskModel
from backend.app.ml.class_mapping import CHECKPOINT_CLASS_NAMES, DERMANOVA_CONDITION_KEYS

logger = logging.getLogger("dermanova.ml.model_loader")


class ModelLoader:
    """Manages the lifecycle, loading, device placement, and warm-up of the PyTorch model."""

    def __init__(self, checkpoint_path: Optional[str] = None, preferred_device: str = "auto"):
        self.root_dir = Path(__file__).resolve().parent.parent.parent.parent
        self.checkpoint_path = (
            Path(checkpoint_path)
            if checkpoint_path
            else self.root_dir / "ml_pipeline" / "models" / "saved_models" / "dermanova_best_weights.pth"
        )
        self.preferred_device = preferred_device
        self.has_torch = HAS_TORCH
        self.device = self._resolve_device(preferred_device) if HAS_TORCH else "cpu"

        self.model: Optional[Any] = None
        self.checkpoint_metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        self.model_version: str = "2.0.0-efficientnet-b0"

    def _resolve_device(self, preferred: str) -> Any:
        if not HAS_TORCH or torch is None:
            return "cpu"
        pref = preferred.lower()
        if pref == "cuda" and torch.cuda.is_available():
            dev = torch.device("cuda")
            logger.info(f"Using CUDA device: {torch.cuda.get_device_name(0)}")
            return dev
        elif pref == "cpu":
            return torch.device("cpu")
        # Auto selection
        if torch.cuda.is_available():
            dev = torch.device("cuda")
            logger.info(f"Auto-selected CUDA device: {torch.cuda.get_device_name(0)}")
            return dev
        return torch.device("cpu")

    def load(self) -> Optional[Any]:
        """
        Loads the trained PyTorch checkpoint using weights_only=True and strict=True.
        Performs a warm-up inference pass and verifies output shapes.
        """
        if not HAS_TORCH or torch is None:
            logger.info("PyTorch is not installed in this environment; skipping PyTorch checkpoint load (ONNX Runtime active).")
            self.load_error = "PyTorch not installed"
            self.is_loaded = False
            return None

        if self.is_loaded and self.model is not None:
            return self.model

        if not self.checkpoint_path.exists():
            msg = f"Model checkpoint not found at path: {self.checkpoint_path}"
            self.load_error = msg
            logger.error(msg)
            raise FileNotFoundError(msg)

        try:
            logger.info(f"Loading DermaNova checkpoint from {self.checkpoint_path} using weights_only=True...")
            # Safe checkpoint deserialization
            checkpoint = torch.load(
                self.checkpoint_path,
                map_location=self.device,
                weights_only=True
            )

            if not isinstance(checkpoint, dict) or "model_state_dict" not in checkpoint:
                raise ValueError("Checkpoint file is missing 'model_state_dict' key.")

            # Extract metadata
            self.checkpoint_metadata = {
                "epoch": checkpoint.get("epoch"),
                "backbone": checkpoint.get("backbone", "efficientnet_b0"),
                "conditions": checkpoint.get("conditions", CHECKPOINT_CLASS_NAMES),
                "metrics": checkpoint.get("metrics", {})
            }

            # Instantiate architecture
            model = create_dermanova_model(
                num_conditions=len(DERMANOVA_CONDITION_KEYS),
                num_severity_grades=3,
                num_skin_types=5,
                backbone_name=self.checkpoint_metadata["backbone"],
                pretrained=False
            )

            # Strict state dictionary loading
            model.load_state_dict(checkpoint["model_state_dict"], strict=True)
            model.to(self.device)
            model.eval()

            # Warm-up pass & verification
            self._warmup_and_verify(model)

            self.model = model
            self.is_loaded = True
            self.load_error = None
            logger.info(
                f"DermaNova model successfully loaded and verified on device: {self.device}. "
                f"Trained epoch: {self.checkpoint_metadata.get('epoch')}"
            )
            return self.model

        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            logger.error(f"Failed to load PyTorch model checkpoint: {e}", exc_info=True)
            raise RuntimeError(f"DermaNova model initialization failed: {e}") from e

    def _warmup_and_verify(self, model: DermaNovaMultiTaskModel):
        """Warm-up pass: ensures model executes and produces valid, finite tensors of expected shape."""
        with torch.inference_mode():
            dummy_input = torch.zeros((1, 3, 224, 224), dtype=torch.float32, device=self.device)
            logits_cond, logits_sev, logits_type = model(dummy_input)

            # Dimension checks
            if logits_cond.shape != (1, 8):
                raise ValueError(f"Condition logits shape mismatch. Expected (1, 8), got {logits_cond.shape}")
            if logits_sev.shape != (1, 3):
                raise ValueError(f"Severity logits shape mismatch. Expected (1, 3), got {logits_sev.shape}")
            if logits_type.shape != (1, 5):
                raise ValueError(f"Skin type logits shape mismatch. Expected (1, 5), got {logits_type.shape}")

            # Finite checks
            if not torch.isfinite(logits_cond).all():
                raise ValueError("Condition logits contain non-finite values (NaN or Inf).")
            if not torch.isfinite(logits_sev).all():
                raise ValueError("Severity logits contain non-finite values (NaN or Inf).")
            if not torch.isfinite(logits_type).all():
                raise ValueError("Skin type logits contain non-finite values (NaN or Inf).")

    def get_info(self) -> Dict[str, Any]:
        """Safe metadata for public/client inspection."""
        from ml_pipeline.inference.predictor import predictor_service
        is_ready = self.is_loaded or getattr(predictor_service, "is_model_loaded", False)
        active_arch = self.checkpoint_metadata.get("backbone", "efficientnet_b0") if self.is_loaded else "efficientnet_b0 (ONNX Runtime)"
        return {
            "model_name": "DermaNova Multi-Task EfficientNet" if self.is_loaded else "DermaNova Multi-Task EfficientNet (ONNX)",
            "model_version": self.model_version,
            "architecture": active_arch,
            "input_resolution": [224, 224],
            "device": str(self.device) if self.is_loaded else "cpu",
            "is_ready": is_ready,
            "supported_conditions": DERMANOVA_CONDITION_KEYS,
            "severity_grades": ["Mild", "Moderate", "Severe"],
            "skin_types": ["Normal", "Oily", "Dry", "Combination", "Sensitive"],
            "load_error": None if is_ready else (self.load_error or "No model weights loaded")
        }


# Global singleton instance
model_loader = ModelLoader()
