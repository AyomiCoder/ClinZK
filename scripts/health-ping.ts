const BASE_URL = process.env.HEALTH_PING_URL || 'http://localhost:4000';
const INTERVAL_MS = parseInt(process.env.HEALTH_PING_INTERVAL || '5000', 10);

async function pingHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    const timestamp = new Date().toISOString();
    
    if (response.ok) {
      console.log(`[${timestamp}] ✅ Health check OK:`, data);
    } else {
      console.error(`[${timestamp}] ❌ Health check failed:`, response.status, data);
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Health check error:`, error instanceof Error ? error.message : String(error));
  }
}

console.log(`🏥 Starting health ping service`);
console.log(`   URL: ${BASE_URL}/health`);
console.log(`   Interval: ${INTERVAL_MS}ms (${INTERVAL_MS / 1000}s)`);
console.log(`   Press Ctrl+C to stop\n`);

pingHealth();

setInterval(pingHealth, INTERVAL_MS);

