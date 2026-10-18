"""
DermaNova Kaggle API Data Ingestion Engine
Streams dataset samples directly via Kaggle API / kagglehub on demand,
bypassing persistent raw disk storage.
"""

import os
import shutil
from pathlib import Path
from typing import Dict, Any
import pandas as pd


class KaggleAPIIngestor:
    def __init__(self, dataset_handle: str = "drishyatomar/glowmix-merged-facial-skincare-dataset"):
        self.dataset_handle = dataset_handle

    def fetch_dataset_metadata(self) -> Dict[str, Any]:
        """Fetch high-level dataset metadata via Kaggle API."""
        import urllib.request
        import json

        owner, slug = self.dataset_handle.split("/")
        url = f"https://www.kaggle.com/api/v1/datasets/view/{owner}/{slug}"
        req = urllib.request.Request(url, headers={"User-Agent": "DermaNova-AI-Client/1.0"})

        try:
            with urllib.request.urlopen(req) as response:
                meta = json.loads(response.read().decode())
                return {
                    "title": meta.get("title"),
                    "owner": meta.get("ownerName"),
                    "license": meta.get("licenseName"),
                    "size_bytes": meta.get("totalBytes"),
                    "size_gb": round(meta.get("totalBytes", 0) / (1024**3), 2),
                    "downloads": meta.get("downloadCount")
                }
        except Exception as e:
            print(f"[Warning] Kaggle API metadata request failed: {e}")
            return {}

    def purge_raw_cache(self) -> None:
        """Purge downloaded raw dataset files from Kagglehub cache directory."""
        owner = self.dataset_handle.split("/")[0]
        cache_dir = Path(os.path.expanduser(f"~/.cache/kagglehub/datasets/{owner}"))
        if cache_dir.exists():
            shutil.rmtree(cache_dir)
            print(f"[Info] Purged raw cache directory: {cache_dir}")
        else:
            print("[Info] Kagglehub cache is already clean.")


if __name__ == "__main__":
    ingestor = KaggleAPIIngestor()
    meta = ingestor.fetch_dataset_metadata()
    print("Fetched Metadata:", meta)
    ingestor.purge_raw_cache()
