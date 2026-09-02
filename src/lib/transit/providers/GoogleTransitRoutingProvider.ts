export interface TransitRouteResult {
  id: string;
  isPrimary: boolean;
  summary: string;
  transitLine?: string;
  operator?: string;
  vehicleType?: string;
  departureTime?: string;
  arrivalTime?: string;
  headwayMinutes?: number;
  stopsCount?: number;
  distanceKm: number;
  durationMin: number;
  fareInr?: number;
  coordinates: [number, number][]; // [lat, lng]
  midPoint: [number, number];
  legs: Array<{
    mode: 'WALK' | 'BUS' | 'METRO' | 'AUTO' | 'TRAIN';
    lineName?: string;
    agencyName?: string;
    departureStopName?: string;
    arrivalStopName?: string;
    departureTime?: string;
    arrivalTime?: string;
    stopCount?: number;
    instructions: string;
    durationMin: number;
    distanceMeters: number;
    coordinates: [number, number][];
  }>;
}

export class GoogleTransitRoutingProvider {
  private apiKey: string;

  constructor() {
    this.apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      '';
  }

  /**
   * Decodes Google's compressed polyline format into an array of [lat, lng] tuples.
   */
  public decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    const poly: [number, number][] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push([lat / 1e5, lng / 1e5]);
    }
    return poly;
  }

  /**
   * Fetches real-time transit routing from Google Routes API v2.
   * Falls back to OSRM road geometry only if the API call fails.
   */
  public async getTransitRoutes(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    originName = 'Origin',
    destName = 'Destination'
  ): Promise<TransitRouteResult[]> {
    if (this.apiKey) {
      try {
        const result = await this.fetchRoutesApiV2(originLat, originLng, destLat, destLng, originName, destName);
        if (result && result.length > 0) {
          return result;
        }
      } catch (err) {
        console.warn('Google Routes API v2 error, falling back to OSRM:', err);
      }
    }

    // Fallback to OSRM road geometry
    return await this.generateOsrmRoadTransitFallback(originLat, originLng, destLat, destLng, originName, destName);
  }

  /**
   * Calls the Google Routes API v2 with TRANSIT travel mode.
   * Parses real bus lines, agencies, stop counts, departure/arrival times.
   */
  private async fetchRoutesApiV2(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    originName: string,
    destName: string
  ): Promise<TransitRouteResult[]> {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const body = {
      origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
      destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
      travelMode: 'TRANSIT',
      computeAlternativeRoutes: true,
      transitPreferences: {
        routingPreference: 'LESS_WALKING',
      },
    };

    const fieldMask = [
      'routes.duration',
      'routes.distanceMeters',
      'routes.polyline.encodedPolyline',
      'routes.legs.duration',
      'routes.legs.distanceMeters',
      'routes.legs.polyline.encodedPolyline',
      'routes.legs.steps.travelMode',
      'routes.legs.steps.staticDuration',
      'routes.legs.steps.polyline.encodedPolyline',
      'routes.legs.steps.transitDetails',
    ].join(',');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.error) {
      console.warn('Routes API v2 error:', data.error.message);
      return [];
    }

    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    return data.routes.map((route: any, routeIndex: number) =>
      this.parseRoutesV2Route(route, routeIndex, originLat, originLng, destLat, destLng, originName, destName)
    );
  }

  /**
   * Parses a single route from the Routes API v2 response into our TransitRouteResult.
   */
  private parseRoutesV2Route(
    route: any,
    routeIndex: number,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    originName: string,
    destName: string
  ): TransitRouteResult {
    const overviewCoords = route.polyline?.encodedPolyline
      ? this.decodePolyline(route.polyline.encodedPolyline)
      : [];

    const totalDurationSec = parseInt(route.duration?.replace('s', '') || '0', 10);
    const totalDistanceM = route.distanceMeters || 0;

    let firstTransitLine = '';
    let firstOperator = '';
    let firstVehicleType = 'BUS';
    let firstDepartureTime = '';
    let firstArrivalTime = '';
    let totalStops = 0;
    const allTransitLines: string[] = [];

    const legs: TransitRouteResult['legs'] = [];

    const routeLegs = route.legs || [];
    for (const leg of routeLegs) {
      const steps = leg.steps || [];

      for (const step of steps) {
        const travelMode = step.travelMode || 'WALK';
        const stepDurSec = parseInt(step.staticDuration?.replace('s', '') || '0', 10);
        const stepCoords = step.polyline?.encodedPolyline
          ? this.decodePolyline(step.polyline.encodedPolyline)
          : [];

        if (travelMode === 'TRANSIT' && step.transitDetails) {
          const td = step.transitDetails;
          const stopDetails = td.stopDetails || {};
          const transitLine = td.transitLine || {};
          const lineShort = transitLine.nameShort || transitLine.name || '';
          const agencies = transitLine.agencies || [];
          const agencyName = agencies[0]?.name || 'MTC Chennai';
          const vehicleType = transitLine.vehicle?.type || 'BUS';
          const stopCount = td.stopCount || 0;

          const depStop = stopDetails.departureStop?.name || originName;
          const arrStop = stopDetails.arrivalStop?.name || destName;
          const depTime = stopDetails.departureTime || '';
          const arrTime = stopDetails.arrivalTime || '';

          // Parse ISO time to local HH:MM
          const depTimeLocal = this.isoToLocalTime(depTime);
          const arrTimeLocal = this.isoToLocalTime(arrTime);

          totalStops += stopCount;
          allTransitLines.push(lineShort);

          if (!firstTransitLine) {
            firstTransitLine = lineShort;
            firstOperator = agencyName;
            firstVehicleType = vehicleType;
            firstDepartureTime = depTimeLocal;
          }
          firstArrivalTime = arrTimeLocal;

          // Map Google vehicle type to our mode
          const mode = this.mapVehicleType(vehicleType);

          legs.push({
            mode,
            lineName: lineShort,
            agencyName,
            departureStopName: depStop,
            arrivalStopName: arrStop,
            departureTime: depTimeLocal,
            arrivalTime: arrTimeLocal,
            stopCount,
            instructions: `Board ${lineShort} ${agencyName} toward ${arrStop}`,
            durationMin: Math.max(1, Math.round(stepDurSec / 60)),
            distanceMeters: this.estimateStepDistance(stepCoords),
            coordinates: stepCoords,
          });
        } else {
          // Walking step
          const walkDistM = this.estimateStepDistance(stepCoords);
          const walkDurMin = Math.max(1, Math.round(stepDurSec / 60));

          legs.push({
            mode: 'WALK',
            instructions: walkDistM > 0
              ? `Walk ${walkDistM}m (${walkDurMin} min)`
              : `Walk to transit stop`,
            durationMin: walkDurMin,
            distanceMeters: walkDistM,
            coordinates: stepCoords,
          });
        }
      }
    }

    const coords = overviewCoords.length > 0
      ? overviewCoords
      : [[originLat, originLng] as [number, number], [destLat, destLng] as [number, number]];
    const midIdx = Math.floor(coords.length / 2);
    const midPoint = coords[midIdx] || [(originLat + destLat) / 2, (originLng + destLng) / 2];

    const summary = allTransitLines.length > 0
      ? `${allTransitLines.join(' → ')} via ${firstOperator}`
      : `Transit Route ${routeIndex + 1}`;

    return {
      id: `google-v2-${routeIndex}`,
      isPrimary: routeIndex === 0,
      summary,
      transitLine: firstTransitLine || undefined,
      operator: firstOperator || undefined,
      vehicleType: firstVehicleType,
      departureTime: firstDepartureTime || undefined,
      arrivalTime: firstArrivalTime || undefined,
      stopsCount: totalStops || undefined,
      distanceKm: Math.round((totalDistanceM / 1000) * 10) / 10,
      durationMin: Math.max(1, Math.round(totalDurationSec / 60)),
      fareInr: this.estimateFare(totalDistanceM, firstVehicleType),
      coordinates: coords,
      midPoint,
      legs,
    };
  }

  private mapVehicleType(googleType: string): 'BUS' | 'METRO' | 'TRAIN' | 'WALK' {
    const upper = (googleType || '').toUpperCase();
    if (upper === 'SUBWAY' || upper === 'METRO_RAIL' || upper === 'METRO') return 'METRO';
    if (upper === 'RAIL' || upper === 'HEAVY_RAIL' || upper === 'HIGH_SPEED_TRAIN' || upper === 'LONG_DISTANCE_TRAIN' || upper === 'COMMUTER_TRAIN') return 'TRAIN';
    return 'BUS';
  }

  private isoToLocalTime(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    } catch {
      return '';
    }
  }

  private estimateStepDistance(coords: [number, number][]): number {
    if (coords.length < 2) return 0;
    let totalM = 0;
    for (let i = 1; i < coords.length; i++) {
      const dLat = (coords[i][0] - coords[i - 1][0]) * 111320;
      const dLng = (coords[i][1] - coords[i - 1][1]) * 111320 * Math.cos(coords[i][0] * Math.PI / 180);
      totalM += Math.sqrt(dLat * dLat + dLng * dLng);
    }
    return Math.round(totalM);
  }

  private estimateFare(distanceM: number, vehicleType: string): number {
    const distKm = distanceM / 1000;
    if (vehicleType === 'RAIL' || vehicleType === 'HEAVY_RAIL' || vehicleType === 'TRAIN') {
      return Math.max(10, Math.round(distKm * 0.7));
    }
    if (vehicleType === 'SUBWAY' || vehicleType === 'METRO') {
      return Math.max(10, Math.min(70, Math.round(10 + distKm * 2)));
    }
    // Bus fare — MTC Chennai stage-based
    if (distKm <= 3) return 5;
    if (distKm <= 5) return 10;
    if (distKm <= 10) return 15;
    if (distKm <= 15) return 20;
    return Math.min(50, Math.round(distKm * 1.5));
  }

  /**
   * Fetches live departures from a specific stop using Routes API v2.
   * Queries multiple destinations to discover which bus lines serve this stop.
   */
  public async getDeparturesFromStop(
    stopLat: number,
    stopLng: number,
    stopName: string,
  ): Promise<{
    stopName: string;
    upcoming: Array<{
      lineShort: string;
      destination: string;
      scheduledTime: string;
      minutesAway: number;
      agencyName: string;
      vehicleType: string;
      stopCount?: number;
    }>;
    previous: Array<{
      lineShort: string;
      destination: string;
      departedTime: string;
      minutesAgo: number;
      agencyName: string;
    }>;
  }> {
    const destinations = [
      { lat: 12.8406, lng: 80.1534, name: 'Velachery' },
      { lat: 13.0827, lng: 80.2707, name: 'Chennai Central' },
      { lat: 12.9516, lng: 80.1462, name: 'Guindy' },
      { lat: 13.0604, lng: 80.2496, name: 'T. Nagar' },
      { lat: 13.1143, lng: 80.2853, name: 'Royapuram' },
    ];

    const upcoming: Array<{
      lineShort: string;
      destination: string;
      scheduledTime: string;
      minutesAway: number;
      agencyName: string;
      vehicleType: string;
      stopCount?: number;
    }> = [];

    const seenLines = new Set<string>();
    const now = new Date();

    const queryPromises = destinations.map(async (dest) => {
      try {
        const routes = await this.fetchRoutesApiV2(stopLat, stopLng, dest.lat, dest.lng, stopName, dest.name);
        for (const route of routes) {
          for (const leg of route.legs) {
            if (leg.mode !== 'WALK' && leg.lineName) {
              const lineKey = `${leg.lineName}-${leg.arrivalStopName || dest.name}`;
              if (seenLines.has(lineKey)) continue;
              seenLines.add(lineKey);

              const depTime = leg.departureTime || '';
              let minutesAway = 0;
              if (depTime) {
                const parts = depTime.split(':').map(Number);
                if (parts.length >= 2) {
                  const depDate = new Date(now);
                  depDate.setHours(parts[0], parts[1], 0, 0);
                  minutesAway = Math.max(0, Math.round((depDate.getTime() - now.getTime()) / 60000));
                }
              }

              upcoming.push({
                lineShort: leg.lineName,
                destination: leg.arrivalStopName || dest.name,
                scheduledTime: depTime,
                minutesAway,
                agencyName: leg.agencyName || 'Metropolitan Transport Corporation',
                vehicleType: route.vehicleType || 'BUS',
                stopCount: leg.stopCount,
              });
            }
          }
        }
      } catch {
        // Silently skip failed destinations
      }
    });

    await Promise.all(queryPromises);
    upcoming.sort((a, b) => a.minutesAway - b.minutesAway);

    // Generate previous departures based on discovered lines
    const previous = upcoming.slice(0, 3).map((dep) => {
      const pastMin = Math.round(5 + Math.random() * 15);
      const pastTime = new Date(now.getTime() - pastMin * 60000);
      return {
        lineShort: dep.lineShort,
        destination: dep.destination,
        departedTime: pastTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
        minutesAgo: pastMin,
        agencyName: dep.agencyName,
      };
    });

    return { stopName, upcoming, previous };
  }

  /**
   * Find nearby bus stops using Google Places API (New).
   */
  public async getNearbyStops(
    lat: number,
    lng: number,
    radiusMeters: number = 500,
  ): Promise<Array<{
    name: string;
    lat: number;
    lng: number;
    distanceMeters: number;
    walkingMinutes: number;
  }>> {
    if (!this.apiKey) return [];

    try {
      const url = 'https://places.googleapis.com/v1/places:searchNearby';
      const body = {
        includedTypes: ['bus_station', 'bus_stop', 'transit_station'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.location,places.shortFormattedAddress',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.places || data.places.length === 0) return [];

      return data.places.map((place: any) => {
        const pLat = place.location?.latitude || lat;
        const pLng = place.location?.longitude || lng;
        const dLat = (pLat - lat) * 111320;
        const dLng = (pLng - lng) * 111320 * Math.cos(lat * Math.PI / 180);
        const distM = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

        return {
          name: place.displayName?.text || 'Bus Stop',
          lat: pLat,
          lng: pLng,
          distanceMeters: distM,
          walkingMinutes: Math.max(1, Math.round(distM / 80)),
        };
      }).sort((a: any, b: any) => a.distanceMeters - b.distanceMeters);
    } catch (e) {
      console.warn('Failed to fetch nearby stops:', e);
      return [];
    }
  }

  private async generateOsrmRoadTransitFallback(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    originName: string,
    destName: string
  ): Promise<TransitRouteResult[]> {
    let primaryRoadCoordinates: [number, number][] = [];
    let realRoadDistKm = 0;
    let realRoadDurationMin = 0;

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true`;
      const res = await fetch(osrmUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          primaryRoadCoordinates = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          realRoadDistKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
          realRoadDurationMin = Math.max(15, Math.round(data.routes[0].duration / 60));
        }
      }
    } catch (e) {
      console.warn('OSRM fallback failed:', e);
    }

    if (primaryRoadCoordinates.length === 0) {
      const distKm = Math.round(
        Math.sqrt(Math.pow(originLat - destLat, 2) + Math.pow(originLng - destLng, 2)) * 111 * 10
      ) / 10;
      realRoadDistKm = distKm;
      realRoadDurationMin = Math.round(distKm * 1.2);
      primaryRoadCoordinates = [
        [originLat, originLng],
        [(originLat + destLat) / 2, (originLng + destLng) / 2],
        [destLat, destLng],
      ];
    }

    const midIdx = Math.floor(primaryRoadCoordinates.length / 2);
    const midPoint = primaryRoadCoordinates[midIdx] || [(originLat + destLat) / 2, (originLng + destLng) / 2];

    return [{
      id: 'osrm-fallback-0',
      isPrimary: true,
      summary: `Road route via OSRM (${realRoadDistKm} km)`,
      distanceKm: realRoadDistKm,
      durationMin: realRoadDurationMin,
      coordinates: primaryRoadCoordinates,
      midPoint,
      legs: [
        {
          mode: 'WALK',
          instructions: `Walk from ${originName} to boarding point`,
          durationMin: 3,
          distanceMeters: 80,
          coordinates: [primaryRoadCoordinates[0], primaryRoadCoordinates[1]],
        },
        {
          mode: 'BUS',
          instructions: `Transit from ${originName} to ${destName}`,
          durationMin: Math.max(10, realRoadDurationMin - 6),
          distanceMeters: Math.round(realRoadDistKm * 1000),
          coordinates: primaryRoadCoordinates,
        },
        {
          mode: 'WALK',
          instructions: `Walk to ${destName}`,
          durationMin: 3,
          distanceMeters: 60,
          coordinates: [primaryRoadCoordinates[primaryRoadCoordinates.length - 2], primaryRoadCoordinates[primaryRoadCoordinates.length - 1]],
        },
      ],
    }];
  }
}

export const googleTransitProvider = new GoogleTransitRoutingProvider();
