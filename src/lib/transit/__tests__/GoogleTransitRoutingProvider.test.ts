import { describe, it, expect } from 'vitest';
import { GoogleTransitRoutingProvider } from '../providers/GoogleTransitRoutingProvider';

describe('GoogleTransitRoutingProvider (The Routing Method)', () => {
  const provider = new GoogleTransitRoutingProvider();

  it('Polyline Decoder: correctly decodes Google compressed polylines', () => {
    // Standard test polyline: (38.5, -120.2) to (40.7, -120.95) to (43.252, -126.453)
    const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    const decoded = provider.decodePolyline(encoded);

    expect(decoded.length).toBe(3);
    expect(decoded[0][0]).toBeCloseTo(38.5, 1);
    expect(decoded[0][1]).toBeCloseTo(-120.2, 1);
    expect(decoded[1][0]).toBeCloseTo(40.7, 1);
    expect(decoded[1][1]).toBeCloseTo(-120.95, 1);
  });

  it('Empty or invalid polyline returns empty array', () => {
    expect(provider.decodePolyline('')).toEqual([]);
  });

  it('Transit Route Discovery: generates valid Chennai transit itineraries with schedules & polylines', async () => {
    const originLat = 12.9602;
    const originLng = 80.2015;
    const destLat = 13.0078;
    const destLng = 80.2138;

    const routes = await provider.getTransitRoutes(
      originLat,
      originLng,
      destLat,
      destLng,
      'Jerusalem College of Engineering',
      'Guindy Metro Station'
    );

    expect(routes.length).toBeGreaterThan(0);

    const route1 = routes[0];
    expect(route1.coordinates.length).toBeGreaterThan(0);
    expect(route1.durationMin).toBeGreaterThan(0);
    expect(route1.legs.length).toBeGreaterThan(0);

    // Assert legs have mode, instructions, and duration
    const leg1 = route1.legs[0];
    expect(leg1.mode).toBeDefined();
    expect(leg1.instructions).toBeDefined();
    expect(leg1.durationMin).toBeGreaterThan(0);
  });
});
