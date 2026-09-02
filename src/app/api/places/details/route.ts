import { NextResponse } from 'next/server';
import { getPlaceSearchProvider } from '@/lib/places';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId' }, { status: 400 });
  }

  try {
    const provider = getPlaceSearchProvider();
    const place = await provider.getPlaceDetails(placeId);

    if (place) {
      return NextResponse.json({
        placeId: place.id,
        name: place.name,
        formattedAddress: place.address.formattedAddress,
        latitude: place.coordinates.lat,
        longitude: place.coordinates.lng,
        locationAccuracy: place.locationAccuracy,
        accessPoints: place.accessPoints || [],
        selectedAccessPoint: place.selectedAccessPoint,
        accessPointType: place.selectedAccessPoint?.type || 'unknown',
        verificationStatus: place.verificationStatus,
        confidence: place.confidence,
        address: place.address,
        source: place.source,
        accessibility: place.accessibility,
      });
    }
  } catch (error: any) {
    console.warn('[API /places/details] Error:', error?.message);
  }

  // No fallback! Return error so the UI handles it correctly.
  return NextResponse.json({ error: 'Live API failed to fetch location details' }, { status: 502 });
}
