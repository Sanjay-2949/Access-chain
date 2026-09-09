import type { BusData } from '../../../types';

export const runtime = 'edge';

// @ts-ignore
if (!globalThis.rateLimitMap) {
  // @ts-ignore
  globalThis.rateLimitMap = new Map<string, { count: number; resetTime: number }>();
}

export async function GET(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  console.log(`Proxy request started: ${requestId}`);

  // HTTPS Enforcement (skip for local development)
  if (request.url.startsWith('http://') && !request.url.includes('localhost')) {
    const httpsUrl = request.url.replace('http://', 'https://');
    return Response.redirect(httpsUrl, 301);
  }

  // Simple In-Memory Rate Limiting (per instance; use external store for production)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  
  // @ts-ignore
  const ipData = globalThis.rateLimitMap.get(clientIp) || { count: 0, resetTime: now };
  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + 60000;
  }
  if (ipData.count >= 50) { // Bumped up a bit for testing
    console.warn(`Rate limit exceeded for IP ${clientIp} (${requestId})`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
  ipData.count++;
  // @ts-ignore
  globalThis.rateLimitMap.set(clientIp, ipData);

  const url = new URL(request.url);

  // Query Param Validation (prevent injection: limit length, sanitize)
  const searchParams = url.searchParams;
  for (const [key, value] of searchParams) {
    if (key.length > 100 || value.length > 1000 || /[<>&"']/.test(value)) {
      console.error(`Invalid query param ${key}=${value} for ${requestId}`);
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  try {
    // Forward Request to Backend
    // For the hackathon, we may fall back to a mock/public endpoint if this is not set
    const backendUrl = process.env.BACKEND_URL || 'https://dummy-backend.invalid';
    
    if (!process.env.BACKEND_URL) {
       console.warn(`BACKEND_URL not set for ${requestId}, using mock responses if possible`);
    }

    const targetPath = url.pathname.replace('/api/proxy', '') || '/';
    const backendFullUrl = `${backendUrl}${targetPath}${url.search}`;

    let rawBusData;

    if (process.env.BACKEND_URL) {
        const backendResponse = await fetch(backendFullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!backendResponse.ok) {
            console.error(`Backend error ${backendResponse.status} for ${requestId}`);
            return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        rawBusData = await backendResponse.json();
    } else {
        // MOCK DATA for local testing if env not set
        rawBusData = {
           "TN01N1234": JSON.stringify({tS: Date.now(), lU: Date.now(), rN: "102X", eSN: "Broadway", rId: "123", latitude: 13.0827, longitude: 80.2707}),
           "TN01N5678": JSON.stringify({tS: Date.now(), lU: Date.now(), rN: "570", eSN: "CMBT", rId: "456", latitude: 13.0674, longitude: 80.2376})
        };
    }

    // Data Transformation
    let busData: BusData[] = [];
    if (rawBusData && typeof rawBusData === 'object' && !Array.isArray(rawBusData)) {
      busData = Object.entries(rawBusData)
        .map(([id, value]) => {
          if (typeof value !== 'string') return null;
          try {
            const details = JSON.parse(value);
            return {
              id: id,
              vehicle_id: id,
              timestamp: (details.tS || details.lU || Date.now()),
              lastSeenTimestamp: details.lU || details.tS || null,
              lU: details.lU,
              route_short_name: details.rN,
              trip_headsign: details.eSN,
              route_id: details.rId,
              agency_name: 'MTC',
              ...details
            };
          } catch (e) {
            console.warn(`Failed to parse data for bus ID ${id}: ${e} for ${requestId}`);
            return null;
          }
        })
        .filter((bus): bus is BusData => bus !== null);
    } else {
      console.error(`Unexpected backend response format for ${requestId}`);
      return new Response(JSON.stringify({ error: 'Invalid data format' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sMaxAge = process.env.CACHE_S_MAXAGE || '30';
    console.log(`Proxy success: ${busData.length} buses fetched for ${requestId}`);
    return new Response(JSON.stringify(busData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=60`, 
      },
    });

  } catch (error) {
    console.error(`Proxy error for ${requestId}: ${error}`);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
