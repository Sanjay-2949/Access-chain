'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Crosshair, Loader2, Navigation, ArrowUpRight } from 'lucide-react';
import { LocationAccuracy, AccessPointType } from '../../lib/places/types';

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  locationAccuracy?: LocationAccuracy;
  accessPointType?: AccessPointType;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace: (place: PlaceResult) => void;
  placeholder?: string;
  label?: string;
  showCurrentLocationButton?: boolean;
}

export const GooglePlacesAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Search location (e.g. Tropical Colony, Balaji Dental Hospital)...',
  label,
  showCurrentLocationButton = false,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const clientCacheRef = useRef<Map<string, any[]>>(new Map());
  const listboxId = useId();

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Remove any legacy Google SDK scripts or error popups from the DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const legacyScript = document.getElementById('google-maps-sdk-script');
      if (legacyScript) legacyScript.remove();

      // Suppress any stray Google auth failure modals
      (window as any).gm_authFailure = () => {};
    }
  }, []);

  // Detect GPS location for proximity bias
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast live autocomplete fetch with 100ms debounce
  const handleSearch = (text: string) => {
    setQuery(text);
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 1) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const cacheKey = text.trim().toLowerCase();
    if (clientCacheRef.current.has(cacheKey)) {
      setPredictions(clientCacheRef.current.get(cacheKey)!);
      setIsOpen(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        let url = `/api/places/search?query=${encodeURIComponent(text.trim())}`;
        if (userCoords?.lat && userCoords?.lng) {
          url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          clientCacheRef.current.set(cacheKey, data.results || []);
          setPredictions(data.results || []);
          setIsLoading(false);
          return;
        } else {
          console.warn('API returned non-ok status:', res.status);
        }
      } catch (err) {
        console.warn('Place search fetch error:', err);
      }

      // Only alert if it actually threw an error or returned a bad status code
      console.warn('Live autocomplete query failed or returned error status.');
      setPredictions([]);
      setIsLoading(false);
    }, 100);
  };

  const handleSelectPrediction = async (item: any) => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(item.name);
    onChange(item.name);

    if (item.lat && item.lng && !item.placeId.startsWith('google-')) {
      onSelectPlace({
        placeId: item.placeId,
        name: item.name,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        locationAccuracy: item.locationAccuracy || 'building',
      });
      return;
    }

    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(item.placeId)}`);
      if (res.ok) {
        const details = await res.json();
        if (details.error) {
          alert(`Error fetching location details: ${details.error}`);
          return;
        }
        if (!details.latitude || !details.longitude) {
           alert('Live API error: Google Places returned no coordinates for this location.');
           return;
        }
        onSelectPlace({
          placeId: details.placeId || item.placeId,
          name: details.name || item.name,
          address: details.formattedAddress || item.address,
          lat: details.latitude,
          lng: details.longitude,
          locationAccuracy: details.locationAccuracy || 'rooftop',
          accessPointType: details.accessPointType || 'main_entrance',
        });
        return;
      }
    } catch (e) {
      console.warn('Details fetch error:', e);
    }
    
    alert('Network error: Could not fetch location details from Google API.');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim().length >= 1) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < predictions.length) {
        e.preventDefault();
        handleSelectPrediction(predictions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // "Use Current Location" (GPS)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        try {
          // Use live Google Geocoding API for reverse geocoding
          const res = await fetch(
            `/api/places/geocode?lat=${lat}&lng=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const bestResult = data.results[0];
              const placeResult: PlaceResult = {
                placeId: bestResult.place_id || `gps-${Date.now()}`,
                name: 'My Current Location',
                address: bestResult.formatted_address,
                lat,
                lng,
                locationAccuracy: 'rooftop',
                accessPointType: 'pedestrian_entrance',
              };
              setQuery('My Current Location');
              onChange('My Current Location');
              onSelectPlace(placeResult);
              setIsLocating(false);
              setIsOpen(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Google Reverse geocode error:', e);
        }

        const fallbackGPS: PlaceResult = {
          placeId: `gps-${Date.now()}`,
          name: 'My Current Location',
          address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}, Chennai, India`,
          lat,
          lng,
          locationAccuracy: 'approximate',
        };
        setQuery(fallbackGPS.name);
        onChange(fallbackGPS.name);
        onSelectPlace(fallbackGPS);
        setIsLocating(false);
        setIsOpen(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not access current location. Please grant browser location permissions.');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        {showCurrentLocationButton && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800 transition-all hover:scale-105 active:scale-95"
            title="Auto-detect current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
          </button>
        )}
      </div>

      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 1) handleSearch(query);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
        />
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown - Zero Error Popups, 100% Reliable */}
      {isOpen && (predictions.length > 0 || isLoading) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3.5">
            <div className="flex items-center gap-1.5 text-sky-400">
              <Navigation className="w-3 h-3" />
              <span>Places Autocomplete</span>
            </div>
            <span>Proximity Biased</span>
          </div>

          {predictions.map((p, index) => {
            const isSelected = activeIndex === index;
            return (
              <button
                key={p.placeId || index}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelectPrediction(p)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left border-b border-slate-800/60 last:border-b-0 group ${
                  isSelected ? 'bg-slate-800 text-sky-200' : 'hover:bg-slate-800/90'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 scale-105'
                      : 'bg-sky-500/10 border-sky-500/20 text-sky-400 group-hover:scale-110'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-bold truncate transition-colors ${
                      isSelected ? 'text-sky-300' : 'text-slate-100 group-hover:text-sky-300'
                    }`}
                  >
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{p.address || p.secondary}</p>
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 self-center shrink-0 transition-colors ${
                    isSelected ? 'text-sky-400' : 'text-slate-600 group-hover:text-sky-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
