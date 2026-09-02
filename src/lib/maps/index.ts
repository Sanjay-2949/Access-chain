import { IMapProvider, ITrafficProvider } from './types';
import { LeafletMapAdapter } from './adapters/LeafletMapAdapter';
import { GoogleTrafficAdapter } from './adapters/GoogleTrafficAdapter';

export * from './types';
export { LeafletMapAdapter } from './adapters/LeafletMapAdapter';
export { GoogleTrafficAdapter } from './adapters/GoogleTrafficAdapter';

export function createMapProvider(): IMapProvider {
  return new LeafletMapAdapter();
}

export function createTrafficProvider(): ITrafficProvider {
  return new GoogleTrafficAdapter();
}
