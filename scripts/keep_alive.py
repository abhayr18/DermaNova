"""
DermaNova Cloud Backend 24/7 Keep-Alive Heartbeat Script
========================================================
Pings the Render backend /health endpoint every 10-12 minutes
to prevent Render's free tier from spinning down into inactivity sleep.
"""

import sys
import time
import urllib.request
import datetime

DEFAULT_URL = "https://dermanova-api.onrender.com/health"

def ping_server(url: str):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "DermaNova-KeepAlive-Heartbeat/2.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            print(f"[{timestamp}] Heartbeat sent to {url} | Status: {status} (AWAKE)")
            return True
    except Exception as e:
        print(f"[{timestamp}] Warning: Heartbeat failed for {url} | Reason: {e}")
        return False

def run_loop(target_url: str, interval_minutes: int = 12):
    print(f"=====================================================")
    print(f" DermaNova 24/7 Keep-Alive Daemon")
    print(f" Target: {target_url}")
    print(f" Interval: Every {interval_minutes} minutes")
    print(f"=====================================================")
    
    # Send immediate first ping
    ping_server(target_url)

    while True:
        time.sleep(interval_minutes * 60)
        ping_server(target_url)

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    if not url.endswith("/health"):
        url = url.rstrip("/") + "/health"
    run_loop(url)
