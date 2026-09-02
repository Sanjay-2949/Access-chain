import { ITrafficProvider } from '../types';

export class GoogleTrafficAdapter implements ITrafficProvider {
  private trafficLayer: any = null;
  public isEnabled: boolean = false;

  public enable(mapInstance: any): void {
    if (!mapInstance || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      if (this.trafficLayer) {
        mapInstance.removeLayer(this.trafficLayer);
      }

      this.trafficLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps & Traffic',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(mapInstance);

      this.isEnabled = true;
    });
  }

  public disable(mapInstance: any): void {
    if (!mapInstance || !this.trafficLayer) return;
    mapInstance.removeLayer(this.trafficLayer);
    this.trafficLayer = null;
    this.isEnabled = false;
  }

  public toggle(mapInstance: any): boolean {
    if (this.isEnabled) {
      this.disable(mapInstance);
    } else {
      this.enable(mapInstance);
    }
    return this.isEnabled;
  }
}
