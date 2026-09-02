import { CachePolicy, PlaceProviderType } from '../places/types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private policies = new Map<PlaceProviderType, CachePolicy>();

  constructor() {
    // Default caching policies complying with provider licensing
    this.registerPolicy({
      provider: 'google',
      maxTtlSeconds: 3600 * 24, // 24 hours transient cache
      persist: false,
    });
    this.registerPolicy({
      provider: 'nominatim',
      maxTtlSeconds: 3600 * 48, // 48 hours for OpenStreetMap
      persist: true,
    });
    this.registerPolicy({
      provider: 'photon',
      maxTtlSeconds: 3600 * 24,
      persist: true,
    });
    this.registerPolicy({
      provider: 'local',
      maxTtlSeconds: 3600 * 24 * 7, // 7 days for local index
      persist: true,
    });
  }

  public registerPolicy(policy: CachePolicy): void {
    this.policies.set(policy.provider, policy);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  public set<T>(key: string, value: T, provider: PlaceProviderType): void {
    const policy = this.policies.get(provider) || {
      provider,
      maxTtlSeconds: 3600,
      persist: false,
    };

    const expiresAt = Date.now() + policy.maxTtlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });

    // Evict oldest entries if cache exceeds 1000 items
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const globalGatewayCache = new CacheService();
