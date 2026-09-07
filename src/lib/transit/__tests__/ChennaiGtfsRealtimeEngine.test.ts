import { describe, it, expect } from 'vitest';
import {
  getLiveTransitVehicles,
  getNearbyAccessibleVehicles,
  calculateDistanceKm,
  CHENNAI_METRO_LINES,
  MTC_LOW_FLOOR_ROUTES,
} from '../ChennaiGtfsRealtimeEngine';

describe('Chennai GTFS & GTFS-Realtime Engine (MTC & CMRL)', () => {
  it('Fleet Ingestion: fetches live transit fleet with valid coordinates and GTFS-RT accessibility', () => {
    const vehicles = getLiveTransitVehicles();
    expect(vehicles.length).toBeGreaterThan(0);

    // Verify presence of both MTC Buses and CMRL Metro Trains
    const hasMtc = vehicles.some((v) => v.agency === 'MTC' && v.vehicleType === 'BUS');
    const hasCmrl = vehicles.some((v) => v.agency === 'CMRL' && v.vehicleType === 'METRO');
    expect(hasMtc).toBe(true);
    expect(hasCmrl).toBe(true);

    // Assert every vehicle has wheelchair accessibility metadata
    vehicles.forEach((v) => {
      expect(v.vehicleId).toBeDefined();
      expect(v.currentCoordinates.lat).toBeGreaterThan(12);
      expect(v.currentCoordinates.lng).toBeGreaterThan(80);
      expect(v.accessibility.isWheelchairAccessible).toBe(true);
      expect(v.accessibility.totalWheelchairBays).toBeGreaterThan(0);
    });
  });

  it('Agency Filtering: correctly filters by MTC and CMRL', () => {
    const mtcOnly = getLiveTransitVehicles({ agency: 'MTC' });
    expect(mtcOnly.every((v) => v.agency === 'MTC')).toBe(true);

    const cmrlOnly = getLiveTransitVehicles({ agency: 'CMRL' });
    expect(cmrlOnly.every((v) => v.agency === 'CMRL')).toBe(true);
    expect(cmrlOnly.length).toBeGreaterThan(0);
  });

  it('CMRL Metro Specifications: verifies certified level boarding gap and reserved cars', () => {
    const cmrlTrains = getLiveTransitVehicles({ agency: 'CMRL' });
    const blueLineTrain = cmrlTrains.find((t) => t.routeShortName.includes('Blue'));
    expect(blueLineTrain).toBeDefined();
    expect(blueLineTrain?.accessibility.levelBoardingGapMm).toBeLessThanOrEqual(50); // < 50mm certified step-free
    expect(blueLineTrain?.accessibility.designatedCars).toContain('Car 1 (Divyangjan Reserved)');
  });

  it('Low-Floor Wheelchair Bay Filter: filters fleet by active wheelchair bay availability', () => {
    const availableBays = getLiveTransitVehicles({ lowFloorOnly: true });
    expect(availableBays.length).toBeGreaterThan(0);
    availableBays.forEach((v) => {
      expect(v.accessibility.availableWheelchairBays).toBeGreaterThan(0);
    });
  });

  it('Geographic Proximity: returns nearby accessible vehicles ordered by distance', () => {
    // Guindy Metro Coordinates
    const guindyLat = 13.0067;
    const guindyLng = 80.2025;

    const nearby = getNearbyAccessibleVehicles(guindyLat, guindyLng, 10);
    expect(nearby.length).toBeGreaterThan(0);

    // Verify distance calculation is ascending
    for (let i = 0; i < nearby.length - 1; i++) {
      expect(nearby[i].distanceKm).toBeLessThanOrEqual(nearby[i + 1].distanceKm);
    }
  });

  it('Haversine distance calculation is accurate within Chennai', () => {
    // Chennai Central (13.0827, 80.2707) to Guindy (13.0067, 80.2025) is ~11 km
    const dist = calculateDistanceKm(13.0827, 80.2707, 13.0067, 80.2025);
    expect(dist).toBeGreaterThanOrEqual(9.5);
    expect(dist).toBeLessThanOrEqual(13);
  });
});
