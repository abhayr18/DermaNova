"""
DermaNova Clinical AI Evaluation Metrics Module
================================================
Computes multi-task evaluation metrics:
1. Multi-Label Classification: Macro/Micro F1, Precision, Recall, Hamming Loss, Subset Accuracy.
2. Ordinal Severity Grading: Mean Absolute Error (MAE), Cumulative Accuracy within 1 grade.
3. Biophysical Skin-Type: Multi-class Accuracy, Weighted F1.
"""

from typing import Dict, Any, List, Optional
import numpy as np


class MultiTaskEvaluator:
    """
    Evaluator computing clinical diagnostic performance metrics
    across all 3 multi-task heads.
    """

    def __init__(self, condition_names: Optional[List[str]] = None, threshold: float = 0.5):
        self.condition_names = condition_names or [
            "Acne", "Blackheads", "Whiteheads", "Dark_Spots",
            "Pigmentation", "Pores", "Wrinkles", "Redness"
        ]
        self.threshold = threshold

    def compute_multilabel_metrics(
        self,
        y_true: np.ndarray,
        y_pred_probs: np.ndarray
    ) -> Dict[str, Any]:
        """
        Evaluate 8-class multi-label condition detection.
        y_true: (N, 8) binary array
        y_pred_probs: (N, 8) float array in [0, 1]
        """
        y_pred = (y_pred_probs >= self.threshold).astype(int)
        y_true = y_true.astype(int)

        N, num_classes = y_true.shape
        per_class_metrics = {}

        precisions = []
        recalls = []
        f1s = []

        for c_idx in range(num_classes):
            c_name = self.condition_names[c_idx]
            tp = int(np.sum((y_pred[:, c_idx] == 1) & (y_true[:, c_idx] == 1)))
            fp = int(np.sum((y_pred[:, c_idx] == 1) & (y_true[:, c_idx] == 0)))
            fn = int(np.sum((y_pred[:, c_idx] == 0) & (y_true[:, c_idx] == 1)))
            tn = int(np.sum((y_pred[:, c_idx] == 0) & (y_true[:, c_idx] == 0)))

            prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

            precisions.append(prec)
            recalls.append(rec)
            f1s.append(f1)

            per_class_metrics[c_name] = {
                "precision": round(float(prec), 4),
                "recall": round(float(rec), 4),
                "f1_score": round(float(f1), 4),
                "support": int(np.sum(y_true[:, c_idx]))
            }

        macro_precision = float(np.mean(precisions))
        macro_recall = float(np.mean(recalls))
        macro_f1 = float(np.mean(f1s))

        # Hamming Loss: fraction of incorrectly predicted labels
        hamming_loss = float(np.mean(y_pred != y_true))

        # Subset Accuracy: Exact match ratio across all 8 classes
        exact_match_ratio = float(np.mean(np.all(y_pred == y_true, axis=1)))

        return {
            "macro_f1": round(macro_f1, 4),
            "macro_precision": round(macro_precision, 4),
            "macro_recall": round(macro_recall, 4),
            "hamming_loss": round(hamming_loss, 4),
            "exact_match_ratio": round(exact_match_ratio, 4),
            "per_class": per_class_metrics
        }

    def compute_ordinal_metrics(
        self,
        y_true_grades: np.ndarray,
        y_pred_grades: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate 3-grade ordinal acne severity (0=Mild, 1=Moderate, 2=Severe).
        y_true_grades: (N,) int array
        y_pred_grades: (N,) int array
        """
        diff = np.abs(y_true_grades - y_pred_grades)
        mae = float(np.mean(diff))
        exact_acc = float(np.mean(diff == 0))
        within_1_grade = float(np.mean(diff <= 1))

        return {
            "ordinal_mae": round(mae, 4),
            "exact_accuracy": round(exact_acc, 4),
            "within_1_grade_accuracy": round(within_1_grade, 4)
        }

    def compute_skintype_metrics(
        self,
        y_true_types: np.ndarray,
        y_pred_types: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate 5-class skin type classification.
        y_true_types: (N,) int array
        y_pred_types: (N,) int array
        """
        correct = np.sum(y_true_types == y_pred_types)
        total = len(y_true_types)
        acc = float(correct / total) if total > 0 else 0.0

        return {
            "skin_type_accuracy": round(acc, 4)
        }
