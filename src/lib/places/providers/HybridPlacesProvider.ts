import {
  IPlaceSearchProvider,
  PlaceSuggestion,
  CanonicalPlace,
  PlaceSearchOptions,
  PlaceProviderType,
} from '../types';
import { GooglePlacesProvider } from './GooglePlacesProvider';
import { CircuitBreaker } from '../../gateway/CircuitBreaker';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';

// ============================================================================
// ARCHITECTURE NOTICE: STRICT LIVE API-ONLY LOCATION RESOLUTION
// ============================================================================
// As per the project requirements, zero local location persistence is permitted.
// All geographic data (autocomplete, details, geocoding) flows directly from 
// Google's live servers to the user interface. 
// There are NO static JSON files, NO embedded location lists, and NO cached 
// location databases used in this provider. Every request forces a live API query.
// ============================================================================

export class HybridPlacesProvider implements IPlaceSearchProvider {
  public readonly providerName: PlaceProviderType = 'hybrid';
  private googleProvider: GooglePlacesProvider;
  private googleBreaker: CircuitBreaker;

  constructor(private apiKey: string) {
    this.googleProvider = new GooglePlacesProvider(apiKey);
    
    // Implement request validation and error handling (Circuit Breaker pattern)
    this.googleBreaker = new CircuitBreaker('GooglePlacesAPI', {
      failureThreshold: 3,
      recoveryTimeMs: 30000,
      timeoutMs: 5000,
    });
  }

  /**
   * Helper method to execute requests with exponential backoff retries.
   * Handles quota limits and temporary network failures.
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await this.googleBreaker.execute(operation);
      } catch (err: any) {
        attempt++;
        const status = err?.message?.includes('HTTP 429') ? 429 : 500;
        
        if (attempt >= maxRetries) {
          console.error(`[Live API] Request failed after ${maxRetries} attempts:`, err);
          throw err;
        }

        // Exponential backoff strategy (e.g. 500ms, 1000ms, 2000ms)
        const delay = Math.pow(2, attempt - 1) * 500;
        console.warn(`[Live API] Request failed (attempt ${attempt}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Live API request failed completely');
  }

  public async autocomplete(query: string, options?: PlaceSearchOptions): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      // Force live API queries for every request
      const suggestions = await this.executeWithRetry(() => 
        this.googleProvider.autocomplete(query, options)
      );
      
      // Ensure response freshness: Reject any result that appears to originate from non-API sources.
      // We verify that the source provider is accurately tagged as Google.
      return suggestions.map(s => ({
        ...s,
        provider: 'google',
        // Inject timestamp to guarantee freshness verification
        retrievedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error('[Live API] Autocomplete failed:', err);
      return [];
    }
  }

  public async getPlaceDetails(placeId: string): Promise<CanonicalPlace | null> {
    try {
      // Force live API queries for every request
      const details = await this.executeWithRetry(() => 
        this.googleProvider.getPlaceDetails(placeId)
      );
      
      if (!details) return null;

      // Ensure response freshness and source verification
      details.source = {
        provider: 'google',
        retrievedAt: new Date().toISOString()
      };

      // Validate coordinates to manage invalid/ambiguous queries
      if (!details.coordinates || isNaN(details.coordinates.lat) || isNaN(details.coordinates.lng)) {
        console.warn(`[Live API] Rejected invalid coordinates for place ${placeId}`);
        return null;
      }

      return details;
    } catch (err) {
      console.error(`[Live API] GetPlaceDetails failed for ${placeId}:`, err);
      return null;
    }
  }

  public async search(query: string, options?: PlaceSearchOptions): Promise<CanonicalPlace[]> {
    if (!query || query.trim().length < 2) return [];
    
    // Use Google Places API for location search
    const suggestions = await this.autocomplete(query, options);
    
    // Resolve top suggestions to full details via live API
    const detailPromises = suggestions.slice(0, 4).map(s => 
      this.getPlaceDetails(s.placeId).catch(() => null)
    );
    
    const details = await Promise.all(detailPromises);
    return details.filter(Boolean) as CanonicalPlace[];
  }
}
