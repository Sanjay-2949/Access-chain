import {
  CanonicalPlace,
  PlaceSuggestion,
  LocationAccuracy,
  AccessPointType,
  VerificationStatus,
  AccessPoint,
  CONFIDENCE_CEILINGS,
} from '../places/types';
import { TemporalService } from './TemporalService';

export class PlaceNormalizer {
  /**
   * Normalize Google Places API (New) Autocomplete Prediction
   */
  public static fromGoogleSuggestion(prediction: any): PlaceSuggestion {
    const p = prediction.placePrediction || prediction;
    const placeId = p.placeId || p.place || `google-${Date.now()}`;
    const primary = p.structuredFormat?.mainText?.text || p.text?.text?.split(',')[0] || '';
    const secondary = p.structuredFormat?.secondaryText?.text || p.text?.text?.split(',').slice(1).join(',').trim() || '';

    return {
      placeId,
      primaryText: primary,
      secondaryText: secondary,
      fullText: p.text?.text || `${primary}, ${secondary}`.trim(),
      provider: 'google',
      verificationStatus: 'provider_verified',
      confidence: CONFIDENCE_CEILINGS.provider_verified,
    };
  }

  /**
   * Normalize Google Place Details Response
   */
  public static fromGoogleDetails(data: any): CanonicalPlace {
    const lat = data.location?.latitude || data.geometry?.location?.lat;
    const lng = data.location?.longitude || data.geometry?.location?.lng;

    let accuracy: LocationAccuracy = 'rooftop';
    const locationType = data.geometry?.location_type;
    if (locationType === 'ROOFTOP') accuracy = 'rooftop';
    else if (locationType === 'GEOMETRIC_CENTER') accuracy = 'locality';
    else if (locationType === 'APPROXIMATE') accuracy = 'approximate';

    const verifiedAt = new Date().toISOString();
    const ageInDays = TemporalService.calculateAgeInDays(verifiedAt);
    const { baseConfidence, effectiveConfidence, stalenessTier } =
      TemporalService.calculateEffectiveConfidence(85, 'provider_verified', ageInDays);

    const accessPoint: AccessPoint = {
      id: `ap-${data.id || data.place_id || 'g-main'}`,
      coordinates: { lat, lng },
      type: 'main_entrance',
      source: 'provider_verified',
      baseConfidence,
      effectiveConfidence,
      stalenessTier,
      ageInDays,
      isPrimaryWheelchairEntrance: false,
      physicalAttributes: {
        hasStepFreeAccess: false,
        doorMechanism: 'manual_swing',
      },
      verifiedAt,
      verifiedBy: 'Google Places API (New)',
      lastUpdatedAt: verifiedAt,
      evidenceSummary: 'Derived from official provider geocode',
    };

    return {
      id: data.id || data.place_id || `google-${Date.now()}`,
      name: data.displayName?.text || data.name || 'Selected Place',
      coordinates: { lat, lng },
      locationAccuracy: accuracy,
      accessPoints: [accessPoint],
      selectedAccessPoint: accessPoint,
      verificationStatus: 'provider_verified',
      confidence: effectiveConfidence,
      address: {
        formattedAddress: data.formattedAddress || data.formatted_address || '',
      },
      source: {
        provider: 'google',
        providerPlaceId: data.id || data.place_id,
        retrievedAt: verifiedAt,
      },
    };
  }

  /**
   * Normalize OpenStreetMap / Nominatim Result
   */
  public static fromNominatim(item: any, userLat?: number, userLng?: number): CanonicalPlace {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addr = item.address || {};

    let accuracy: LocationAccuracy = 'building';
    let accessPointType: AccessPointType = 'pedestrian_entrance';
    let verification: VerificationStatus = 'community_audited';
    let isWheelchair = false;
    let rawConfidence = 75;

    if (item.osm_type === 'node') {
      accuracy = 'entrance';
      accessPointType = 'pedestrian_entrance';
      rawConfidence = 80;
    } else if (item.class === 'highway' || item.class === 'road') {
      accuracy = 'street';
      accessPointType = 'unknown';
      rawConfidence = 70;
    } else if (item.class === 'boundary' || item.type === 'administrative') {
      accuracy = 'locality';
      accessPointType = 'unknown';
      rawConfidence = 60;
    }

    if (item.extratags?.wheelchair === 'yes') {
      accessPointType = 'wheelchair_entrance';
      isWheelchair = true;
      rawConfidence = 82;
    }

    const verifiedAt = new Date().toISOString();
    const ageInDays = TemporalService.calculateAgeInDays(verifiedAt);
    const { baseConfidence, effectiveConfidence, stalenessTier } =
      TemporalService.calculateEffectiveConfidence(rawConfidence, verification, ageInDays);

    const street = addr.road || addr.street || addr.footway || addr.pedestrian;
    const neighborhood = addr.suburb || addr.neighbourhood || addr.residential;
    const city = addr.city || addr.town || addr.municipality || addr.village;
    const district = addr.county || addr.district || addr.state_district;
    const state = addr.state;
    const postalCode = addr.postcode;
    const country = addr.country || 'India';
    const countryCode = addr.country_code ? addr.country_code.toUpperCase() : 'IN';

    const name = item.namedetails?.name || item.name || item.display_name.split(',')[0].trim();

    const accessPoint: AccessPoint = {
      id: `ap-osm-${item.place_id || item.osm_id}`,
      coordinates: { lat, lng },
      type: accessPointType,
      source: verification,
      baseConfidence,
      effectiveConfidence,
      stalenessTier,
      ageInDays,
      isPrimaryWheelchairEntrance: isWheelchair,
      physicalAttributes: {
        hasStepFreeAccess: isWheelchair,
        rampSlopeRatio: isWheelchair ? 0.0833 : undefined,
        doorWidthMm: isWheelchair ? 1100 : 900,
        doorMechanism: 'manual_swing',
      },
      verifiedAt,
      verifiedBy: 'OpenStreetMap Community',
      lastUpdatedAt: verifiedAt,
      evidenceSummary: 'OSM node/building feature with pedestrian accessibility tags',
    };

    return {
      id: `osm-${item.place_id || item.osm_id}`,
      name,
      coordinates: { lat, lng },
      locationAccuracy: accuracy,
      accessPoints: [accessPoint],
      selectedAccessPoint: accessPoint,
      verificationStatus: verification,
      confidence: effectiveConfidence,
      address: {
        street,
        houseNumber: addr.house_number,
        neighborhood,
        city,
        district,
        state,
        postalCode,
        country,
        countryCode,
        formattedAddress: item.display_name,
      },
      source: {
        provider: 'nominatim',
        providerPlaceId: String(item.place_id || item.osm_id),
        retrievedAt: verifiedAt,
      },
    };
  }

  /**
   * Normalize Photon (Komoot) Feature
   */
  public static fromPhoton(feature: any): CanonicalPlace {
    const props = feature.properties || {};
    const [lng, lat] = feature.geometry.coordinates;

    const name = props.name || props.street || props.city || 'Location';
    const street = props.street;
    const neighborhood = props.district || props.suburb;
    const city = props.city;
    const state = props.state;
    const postalCode = props.postcode;
    const country = props.country || 'India';
    const countryCode = props.countrycode ? props.countrycode.toUpperCase() : 'IN';

    const verifiedAt = new Date().toISOString();
    const ageInDays = TemporalService.calculateAgeInDays(verifiedAt);
    const { baseConfidence, effectiveConfidence, stalenessTier } =
      TemporalService.calculateEffectiveConfidence(60, 'inferred', ageInDays);

    const accessPoint: AccessPoint = {
      id: `ap-photon-${props.osm_id || Math.random()}`,
      coordinates: { lat, lng },
      type: 'unknown',
      source: 'inferred',
      baseConfidence,
      effectiveConfidence,
      stalenessTier,
      ageInDays,
      isPrimaryWheelchairEntrance: false,
      physicalAttributes: {
        hasStepFreeAccess: false,
      },
      verifiedAt,
      verifiedBy: 'Komoot Photon Spatial Index',
      lastUpdatedAt: verifiedAt,
      evidenceSummary: 'Algorithmic address centroid interpolation',
    };

    const addressParts = [props.name, props.street, props.district, props.city, props.state, props.country]
      .filter(Boolean)
      .join(', ');

    return {
      id: `photon-${props.osm_id || Math.random()}`,
      name,
      coordinates: { lat, lng },
      locationAccuracy: props.street ? 'street' : 'locality',
      accessPoints: [accessPoint],
      selectedAccessPoint: accessPoint,
      verificationStatus: 'inferred',
      confidence: effectiveConfidence,
      address: {
        street,
        houseNumber: props.housenumber,
        neighborhood,
        city,
        state,
        postalCode,
        country,
        countryCode,
        formattedAddress: addressParts || `${name}, ${country}`,
      },
      source: {
        provider: 'photon',
        providerPlaceId: String(props.osm_id || ''),
        retrievedAt: verifiedAt,
      },
    };
  }

  /**
   * Convert CanonicalPlace to lightweight PlaceSuggestion for dropdowns
   */
  public static toSuggestion(place: CanonicalPlace): PlaceSuggestion {
    const secondary = [
      place.address.neighborhood || place.address.street,
      place.address.city,
      place.address.state,
    ]
      .filter(Boolean)
      .join(', ');

    const hasVerifiedWheelchair =
      place.accessPoints?.some((ap) => ap.type === 'wheelchair_entrance' && ap.source === 'field_verified') ||
      place.selectedAccessPoint?.type === 'wheelchair_entrance';

    return {
      placeId: place.id,
      primaryText: place.name,
      secondaryText: secondary || place.address.formattedAddress,
      fullText: place.address.formattedAddress || place.name,
      provider: place.source.provider,
      verificationStatus: place.verificationStatus,
      confidence: place.confidence,
      hasVerifiedWheelchairEntrance: hasVerifiedWheelchair,
      coordinates: place.coordinates,
      distanceKm: place.distanceKm,
    };
  }
}
