import { IMapProvider, LatLng, MarkerOptions, PolylineOptions } from '../types';

export class LeafletMapAdapter implements IMapProvider {
  private map: any = null;
  private markers = new Map<string, any>();
  private polylines = new Map<string, any>();
  private L: any = null;

  public async initialize(container: HTMLElement, options?: { center?: LatLng; zoom?: number }): Promise<void> {
    if (typeof window === 'undefined') return;

    this.L = await import('leaflet');

    // Inject CSS if missing
    if (!document.getElementById('leaflet-css-bundle')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-bundle';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const centerLat = options?.center?.lat ?? 12.9602;
    const centerLng = options?.center?.lng ?? 80.2015;
    const zoom = options?.zoom ?? 14;

    this.map = this.L.map(container, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
    });

    // Base Street Tile Layer
    this.L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.map);

    this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  public getRawMapInstance(): any {
    return this.map;
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  public setCenter(position: LatLng, animate: boolean = true): void {
    if (!this.map) return;
    if (animate) {
      this.map.panTo([position.lat, position.lng]);
    } else {
      this.map.setView([position.lat, position.lng]);
    }
  }

  public setZoom(level: number, animate: boolean = true): void {
    if (!this.map) return;
    this.map.setZoom(level, { animate });
  }

  public fitBounds(coordinates: [number, number][], padding: [number, number] = [50, 50]): void {
    if (!this.map || !this.L || coordinates.length === 0) return;
    const bounds = this.L.latLngBounds(coordinates);
    this.map.fitBounds(bounds, { padding });
  }

  public addMarker(options: MarkerOptions): void {
    if (!this.map || !this.L) return;

    this.removeMarker(options.id);

    let icon: any = undefined;
    if (options.customIconHtml) {
      icon = this.L.divIcon({
        className: `marker-${options.id}`,
        html: options.customIconHtml,
        iconSize: options.iconSize || [32, 32],
        iconAnchor: options.iconAnchor || [16, 32],
      });
    }

    const marker = this.L.marker([options.position.lat, options.position.lng], {
      icon,
      title: options.title,
    }).addTo(this.map);

    if (options.popupHtml) {
      marker.bindPopup(options.popupHtml);
    }

    if (options.onClick) {
      marker.on('click', options.onClick);
    }

    this.markers.set(options.id, marker);
  }

  public removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker && this.map) {
      this.map.removeLayer(marker);
      this.markers.delete(id);
    }
  }

  public clearMarkers(): void {
    this.markers.forEach((m) => this.map?.removeLayer(m));
    this.markers.clear();
  }

  public addPolyline(options: PolylineOptions): void {
    if (!this.map || !this.L) return;

    this.removePolyline(options.id);

    const polyline = this.L.polyline(options.coordinates, {
      color: options.color || '#0284c7',
      weight: options.weight || 5,
      opacity: options.opacity || 0.9,
      dashArray: options.dashArray,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    if (options.onClick) {
      polyline.on('click', options.onClick);
    }

    this.polylines.set(options.id, polyline);
  }

  public removePolyline(id: string): void {
    const polyline = this.polylines.get(id);
    if (polyline && this.map) {
      this.map.removeLayer(polyline);
      this.polylines.delete(id);
    }
  }

  public clearPolylines(): void {
    this.polylines.forEach((p) => this.map?.removeLayer(p));
    this.polylines.clear();
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.map?.on(event, callback);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    this.map?.off(event, callback);
  }
}
