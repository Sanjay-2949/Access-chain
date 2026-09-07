import { NextRequest, NextResponse } from 'next/server';
import {
  getLiveTransitVehicles,
  getNearbyAccessibleVehicles,
} from '@/lib/transit/ChennaiGtfsRealtimeEngine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeNumber = searchParams.get('routeNumber') || undefined;
  const agencyParam = searchParams.get('agency')?.toUpperCase();
  const agency = agencyParam === 'MTC' || agencyParam === 'CMRL' ? agencyParam : 'ALL';
  const lowFloorOnly = searchParams.get('lowFloorOnly') === 'true';

  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const radiusKmStr = searchParams.get('radiusKm') || '8';

  try {
    // If coordinates are provided, search nearby vehicles
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      const radiusKm = parseFloat(radiusKmStr);

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }

      const nearby = getNearbyAccessibleVehicles(lat, lng, radiusKm);
      return NextResponse.json({
        feedTimestamp: new Date().toISOString(),
        feedProvider: 'CHENNAI_CUMTA_GTFS_REALTIME',
        center: { lat, lng },
        radiusKm,
        totalVehicles: nearby.length,
        vehicles: nearby,
      });
    }

    // Otherwise, return filtered fleet
    const vehicles = getLiveTransitVehicles({
      routeId: routeNumber,
      agency,
      lowFloorOnly,
    });

    return NextResponse.json({
      feedTimestamp: new Date().toISOString(),
      feedProvider: 'CHENNAI_CUMTA_GTFS_REALTIME',
      filters: { routeNumber, agency, lowFloorOnly },
      totalVehicles: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error('[GTFS-RT Realtime API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve GTFS realtime feed' }, { status: 500 });
  }
}
