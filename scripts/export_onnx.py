"""
DermaNova ONNX Model Export Script
====================================
Exports the calibrated PyTorch Multi-Task EfficientNet model to ONNX format:
'ml_pipeline/models/saved_models/dermanova_model.onnx'
For ultra-fast, cross-platform, multi-device inference.
"""

import sys
from pathlib import Path
import torch

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.models.cnn.multi_task_efficientnet import DermaNovaMultiTaskModel

def export_model_to_onnx():
    print("=" * 65)
    print("DERMANOVA ONNX COMPILATION & EXPORT ENGINE")
    print("=" * 65)

    weights_path = ROOT_DIR / "ml_pipeline" / "models" / "saved_models" / "dermanova_best_weights.pth"
    onnx_output_path = ROOT_DIR / "ml_pipeline" / "models" / "saved_models" / "dermanova_model.onnx"

    if not weights_path.exists():
        raise FileNotFoundError(f"PyTorch weights not found at: {weights_path}")

    print(f"Loading PyTorch checkpoint from: {weights_path}")
    checkpoint = torch.load(weights_path, map_location="cpu")

    model = DermaNovaMultiTaskModel(
        num_conditions=len(checkpoint.get("conditions", range(8))),
        num_severity_grades=3,
        num_skin_types=5,
        backbone_name=checkpoint.get("backbone", "efficientnet_b0"),
        pretrained=False
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    dummy_input = torch.randn(1, 3, 224, 224, requires_grad=False)

    print("Compiling ONNX computation graph with dynamic batching...")
    torch.onnx.export(
        model,
        dummy_input,
        str(onnx_output_path),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        dynamo=False,
        input_names=["input_image"],
        output_names=["logits_conditions", "logits_severity", "logits_skin_type"],
        dynamic_axes={
            "input_image": {0: "batch_size"},
            "logits_conditions": {0: "batch_size"},
            "logits_severity": {0: "batch_size"},
            "logits_skin_type": {0: "batch_size"}
        }
    )

    print(f"[OK] Successfully exported ONNX model to: {onnx_output_path}")
    print(f"ONNX Model File Size: {onnx_output_path.stat().st_size / (1024 * 1024):.2f} MB")

    # Verify ONNX model with onnx library
    import onnx
    onnx_model = onnx.load(str(onnx_output_path))
    onnx.checker.check_model(onnx_model)
    print("[OK] ONNX model structural validity check passed with 0 errors!")
    print("=" * 65)

if __name__ == "__main__":
    export_model_to_onnx()
