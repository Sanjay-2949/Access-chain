import {
  IPlaceSearchProvider,
  PlaceSuggestion,
  CanonicalPlace,
  PlaceSearchOptions,
  PlaceProviderType,
} from '../types';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';

export class GooglePlacesProvider implements IPlaceSearchProvider {
  public readonly providerName: PlaceProviderType = 'google';

  constructor(private apiKey: string) {}

  public async autocomplete(query: string, options?: PlaceSearchOptions): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    const userLat = options?.proximityCoordinates?.lat ?? 12.9602;
    const userLng = options?.proximityCoordinates?.lng ?? 80.2015;
    const radius = options?.radiusMeters ?? 50000.0;

    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        input: query.trim(),
        includedRegionCodes: options?.countryCodes ?? ['in'],
        locationBias: {
          circle: {
            center: { latitude: userLat, longitude: userLng },
            radius,
          },
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`[GooglePlacesProvider] HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    if (!data.suggestions || data.suggestions.length === 0) {
      return [];
    }

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => PlaceNormalizer.fromGoogleSuggestion(s));
  }

  public async getPlaceDetails(placeId: string): Promise<CanonicalPlace | null> {
    const formattedId = placeId.startsWith('places/') ? placeId.replace('places/', '') : placeId;

    const res = await fetch(`https://places.googleapis.com/v1/places/${formattedId}`, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
      },
    });

    if (!res.ok) {
      throw new Error(`[GooglePlacesProvider] Details HTTP ${res.status}`);
    }

    const data = await res.json();
    return PlaceNormalizer.fromGoogleDetails(data);
  }

  public async search(query: string, options?: PlaceSearchOptions): Promise<CanonicalPlace[]> {
    const suggestions = await this.autocomplete(query, options);
    const details = await Promise.all(
      suggestions.slice(0, 3).map((s) => this.getPlaceDetails(s.placeId).catch(() => null))
    );
    return details.filter(Boolean) as CanonicalPlace[];
  }
}
