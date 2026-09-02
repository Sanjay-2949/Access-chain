import { NextResponse } from 'next/server';
import { getPlaceSearchProvider } from '@/lib/places';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  const userLat = latParam ? parseFloat(latParam) : undefined;
  const userLng = lngParam ? parseFloat(lngParam) : undefined;

  try {
    const provider = getPlaceSearchProvider();
    
    // Only pass proximity if provided by client GPS
    const options: any = {
      countryCodes: ['in'],
      limit: 8,
    };
    if (userLat !== undefined && userLng !== undefined) {
      options.proximityCoordinates = { lat: userLat, lng: userLng };
    }
    
    const suggestions = await provider.autocomplete(query, options);

    const results = suggestions.map((s) => ({
      placeId: s.placeId,
      name: s.primaryText,
      address: s.fullText,
      secondary: s.secondaryText,
      lat: s.coordinates?.lat,
      lng: s.coordinates?.lng,
      distanceKm: s.distanceKm,
      source: s.provider,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.warn('[API /places/search] Error:', error?.message);
    return NextResponse.json({ results: [] });
  }
}
