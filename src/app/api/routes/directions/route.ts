import { NextResponse } from 'next/server';
import { googleTransitProvider } from '@/lib/transit/providers/GoogleTransitRoutingProvider';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originLatStr = searchParams.get('originLat');
  const originLngStr = searchParams.get('originLng');
  const destLatStr = searchParams.get('destLat');
  const destLngStr = searchParams.get('destLng');

  if (!originLatStr || !originLngStr || !destLatStr || !destLngStr) {
    return NextResponse.json({ error: 'Missing origin or destination coordinates' }, { status: 400 });
  }

  const originLat = parseFloat(originLatStr);
  const originLng = parseFloat(originLngStr);
  const destLat = parseFloat(destLatStr);
  const destLng = parseFloat(destLngStr);
  const originName = searchParams.get('originName') || 'Origin';
  const destName = searchParams.get('destName') || 'Destination';

  try {
    const routes = await googleTransitProvider.getTransitRoutes(
      originLat,
      originLng,
      destLat,
      destLng,
      originName,
      destName
    );

    return NextResponse.json({
      status: 'OK',
      source: 'GoogleTransitRoutingProvider',
      routes,
      origin: { lat: originLat, lng: originLng, name: originName },
      destination: { lat: destLat, lng: destLng, name: destName },
    });
  } catch (err: any) {
    console.error('Transit routing API error:', err);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: err.message || 'Failed to compute transit routes',
        routes: [],
      },
      { status: 500 }
    );
  }
}
