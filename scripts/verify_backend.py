import sys, os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from backend.app.main import root, health_check
from backend.app.api.v1.analysis import get_demo_analysis
from backend.app.api.v1.recommendation import generate_recommendations
from backend.app.api.v1.history import get_history_records
from backend.app.models.schemas import RecommendationRequest, SkinTypeEnum

async def run_tests():
    print("1. Testing root...")
    res = await root()
    assert res['status'] == 'online'
    print("   -> Root OK:", res['system'])

    print("2. Testing health_check...")
    res = await health_check()
    assert res['status'] == 'healthy'
    print("   -> Health OK:", res['services'])

    print("3. Testing get_demo_analysis...")
    analysis = await get_demo_analysis()
    assert analysis.overall_health_score >= 0
    assert len(analysis.conditions) == 8
    assert analysis.heatmap_image_base64 is not None
    print(f"   -> Analysis OK: Score={analysis.overall_health_score}, Acne={analysis.conditions['acne'].probability}")
    print(f"   -> Heatmap prefix: {analysis.heatmap_image_base64[:45]}...")

    print("4. Testing generate_recommendations...")
    req = RecommendationRequest(
        detected_conditions={'acne': 0.75, 'blackheads': 0.65},
        skin_type=SkinTypeEnum.OILY
    )
    rec = await generate_recommendations(req)
    assert len(rec.primary_active_ingredients) > 0
    assert len(rec.curated_products) > 0
    assert len(rec.daily_routine.morning_routine) == 4
    print(f"   -> Recommendations OK: {len(rec.primary_active_ingredients)} Actives, {len(rec.curated_products)} Products")

    print("5. Testing get_history_records...")
    hist = await get_history_records()
    assert hist['status'] == 'success'
    print(f"   -> History OK: {hist['total_records']} records")

    print("\n>>> ALL MODULE 1, 2, AND 3 TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    asyncio.run(run_tests())
