/**
 * Single-Flight (Request Coalescing) Pattern
 * Deduplicates concurrent identical in-flight promises to prevent upstream API thundering herds.
 */

export class SingleFlight {
  private inFlight = new Map<string, Promise<any>>();

  public async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fn();
      } finally {
        // Crucial: Clean up on both resolve AND reject so subsequent calls are not poisoned
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  public getInFlightCount(): number {
    return this.inFlight.size;
  }

  public clear(): void {
    this.inFlight.clear();
  }
}

export const globalSingleFlight = new SingleFlight();
