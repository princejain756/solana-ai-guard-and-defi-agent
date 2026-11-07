/**
 * Solana Devnet JSON-RPC Failover Pool & Latency Monitor
 * Tracks response latency and slot progression across primary and backup Devnet RPC endpoints.
 */

const DEFAULT_ENDPOINTS = [
  "https://api.devnet.solana.com",
  "https://rpc.ankr.com/solana_devnet"
];

export class SolanaRpcFailoverPool {
  constructor(endpoints = DEFAULT_ENDPOINTS, timeoutMs = 4200) {
    this.endpoints = endpoints;
    this.timeoutMs = timeoutMs;
    this.metrics = new Map(
      endpoints.map((url) => [
        url,
        { url, requests: 0, failures: 0, lastLatencyMs: null, lastSlot: null }
      ])
    );
  }

  async callWithFailover(method, params = []) {
    let lastError = null;
    for (const url of this.endpoints) {
      const stat = this.metrics.get(url);
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        stat.requests += 1;
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
          signal: controller.signal
        });
        const body = await res.json();
        if (body.error) {
          throw new Error(body.error.message || "RPC error");
        }
        stat.lastLatencyMs = Date.now() - started;
        if (method === "getSlot" && typeof body.result === "number") {
          stat.lastSlot = body.result;
        }
        return { result: body.result, endpoint: url, latencyMs: stat.lastLatencyMs };
      } catch (err) {
        stat.failures += 1;
        lastError = err;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError || new Error("All Solana Devnet RPC endpoints failed");
  }

  getHealthSnapshot() {
    return Array.from(this.metrics.values());
  }
}
