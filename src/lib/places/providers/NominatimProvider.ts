import {
  IPlaceSearchProvider,
  PlaceSuggestion,
  CanonicalPlace,
  PlaceSearchOptions,
  PlaceProviderType,
} from '../types';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';

export class NominatimProvider implements IPlaceSearchProvider {
  public readonly providerName: PlaceProviderType = 'nominatim';

  public async autocomplete(query: string, options?: PlaceSearchOptions): Promise<PlaceSuggestion[]> {
    const places = await this.search(query, options);
    return places.map((p) => PlaceNormalizer.toSuggestion(p));
  }

  public async getPlaceDetails(placeId: string): Promise<CanonicalPlace | null> {
    const numericId = placeId.replace('osm-', '');
    const url = `https://nominatim.openstreetmap.org/details?osmtype=N&osmid=${numericId}&format=json&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AccessChain-A11y-Platform/1.0',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return PlaceNormalizer.fromNominatim(data);
  }

  public async search(query: string, options?: PlaceSearchOptions): Promise<CanonicalPlace[]> {
    if (!query || query.trim().length < 2) return [];

    const countryCodes = (options?.countryCodes ?? ['in']).join(',');
    const limit = options?.limit ?? 8;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&countrycodes=${countryCodes}&addressdetails=1&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AccessChain-A11y-Platform/1.0',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`[NominatimProvider] Search HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const userLat = options?.proximityCoordinates?.lat;
    const userLng = options?.proximityCoordinates?.lng;

    return data.map((item) => PlaceNormalizer.fromNominatim(item, userLat, userLng));
  }
}
