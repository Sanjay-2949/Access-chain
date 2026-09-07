'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore, type JourneySegment } from '@/stores/useJourneyStore';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  calculateDistanceMeters,
  detectInTransitHazard,
  playAudibleChimeAlert,
  speakVoiceGuidance,
  triggerHapticAlert,
  type InTransitAlert,
} from '@/lib/routing/inTransitTracker';
import {
  Navigation,
  AlertTriangle,
  Volume2,
  VolumeX,
  Vibrate,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Play,
  Pause,
  RotateCcw,
  Compass,
  MapPin,
  Flame,
  Bus,
  Train,
} from 'lucide-react';

export default function ActiveJourney() {
  const navigate = useNavigate();
  const {
    currentJourney,
    outages,
    activeNavigation,
    startNavigation,
    stopNavigation,
    advanceNavigationStep,
    setNavigationStep,
    updateUserLocation,
    setActiveAlert,
    acceptInTransitReroute,
    simulateOutage,
  } = useJourneyStore();
  const { emergencyContacts } = useAppStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0); // 0 to 100%
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
  const [hasTriggeredAlertForCurrentHazard, setHasTriggeredAlertForCurrentHazard] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const hazardMarkersRef = useRef<any[]>([]);
  const simIntervalRef = useRef<any>(null);

  // Initialize navigation if not already started
  useEffect(() => {
    if (currentJourney && !activeNavigation.isNavigating) {
      startNavigation();
    }
  }, [currentJourney, activeNavigation.isNavigating, startNavigation]);

  // Real GPS geolocation tracking using watchPosition
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (activeNavigation.isSimulated) return; // User is in simulation mode

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setGpsAccuracy(Math.round(accuracy));
        setGpsSpeed(speed ? Math.round(speed * 3.6) : 0);
        updateUserLocation({ lat: latitude, lng: longitude, accuracy }, false);
      },
      (err) => {
        console.warn('[GPS Geolocation] Watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activeNavigation.isSimulated, updateUserLocation]);

  // If no active journey, show empty state
  if (!currentJourney) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <Compass className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold mb-2">No Active Journey Found</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-sm">
          Please plan an accessible route first before starting active navigation.
        </p>
        <Button onClick={() => navigate('/journey/new')}>Plan Accessible Journey</Button>
      </div>
    );
  }

  const segments = currentJourney.segments || [];
  const currentStepIndex = activeNavigation.currentSegmentIndex;
  const isCompleted = currentStepIndex >= segments.length;
  const currentSegment = segments[currentStepIndex] || segments[segments.length - 1];

  // Derive flat array of all route coordinates for simulation and mapping
  const allRouteCoords: [number, number][] = React.useMemo(() => {
    const pts: [number, number][] = [];
    segments.forEach((s) => {
      if (s.coordinates && s.coordinates.length > 0) {
        pts.push(...s.coordinates);
      } else if (s.startCoordinates && s.endCoordinates) {
        pts.push([s.startCoordinates.lat, s.startCoordinates.lng]);
        pts.push([s.endCoordinates.lat, s.endCoordinates.lng]);
      }
    });

    if (pts.length === 0) {
      // Fallback to origin & destination
      pts.push([currentJourney.origin.lat, currentJourney.origin.lng]);
      pts.push([currentJourney.destination.lat, currentJourney.destination.lng]);
    }
    return pts;
  }, [segments, currentJourney]);

  // Outage Proximity Detection Loop
  useEffect(() => {
    const userLoc = activeNavigation.userLocation || {
      lat: currentJourney.origin.lat,
      lng: currentJourney.origin.lng,
    };

    const hazard = detectInTransitHazard(
      userLoc.lat,
      userLoc.lng,
      segments,
      currentStepIndex,
      outages,
      300 // proximity threshold in meters
    );

    if (hazard && !activeNavigation.activeAlert) {
      setActiveAlert(hazard);

      if (!hasTriggeredAlertForCurrentHazard) {
        setHasTriggeredAlertForCurrentHazard(true);

        // 1. Audible alert
        if (soundEnabled) {
          playAudibleChimeAlert();
        }

        // 2. Speech synthesis guidance
        if (speechEnabled) {
          speakVoiceGuidance(
            `Attention. Infrastructure outage detected ahead on ${hazard.infrastructure}. Verified step-free detour via Gate 5 Ramp is ready.`
          );
        }

        // 3. Haptic vibration
        if (hapticEnabled) {
          triggerHapticAlert();
        }
      }
    } else if (!hazard && activeNavigation.activeAlert) {
      setActiveAlert(null);
      setHasTriggeredAlertForCurrentHazard(false);
    }
  }, [
    activeNavigation.userLocation,
    currentStepIndex,
    segments,
    outages,
    activeNavigation.activeAlert,
    hasTriggeredAlertForCurrentHazard,
    soundEnabled,
    speechEnabled,
    hapticEnabled,
    currentJourney.origin.lat,
    currentJourney.origin.lng,
    setActiveAlert,
  ]);

  // Simulation play/pause runner
  useEffect(() => {
    if (isSimulatingMove) {
      simIntervalRef.current = setInterval(() => {
        setSimulationProgress((prev) => {
          const next = prev + 1.5;
          if (next >= 100) {
            setIsSimulatingMove(false);
            clearInterval(simIntervalRef.current);
            return 100;
          }

          // Compute interpolated lat/lng along allRouteCoords
          const targetIndex = Math.min(
            allRouteCoords.length - 1,
            Math.floor((next / 100) * (allRouteCoords.length - 1))
          );
          const pt = allRouteCoords[targetIndex];
          if (pt) {
            updateUserLocation({ lat: pt[0], lng: pt[1] }, true);

            // Dynamically update segment index as simulation progresses
            const segStep = Math.min(
              segments.length - 1,
              Math.floor((next / 100) * segments.length)
            );
            if (segStep !== currentStepIndex) {
              setNavigationStep(segStep);
            }
          }

          return next;
        });
      }, 500);
    } else if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [
    isSimulatingMove,
    allRouteCoords,
    segments.length,
    currentStepIndex,
    updateUserLocation,
    setNavigationStep,
  ]);

  // Leaflet Map Initialization (Runs once when container mounts)
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Inject stylesheet if missing
      if (!document.getElementById('leaflet-css-bundle')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-bundle';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Cleanup prior instance if any
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const initialLat = currentJourney?.origin?.lat || 13.0827;
      const initialLng = currentJourney?.origin?.lng || 80.2707;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([initialLat, initialLng], 15);

      // Google Maps Tile Layer
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size after layout stabilization
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 500);

      // Initial fit to route bounds if coordinates available
      if (allRouteCoords.length > 1) {
        try {
          const bounds = L.latLngBounds(allRouteCoords);
          map.fitBounds(bounds, { padding: [40, 40] });
        } catch (e) {
          console.warn('[Map] Initial fitBounds error:', e);
        }
      }
    }).catch((err) => {
      console.error('[Map] Leaflet import failed:', err);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers (Polylines, Hazard Markers, User GPS Marker)
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing polylines
      polylinesRef.current.forEach((p) => {
        try { map.removeLayer(p); } catch {}
      });
      polylinesRef.current = [];

      // Clear existing hazard markers
      hazardMarkersRef.current.forEach((m) => {
        try { map.removeLayer(m); } catch {}
      });
      hazardMarkersRef.current = [];

      // Render Completed and Active Polylines
      if (allRouteCoords.length > 1) {
        const fullLine = L.polyline(allRouteCoords, {
          color: '#0284c7',
          weight: 6,
          opacity: 0.8,
          lineJoin: 'round',
        }).addTo(map);
        polylinesRef.current.push(fullLine);

        // Highlight active segment in bright emerald
        if (currentSegment?.coordinates && currentSegment.coordinates.length > 1) {
          const activeLine = L.polyline(currentSegment.coordinates, {
            color: '#10b981',
            weight: 8,
            opacity: 0.95,
          }).addTo(map);
          polylinesRef.current.push(activeLine);
        }
      }

      // Render Outage Hazard Markers on Map
      outages.forEach((outage) => {
        if (outage.status === 'Outage') {
          const hazardLat = outage.coordinates?.lat || 13.0827;
          const hazardLng = outage.coordinates?.lng || 80.2707;

          const hazardIcon = L.divIcon({
            className: 'hazard-marker',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 34px; height: 34px; background: rgba(239,68,68,0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="width: 24px; height: 24px; background: #ef4444; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4);">!</div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([hazardLat, hazardLng], { icon: hazardIcon })
            .bindPopup(`<b>Outage Hazard:</b> ${outage.infrastructure}<br/><small>Status: Out of Service</small>`)
            .addTo(map);
          hazardMarkersRef.current.push(marker);
        }
      });

      // Render User GPS Location Marker
      const rawUserLat = activeNavigation.userLocation?.lat ?? currentJourney?.origin?.lat;
      const rawUserLng = activeNavigation.userLocation?.lng ?? currentJourney?.origin?.lng;
      const userLat = typeof rawUserLat === 'number' && !isNaN(rawUserLat) ? rawUserLat : 13.0827;
      const userLng = typeof rawUserLng === 'number' && !isNaN(rawUserLng) ? rawUserLng : 80.2707;

      const userGpsIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; background: rgba(14,165,160,0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
            <div style="width: 18px; height: 18px; background: #0EA5A0; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px #0EA5A0;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLat, userLng], { icon: userGpsIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLat, userLng]);
      }

      // Smooth camera pan to user
      try {
        map.panTo([userLat, userLng], { animate: true, duration: 0.5 });
      } catch {}
    }).catch((err) => {
      console.warn('[Map] Layer update error:', err);
    });
  }, [
    allRouteCoords,
    currentSegment,
    outages,
    activeNavigation.userLocation,
    currentJourney?.origin?.lat,
    currentJourney?.origin?.lng,
  ]);

  const handleAcceptReroute = () => {
    acceptInTransitReroute();
    setHasTriggeredAlertForCurrentHazard(false);
    if (speechEnabled) {
      speakVoiceGuidance('Alternate route accepted. Continuing safely via Gate 5 Ramp.');
    }
  };

  const handleAdvanceStep = () => {
    advanceNavigationStep();
    setHasTriggeredAlertForCurrentHazard(false);
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < segments.length && speechEnabled) {
      speakVoiceGuidance(`Next step: ${segments[nextIdx].label}`);
    }
  };

  const handleSimulateOutageAhead = () => {
    simulateOutage(currentSegment.id);
    if (speechEnabled) {
      speakVoiceGuidance('Warning. Live outage reported on current step.');
    }
  };

  // Completion State View
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-5 border-2 border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">Journey Completed!</h2>
        <p className="text-slate-300 max-w-md text-sm mb-8 leading-relaxed">
          You have successfully arrived at <strong>{currentJourney.destination.name}</strong>. Every step-free connection and ramp was verified.
        </p>
        <div className="flex gap-4 w-full max-w-sm">
          <Button variant="outline" fullWidth onClick={() => navigate('/saved-journeys')}>
            View Saved Trips
          </Button>
          <Button fullWidth onClick={() => navigate('/home')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* TOP FLOATING NAVIGATION BAR */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl shadow-xl pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-400" />
              Live In-Transit Guidance
            </span>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span>Step {currentStepIndex + 1} of {segments.length}</span>
              {gpsAccuracy && <span>• GPS ±{gpsAccuracy}m</span>}
              {gpsSpeed !== null && <span>• {gpsSpeed} km/h</span>}
            </div>
          </div>
        </div>

        {/* Audio / Haptic controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl pointer-events-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition-colors ${soundEnabled ? 'text-sky-400 bg-sky-950/50' : 'text-slate-500 hover:text-slate-300'}`}
            title="Toggle Chime Alert"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`px-2 py-1 text-[11px] font-bold rounded-xl transition-colors ${speechEnabled ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'}`}
            title="Toggle Voice Guidance"
          >
            TTS
          </button>
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`p-2 rounded-xl transition-colors ${hapticEnabled ? 'text-amber-400 bg-amber-950/50' : 'text-slate-500 hover:text-slate-300'}`}
            title="Toggle Vibration"
          >
            <Vibrate className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PROXIMITY HAZARD ALERT BANNER */}
      {activeNavigation.activeAlert && (
        <div className="absolute top-20 left-4 right-4 z-[1000] animate-in slide-in-from-top duration-300">
          <div className="bg-rose-950/95 border-2 border-rose-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                    Proximity Outage Hazard Ahead ({activeNavigation.activeAlert.distanceMeters}m)
                  </span>
                  <Badge variant="danger" size="sm">CRITICAL</Badge>
                </div>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {activeNavigation.activeAlert.message}
                </p>
              </div>
            </div>

            {/* Suggested Alternative Card */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instant Step-Free Detour Ready</span>
                </div>
                <p className="text-sm font-bold text-white mt-0.5">
                  {activeNavigation.activeAlert.suggestedAlternative.segment.label}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeNavigation.activeAlert.suggestedAlternative.impactDescription}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptReroute}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shrink-0 shadow-lg shadow-emerald-950/50"
              >
                Accept Alternate Route
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LEAFLET MAP CONTAINER */}
      <div className="flex-1 w-full min-h-[380px] h-[50vh] relative">
        <div ref={mapContainerRef} className="w-full h-full min-h-[380px] relative z-0" />
      </div>

      {/* BOTTOM ACTION & STEP CARD DRAWER */}
      <div className="bg-slate-900 border-t border-slate-800 p-5 rounded-t-3xl shadow-2xl z-20 flex flex-col gap-4">
        {/* Active Step Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30 shrink-0">
              {currentStepIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Current Segment ({currentSegment.type})
                </span>
                <Badge variant={currentSegment.accessibility === 'ACCESSIBLE' ? 'feasible' : 'danger'} size="sm">
                  {currentSegment.accessibility}
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentSegment.label}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                From: <span className="text-slate-200">{currentSegment.from}</span> → To: <span className="text-slate-200">{currentSegment.to}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black font-mono text-white">~{currentSegment.duration} min</span>
            {currentSegment.distance && (
              <p className="text-xs text-slate-400">{currentSegment.distance} meters</p>
            )}
          </div>
        </div>

        {/* LIVE TRANSIT TELEMETRY (GTFS-RT) PANEL IF BUS OR METRO */}
        {(currentSegment.type === 'bus' || currentSegment.type === 'metro') && (
          <div className="bg-slate-950/90 border border-sky-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
                  {currentSegment.type === 'metro' ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {currentSegment.type === 'metro'
                      ? 'CMRL Metro (Level-Boarding 40mm Gap)'
                      : 'MTC Electric Low-Floor Fleet'}
                  </span>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    GTFS-Realtime Verified Accessible
                  </div>
                </div>
              </div>

              <Badge variant="feasible" size="sm">
                ♿ 2 Bays Open
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Approaching:</span>
                <span className="font-bold text-sky-400 font-mono">
                  {currentSegment.type === 'metro' ? 'Train #B-108' : 'TN-01-AN-4821'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ETA to Boarding:</span>
                <span className="font-bold text-amber-300 font-mono">~3 mins</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Boarding Assist:</span>
                <span className="text-emerald-400 font-semibold">
                  {currentSegment.type === 'metro' ? 'Car 1 & 4' : 'Kneeling Ramp'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => navigate('/transit/radar')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                Track live on Transit Radar →
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    const text = `${currentSegment.operator || 'Transit vehicle'} approaching. 2 of 2 wheelchair bays available. Certified step-free low floor.`;
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3 text-sky-400" /> Announce Arrival
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <Button variant="outline" size="md" onClick={() => navigate('/journey/roadmap')}>
            Roadmap
          </Button>

          {/* Simulate Outage Trigger (For Demo & Verification) */}
          <Button
            variant="outline"
            size="md"
            onClick={handleSimulateOutageAhead}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs"
            title="Simulate outage on this step to trigger audible/haptic alert and dynamic reroute"
          >
            <Flame className="w-3.5 h-3.5 mr-1" />
            Simulate Hazard
          </Button>

          {/* Emergency SOS Call */}
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              const primary = emergencyContacts[0]?.phone || '112';
              window.location.href = `tel:${primary}`;
            }}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1" />
            SOS / Call
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleAdvanceStep}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
          >
            Done Step
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* DESKTOP SIMULATION & SCRUBBING CONTROLS */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              Demo In-Transit GPS Simulation
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulatingMove(!isSimulatingMove)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                {isSimulatingMove ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                <span>{isSimulatingMove ? 'Pause' : 'Play Walk'}</span>
              </button>
              <button
                onClick={() => {
                  setIsSimulatingMove(false);
                  setSimulationProgress(0);
                  setNavigationStep(0);
                  updateUserLocation({ lat: currentJourney.origin.lat, lng: currentJourney.origin.lng }, true);
                }}
                className="p-1 text-slate-400 hover:text-white"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={simulationProgress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSimulationProgress(val);
              const targetIndex = Math.min(
                allRouteCoords.length - 1,
                Math.floor((val / 100) * (allRouteCoords.length - 1))
              );
              const pt = allRouteCoords[targetIndex];
              if (pt) {
                updateUserLocation({ lat: pt[0], lng: pt[1] }, true);
                const segStep = Math.min(
                  segments.length - 1,
                  Math.floor((val / 100) * segments.length)
                );
                setNavigationStep(segStep);
              }
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      </div>
    </div>
  );
}
