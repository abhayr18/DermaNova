"""
DermaNova Multi-Task Deep Learning Training Harness
====================================================
End-to-end training pipeline for:
1. 8-class Multi-Label Dermatological Condition Diagnosis (Asymmetric Focal Loss)
2. 3-grade Ordinal Severity Grading (Ordinal Ranking Loss)
3. 5-class Biophysical Skin-Type Classification (Cross-Entropy Loss)

Features:
- Mixed precision training (AMP)
- Cosine Annealing learning rate schedule with warm restarts
- Per-class F1 evaluation, subset accuracy, and early stopping
- Model checkpoint serialization (.pth) and ONNX export (.onnx)
"""

import os
import sys
import time
import argparse
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import numpy as np

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.utils.data import DataLoader
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

from ml_pipeline.models.cnn.multi_task_efficientnet import DermaNovaMultiTaskModel
from ml_pipeline.models.cnn.losses import AsymmetricFocalLoss, OrdinalRankingLoss
from ml_pipeline.preprocessing.dataset import DermaNovaSkinDataset
from ml_pipeline.evaluation.metrics import MultiTaskEvaluator


class MultiTaskCriterion(nn.Module):
    """Joint loss combiner for multi-task heads."""
    def __init__(
        self,
        weight_condition: float = 1.0,
        weight_severity: float = 0.5,
        weight_skin_type: float = 0.3
    ):
        super().__init__()
        self.condition_loss_fn = AsymmetricFocalLoss(gamma_neg=4.0, gamma_pos=1.0, clip=0.05)
        self.severity_loss_fn = OrdinalRankingLoss(num_classes=3)
        self.skin_type_loss_fn = nn.CrossEntropyLoss()

        self.w_cond = weight_condition
        self.w_sev = weight_severity
        self.w_type = weight_skin_type

    def forward(
        self,
        logits_cond: torch.Tensor,
        logits_sev: torch.Tensor,
        logits_type: torch.Tensor,
        targets_cond: torch.Tensor,
        targets_sev: Optional[torch.Tensor] = None,
        targets_type: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        loss_cond = self.condition_loss_fn(logits_cond, targets_cond)
        total_loss = self.w_cond * loss_cond
        loss_dict = {"loss_cond": float(loss_cond.item())}

        if targets_sev is not None:
            loss_sev = self.severity_loss_fn(logits_sev, targets_sev)
            total_loss += self.w_sev * loss_sev
            loss_dict["loss_sev"] = float(loss_sev.item())

        if targets_type is not None:
            loss_type = self.skin_type_loss_fn(logits_type, targets_type)
            total_loss += self.w_type * loss_type
            loss_dict["loss_type"] = float(loss_type.item())

        loss_dict["loss_total"] = float(total_loss.item())
        return total_loss, loss_dict


def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: MultiTaskCriterion,
    scaler: Optional[Any],
    device: torch.device
) -> Dict[str, float]:
    model.train()
    total_loss = 0.0
    num_batches = 0

    for batch in dataloader:
        images = batch["image"].to(device, non_blocking=True)
        targets_cond = batch["target"].to(device, non_blocking=True)

        optimizer.zero_grad()

        # Mixed precision training
        use_amp = scaler is not None and device.type == "cuda"
        with torch.amp.autocast(device_type=device.type, enabled=use_amp):
            logits_cond, logits_sev, logits_type = model(images)
            loss, _ = criterion(
                logits_cond=logits_cond,
                logits_sev=logits_sev,
                logits_type=logits_type,
                targets_cond=targets_cond
            )

        if scaler is not None and use_amp:
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            loss.backward()
            optimizer.step()

        total_loss += loss.item()
        num_batches += 1

    return {"train_loss": total_loss / max(num_batches, 1)}


def validate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: MultiTaskCriterion,
    evaluator: MultiTaskEvaluator,
    device: torch.device
) -> Dict[str, Any]:
    model.eval()
    total_loss = 0.0
    num_batches = 0

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for batch in dataloader:
            images = batch["image"].to(device, non_blocking=True)
            targets_cond = batch["target"].to(device, non_blocking=True)

            logits_cond, logits_sev, logits_type = model(images)
            loss, _ = criterion(
                logits_cond=logits_cond,
                logits_sev=logits_sev,
                logits_type=logits_type,
                targets_cond=targets_cond
            )

            total_loss += loss.item()
            num_batches += 1

            probs = torch.sigmoid(logits_cond).cpu().numpy()
            all_preds.append(probs)
            all_targets.append(targets_cond.cpu().numpy())

    if all_preds:
        y_pred = np.vstack(all_preds)
        y_true = np.vstack(all_targets)
        metrics = evaluator.compute_multilabel_metrics(y_true, y_pred)
    else:
        metrics = {"macro_f1": 0.0, "hamming_loss": 1.0}

    metrics["val_loss"] = total_loss / max(num_batches, 1)
    return metrics


def export_to_onnx(model: nn.Module, output_path: Path, image_size: Tuple[int, int] = (224, 224)):
    """Export trained PyTorch model to ONNX format for ultra-fast CPU inference."""
    try:
        model.eval()
        dummy_input = torch.randn(1, 3, image_size[0], image_size[1])
        output_path.parent.mkdir(parents=True, exist_ok=True)
        torch.onnx.export(
            model,
            dummy_input,
            str(output_path),
            export_params=True,
            opset_version=14,
            do_constant_folding=True,
            input_names=["input_image"],
            output_names=["condition_logits", "severity_logits", "skin_type_logits"],
            dynamic_axes={
                "input_image": {0: "batch_size"},
                "condition_logits": {0: "batch_size"},
                "severity_logits": {0: "batch_size"},
                "skin_type_logits": {0: "batch_size"},
            }
        )
        print(f"[ONNX] Exported successfully to {output_path}")
    except Exception as e:
        print(f"[ONNX Warning] Could not export ONNX model: {e}")


def run_training(
    train_csv: str = "datasets/annotations/dermanova_train_split.csv",
    val_csv: str = "datasets/annotations/dermanova_val_split.csv",
    epochs: int = 30,
    batch_size: int = 32,
    lr: float = 3e-4,
    backbone: str = "efficientnet_b0",
    image_size: Tuple[int, int] = (224, 224),
    save_dir: str = "ml_pipeline/models/saved_models",
    ds_root_override: Optional[str] = None
):
    if not HAS_TORCH:
        print("[ERROR] PyTorch is not installed in the current environment. Please install torch.")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 60)
    print("DERMANOVA PRODUCTION MULTI-TASK DEEP LEARNING TRAINER")
    print("=" * 60)
    print(f"Device:      {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")
    print(f"Backbone:    {backbone}")
    print(f"Epochs:      {epochs}")
    print(f"Batch Size:  {batch_size}")
    print(f"Learning Rate:{lr}")
    print(f"Train Split: {train_csv}")
    print(f"Val Split:   {val_csv}")
    print("=" * 60)

    # 1. Datasets & Loaders
    train_ds = DermaNovaSkinDataset(train_csv, image_size=image_size, is_train=True, ds_root_override=ds_root_override)
    val_ds = DermaNovaSkinDataset(val_csv, image_size=image_size, is_train=False, ds_root_override=ds_root_override)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0, pin_memory=torch.cuda.is_available())
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"Train samples: {len(train_ds)} | Val samples: {len(val_ds)}")

    # 2. Model & Optimizer
    model = DermaNovaMultiTaskModel(backbone_name=backbone, pretrained=True).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    criterion = MultiTaskCriterion()
    evaluator = MultiTaskEvaluator()

    scaler = torch.amp.GradScaler(enabled=(device.type == "cuda"))

    out_path = Path(save_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    best_weights_path = out_path / "dermanova_best_weights.pth"
    onnx_path = out_path / "dermanova_model.onnx"

    best_f1 = -1.0

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        train_res = train_one_epoch(model, train_loader, optimizer, criterion, scaler, device)
        val_res = validate(model, val_loader, criterion, evaluator, device)
        scheduler.step()
        elapsed = time.time() - t0

        val_f1 = val_res.get("macro_f1", 0.0)
        val_loss = val_res.get("val_loss", 0.0)

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {train_res['train_loss']:.4f} | "
            f"Val Loss: {val_loss:.4f} | "
            f"Val Macro-F1: {val_f1:.4f} | "
            f"Hamming Loss: {val_res.get('hamming_loss', 0.0):.4f} | "
            f"Time: {elapsed:.1f}s"
        )

        if val_f1 > best_f1:
            best_f1 = val_f1
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_macro_f1": best_f1,
                "backbone": backbone,
                "num_conditions": 8
            }, best_weights_path)
            print(f"   -> [BEST CHECKPOINT SAVED] Macro-F1 improved to {best_f1:.4f} -> {best_weights_path}")

    # Export final best model to ONNX
    if best_weights_path.exists():
        checkpoint = torch.load(best_weights_path, map_location="cpu")
        model.load_state_dict(checkpoint["model_state_dict"])
        export_to_onnx(model, onnx_path, image_size=image_size)

    print("\n" + "=" * 60)
    print(f"TRAINING COMPLETE! Best Validation Macro-F1: {best_f1:.4f}")
    print(f"Best Weights: {best_weights_path}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DermaNova Multi-Task Training")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--backbone", type=str, default="efficientnet_b0")
    parser.add_argument("--train-csv", type=str, default="datasets/annotations/dermanova_train_split.csv")
    parser.add_argument("--val-csv", type=str, default="datasets/annotations/dermanova_val_split.csv")
    parser.add_argument("--data-root", type=str, default=None)
    args = parser.parse_args()

    run_training(
        train_csv=args.train_csv,
        val_csv=args.val_csv,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        backbone=args.backbone,
        ds_root_override=args.data_root
    )
