/**
 * Geospatial Validator and Coordinate Sanitizer
 */

export interface GeoBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const INDIA_BOUNDING_BOX: GeoBoundingBox = {
  minLat: 6.5,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
};

export const CHENNAI_METRO_BOUNDING_BOX: GeoBoundingBox = {
  minLat: 12.75,
  maxLat: 13.35,
  minLng: 79.9,
  maxLng: 80.4,
};

export class GeoValidator {
  /**
   * Validate that lat and lng are valid decimal coordinates
   */
  public static isValidCoordinate(lat: number, lng: number): boolean {
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Check if coordinate falls inside a geographic bounding box
   */
  public static isWithinBounds(lat: number, lng: number, bounds: GeoBoundingBox = INDIA_BOUNDING_BOX): boolean {
    if (!this.isValidCoordinate(lat, lng)) return false;
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
  }

  /**
   * Sanitize and format coordinates to 6 decimal places (~0.11m precision)
   */
  public static sanitizeCoordinate(lat: number, lng: number): { lat: number; lng: number } {
    if (!this.isValidCoordinate(lat, lng)) {
      throw new Error(`[GeoValidator] Invalid coordinates provided: lat=${lat}, lng=${lng}`);
    }
    return {
      lat: Math.round(lat * 1000000) / 1000000,
      lng: Math.round(lng * 1000000) / 1000000,
    };
  }

  /**
   * Format coordinates to human readable string (e.g. "12.9456° N, 80.2080° E")
   */
  public static formatCoordinatesReadable(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  }
}
