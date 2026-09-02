/**
 * Circuit Breaker pattern implementation with Granular HTTP Error Classification
 */

export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation, traffic passes through
  OPEN = 'OPEN',           // Tripped, fast-failing traffic to trigger immediate fallback
  HALF_OPEN = 'HALF_OPEN', // Probe state, testing provider recovery
}

export enum ErrorSeverity {
  TRANSIENT = 'TRANSIENT',         // 408, 502, 503, 504, Timeout (Increments failure count)
  QUOTA_EXHAUSTED = 'QUOTA',       // 429 (Trips immediately to OPEN)
  AUTH_FAILURE = 'AUTH',           // 401, 403 (Trips to OPEN & alerts)
  CLIENT_ERROR = 'CLIENT',         // 400, 404 (Ignored by circuit breaker, no retry)
  VALID_EMPTY = 'VALID_EMPTY',     // 200 + [] (Normal business outcome, no fallback)
}

export interface CircuitBreakerConfig {
  failureThreshold?: number; // Failures before tripping (default: 3)
  recoveryTimeMs?: number;    // Duration in OPEN state before probe (default: 60,000ms)
  timeoutMs?: number;         // Execution timeout (default: 3,500ms)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeMs: number;
  private readonly timeoutMs: number;

  constructor(public readonly name: string, config?: CircuitBreakerConfig) {
    this.failureThreshold = config?.failureThreshold ?? 3;
    this.recoveryTimeMs = config?.recoveryTimeMs ?? 60000;
    this.timeoutMs = config?.timeoutMs ?? 3500;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state;
  }

  public classifyError(error: any): ErrorSeverity {
    const msg = String(error?.message || '');

    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      return ErrorSeverity.QUOTA_EXHAUSTED;
    }
    if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID')) {
      return ErrorSeverity.AUTH_FAILURE;
    }
    if (msg.includes('400') || msg.includes('INVALID_REQUEST')) {
      return ErrorSeverity.CLIENT_ERROR;
    }
    if (msg.includes('timeout') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
      return ErrorSeverity.TRANSIENT;
    }

    return ErrorSeverity.TRANSIENT;
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === CircuitState.OPEN) {
      throw new Error(`[CircuitBreaker:${this.name}] Circuit is OPEN. Fast-failing to fallback.`);
    }

    try {
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`[CircuitBreaker:${this.name}] Request timed out after ${this.timeoutMs}ms`)), this.timeoutMs)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(error: any): void {
    const severity = this.classifyError(error);

    // Client errors (400) do NOT count towards circuit tripping
    if (severity === ErrorSeverity.CLIENT_ERROR) {
      return;
    }

    // Quota exhausted (429) or Auth failure (401/403) trips immediately
    if (severity === ErrorSeverity.QUOTA_EXHAUSTED || severity === ErrorSeverity.AUTH_FAILURE) {
      this.state = CircuitState.OPEN;
      this.lastFailureTime = Date.now();
      console.warn(`[CircuitBreaker:${this.name}] Critical error (${severity}). Circuit tripped to OPEN.`);
      return;
    }

    // Transient errors (5xx, timeout) increment failure count
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.warn(`[CircuitBreaker:${this.name}] Transient failure threshold reached (${this.failureCount}). Circuit tripped to OPEN.`);
    }
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }
}
