/**
 * Core Map and Visual Canvas Interfaces (Decoupled from Transit & Traffic)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LatLngBounds {
  northEast: LatLng;
  southWest: LatLng;
}

export interface MarkerOptions {
  id: string;
  position: LatLng;
  title?: string;
  customIconHtml?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  popupHtml?: string;
  onClick?: () => void;
}

export interface PolylineOptions {
  id: string;
  coordinates: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  onClick?: () => void;
}

export interface IMapProvider {
  initialize(container: HTMLElement, options?: { center?: LatLng; zoom?: number }): void;
  destroy(): void;
  setCenter(position: LatLng, animate?: boolean): void;
  setZoom(level: number, animate?: boolean): void;
  fitBounds(coordinates: [number, number][], padding?: [number, number]): void;
  addMarker(options: MarkerOptions): void;
  removeMarker(id: string): void;
  clearMarkers(): void;
  addPolyline(options: PolylineOptions): void;
  removePolyline(id: string): void;
  clearPolylines(): void;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
}

export interface ITrafficProvider {
  readonly isEnabled: boolean;
  enable(mapInstance: any): void;
  disable(mapInstance: any): void;
  toggle(mapInstance: any): boolean;
}
