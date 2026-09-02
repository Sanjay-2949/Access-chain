import { TransportOption, ExternalBookingProvider } from '../types/accessibility';

export const DEMO_TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'bus-1',
    name: 'Bus 21G',
    operator: 'BMTC',
    type: 'BUS',
    departureTime: '19:20',
    arrivalTime: '19:45',
    durationMinutes: 25,
    accessibilityStatus: 'accessible',
    wheelchairSupport: true,
    boardingMethod: 'Low-floor boarding with hydraulic ramp',
    accessibilityNotes: 'Fully accessible low-floor bus with designated wheelchair space',
    externalBookingUrl: 'https://www.redbus.in',
    selected: true,
  },
  {
    id: 'bus-2',
    name: 'Bus 335E',
    operator: 'BMTC',
    type: 'BUS',
    departureTime: '19:35',
    arrivalTime: '20:05',
    durationMinutes: 30,
    accessibilityStatus: 'limited',
    wheelchairSupport: false,
    boardingMethod: 'Standard step boarding',
    accessibilityNotes: 'High-floor bus — wheelchair accessibility unknown. Manual boarding assistance may be required.',
    externalBookingUrl: 'https://www.redbus.in',
    selected: false,
  },
  {
    id: 'bus-3',
    name: 'Bus 500D',
    operator: 'KSRTC',
    type: 'BUS',
    departureTime: '19:50',
    arrivalTime: '20:25',
    durationMinutes: 35,
    accessibilityStatus: 'inaccessible',
    wheelchairSupport: false,
    boardingMethod: 'High step boarding only',
    accessibilityNotes: 'Not wheelchair accessible. No ramp or low-floor option available.',
    externalBookingUrl: 'https://www.redbus.in',
    selected: false,
  },
];

export const BOOKING_PROVIDERS: Record<string, ExternalBookingProvider> = {
  redbus: {
    name: 'RedBus',
    bookingBaseUrl: 'https://www.redbus.in',
    isExternal: true,
  },
  irctc: {
    name: 'IRCTC',
    bookingBaseUrl: 'https://www.irctc.co.in',
    isExternal: true,
  },
  makemytrip: {
    name: 'MakeMyTrip',
    bookingBaseUrl: 'https://www.makemytrip.com',
    isExternal: true,
  },
};
