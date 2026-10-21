/**
 * DermaNova Render Backend Keep-Alive Heartbeat (Node.js)
 * ========================================================
 * Sends a lightweight GET ping to the Render backend every 10 minutes
 * to ensure Render's free tier never spins down into inactivity sleep.
 *
 * Usage:
 *   node scripts/keep_alive.js [optional_url] [optional_interval_minutes]
 */

const https = require('https');
const http = require('http');

const TARGET_URL = process.argv[2] || process.env.RENDER_URL || 'https://dermanova.onrender.com/api/v1/health';
const INTERVAL_MINUTES = parseInt(process.argv[3] || '10', 10);

function pingServer(url) {
  const parsed = new URL(url);
  const client = parsed.protocol === 'https:' ? https : http;
  const start = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const req = client.get(url, {
    headers: {
      'User-Agent': 'DermaNova-Node-KeepAlive/2.0',
      'Accept': 'application/json',
    },
    timeout: 60000,
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const ms = Date.now() - start;
      console.log(`[${timestamp}] Heartbeat sent -> ${url} | HTTP ${res.statusCode} | Latency: ${ms}ms (AWAKE)`);
    });
  });

  req.on('error', (err) => {
    const ms = Date.now() - start;
    console.warn(`[${timestamp}] Heartbeat issue -> ${url} (${ms}ms) | Reason: ${err.message}`);
  });

  req.on('timeout', () => {
    req.destroy();
    console.warn(`[${timestamp}] Heartbeat timed out after 60s for ${url}`);
  });
}

console.log('=====================================================');
console.log(' DermaNova 24/7 Keep-Alive Daemon (Node.js)');
console.log(` Target:   ${TARGET_URL}`);
console.log(` Interval: Every ${INTERVAL_MINUTES} minutes (Render sleeps after 15m)`);
console.log(' Press Ctrl+C to stop');
console.log('=====================================================');

// Immediate first ping
pingServer(TARGET_URL);

// Schedule recurring pings
setInterval(() => {
  pingServer(TARGET_URL);
}, INTERVAL_MINUTES * 60 * 1000);
