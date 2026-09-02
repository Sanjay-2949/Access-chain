import { IPlaceSearchProvider, PlaceProviderType } from './types';
import { GooglePlacesProvider } from './providers/GooglePlacesProvider';
import { NominatimProvider } from './providers/NominatimProvider';
import { PhotonProvider } from './providers/PhotonProvider';
import { HybridPlacesProvider } from './providers/HybridPlacesProvider';

export * from './types';
export { PlaceNormalizer } from '../gateway/PlaceNormalizer';

export function getPlaceSearchProvider(preferredType?: PlaceProviderType): IPlaceSearchProvider {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyC3usuHm_bRVT4mGQ4sCO2ZpiigsutnY2A';

  const type = preferredType || (process.env.NEXT_PUBLIC_SEARCH_PROVIDER as PlaceProviderType) || 'hybrid';

  switch (type) {
    case 'google':
      return new GooglePlacesProvider(apiKey);
    case 'nominatim':
      return new NominatimProvider();
    case 'photon':
      return new PhotonProvider();
    case 'hybrid':
    default:
      return new HybridPlacesProvider(apiKey);
  }
}
