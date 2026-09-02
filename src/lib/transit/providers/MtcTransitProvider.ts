import { ITransitProvider, TransitVehiclePosition, TransitRouteTelemetry, TransitStop } from '../types';

export class MtcTransitProvider implements ITransitProvider {
  public readonly providerName = 'MTC_CHENNAI_TRANSIT';

  public async getLiveVehicles(routeId: string): Promise<TransitVehiclePosition[]> {
    return [];
  }

  public async getRouteTelemetry(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    routeNumber: string = '51'
  ): Promise<TransitRouteTelemetry> {
    const isVelacheryPallikaranai =
      origin.lat > 12.9 && origin.lat < 13.0 && origin.lng > 80.15 && origin.lng < 80.25;

    const stops: TransitStop[] = isVelacheryPallikaranai
      ? [
          {
            stopId: 'stop-1',
            stopName: 'Medavakkam Koot Road',
            coordinates: { lat: origin.lat + 0.006, lng: origin.lng - 0.005 },
            sequenceOrder: 1,
            isAccessible: true,
          },
          {
            stopId: 'stop-2',
            stopName: 'Jerusalem College / Narayanapuram',
            coordinates: { lat: origin.lat, lng: origin.lng },
            sequenceOrder: 2,
            isAccessible: true,
            etaMinutes: 3,
          },
          {
            stopId: 'stop-3',
            stopName: 'Sree Balaji Dental Hospital',
            coordinates: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
            sequenceOrder: 3,
            isAccessible: true,
          },
          {
            stopId: 'stop-4',
            stopName: 'Pallikaranai Oil Mill',
            coordinates: { lat: destination.lat + 0.001, lng: destination.lng - 0.001 },
            sequenceOrder: 4,
            isAccessible: true,
          },
          {
            stopId: 'stop-5',
            stopName: 'Velachery Vijaya Nagar Bus Terminus',
            coordinates: { lat: destination.lat, lng: destination.lng },
            sequenceOrder: 5,
            isAccessible: true,
          },
        ]
      : [
          {
            stopId: 'stop-1',
            stopName: 'Boarding Point Stop',
            coordinates: { lat: origin.lat, lng: origin.lng },
            sequenceOrder: 1,
            isAccessible: true,
            etaMinutes: 4,
          },
          {
            stopId: 'stop-2',
            stopName: 'Intermediate Accessible Stop',
            coordinates: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
            sequenceOrder: 2,
            isAccessible: true,
          },
          {
            stopId: 'stop-3',
            stopName: 'Destination Terminal',
            coordinates: { lat: destination.lat, lng: destination.lng },
            sequenceOrder: 3,
            isAccessible: true,
          },
        ];

    const activeVehicles: TransitVehiclePosition[] = [
      {
        vehicleId: 'TN-01-AN-4821',
        routeId: 'mtc-51',
        routeShortName: routeNumber,
        headsign: 'T. Nagar / Velachery MRTS',
        operator: 'MTC Chennai (Electric Low-Floor)',
        currentCoordinates: {
          lat: origin.lat + 0.0035,
          lng: origin.lng - 0.0025,
        },
        speedKmph: 28,
        bearingDegrees: 145,
        timestamp: new Date().toISOString(),
        occupancyStatus: 'MANY_SEATS_AVAILABLE',
        accessibility: {
          isWheelchairAccessible: true,
          hasKneelingSuspension: true,
          hasRampDeployed: false,
          availableWheelchairBays: 1,
          totalWheelchairBays: 2,
          audioAnnouncementsOnline: true,
        },
      },
    ];

    return {
      routeId: `route-${routeNumber}`,
      routeNumber,
      activeVehicles,
      stops,
      feedProvider: this.providerName,
    };
  }
}
