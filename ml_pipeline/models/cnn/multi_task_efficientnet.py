"""
DermaNova Multi-Task Deep Learning Model Architecture.
Supports:
1. 8-class Multi-Label Dermatological Condition Diagnosis
2. 3-grade Ordinal Severity Grading (Mild, Moderate, Severe)
3. 5-class Biophysical Skin-Type Classification (Normal, Oily, Dry, Combination, Sensitive)
4. Saliency feature extraction hooks for Grad-CAM spatial heatmap rendering
"""
from typing import Dict, Tuple, Optional

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    import torchvision.models as models
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


if HAS_TORCH:
    class DermaNovaMultiTaskModel(nn.Module):
        def __init__(
            self,
            num_conditions: int = 8,
            num_severity_grades: int = 3,
            num_skin_types: int = 5,
            backbone_name: str = "efficientnet_b0",
            pretrained: bool = True
        ):
            super().__init__()
            self.num_conditions = num_conditions
            self.num_severity_grades = num_severity_grades
            self.num_skin_types = num_skin_types
            
            # 1. Feature Extractor Backbone
            if backbone_name == "efficientnet_b0":
                weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
                base_model = models.efficientnet_b0(weights=weights)
                self.features = base_model.features
                in_features = base_model.classifier[1].in_features  # 1280
            elif backbone_name == "resnet50":
                weights = models.ResNet50_Weights.DEFAULT if pretrained else None
                base_model = models.resnet50(weights=weights)
                self.features = nn.Sequential(*list(base_model.children())[:-2])
                in_features = base_model.fc.in_features
            else:
                weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
                base_model = models.mobilenet_v3_small(weights=weights)
                self.features = base_model.features
                in_features = 576

            self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
            self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
            
            # Shared latent representation dense projector
            self.shared_proj = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 512),
                nn.BatchNorm1d(512),
                nn.SiLU()
            )

            # Multi-Task Classification Heads
            self.head_conditions = nn.Linear(512, num_conditions)
            self.head_severity = nn.Linear(512, num_severity_grades)
            self.head_skin_type = nn.Linear(512, num_skin_types)

            # Saliency gradient hooks for Grad-CAM
            self.gradients = None
            self.activations = None
            self._register_hooks()

        # Backward compatibility aliases
        @property
        def condition_head(self):
            return self.head_conditions

        @property
        def severity_head(self):
            return self.head_severity

        @property
        def skin_type_head(self):
            return self.head_skin_type

        @property
        def shared_dense(self):
            return self.shared_proj

        def _register_hooks(self):
            def forward_hook(module, input, output):
                self.activations = output
            def backward_hook(module, grad_in, grad_out):
                self.gradients = grad_out[0]
                
            target_layer = self.features[-1]
            target_layer.register_forward_hook(forward_hook)
            target_layer.register_full_backward_hook(backward_hook)

        def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
            feat = self.features(x)
            pooled = self.avgpool(feat).flatten(1)
            shared = self.shared_proj(pooled)

            logits_cond = self.head_conditions(shared)
            logits_sev = self.head_severity(shared)
            logits_type = self.head_skin_type(shared)

            return logits_cond, logits_sev, logits_type

        def get_gradcam_weights(self) -> Optional[torch.Tensor]:
            """Compute spatial attention heatmap using backward pass gradients."""
            if self.gradients is None or self.activations is None:
                return None
            weights = torch.mean(self.gradients, dim=[2, 3], keepdim=True)
            cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
            cam = F.relu(cam)
            return cam.squeeze().detach()

        def load_state_dict(self, state_dict: Dict[str, torch.Tensor], strict: bool = False):
            # Remap legacy keys if present
            remapped = {}
            for k, v in state_dict.items():
                new_k = k
                new_k = new_k.replace("condition_head", "head_conditions")
                new_k = new_k.replace("severity_head", "head_severity")
                new_k = new_k.replace("skin_type_head", "head_skin_type")
                if "shared_dense.0" in new_k:
                    new_k = new_k.replace("shared_dense.0", "shared_proj.1")
                elif "shared_dense.1" in new_k:
                    new_k = new_k.replace("shared_dense.1", "shared_proj.2")
                remapped[new_k] = v
            return super().load_state_dict(remapped, strict=strict)
else:
    class DermaNovaMultiTaskModel:
        def __init__(self, **kwargs):
            pass
