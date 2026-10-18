import io
import base64
from pathlib import Path
from PIL import Image
import gradio as gr

# Add project root to path
import sys
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

from ml_pipeline.inference.predictor import DermaNovaPredictor
from backend.app.services.recommender import recommender_service

# Initialize clinical inference & recommendation engines
predictor = DermaNovaPredictor()

def analyze_skin(image: Image.Image):
    if image is None:
        return 0, {}, None, "⚠️ Please upload or capture a facial photo."

    try:
        # 1. Run Deep Learning Diagnostic Inference (ONNX + Grad-CAM)
        res = predictor.predict(image)

        # 2. Extract Condition Probability Distribution
        condition_probs = {
            c.display_name: round(float(c.probability), 3)
            for c in res.conditions.values()
        }
        cond_dict_raw = {k: float(v.probability) for k, v in res.conditions.items()}

        # 3. Decode Grad-CAM Saliency Heatmap
        heatmap_img = None
        if res.heatmap_image_base64 and "," in res.heatmap_image_base64:
            b64_data = res.heatmap_image_base64.split(",")[1]
            img_bytes = base64.b64decode(b64_data)
            heatmap_img = Image.open(io.BytesIO(img_bytes))

        # 4. Generate Personalized Pharmacological Regimen
        rec = recommender_service.generate_recommendations(
            detected_conditions=cond_dict_raw,
            skin_type=res.detected_skin_type
        )

        # Format Actives
        actives_md = ""
        for a in rec.primary_active_ingredients:
            actives_md += f"- **{a.name}** (`{a.recommended_strength}`)\n  - *Mechanism:* {a.mechanism_of_action}\n  - *Usage:* {a.application_timing}\n  - *Precaution:* {a.precaution}\n"
        if not actives_md:
            actives_md = "_No aggressive actives required. Focus on barrier maintenance._\n"

        # Format Morning Routine
        am_routine = ""
        for s in rec.daily_routine.morning_routine:
            am_routine += f"{s.step_number}. **{s.step_name}** ({s.product_category}): {s.product_name}\n   - *Key Actives:* `{s.key_actives}`\n   - *Application:* {s.recommended_action}\n"

        # Format Evening Routine
        pm_routine = ""
        for s in rec.daily_routine.evening_routine:
            pm_routine += f"{s.step_number}. **{s.step_name}** ({s.product_category}): {s.product_name}\n   - *Key Actives:* `{s.key_actives}`\n   - *Application:* {s.recommended_action}\n"

        # Format Contraindications
        contra_md = ""
        if rec.contraindications_avoided:
            contra_md = "\n### 🛡️ Chemical Contraindications Enforced\n"
            for c in rec.contraindications_avoided:
                contra_md += f"- ⚠️ {c}\n"

        # Format Lifestyle & Dietary
        diet_md = "\n### 🥗 Clinical Lifestyle & Dietary Support\n"
        for d in rec.dietary_guidance:
            diet_md += f"- {d}\n"

        # 5. Build Rich Markdown Clinical Report
        report_md = f"""
## 🩺 Clinical Diagnostic Assessment
- **Overall Skin Health Score:** **{res.overall_health_score}/100**
- **Biophysical Skin Type:** **{res.detected_skin_type.value}**
- **Acne Severity Classification:** **{res.acne_severity_grade.value}**
- **Primary Cutaneous Concerns:** {', '.join(res.top_concerns) if res.top_concerns else 'Optimal barrier profile'}

---

### 🧪 Prescribed Dermatological Active Ingredients
{actives_md}
{contra_md}
---

### 🌅 Morning Regimen (AM)
{am_routine}

### 🌙 Evening Regimen (PM)
{pm_routine}
{diet_md}
---

### 🏥 Chemist / Generic Pharmacy Guidance
> **100% Free Open-Source Skincare:** DermaNova is non-commercial. All recommended actives above are available as affordable generic formulations at any local pharmacy/chemist (e.g. 2% Salicylic Acid Cleanser, 10% Niacinamide Serum, Adapalene 0.1%, or Ceramide moisturizing creams) without expensive brand markups.

*Disclaimer: DermaNova provides clinical decision support and educational guidance. It does not replace in-person physical palpation and consultation with a board-certified dermatologist.*
"""
        return res.overall_health_score, condition_probs, heatmap_img, report_md

    except Exception as e:
        import traceback
        traceback.print_exc()
        return 0, {}, None, f"❌ Diagnostic processing error: {str(e)}"


# Build Modern Gradio Web UI
with gr.Blocks(title="DermaNova: AI Facial Skin Diagnostic Framework") as demo:
    gr.Markdown("""
    # 🔬 DermaNova: AI-Driven Facial Skin Diagnostic Framework
    ### Multi-Task Deep Learning Diagnosis, Ordinal Severity Grading & Pharmacological Regimens
    *Trained on 14,003 verified clinical images with Zero-Leakage Grouped Partitioning and Asymmetric Focal Loss.*
    """)

    with gr.Row():
        with gr.Column(scale=1):
            input_image = gr.Image(
                type="pil", 
                label="Capture with Camera or Upload Face Photo",
                sources=["webcam", "upload"]
            )
            analyze_btn = gr.Button("🔍 Run AI Skin Diagnosis", variant="primary", size="lg")
            
            gr.Markdown("#### Sample Faces to Test:")
            sample_paths = [
                ["sample_images/my_face.jpeg"],
                ["sample_images/my_face2.jpeg"]
            ]
            valid_samples = [s for s in sample_paths if Path(s[0]).exists()]
            if valid_samples:
                gr.Examples(examples=valid_samples, inputs=input_image)

        with gr.Column(scale=1):
            score_out = gr.Number(label="Skin Health Score (0-100)", precision=0)
            conditions_out = gr.Label(label="Diagnosed Dermatological Conditions", num_top_classes=8)
            heatmap_out = gr.Image(label="Grad-CAM Neural Attention Hotspot", type="pil")

    with gr.Row():
        regimen_out = gr.Markdown()

    analyze_btn.click(
        fn=analyze_skin,
        inputs=input_image,
        outputs=[score_out, conditions_out, heatmap_out, regimen_out]
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
