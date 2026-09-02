'use client';

import React, { useState, useRef } from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { GooglePlaceLocation } from '@/lib/types/accessibility';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, ArrowUpDown, Loader2, CheckCircle2 } from 'lucide-react';

const toGooglePlace = (loc: any): GooglePlaceLocation => ({
  placeId: loc.placeId || loc.id || `loc-${Date.now()}`,
  name: loc.name || 'Location',
  formattedAddress: loc.formattedAddress || loc.address || loc.name,
  latitude: typeof loc.latitude === 'number' ? loc.latitude : typeof loc.lat === 'number' ? loc.lat : 12.9602,
  longitude: typeof loc.longitude === 'number' ? loc.longitude : typeof loc.lng === 'number' ? loc.lng : 80.2015,
});

export default function Screen6FastTravel() {
  const {
    prevScreen,
    nextScreen,
    originLocation,
    destinationLocation,
    setOriginLocation,
    setDestinationLocation,
  } = useJourneyWizardStore();

  const [fromQuery, setFromQuery] = useState(originLocation?.name || '');
  const [toQuery, setToQuery] = useState(destinationLocation?.name || '');
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const fromTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFromSearch = (q: string) => {
    setFromQuery(q);
    if (fromTimeoutRef.current) clearTimeout(fromTimeoutRef.current);
    if (q.trim().length < 1) {
      setFromSuggestions([]);
      setIsSearchingFrom(false);
      return;
    }
    setIsSearchingFrom(true);
    fromTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setFromSuggestions(data.results);
            setIsSearchingFrom(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Place search API error:', err);
      }
      setFromSuggestions([]);
      setIsSearchingFrom(false);
    }, 120);
  };

  const handleToSearch = (q: string) => {
    setToQuery(q);
    if (toTimeoutRef.current) clearTimeout(toTimeoutRef.current);
    if (q.trim().length < 1) {
      setToSuggestions([]);
      setIsSearchingTo(false);
      return;
    }
    setIsSearchingTo(true);
    toTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setToSuggestions(data.results);
            setIsSearchingTo(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Place search API error:', err);
      }
      setToSuggestions([]);
      setIsSearchingTo(false);
    }, 120);
  };

  const setToSuggestionsSafe = (items: any[]) => setToSuggestions(items);

  const handleSwap = () => {
    const tempO = originLocation;
    const tempD = destinationLocation;
    setOriginLocation(tempD);
    setDestinationLocation(tempO);
    const prevFrom = fromQuery;
    setFromQuery(toQuery);
    setToQuery(prevFrom);
  };

  const selectOrigin = (loc: any) => {
    const place = toGooglePlace(loc);
    setOriginLocation(place);
    setFromQuery(place.name);
    setFromSuggestions([]);
  };

  const selectDest = (loc: any) => {
    const place = toGooglePlace(loc);
    setDestinationLocation(place);
    setToQuery(place.name);
    setToSuggestions([]);
  };

  const handleProceed = async () => {
    let finalOrigin = originLocation;
    let finalDest = destinationLocation;

    // If user typed without clicking suggestion, auto-resolve top match
    if (!finalOrigin && fromQuery.trim()) {
      if (fromSuggestions.length > 0) {
        finalOrigin = toGooglePlace(fromSuggestions[0]);
      } else {
        try {
          const res = await fetch(`/api/places/search?query=${encodeURIComponent(fromQuery.trim())}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            finalOrigin = toGooglePlace(data.results[0]);
          }
        } catch (e) {}
      }
    }

    if (!finalDest && toQuery.trim()) {
      if (toSuggestions.length > 0) {
        finalDest = toGooglePlace(toSuggestions[0]);
      } else {
        try {
          const res = await fetch(`/api/places/search?query=${encodeURIComponent(toQuery.trim())}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            finalDest = toGooglePlace(data.results[0]);
          }
        } catch (e) {}
      }
    }

    finalOrigin = finalOrigin || toGooglePlace({ name: fromQuery || 'Origin', address: fromQuery });
    finalDest = finalDest || toGooglePlace({ name: toQuery || 'Destination', address: toQuery });

    setOriginLocation(finalOrigin);
    setDestinationLocation(finalDest);
    nextScreen();
  };

  const isReady = fromQuery.trim().length > 0 && toQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button
          onClick={prevScreen}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
          Step 6 of 12 • Fast Travel
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-black text-white">Where are you going?</h2>
          <p className="text-xs text-slate-400">
            Search any starting point and destination in India
          </p>
        </div>

        <div className="relative space-y-4">
          {/* FROM INPUT */}
          <div className="relative z-20 flex gap-3.5 items-start">
            <div className="mt-3.5 w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] flex-shrink-0">
              A
            </div>
            <div className="flex-grow space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Start Point (From)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => handleFromSearch(e.target.value)}
                  onFocus={() => {
                    if (fromQuery.trim().length >= 1) handleFromSearch(fromQuery);
                  }}
                  placeholder="Search start location (e.g. Tropical Colony, Medavakkam)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* Suggestions Dropdown */}
              {(fromSuggestions.length > 0 || isSearchingFrom) && (
                <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-2xl mt-1.5 shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  {isSearchingFrom && (
                    <div className="p-3 text-xs text-slate-400 flex items-center gap-2 bg-slate-950">
                      <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>Searching places...</span>
                    </div>
                  )}
                  {fromSuggestions.map((l) => (
                    <button
                      key={l.placeId || l.id}
                      type="button"
                      onClick={() => selectOrigin(l)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm border-b border-slate-800/80 last:border-0 group flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                          {l.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{l.address || l.secondary}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative z-10 flex justify-end pr-3">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 bg-slate-800 rounded-full border border-slate-700 hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 text-slate-400 hover:text-sky-300"
              title="Swap From & To"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO INPUT */}
          <div className="relative z-10 flex gap-3.5 items-start">
            <div className="mt-3.5 w-5 h-5 rounded-full border-2 border-rose-400 bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-[10px] flex-shrink-0">
              B
            </div>
            <div className="flex-grow space-y-1.5 relative">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Destination (To)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                <input
                  type="text"
                  value={toQuery}
                  onChange={(e) => handleToSearch(e.target.value)}
                  onFocus={() => {
                    if (toQuery.trim().length >= 1) handleToSearch(toQuery);
                  }}
                  placeholder="Search destination (e.g. Jeppiaar, Jerusalem College)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* Suggestions Dropdown */}
              {(toSuggestions.length > 0 || isSearchingTo) && (
                <div className="absolute w-full bg-slate-900 border border-slate-700 rounded-2xl mt-1.5 shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  {isSearchingTo && (
                    <div className="p-3 text-xs text-slate-400 flex items-center gap-2 bg-slate-950">
                      <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                      <span>Searching places...</span>
                    </div>
                  )}
                  {toSuggestions.map((l) => (
                    <button
                      key={l.placeId || l.id}
                      type="button"
                      onClick={() => selectDest(l)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm border-b border-slate-800/80 last:border-0 group flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                          {l.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{l.address || l.secondary}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleProceed}
            disabled={!isReady}
            className="w-full py-4 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            Calculate Accessible Route
          </button>
        </div>
      </motion.div>
    </div>
  );
}
