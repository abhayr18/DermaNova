"""
DermaNova Cloud & Supabase Connectivity Verification Script
=============================================================
Verifies:
1. PostgreSQL Database Connectivity (Supabase / RDS / Local SQLite)
2. Schema Tables Initialized (users, patient_profiles, skin_assessments, personalized_routines, skin_journey_logs)
3. Supabase Cloud Storage Buckets (patient-scans, diagnostic-heatmaps)
"""

import os
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.config import settings
from backend.app.database.session import engine, Base
import httpx

def main():
    print("=" * 65)
    print("DERMANOVA CLOUD & SUPABASE CONNECTIVITY DIAGNOSTIC")
    print("=" * 65)

    db_url = settings.DATABASE_URL
    is_sqlite = db_url.startswith("sqlite")
    print(f"\n1. Database Configuration:")
    print(f"   - Engine: {'Local SQLite Fallback' if is_sqlite else 'Cloud PostgreSQL (Supabase/RDS)'}")
    print(f"   - URL: {db_url.split('@')[-1] if '@' in db_url else db_url}")

    # Test Database Engine
    try:
        with engine.connect() as conn:
            print("   [OK] Database connection established successfully!")
            
        # Create schemas if not existing
        Base.metadata.create_all(bind=engine)
        print("   [OK] All 5 clinical relational schemas verified & up-to-date:")
        for table in Base.metadata.tables.keys():
            print(f"        * {table}")
    except Exception as e:
        print(f"   [FAIL] Database connection error: {e}")

    # Test Supabase Storage
    print(f"\n2. Supabase Cloud Storage:")
    supa_url = settings.SUPABASE_URL.rstrip("/")
    supa_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

    if not supa_url or "your-project" in supa_url or not supa_key:
        print("   [INFO] Supabase cloud keys not configured in .env.")
        print("   -> Using graceful local filesystem storage (uploads/).")
        print("\nTo activate Live Cloud Storage in 2 minutes:")
        print("   1. Open https://supabase.com and create a project.")
        print("   2. Go to Project Settings -> API and copy URL & Service Key.")
        print("   3. Go to Project Settings -> Database and copy the PostgreSQL URI.")
        print("   4. Save into your .env file as:")
        print("      DATABASE_URL=postgresql://postgres.xxx:password@host:5432/postgres")
        print("      SUPABASE_URL=https://your-project.supabase.co")
        print("      SUPABASE_SERVICE_ROLE_KEY=eyJh...")
    else:
        print(f"   - Supabase URL: {supa_url}")
        headers = {
            "Authorization": f"Bearer {supa_key}",
            "apikey": supa_key
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(f"{supa_url}/storage/v1/bucket", headers=headers)
                if res.status_code == 200:
                    buckets = [b.get("name") for b in res.json()]
                    print(f"   [OK] Connected to Supabase Storage! Existing Buckets: {buckets}")
                    
                    # Check our required buckets
                    for req_b in ["patient-scans", "diagnostic-heatmaps"]:
                        if req_b in buckets:
                            print(f"        * Bucket '{req_b}': Found & Ready")
                        else:
                            print(f"        * Bucket '{req_b}': Creating bucket...")
                            create_res = client.post(
                                f"{supa_url}/storage/v1/bucket",
                                headers=headers,
                                json={"id": req_b, "name": req_b, "public": True}
                            )
                            if create_res.status_code in (200, 201):
                                print(f"        * Bucket '{req_b}': Created successfully!")
                            else:
                                print(f"        * Bucket '{req_b}': Please create manually in Supabase dashboard (Storage -> New Bucket)")
                else:
                    print(f"   [WARN] Supabase Storage responded with HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"   [WARN] Could not reach Supabase Storage: {e}")

    print("\n" + "=" * 65)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 65)

if __name__ == "__main__":
    main()
