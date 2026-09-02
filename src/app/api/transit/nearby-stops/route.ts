import { NextRequest, NextResponse } from 'next/server';
import { googleTransitProvider } from '@/lib/transit/providers/GoogleTransitRoutingProvider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radiusMeters') || '500', 10);

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const stops = await googleTransitProvider.getNearbyStops(lat, lng, radius);
    return NextResponse.json({ stops, radiusMeters: radius, center: { lat, lng } });
  } catch (error) {
    console.error('Nearby stops API error:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby stops' }, { status: 500 });
  }
}
