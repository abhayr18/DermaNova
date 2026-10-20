"""
DermaNova Multi-Task EfficientNet Model Factory
================================================
Constructs the verified multi-task CNN architecture corresponding exactly to the trained
checkpoint ('dermanova_best_weights.pth') and training notebook.

Architecture:
1. Feature Extractor: torchvision.models.efficientnet_b0(pretrained=False).features
2. Spatial Pooling: nn.AdaptiveAvgPool2d((1, 1)).flatten(1) -> 1280 features
3. Latent Projector:
   - Dropout(p=0.3)
   - Linear(1280, 512)
   - BatchNorm1d(512)
   - SiLU()
4. Multi-Task Heads:
   - head_conditions: nn.Linear(512, 8)  (Multi-label condition logits)
   - head_severity:   nn.Linear(512, 3)  (3-grade ordinal severity logits)
   - head_skin_type:  nn.Linear(512, 5)  (5-class biophysical skin-type logits)
5. Grad-CAM feature hooks on features[-1]
"""

from typing import Tuple, Optional, Any

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    import torchvision.models as models
    HAS_TORCH = True
    _ModuleBase = nn.Module
except ImportError:
    torch = None
    nn = None
    F = None
    models = None
    HAS_TORCH = False
    _ModuleBase = object


class DermaNovaMultiTaskModel(_ModuleBase):
    def __init__(
        self,
        num_conditions: int = 8,
        num_severity_grades: int = 3,
        num_skin_types: int = 5,
        backbone_name: str = "efficientnet_b0",
        pretrained: bool = False
    ):
        super().__init__()
        self.num_conditions = num_conditions
        self.num_severity_grades = num_severity_grades
        self.num_skin_types = num_skin_types
        self.backbone_name = backbone_name

        if backbone_name == "efficientnet_b0":
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            base_model = models.efficientnet_b0(weights=weights)
            self.features = base_model.features
            in_features = base_model.classifier[1].in_features  # 1280
        else:
            raise ValueError(f"Unsupported backbone: {backbone_name}. Only efficientnet_b0 is validated.")

        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))

        # Shared latent projector
        self.shared_proj = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.SiLU()
        )

        # Multi-task heads
        self.head_conditions = nn.Linear(512, num_conditions)
        self.head_severity = nn.Linear(512, num_severity_grades)
        self.head_skin_type = nn.Linear(512, num_skin_types)

        # Grad-CAM hooks
        self.gradients = None
        self.activations = None
        self._register_hooks()

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


def create_dermanova_model(
    num_conditions: int = 8,
    num_severity_grades: int = 3,
    num_skin_types: int = 5,
    backbone_name: str = "efficientnet_b0",
    pretrained: bool = False
) -> DermaNovaMultiTaskModel:
    """Factory helper to build a DermaNova multi-task model instance."""
    return DermaNovaMultiTaskModel(
        num_conditions=num_conditions,
        num_severity_grades=num_severity_grades,
        num_skin_types=num_skin_types,
        backbone_name=backbone_name,
        pretrained=pretrained
    )
