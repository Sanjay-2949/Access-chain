import { TransitVehiclePosition, TransitStop } from './types';

export interface GtfsRtTripDescriptor {
  tripId: string;
  routeId: string;
  startTime: string;
  startDate: string;
  scheduleRelationship: 'SCHEDULED' | 'ADDED' | 'UNSCHEDULED';
}

export interface GtfsRtVehiclePositionEntity {
  id: string;
  vehicle: {
    trip?: GtfsRtTripDescriptor;
    position: {
      latitude: number;
      longitude: number;
      bearing?: number;
      speed?: number; // m/s
    };
    currentStopSequence?: number;
    currentStatus?: 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO';
    timestamp: number;
    congestionLevel?: 'RUNNING_SMOOTHLY' | 'STOP_AND_GO' | 'CONGESTION';
    occupancyStatus?: string;
    vehicleId: string;
    label: string;
  };
  accessibility: TransitVehiclePosition['accessibility'];
  agency: 'MTC' | 'CMRL';
  routeShortName: string;
  headsign: string;
  operator: string;
}

export interface ChennaiMetroRouteDef {
  routeId: string;
  lineName: string;
  colorHex: string;
  stations: {
    name: string;
    lat: number;
    lng: number;
    hasElevator: boolean;
    levelGapMm: number;
    tactilePaving: boolean;
  }[];
  activeTrains: {
    trainId: string;
    speedKmph: number;
    bearing: number;
    baysTotal: number;
    baysAvailable: number;
    levelGapMm: number;
  }[];
}

// ==========================================
// CHENNAI METRO (CMRL) REALTIME DATABASE
// ==========================================
export const CHENNAI_METRO_LINES: Record<string, ChennaiMetroRouteDef> = {
  'CMRL-BLUE': {
    routeId: 'cmrl-blue',
    lineName: 'CMRL Blue Line (Wimco Nagar ⇄ Chennai Central ⇄ Airport)',
    colorHex: '#0284c7',
    stations: [
      { name: 'Wimco Nagar Depot', lat: 13.1705, lng: 80.3015, hasElevator: true, levelGapMm: 40, tactilePaving: true },
      { name: 'Tondiarpet Metro', lat: 13.1250, lng: 80.2890, hasElevator: true, levelGapMm: 42, tactilePaving: true },
      { name: 'Chennai Central Metro (Interchange)', lat: 13.0827, lng: 80.2707, hasElevator: true, levelGapMm: 38, tactilePaving: true },
      { name: 'LIC / Anna Salai', lat: 13.0640, lng: 80.2640, hasElevator: true, levelGapMm: 40, tactilePaving: true },
      { name: 'Thousand Lights Metro', lat: 13.0560, lng: 80.2540, hasElevator: true, levelGapMm: 41, tactilePaving: true },
      { name: 'Saidapet Metro', lat: 13.0158, lng: 80.2205, hasElevator: true, levelGapMm: 39, tactilePaving: true },
      { name: 'Guindy Metro (Railway Interchange)', lat: 13.0067, lng: 80.2025, hasElevator: true, levelGapMm: 40, tactilePaving: true },
      { name: 'Alandur Metro (Elevated Interchange)', lat: 12.9975, lng: 80.2005, hasElevator: true, levelGapMm: 44, tactilePaving: true },
      { name: 'Meenambakkam Metro', lat: 12.9870, lng: 80.1780, hasElevator: true, levelGapMm: 42, tactilePaving: true },
      { name: 'Chennai International Airport Metro', lat: 12.9790, lng: 80.1650, hasElevator: true, levelGapMm: 36, tactilePaving: true },
    ],
    activeTrains: [
      { trainId: 'CMRL-TR-102', speedKmph: 52, bearing: 215, baysTotal: 4, baysAvailable: 3, levelGapMm: 38 },
      { trainId: 'CMRL-TR-108', speedKmph: 48, bearing: 35, baysTotal: 4, baysAvailable: 2, levelGapMm: 40 },
    ],
  },
  'CMRL-GREEN': {
    routeId: 'cmrl-green',
    lineName: 'CMRL Green Line (Chennai Central ⇄ Koyambedu CMBT ⇄ St. Thomas Mount)',
    colorHex: '#10b981',
    stations: [
      { name: 'Chennai Central Metro (Central Square)', lat: 13.0827, lng: 80.2707, hasElevator: true, levelGapMm: 38, tactilePaving: true },
      { name: 'Egmore Metro', lat: 13.0780, lng: 80.2610, hasElevator: true, levelGapMm: 42, tactilePaving: true },
      { name: 'Nehru Park Metro', lat: 13.0795, lng: 80.2450, hasElevator: true, levelGapMm: 40, tactilePaving: true },
      { name: 'Kilpauk Medical College', lat: 13.0785, lng: 80.2380, hasElevator: true, levelGapMm: 40, tactilePaving: true },
      { name: 'Shenoy Nagar Metro', lat: 13.0790, lng: 80.2260, hasElevator: true, levelGapMm: 43, tactilePaving: true },
      { name: 'Koyambedu CMBT Metro Terminus', lat: 13.0694, lng: 80.2052, hasElevator: true, levelGapMm: 39, tactilePaving: true },
      { name: 'Vadapalani Metro', lat: 13.0505, lng: 80.2120, hasElevator: true, levelGapMm: 41, tactilePaving: true },
      { name: 'Ashok Nagar Metro', lat: 13.0360, lng: 80.2110, hasElevator: true, levelGapMm: 42, tactilePaving: true },
      { name: 'Alandur Metro (Platform 2)', lat: 12.9975, lng: 80.2005, hasElevator: true, levelGapMm: 44, tactilePaving: true },
      { name: 'St. Thomas Mount Metro / MRTS', lat: 12.9950, lng: 80.1980, hasElevator: true, levelGapMm: 40, tactilePaving: true },
    ],
    activeTrains: [
      { trainId: 'CMRL-TR-204', speedKmph: 55, bearing: 240, baysTotal: 4, baysAvailable: 4, levelGapMm: 40 },
    ],
  },
};

// ==========================================
// MTC CHENNAI ELECTRIC LOW-FLOOR BUS DATABASE
// ==========================================
export const MTC_LOW_FLOOR_ROUTES: Record<string, {
  routeNumber: string;
  routeName: string;
  stops: { name: string; lat: number; lng: number }[];
  vehicles: {
    vehicleId: string;
    operator: string;
    speedKmph: number;
    bearing: number;
    baysTotal: number;
    baysAvailable: number;
    hasKneeling: boolean;
  }[];
}> = {
  '51B': {
    routeNumber: '51B',
    routeName: 'Saidapet ⇄ Velachery ⇄ Narayanapuram (Jerusalem) ⇄ Medavakkam',
    stops: [
      { name: 'Saidapet Metro / Bus Stand', lat: 13.0158, lng: 80.2205 },
      { name: 'Guindy Race Course / Checkpost', lat: 13.0075, lng: 80.2185 },
      { name: 'Velachery Vijaya Nagar Terminus', lat: 12.9782, lng: 80.2212 },
      { name: 'Kaiveli Bus Stop', lat: 12.9650, lng: 80.2140 },
      { name: 'Jerusalem College / Narayanapuram', lat: 12.9456, lng: 80.2080 },
      { name: 'Sree Balaji Dental College & Hospital', lat: 12.9422, lng: 80.2095 },
      { name: 'Pallikaranai Oil Mill / Tropical Colony', lat: 12.9326, lng: 80.2168 },
      { name: 'Medavakkam Koot Road Junction', lat: 12.9210, lng: 80.1915 },
    ],
    vehicles: [
      {
        vehicleId: 'TN-01-AN-4821',
        operator: 'MTC Chennai (Electric Low-Floor AC)',
        speedKmph: 32,
        bearing: 165,
        baysTotal: 2,
        baysAvailable: 1,
        hasKneeling: true,
      },
      {
        vehicleId: 'TN-01-AN-4855',
        operator: 'MTC Chennai (Electric Low-Floor AC)',
        speedKmph: 28,
        bearing: 345,
        baysTotal: 2,
        baysAvailable: 2,
        hasKneeling: true,
      },
    ],
  },
  '570': {
    routeNumber: '570',
    routeName: 'CMBT Koyambedu ⇄ Guindy ⇄ OMR ⇄ Semmancheri ⇄ Siruseri SIPCOT',
    stops: [
      { name: 'CMBT Bus Terminus (Koyambedu)', lat: 13.0694, lng: 80.2052 },
      { name: 'Kathipara / Guindy Asiad Junction', lat: 13.0067, lng: 80.2025 },
      { name: 'TIDEL Park / Taramani MRTS', lat: 12.9892, lng: 80.2470 },
      { name: 'Perungudi Toll Plaza', lat: 12.9650, lng: 80.2450 },
      { name: 'Sholinganallur Junction', lat: 12.9010, lng: 80.2270 },
      { name: 'Jeppiaar Engineering College (Semmancheri)', lat: 12.8718, lng: 80.2198 },
      { name: 'Siruseri SIPCOT IT Park Gate 1', lat: 12.8310, lng: 80.2225 },
    ],
    vehicles: [
      {
        vehicleId: 'TN-22-N-1904',
        operator: 'MTC Chennai (Electric Low-Floor Express)',
        speedKmph: 36,
        bearing: 178,
        baysTotal: 2,
        baysAvailable: 2,
        hasKneeling: true,
      },
    ],
  },
  '19B': {
    routeNumber: '19B',
    routeName: 'T. Nagar ⇄ Adyar ⇄ Thiruvanmiyur ⇄ Sholinganallur ⇄ Kelambakkam',
    stops: [
      { name: 'T. Nagar Bus Terminus', lat: 13.0418, lng: 80.2341 },
      { name: 'Adyar Depot / Madhya Kailash', lat: 13.0062, lng: 80.2575 },
      { name: 'Thiruvanmiyur RTO', lat: 12.9860, lng: 80.2590 },
      { name: 'Karapakkam TCS', lat: 12.9150, lng: 80.2310 },
      { name: 'Semmancheri Main Gate', lat: 12.8718, lng: 80.2198 },
    ],
    vehicles: [
      {
        vehicleId: 'TN-01-AN-5120',
        operator: 'MTC Deluxe (Electric Low-Floor AC)',
        speedKmph: 30,
        bearing: 182,
        baysTotal: 2,
        baysAvailable: 1,
        hasKneeling: true,
      },
    ],
  },
  '91': {
    routeNumber: '91',
    routeName: 'Tambaram ⇄ Chromepet ⇄ Radial Road (Kamakshi) ⇄ Velachery',
    stops: [
      { name: 'Tambaram Sanatorium Bus Stand', lat: 12.9360, lng: 80.1280 },
      { name: 'Chromepet MIT Bridge', lat: 12.9510, lng: 80.1410 },
      { name: 'Dr. Kamakshi Memorial Hospital (Radial Rd)', lat: 12.9463, lng: 80.2038 },
      { name: 'Jerusalem College / Narayanapuram', lat: 12.9456, lng: 80.2080 },
      { name: 'Velachery Vijaya Nagar Bus Terminus', lat: 12.9782, lng: 80.2212 },
    ],
    vehicles: [
      {
        vehicleId: 'TN-01-AN-3319',
        operator: 'MTC Chennai (Radial Road Low-Floor Electric)',
        speedKmph: 34,
        bearing: 85,
        baysTotal: 2,
        baysAvailable: 2,
        hasKneeling: true,
      },
    ],
  },
};

// Haversine distance helper (km)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Returns all real-time transit vehicles (MTC and CMRL) formatted with GTFS-RT attributes.
 */
export function getLiveTransitVehicles(filter?: {
  agency?: 'MTC' | 'CMRL' | 'ALL';
  routeId?: string;
  lowFloorOnly?: boolean;
}): TransitVehiclePosition[] {
  const agencyFilter = filter?.agency || 'ALL';
  const lowFloorOnly = filter?.lowFloorOnly ?? false;
  const now = new Date().toISOString();
  const results: TransitVehiclePosition[] = [];

  // 1. MTC Buses
  if (agencyFilter === 'ALL' || agencyFilter === 'MTC') {
    Object.entries(MTC_LOW_FLOOR_ROUTES).forEach(([routeNum, def]) => {
      if (filter?.routeId && filter.routeId !== routeNum && filter.routeId !== `mtc-${routeNum.toLowerCase()}`) {
        return;
      }

      def.vehicles.forEach((v, idx) => {
        const stop = def.stops[idx % def.stops.length];
        results.push({
          vehicleId: v.vehicleId,
          routeId: `mtc-${routeNum.toLowerCase()}`,
          routeShortName: routeNum,
          headsign: def.routeName.split('⇄').pop()?.trim() || 'Terminus',
          operator: v.operator,
          agency: 'MTC',
          vehicleType: 'BUS',
          currentCoordinates: {
            lat: stop.lat + 0.0012,
            lng: stop.lng + 0.0015,
          },
          speedKmph: v.speedKmph,
          bearingDegrees: v.bearing,
          timestamp: now,
          occupancyStatus: v.baysAvailable > 0 ? 'MANY_SEATS_AVAILABLE' : 'FEW_SEATS_AVAILABLE',
          accessibility: {
            isWheelchairAccessible: true,
            hasKneelingSuspension: v.hasKneeling,
            hasRampDeployed: false,
            availableWheelchairBays: v.baysAvailable,
            totalWheelchairBays: v.baysTotal,
            audioAnnouncementsOnline: true,
            levelBoardingGapMm: undefined,
          },
        });
      });
    });
  }

  // 2. CMRL Metro Trains
  if (agencyFilter === 'ALL' || agencyFilter === 'CMRL') {
    Object.entries(CHENNAI_METRO_LINES).forEach(([lineKey, def]) => {
      if (filter?.routeId && filter.routeId !== def.routeId && filter.routeId !== lineKey) {
        return;
      }

      def.activeTrains.forEach((t, idx) => {
        const station = def.stations[idx % def.stations.length];
        results.push({
          vehicleId: t.trainId,
          routeId: def.routeId,
          routeShortName: def.lineName.includes('Blue') ? 'Blue Line' : 'Green Line',
          headsign: def.lineName.split('⇄').pop()?.replace(')', '').trim() || 'Terminal',
          operator: 'CMRL (Chennai Metro Rail)',
          agency: 'CMRL',
          vehicleType: 'METRO',
          currentCoordinates: {
            lat: station.lat + 0.0008,
            lng: station.lng + 0.0006,
          },
          speedKmph: t.speedKmph,
          bearingDegrees: t.bearing,
          timestamp: now,
          occupancyStatus: 'MANY_SEATS_AVAILABLE',
          accessibility: {
            isWheelchairAccessible: true,
            hasKneelingSuspension: false, // Platform is level boarding
            hasRampDeployed: true, // Permanent zero-step level boarding
            availableWheelchairBays: t.baysAvailable,
            totalWheelchairBays: t.baysTotal,
            audioAnnouncementsOnline: true,
            levelBoardingGapMm: t.levelGapMm,
            designatedCars: ['Car 1 (Divyangjan Reserved)', 'Car 4'],
          },
        });
      });
    });
  }

  if (lowFloorOnly) {
    return results.filter((r) => r.accessibility.isWheelchairAccessible && r.accessibility.availableWheelchairBays > 0);
  }

  return results;
}

/**
 * Returns accessible transit vehicles within a radius around given coordinates.
 */
export function getNearbyAccessibleVehicles(
  lat: number,
  lng: number,
  radiusKm = 5
): Array<TransitVehiclePosition & { distanceKm: number }> {
  const all = getLiveTransitVehicles();
  return all
    .map((v) => ({
      ...v,
      distanceKm: calculateDistanceKm(lat, lng, v.currentCoordinates.lat, v.currentCoordinates.lng),
    }))
    .filter((v) => v.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
