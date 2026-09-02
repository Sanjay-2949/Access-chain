/**
 * Gateway Observability, Metrics & Telemetry Service
 */

export interface MetricEntry {
  provider: string;
  latencyMs: number;
  success: boolean;
  cacheHit: boolean;
  circuitState?: string;
  timestamp: string;
}

export class GatewayMetrics {
  private static entries: MetricEntry[] = [];

  public static record(entry: MetricEntry): void {
    this.entries.push(entry);
    if (this.entries.length > 500) {
      this.entries.shift();
    }
  }

  public static getStats(): {
    totalRequests: number;
    cacheHitRatio: number;
    averageLatencyMs: number;
    fallbackRate: number;
  } {
    if (this.entries.length === 0) {
      return { totalRequests: 0, cacheHitRatio: 0, averageLatencyMs: 0, fallbackRate: 0 };
    }

    const total = this.entries.length;
    const cacheHits = this.entries.filter((e) => e.cacheHit).length;
    const failures = this.entries.filter((e) => !e.success).length;
    const totalLatency = this.entries.reduce((sum, e) => sum + e.latencyMs, 0);

    return {
      totalRequests: total,
      cacheHitRatio: Math.round((cacheHits / total) * 100),
      averageLatencyMs: Math.round(totalLatency / total),
      fallbackRate: Math.round((failures / total) * 100),
    };
  }

  public static clear(): void {
    this.entries = [];
  }
}
