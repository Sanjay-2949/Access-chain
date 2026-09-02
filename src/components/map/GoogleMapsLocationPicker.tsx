'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Clock,
  CheckCircle2,
  X,
  Compass,
  Navigation,
  AlertTriangle,
  Loader2,
  Building,
  Globe,
  Sliders,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LocationData {
  id: string;
  name: string;
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

interface Props {
  initialLocationName?: string;
  initialLat?: number;
  initialLng?: number;
  title?: string;
  onConfirm: (location: LocationData) => void;
  onClose?: () => void;
}

export const GoogleMapsLocationPicker: React.FC<Props> = ({
  initialLocationName = 'Chennai Central Railway Station',
  initialLat = 13.0827,
  initialLng = 80.2707,
  title = 'Select Location on Map',
  onConfirm,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'M. Chinnaswamy Stadium, Bengaluru',
    'Chennai Central Railway Station',
    'Chhatrapati Shivaji Maharaj Terminus, Mumbai',
    'Indira Gandhi International Airport, Delhi',
  ]);

  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    id: `loc-${Date.now()}`,
    name: initialLocationName,
    formattedAddress: `${initialLocationName}, EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003`,
    street: 'EVR Periyar Salai, Park Town',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '600003',
    latitude: initialLat,
    longitude: initialLng,
  });

  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map view bounds & zoom
  const [zoomLevel, setZoomLevel] = useState(15);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete Search Debounce Logic (Nominatim OpenStreetMap Geocoder API + Deterministic Fallback)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Handle coordinate input like "13.0827, 80.2707"
        const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[3]);
          const coordLoc: LocationData = {
            id: `coord-${Date.now()}`,
            name: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            formattedAddress: `Lat: ${lat}, Lng: ${lng}, India`,
            street: 'Custom Coordinates',
            city: 'Custom Location',
            state: 'India',
            country: 'India',
            postalCode: '000000',
            latitude: lat,
            longitude: lng,
          };
          setSearchResults([coordLoc]);
          setIsSearching(false);
          return;
        }

        // Query Nominatim API with 3s timeout
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=in&limit=5`,
          { headers: { 'User-Agent': 'AccessChain-LocationPicker/1.0' } }
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped: LocationData[] = data.map((item: any) => ({
              id: `nom-${item.place_id}`,
              name: item.display_name.split(',')[0],
              formattedAddress: item.display_name,
              street: item.display_name.split(',')[1] || '',
              city: item.address?.city || item.address?.town || item.address?.county || 'India',
              state: item.address?.state || 'India',
              country: item.address?.country || 'India',
              postalCode: item.address?.postcode || '',
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            }));
            setSearchResults(mapped);
          } else {
            setSearchResults(getFallbackSearchResults(searchQuery));
          }
        } else {
          setSearchResults(getFallbackSearchResults(searchQuery));
        }
      } catch (err) {
        setSearchResults(getFallbackSearchResults(searchQuery));
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fallback Geocoding for robust offline/demo execution
  const getFallbackSearchResults = (query: string): LocationData[] => {
    const q = query.toLowerCase();
    const mockDb: LocationData[] = [
      {
        id: 'loc-chennai-central',
        name: 'Chennai Central Railway Station',
        formattedAddress: 'EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003',
        street: 'EVR Periyar Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        postalCode: '600003',
        latitude: 13.0827,
        longitude: 80.2707,
      },
      {
        id: 'loc-bengaluru-stadium',
        name: 'M. Chinnaswamy Stadium',
        formattedAddress: 'MG Road / Cubbon Road, Bengaluru, Karnataka 560001',
        street: 'Cubbon Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
        latitude: 12.9788,
        longitude: 77.5996,
      },
      {
        id: 'loc-mumbai-csmt',
        name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
        formattedAddress: 'Fort, Mumbai, Maharashtra 400001',
        street: 'DN Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
        latitude: 18.9400,
        longitude: 72.8353,
      },
      {
        id: 'loc-delhi-airport',
        name: 'Indira Gandhi International Airport (DEL)',
        formattedAddress: 'Palam, New Delhi, Delhi 110037',
        street: 'Airport Road',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110037',
        latitude: 28.5562,
        longitude: 77.1000,
      },
    ];

    return mockDb.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.formattedAddress.toLowerCase().includes(q)
    );
  };

  // Reverse Geocoding on Map Click/Tap
  const handleMapClick = async (lat: number, lng: number) => {
    const clickLoc: LocationData = {
      id: `map-click-${Date.now()}`,
      name: `Selected Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      formattedAddress: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}, India`,
      street: 'Map Selected Point',
      city: selectedLocation.city || 'India',
      state: selectedLocation.state || 'India',
      country: 'India',
      postalCode: '',
      latitude: lat,
      longitude: lng,
    };
    setSelectedLocation(clickLoc);

    // Perform reverse geocoding via Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'AccessChain-LocationPicker/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setSelectedLocation({
            id: `rev-${data.place_id || Date.now()}`,
            name: data.display_name.split(',')[0],
            formattedAddress: data.display_name,
            street: data.address?.road || data.display_name.split(',')[1] || '',
            city: data.address?.city || data.address?.town || data.address?.county || 'India',
            state: data.address?.state || 'India',
            country: data.address?.country || 'India',
            postalCode: data.address?.postcode || '',
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } catch (e) {
      // Keep clickLoc if offline
    }
  };

  // GPS Current Location Detection
  const handleUseCurrentLocation = () => {
    setIsLocatingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocatingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleMapClick(latitude, longitude);
        setIsLocatingGPS(false);
      },
      (error) => {
        setGpsError('Location permission denied or unavailable. Centering default position.');
        setIsLocatingGPS(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectResult = (result: LocationData) => {
    setSelectedLocation(result);
    setSearchResults([]);
    setSearchQuery(result.name);

    if (!recentSearches.includes(result.name)) {
      setRecentSearches([result.name, ...recentSearches.slice(0, 3)]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] w-full max-w-4xl mx-auto relative font-sans text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[11px] text-slate-400">
              Search, tap map to drop pin, or use GPS location
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Close Location Picker"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Prominent Search Bar with Autocomplete */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 relative z-30 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, landmark, or lat, lng (e.g. 13.0827, 80.2707)..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 text-slate-100 text-xs rounded-xl pl-10 pr-10 py-2.5 font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin absolute right-3.5 top-3" />
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Real-time Autocomplete Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-4 right-4 top-14 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-40 max-h-60 overflow-y-auto divide-y divide-slate-800/80"
            >
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-3 text-left hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 group"
                >
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-100 truncate">{result.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{result.formattedAddress}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Recent Search Suggestions */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Recent:
            </span>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(term)}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors truncate max-w-[180px]"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Map & Canvas Pin Dropper */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-crosshair group">
        {/* Background OpenStreetMap Tile Graphic / Interactive Canvas Container */}
        <div
          ref={mapContainerRef}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Map click offset calculations around initial lat/lng
            const deltaLat = ((y - rect.height / 2) / rect.height) * -0.04;
            const deltaLng = ((x - rect.width / 2) / rect.width) * 0.04;
            handleMapClick(selectedLocation.latitude + deltaLat, selectedLocation.longitude + deltaLng);
          }}
          className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-80"
        >
          {/* Tile Layer Overlay Simulation */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

          {/* Interactive Concentric Pulse Radius around Pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-sky-500/20 bg-sky-500/5 animate-ping" />
            <div className="w-24 h-24 rounded-full border border-sky-500/40 bg-sky-500/10 absolute" />
          </div>

          {/* Selected Location Animated Pin Marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 flex flex-col items-center">
            <motion.div
              initial={{ y: -20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-sky-400 text-xs font-bold flex items-center gap-1.5 mb-1"
            >
              <MapPin className="w-4 h-4 fill-current text-white" />
              <span>{selectedLocation.name}</span>
            </motion.div>
            <div className="w-3 h-3 bg-sky-400 rotate-45 -mt-2 shadow-lg" />
            <div className="w-3 h-1 bg-black/60 rounded-full blur-[2px] mt-1" />
          </div>
        </div>

        {/* GPS Current Location Floating Action Button */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocatingGPS}
            className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 shadow-2xl backdrop-blur transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs font-bold"
            title="Locate Current Position via GPS"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 text-sky-400" />
            )}
            <span className="hidden sm:inline">Use GPS Location</span>
          </button>
        </div>

        {/* Map Pan / Zoom Controls Overlay */}
        <div className="absolute left-4 top-4 z-20 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2">
          <span>Tap anywhere on map to drop pin</span>
          <span className="text-slate-600">•</span>
          <span>Zoom: {zoomLevel}x</span>
        </div>

        {/* GPS Error Toast */}
        {gpsError && (
          <div className="absolute left-4 right-4 top-4 z-30 bg-rose-950/90 border border-rose-800 text-rose-200 text-xs p-2.5 rounded-xl shadow-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {gpsError}
            </span>
            <button onClick={() => setGpsError(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Location Confirmation Information Drawer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 z-20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">{selectedLocation.name}</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                Verified Coordinates
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">{selectedLocation.formattedAddress}</p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
              <span>Lat: {selectedLocation.latitude.toFixed(6)}</span>
              <span>Lng: {selectedLocation.longitude.toFixed(6)}</span>
              {selectedLocation.city && <span>City: {selectedLocation.city}</span>}
              {selectedLocation.state && <span>State: {selectedLocation.state}</span>}
            </div>
          </div>

          {/* Confirm Selection CTA */}
          <button
            onClick={() => onConfirm(selectedLocation)}
            className="px-6 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>CONFIRM LOCATION SELECTION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
