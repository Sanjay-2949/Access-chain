import { ITransitProvider } from './types';
import { MtcChennaiRealtimeProvider } from './providers/MtcChennaiRealtimeProvider';

export * from './types';
export { MtcChennaiRealtimeProvider, CHENNAI_MTC_ROUTES } from './providers/MtcChennaiRealtimeProvider';

export function getTransitProvider(): ITransitProvider {
  return new MtcChennaiRealtimeProvider();
}
