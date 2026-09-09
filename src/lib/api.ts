import { BusData } from '../types';

/**
 * Fetches bus data from the proxy endpoint.
 * @returns A promise that resolves to an array of BusData objects.
 */
export const getBusData = async (): Promise<BusData[]> => {
    const response = await fetch('/api/proxy', {
        headers: { 'Accept': 'application/json' },
        // Use no-store to ensure we get fresh data or let the proxy handle cache headers
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};
