import {
  IPlaceSearchProvider,
  PlaceSuggestion,
  CanonicalPlace,
  PlaceSearchOptions,
  PlaceProviderType,
} from '../types';
import { PlaceNormalizer } from '../../gateway/PlaceNormalizer';

export class PhotonProvider implements IPlaceSearchProvider {
  public readonly providerName: PlaceProviderType = 'photon';

  public async autocomplete(query: string, options?: PlaceSearchOptions): Promise<PlaceSuggestion[]> {
    const places = await this.search(query, options);
    return places.map((p) => PlaceNormalizer.toSuggestion(p));
  }

  public async getPlaceDetails(placeId: string): Promise<CanonicalPlace | null> {
    return null;
  }

  public async search(query: string, options?: PlaceSearchOptions): Promise<CanonicalPlace[]> {
    if (!query || query.trim().length < 2) return [];

    const userLat = options?.proximityCoordinates?.lat ?? 12.9602;
    const userLng = options?.proximityCoordinates?.lng ?? 80.2015;
    const limit = options?.limit ?? 10;

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query.trim()
    )}&lat=${userLat}&lon=${userLng}&limit=${limit}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`[PhotonProvider] HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.features || data.features.length === 0) return [];

    // Filter strictly to India
    return data.features
      .filter((f: any) => {
        const props = f.properties || {};
        const [lng, lat] = f.geometry?.coordinates || [0, 0];
        const isCoordInIndia = lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;
        const isCountryIndia =
          props.country === 'India' ||
          props.countrycode === 'IN' ||
          props.state === 'Tamil Nadu' ||
          props.state === 'Karnataka' ||
          props.state === 'Kerala' ||
          props.state === 'Delhi';
        return isCoordInIndia && (isCountryIndia || !props.country);
      })
      .map((f: any) => PlaceNormalizer.fromPhoton(f));
  }
}
