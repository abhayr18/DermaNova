"""
DermaNova Specialized Loss Functions:
1. Asymmetric Focal Loss (ASL) for Multi-Label Class Imbalance
2. Ordinal Ranking Cross-Entropy Loss for Continuous Severity Grading
"""
import math

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


if HAS_TORCH:
    class AsymmetricFocalLoss(nn.Module):
        """
        Asymmetric Focal Loss for Multi-Label Classification (Ridnik et al., ICCV 2021).
        Decouples positive focusing (gamma_pos) and negative focusing (gamma_neg),
        applying hard negative probability margin (clip) to discard easy background negative samples.
        """
        def __init__(self, gamma_neg: float = 4.0, gamma_pos: float = 1.0, clip: float = 0.05, eps: float = 1e-8):
            super().__init__()
            self.gamma_neg = gamma_neg
            self.gamma_pos = gamma_pos
            self.clip = clip
            self.eps = eps

        def forward(self, x: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
            """
            x: Raw model logits [B, C]
            y: Binary multi-label targets [B, C] in {0, 1}
            """
            xs_pos = torch.sigmoid(x)
            xs_neg = 1.0 - xs_pos

            # Asymmetric clipping on negatives
            if self.clip is not None and self.clip > 0:
                xs_neg = (xs_neg + self.clip).clamp(max=1.0)

            # Basic Cross Entropy
            los_pos = y * torch.log(xs_pos.clamp(min=self.eps))
            los_neg = (1.0 - y) * torch.log(xs_neg.clamp(min=self.eps))
            loss = los_pos + los_neg

            # Asymmetric Focusing weights
            if self.gamma_neg > 0 or self.gamma_pos > 0:
                pt0 = xs_pos * y
                pt1 = xs_neg * (1.0 - y)
                pt = pt0 + pt1
                one_sided_gamma = self.gamma_pos * y + self.gamma_neg * (1.0 - y)
                one_sided_w = torch.pow(1.0 - pt, one_sided_gamma)
                loss = loss * one_sided_w

            return -loss.sum()


    class OrdinalRankingLoss(nn.Module):
        """
        Ordinal Ranking Loss for Discrete Severity Grading (Shen et al. / Frank & Hall ordinal framework).
        Decomposes a K-class ordinal classification problem (e.g., Mild < Moderate < Severe)
        into K-1 cumulative binary decision tasks.
        """
        def __init__(self, num_classes: int = 3):
            super().__init__()
            self.num_classes = num_classes

        def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
            """
            logits: [B, K - 1] cumulative binary logits
            targets: [B] integer class labels in {0, 1, ..., K-1}
            """
            batch_size = logits.size(0)
            loss = 0.0
            
            # Cumulative binary labels
            for k in range(self.num_classes - 1):
                # Target is 1 if true grade > k, else 0
                binary_target = (targets > k).float()
                binary_logit = logits[:, k]
                loss += F.binary_cross_entropy_with_logits(binary_logit, binary_target)

            return loss / (self.num_classes - 1)
else:
    # Pure Python numerical loss calculators for environments without torch
    class AsymmetricFocalLoss:
        def __init__(self, gamma_neg=4.0, gamma_pos=1.0, clip=0.05):
            self.gamma_neg = gamma_neg
            self.gamma_pos = gamma_pos
            self.clip = clip

    class OrdinalRankingLoss:
        def __init__(self, num_classes=3):
            self.num_classes = num_classes
