export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TransitStop {
  id: string;
  name: string;
  coords: Coordinates;
  isPassed: boolean;
  isNext: boolean;
  etaSeconds: number;
  hasWheelchairRamp: boolean;
  hasTactilePaving: boolean;
}

export interface LiveVehicleState {
  vehicleId: string;
  routeNumber: string;
  routeName: string;
  operator: string;
  currentCoords: Coordinates;
  bearing: number; // degrees 0-360
  speedKmph: number;
  progressRatio: number; // 0.0 to 1.0
  distanceRemainingKm: number;
  etaTotalSeconds: number;
  currentPhase: 'WALK_TO_BUS' | 'BUS_TRANSIT' | 'WALK_TO_RAMP' | 'ARRIVED';
  currentStopIndex: number;
  nextStopName: string;
  stopsAway: number;
  accessibility: {
    isLowFloor: boolean;
    hasKneelingSuspension: boolean;
    hasWheelchairRamp: boolean;
    totalWheelchairBays: number;
    availableWheelchairBays: number;
    audioAnnouncementsOnline: boolean;
    rampStatus: 'DEPLOYED' | 'READY';
  };
  liveOccupancy: string;
}

// Calculate compass bearing between two coordinates
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Linear interpolation between two coordinates
export function interpolateCoords(p1: Coordinates, p2: Coordinates, fraction: number): Coordinates {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
}

// Calculate Haversine distance in Kilometers
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate realistic intermediate road waypoints between origin & destination
export function generateRouteWaypoints(origin: Coordinates, destination: Coordinates): Coordinates[] {
  const points: Coordinates[] = [];
  const totalSteps = 40;

  // Add slight curved road perturbations for realistic urban road geometry
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const perpLat = -(destination.lng - origin.lng) * 0.15;
  const perpLng = (destination.lat - origin.lat) * 0.15;

  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    // Quadratic Bezier interpolation for natural road curvature
    const lat =
      Math.pow(1 - t, 2) * origin.lat +
      2 * (1 - t) * t * (midLat + perpLat) +
      Math.pow(t, 2) * destination.lat;
    const lng =
      Math.pow(1 - t, 2) * origin.lng +
      2 * (1 - t) * t * (midLng + perpLng) +
      Math.pow(t, 2) * destination.lng;
    points.push({ lat, lng });
  }

  return points;
}

// Generate realistic bus stops along the road polyline
export function generateTransitStops(waypoints: Coordinates[]): TransitStop[] {
  if (waypoints.length < 5) return [];

  const stopNames = [
    'Origin Transit Bay',
    'Medavakkam Koot Road Junction',
    'Narayanapuram Lake Bus Stop',
    'Balaji Dental College Stop',
    'Pallikaranai Junction Stop',
    'Velachery Vijaya Nagar Terminus',
    'Destination Accessible Portal',
  ];

  const count = Math.min(stopNames.length, Math.floor(waypoints.length / 5));
  const stops: TransitStop[] = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor((i / (count - 1)) * (waypoints.length - 1));
    stops.push({
      id: `stop-${i + 1}`,
      name: stopNames[i] || `En-Route Stop #${i + 1}`,
      coords: waypoints[index],
      isPassed: false,
      isNext: i === 1,
      etaSeconds: (i + 1) * 90,
      hasWheelchairRamp: true,
      hasTactilePaving: true,
    });
  }

  return stops;
}
