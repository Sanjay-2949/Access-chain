/**
 * Generic Provider-Agnostic Realtime Transit Interfaces
 */

export interface TransitVehiclePosition {
  vehicleId: string;
  routeId: string;
  routeShortName: string;
  headsign: string;
  operator: string;
  currentCoordinates: {
    lat: number;
    lng: number;
  };
  speedKmph: number;
  bearingDegrees: number;
  timestamp: string;
  occupancyStatus: 'EMPTY' | 'MANY_SEATS_AVAILABLE' | 'FEW_SEATS_AVAILABLE' | 'STANDING_ROOM_ONLY' | 'FULL';
  agency?: 'MTC' | 'CMRL';
  vehicleType?: 'BUS' | 'METRO';
  accessibility: {
    isWheelchairAccessible: boolean;
    hasKneelingSuspension: boolean;
    hasRampDeployed: boolean;
    availableWheelchairBays: number;
    totalWheelchairBays: number;
    audioAnnouncementsOnline: boolean;
    levelBoardingGapMm?: number;
    designatedCars?: string[];
  };
}

export interface TransitStop {
  stopId: string;
  stopName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sequenceOrder: number;
  isAccessible: boolean;
  estimatedArrivalTimestamp?: string;
  etaMinutes?: number;
}

export interface TransitRouteTelemetry {
  routeId: string;
  routeNumber: string;
  activeVehicles: TransitVehiclePosition[];
  stops: TransitStop[];
  feedProvider: string;
}

export interface ITransitProvider {
  readonly providerName: string;
  getLiveVehicles(routeId: string): Promise<TransitVehiclePosition[]>;
  getRouteTelemetry(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, routeNumber?: string): Promise<TransitRouteTelemetry>;
}
