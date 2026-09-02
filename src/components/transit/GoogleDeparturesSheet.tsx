'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, Clock, AlertTriangle, Bus, Users, Accessibility } from 'lucide-react';

interface Departure {
  lineShort: string;
  destination: string;
  scheduledTime: string;
  minutesAway: number;
  agencyName: string;
  vehicleType: string;
  stopCount?: number;
}

interface PreviousDeparture {
  lineShort: string;
  destination: string;
  departedTime: string;
  minutesAgo: number;
  agencyName: string;
}

interface GoogleDeparturesSheetProps {
  stopName: string;
  stopLat: number;
  stopLng: number;
  onClose: () => void;
  isOpen: boolean;
}

export default function GoogleDeparturesSheet({
  stopName,
  stopLat,
  stopLng,
  onClose,
  isOpen,
}: GoogleDeparturesSheetProps) {
  const [upcoming, setUpcoming] = useState<Departure[]>([]);
  const [previous, setPrevious] = useState<PreviousDeparture[]>([]);
  const [showPrevious, setShowPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/transit/departures?lat=${stopLat}&lng=${stopLng}&stopName=${encodeURIComponent(stopName)}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUpcoming(data.upcoming || []);
      setPrevious(data.previous || []);
    } catch (e) {
      setError('Unable to load departures');
    } finally {
      setLoading(false);
    }
  }, [stopLat, stopLng, stopName]);

  useEffect(() => {
    if (isOpen) {
      fetchDepartures();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchDepartures, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchDepartures]);

  if (!isOpen) return null;

  const getTimeLabel = (minutesAway: number) => {
    if (minutesAway <= 0) return 'Now';
    return `${minutesAway} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Departures</h2>
            <p className="text-sm text-gray-500 mt-0.5">From {stopName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500">Loading live departures...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 py-6 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Show/Hide Previous Departures Toggle */}
              {previous.length > 0 && (
                <button
                  onClick={() => setShowPrevious(!showPrevious)}
                  className="flex items-center gap-2 w-full py-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {showPrevious ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {showPrevious ? 'Hide' : 'Show'} previous departures
                  </span>
                </button>
              )}

              {/* Previous Departures */}
              {showPrevious && previous.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  {previous.map((dep, i) => (
                    <div
                      key={`prev-${i}`}
                      className="flex items-center justify-between py-3 border-b border-gray-100 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <Bus className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-700 border border-gray-200">
                              {dep.lineShort}
                            </span>
                            <span className="text-sm text-gray-600">{dep.destination}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Departed · {dep.departedTime} · <Users className="w-3 h-3 inline" />
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-400">{dep.minutesAgo}</span>
                        <p className="text-xs text-gray-400">min ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming Departures */}
              {upcoming.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Bus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No upcoming departures found</p>
                </div>
              )}

              <div className="space-y-0.5">
                {upcoming.map((dep, i) => {
                  const isNow = dep.minutesAway <= 1;
                  return (
                    <div
                      key={`up-${i}`}
                      className="flex items-center justify-between py-3.5 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <Bus className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-white rounded text-xs font-bold text-gray-800 border border-gray-300">
                              {dep.lineShort}
                            </span>
                            <span className="text-sm font-medium text-gray-800">
                              {dep.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-500">
                              Scheduled · {dep.scheduledTime}
                            </span>
                            <span className="text-xs text-gray-400">·</span>
                            <Users className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right min-w-[48px]">
                        {isNow ? (
                          <span className="text-base font-bold text-green-600">Now</span>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-gray-800">
                              {dep.minutesAway}
                            </span>
                            <p className="text-xs text-gray-500">min</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Report problem card */}
              {upcoming.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">
                      Report a problem with this transport info
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
