import { describe, it, expect } from 'vitest';
import { CircuitBreaker, CircuitState } from '../CircuitBreaker';
import { PlaceNormalizer } from '../PlaceNormalizer';
import { CacheService } from '../CacheService';

describe('CircuitBreaker', () => {
  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker('TestBreaker');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should trip to OPEN state after failure threshold is exceeded', async () => {
    const breaker = new CircuitBreaker('TestBreaker', { failureThreshold: 2, recoveryTimeMs: 500 });

    // Fail 1
    await expect(breaker.execute(() => Promise.reject(new Error('500 Error')))).rejects.toThrow();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);

    // Fail 2 -> Trip
    await expect(breaker.execute(() => Promise.reject(new Error('500 Error')))).rejects.toThrow();
    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Fast-fail while OPEN
    await expect(breaker.execute(() => Promise.resolve('ok'))).rejects.toThrow(/Circuit is OPEN/);
  });

  it('should instantly trip to OPEN on 429 quota exceeded', async () => {
    const breaker = new CircuitBreaker('QuotaBreaker');
    await expect(breaker.execute(() => Promise.reject(new Error('429 RESOURCE_EXHAUSTED')))).rejects.toThrow();
    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });
});

describe('PlaceNormalizer', () => {
  it('should correctly normalize Nominatim DTO to CanonicalPlace', () => {
    const osmDto = {
      place_id: 12345,
      osm_type: 'node',
      name: 'Jerusalem College of Engineering',
      display_name: 'Jerusalem College of Engineering, Velachery Main Road, Chennai, Tamil Nadu, 600100, India',
      lat: '12.9456',
      lon: '80.2080',
      address: {
        road: 'Velachery Main Road',
        suburb: 'Pallikaranai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postcode: '600100',
        country: 'India',
        country_code: 'in',
      },
    };

    const place = PlaceNormalizer.fromNominatim(osmDto);
    expect(place.id).toBe('osm-12345');
    expect(place.name).toBe('Jerusalem College of Engineering');
    expect(place.coordinates.lat).toBe(12.9456);
    expect(place.coordinates.lng).toBe(80.2080);
    expect(place.locationAccuracy).toBe('entrance');
    expect(place.selectedAccessPoint?.type).toBe('pedestrian_entrance');
    expect(place.address.city).toBe('Chennai');
    expect(place.address.postalCode).toBe('600100');
  });
});

describe('CacheService', () => {
  it('should store and retrieve entries with TTL', () => {
    const cache = new CacheService();
    cache.set('key1', { data: 'test' }, 'google');
    expect(cache.get('key1')).toEqual({ data: 'test' });
    expect(cache.get('nonexistent')).toBeNull();
  });
});
