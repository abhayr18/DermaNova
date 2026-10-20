"""
DermaNova End-to-End Analysis Orchestration Service
====================================================
Coordinates the complete facial skin analysis pipeline:
1. File validation (magic bytes, size, format, decompression bomb protection)
2. Optical quality evaluation (blur, illumination, skin/face chrominance presence)
3. Facial ROI extraction
4. Training-consistent preprocessing (LAB CLAHE, Bicubic resize, ImageNet normalization)
5. Multi-task deep learning inference (PyTorch EfficientNet-B0)
6. Prediction post-processing (thresholds, health scoring, lesion pinpointing, Grad-CAM heatmap)
7. Curated rule-based skincare recommendations
8. Persistence to cloud database and storage if user is authenticated
9. Structured response assembly
"""

import time
import uuid
import logging
from typing import Optional, Union, Dict, Any
import numpy as np
from PIL import Image
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.models import User
from backend.app.schemas.analysis import AnalysisResponse
from backend.app.services.image_validation_service import image_validation_service, ImageValidationService
from backend.app.services.image_quality_service import image_quality_service, ImageQualityService
from backend.app.services.preprocessing_service import preprocessing_service, PreprocessingService
from backend.app.ml.inference import inference_engine, InferenceEngine
from backend.app.services.prediction_service import prediction_service, PredictionService
from backend.app.services.recommendation_service import recommendation_service, RecommendationService
from backend.app.services.storage_service import storage_service, StorageService
from backend.app.db.repositories.analysis_repository import AnalysisRepository

logger = logging.getLogger("dermanova.services.analysis")


class AnalysisService:
    def __init__(
        self,
        validator: Optional[ImageValidationService] = None,
        quality: Optional[ImageQualityService] = None,
        preprocessor: Optional[PreprocessingService] = None,
        inferencer: Optional[InferenceEngine] = None,
        predictor: Optional[PredictionService] = None,
        recommender: Optional[RecommendationService] = None,
        storage: Optional[StorageService] = None
    ):
        self.validator = validator or image_validation_service
        self.quality = quality or image_quality_service
        self.preprocessor = preprocessor or preprocessing_service
        self.inferencer = inferencer or inference_engine
        self.predictor = predictor or prediction_service
        self.recommender = recommender or recommendation_service
        self.storage = storage or storage_service

    async def run_analysis(
        self,
        image_input: Union[bytes, str, Image.Image],
        user: Optional[User] = None,
        db: Optional[Session] = None
    ) -> AnalysisResponse:
        """
        Executes end-to-end analysis on the provided image input.
        """
        analysis_id = f"DN-{uuid.uuid4().hex[:8].upper()}"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        # Step 1: Image validation and safe decoding
        pil_img, clean_bytes = self.validator.validate_and_decode(image_input)

        # Step 2: Optical quality and facial skin suitability evaluation
        self.quality.evaluate_quality_and_suitability(pil_img)

        # Step 3: Facial ROI extraction
        roi_pil, face_detected = self.quality.crop_face_roi(pil_img)

        # Step 4: Preprocessing (exact training reproduction)
        tensor = self.preprocessor.preprocess_to_tensor(roi_pil)

        # Step 5: Neural network inference
        inference_out = self.inferencer.predict_tensor(tensor, compute_gradcam=True)

        # Step 6: Prediction post-processing
        img_np = np.array(pil_img)
        pred_out = self.predictor.post_process_predictions(
            raw_probabilities=inference_out["condition_probabilities"],
            severity_grade=inference_out["severity_grade"],
            skin_type=inference_out["skin_type"],
            img_np=img_np,
            saliency_map=inference_out["saliency_map"],
            model_version=inference_out["model_version"]
        )

        # Step 7: Rule-based skincare recommendations
        condition_prob_map = {
            k: v.probability for k, v in pred_out["conditions"].items()
        }
        has_sensitive = (
            pred_out["detected_skin_type"] == "Sensitive" or
            (user and user.profile and user.profile.has_sensitive_skin)
        )
        user_allergies = user.profile.get_allergies() if (user and user.profile) else []
        is_pregnant = bool(user and user.profile and user.profile.is_pregnant_or_nursing)

        recs = self.recommender.generate_recommendations(
            detected_conditions=condition_prob_map,
            skin_type=pred_out["detected_skin_type"],
            has_sensitive_skin=has_sensitive,
            allergies=user_allergies,
            is_pregnant_or_nursing=is_pregnant,
            analysis_id=analysis_id
        )

        # Step 8: Persistence (if user and db available)
        image_url = None
        heatmap_url = None

        if user and db:
            try:
                # Upload scan and heatmap if retention is enabled
                if settings.RETAIN_IMAGES_ENABLED:
                    image_url = await self.storage.upload_scan(clean_bytes, user.id)
                    if pred_out["heatmap_image_base64"]:
                        heatmap_url = await self.storage.upload_heatmap(pred_out["heatmap_image_base64"], user.id)

                repo = AnalysisRepository(db)
                top_concern_str = pred_out["top_concerns"][0] if pred_out["top_concerns"] else "Acne"
                repo.create(
                    assessment_id=analysis_id,
                    user_id=user.id,
                    overall_health_score=pred_out["overall_health_score"],
                    detected_skin_type=str(pred_out["detected_skin_type"].value if hasattr(pred_out["detected_skin_type"], "value") else pred_out["detected_skin_type"]),
                    primary_concern=top_concern_str,
                    acne_severity_grade=str(pred_out["acne_severity_grade"].value if hasattr(pred_out["acne_severity_grade"], "value") else pred_out["acne_severity_grade"]),
                    requires_clinical_referral=pred_out["requires_clinical_referral"],
                    image_cloud_url=image_url,
                    heatmap_cloud_url=heatmap_url,
                    condition_scores=condition_prob_map,
                    clinical_notes="AI Multi-Task Clinical Diagnosis"
                )
            except Exception as e:
                logger.error(f"Failed to persist assessment for user {user.id}: {e}")

        # Step 9: Assemble final response
        return AnalysisResponse(
            analysis_id=analysis_id,
            status="completed",
            timestamp=timestamp,
            model_version=pred_out["model_version"],
            overall_health_score=pred_out["overall_health_score"],
            detected_skin_type=pred_out["detected_skin_type"],
            conditions=pred_out["conditions"],
            top_concerns=pred_out["top_concerns"],
            acne_severity_grade=pred_out["acne_severity_grade"],
            requires_clinical_referral=pred_out["requires_clinical_referral"],
            heatmap_image_base64=pred_out["heatmap_image_base64"],
            face_detected=face_detected,
            detected_lesions=pred_out["detected_lesions"],
            recommendations=recs
        )


# Global analysis service instance
analysis_service = AnalysisService()
