import { NextRequest, NextResponse } from 'next/server';
import { googleTransitProvider } from '@/lib/transit/providers/GoogleTransitRoutingProvider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const stopName = searchParams.get('stopName') || 'Bus Stop';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const departures = await googleTransitProvider.getDeparturesFromStop(lat, lng, stopName);
    return NextResponse.json(departures);
  } catch (error) {
    console.error('Departures API error:', error);
    return NextResponse.json({ error: 'Failed to fetch departures' }, { status: 500 });
  }
}
