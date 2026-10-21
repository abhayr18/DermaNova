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

DEFAULT_URL = "https://dermanova.onrender.com/api/v1/health"

def ping_server(url: str):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    start_time = time.time()
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "DermaNova-KeepAlive-Heartbeat/2.0",
                "Accept": "application/json"
            }
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            latency_ms = int((time.time() - start_time) * 1000)
            status = resp.status
            print(f"[{timestamp}] Heartbeat sent to {url} | Status: {status} | Latency: {latency_ms}ms (AWAKE)")
            return True
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        print(f"[{timestamp}] Warning: Heartbeat issue for {url} ({latency_ms}ms) | Reason: {e}")
        return False

def run_loop(target_url: str, interval_minutes: int = 10):
    print(f"=====================================================")
    print(f" DermaNova 24/7 Keep-Alive Daemon")
    print(f" Target: {target_url}")
    print(f" Interval: Every {interval_minutes} minutes (Render sleeps after 15m)")
    print(f" Press Ctrl+C to stop")
    print(f"=====================================================")
    
    # Send immediate first ping
    ping_server(target_url)

    while True:
        try:
            time.sleep(interval_minutes * 60)
            ping_server(target_url)
        except KeyboardInterrupt:
            print("\nKeep-alive daemon stopped.")
            break

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    run_loop(url)

