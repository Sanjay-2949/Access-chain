'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Coordinates,
  TransitStop,
  generateRouteWaypoints,
  calculateBearing,
  calculateDistanceKm,
} from '../../lib/transit/LiveBusSimulator';
import { CHENNAI_MTC_ROUTES } from '../../lib/transit/providers/MtcChennaiRealtimeProvider';
import {
  Bus,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Clock,
  Gauge,
} from 'lucide-react';

interface Props {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  routeNumber?: string;
  routeName?: string;
  onArrived?: () => void;
}

export const LiveBusRadarMap: React.FC<Props> = ({
  origin,
  destination,
  routeNumber: initialRoute = '51B',
  onArrived,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const busIconElementRef = useRef<HTMLDivElement | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<string>(initialRoute);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(32);
  const [bearing, setBearing] = useState<number>(165);
  const [wheelchairBaysAvailable, setWheelchairBaysAvailable] = useState<number>(1);
  const [rampStatus, setRampStatus] = useState<'DEPLOYED' | 'READY'>('READY');
  const [activeStopName, setActiveStopName] = useState<string>('En Route');

  // Fallback valid Chennai coordinates
  const originLat = origin?.lat && origin.lat > 0 ? origin.lat : 12.9210;
  const originLng = origin?.lng && origin.lng > 0 ? origin.lng : 80.1915;
  const destLat = destination?.lat && destination.lat > 0 ? destination.lat : 12.8718;
  const destLng = destination?.lng && destination.lng > 0 ? destination.lng : 80.2198;

  const originDisplayName = origin?.name?.trim() || 'Start Location (Origin)';
  const destDisplayName = destination?.name?.trim() || 'Destination';

  const activeChennaiRoute = CHENNAI_MTC_ROUTES[selectedRoute] || CHENNAI_MTC_ROUTES['51B'];

  // Ref to hold waypoints and stops across renders without triggering useEffect re-runs
  const waypointsRef = useRef<Coordinates[]>([]);
  const stopsRef = useRef<TransitStop[]>([]);

  // 1. Prepare Waypoints and Stops synchronously or on route/coords change
  const buildRouteGeometry = () => {
    const startPt: Coordinates = { lat: originLat, lng: originLng };
    const endPt: Coordinates = { lat: destLat, lng: destLng };
    const chennaiStops = activeChennaiRoute.stops;

    const allKeyPoints: Coordinates[] = [
      startPt,
      ...chennaiStops.map((s) => ({ lat: s.lat, lng: s.lng })),
      endPt,
    ];

    const fullWaypoints: Coordinates[] = [];
    for (let i = 0; i < allKeyPoints.length - 1; i++) {
      const leg = generateRouteWaypoints(allKeyPoints[i], allKeyPoints[i + 1]);
      fullWaypoints.push(...leg);
    }

    const stopsList: TransitStop[] = chennaiStops.map((s, idx) => ({
      id: `mtc-stop-${idx + 1}`,
      name: s.name,
      coords: { lat: s.lat, lng: s.lng },
      isPassed: false,
      isNext: idx === 0,
      etaSeconds: (idx + 1) * 120,
      hasWheelchairRamp: true,
      hasTactilePaving: true,
    }));

    waypointsRef.current = fullWaypoints;
    stopsRef.current = stopsList;
    return { fullWaypoints, stopsList };
  };

  // 2. Leaflet Map Initialization - RUNS ONLY ONCE when route or endpoints change!
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const { fullWaypoints, stopsList } = buildRouteGeometry();
    if (fullWaypoints.length === 0) return;

    setProgressIndex(0);
    setWheelchairBaysAvailable(activeChennaiRoute.vehicles[0]?.baysAvailable ?? 1);
    setActiveStopName(stopsList[0]?.name || 'First Stop');

    let isCancelled = false;

    import('leaflet').then((LModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = LModule.default || LModule;

      // Clean up previous map instance safely
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Initialize map with stable zoom
      const map = L.map(mapContainerRef.current, {
        center: [originLat, originLng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Voyager Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Draw Route Polyline
      const latLngs: [number, number][] = fullWaypoints.map((p) => [p.lat, p.lng] as [number, number]);
      L.polyline(latLngs, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 2,
        opacity: 1,
        dashArray: '8, 8',
      }).addTo(map);

      // Prominent Origin Marker (Start Point A)
      const originIcon = L.divIcon({
        className: 'custom-start-point-icon',
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <span style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(16,185,129,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
            <div style="width:32px; height:32px; border-radius:50%; background:#10b981; border:3px solid #ffffff; box-shadow:0 6px 16px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:13px; z-index:10;">
              A
            </div>
            <div style="background:#0f172a; color:#34d399; font-size:10px; font-weight:800; padding:2px 6px; border-radius:6px; border:1px solid #059669; white-space:nowrap; margin-top:4px; box-shadow:0 2px 6px rgba(0,0,0,0.7); z-index:11;">
              START POINT
            </div>
          </div>
        `,
        iconSize: [80, 56],
        iconAnchor: [40, 16],
      });

      L.marker([originLat, originLng], { icon: originIcon, zIndexOffset: 2000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a;">
            <div style="font-size:11px; font-weight:bold; color:#059669; text-transform:uppercase; margin-bottom:2px;">🟢 Origin (Start Point)</div>
            <div style="font-size:13px; font-weight:bold;">${originDisplayName}</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">${originLat.toFixed(4)}° N, ${originLng.toFixed(4)}° E</div>
          </div>
        `);

      // Prominent Destination Marker (Destination B - Ramp)
      const destIcon = L.divIcon({
        className: 'custom-destination-icon',
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <span style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
            <div style="width:32px; height:32px; border-radius:50%; background:#ef4444; border:3px solid #ffffff; box-shadow:0 6px 16px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:14px; z-index:10;">
              ♿
            </div>
            <div style="background:#0f172a; color:#f87171; font-size:10px; font-weight:800; padding:2px 6px; border-radius:6px; border:1px solid #dc2626; white-space:nowrap; margin-top:4px; box-shadow:0 2px 6px rgba(0,0,0,0.7); z-index:11;">
              DESTINATION (RAMP)
            </div>
          </div>
        `,
        iconSize: [110, 56],
        iconAnchor: [55, 16],
      });

      L.marker([destLat, destLng], { icon: destIcon, zIndexOffset: 2000 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a;">
            <div style="font-size:11px; font-weight:bold; color:#dc2626; text-transform:uppercase; margin-bottom:2px;">🔴 Target Destination Portal</div>
            <div style="font-size:13px; font-weight:bold;">${destDisplayName}</div>
            <div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:3px;">♿ Field-Verified Wheelchair Ramp Entrance</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">${destLat.toFixed(4)}° N, ${destLng.toFixed(4)}° E</div>
          </div>
        `);

      // Intermediate Bus Stops
      stopsList.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'custom-stop-icon',
          html: `<div style="width:14px; height:14px; border-radius:50%; background:#0f172a; border:2px solid #38bdf8; box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([stop.coords.lat, stop.coords.lng], { icon: stopIcon })
          .addTo(map)
          .bindTooltip(`<b>MTC Stop:</b> ${stop.name}<br/>♿ Step-Free Low-Floor Bay`, { direction: 'top' });
      });

      // Live Moving Bus Marker
      const busDiv = document.createElement('div');
      busIconElementRef.current = busDiv;
      busDiv.className = 'live-bus-marker-container';
      busDiv.innerHTML = `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(14,165,233,0.3); animation:pulse 2s infinite;"></div>
          <div class="bus-rotator" style="width:36px; height:36px; border-radius:10px; background:#0284c7; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.5); transform:rotate(${bearing}deg); transition:transform 0.2s ease-out;">
            <span style="font-size:18px; line-height:1;">🚌</span>
          </div>
          <div style="position:absolute; bottom:-18px; background:#0f172a; color:#38bdf8; font-size:9px; font-weight:800; padding:1px 6px; border-radius:4px; border:1px solid #334155; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.6);">
            MTC ${selectedRoute}
          </div>
        </div>
      `;

      const busDivIcon = L.divIcon({
        className: 'custom-live-bus-icon',
        html: busDiv,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      busMarkerRef.current = L.marker([originLat, originLng] as [number, number], {
        icon: busDivIcon,
        zIndexOffset: 1500,
      }).addTo(map);

      // Fit bounds EXACTLY ONCE on initial load - NEVER called inside animation loop!
      const bounds = L.latLngBounds([
        [originLat, originLng] as [number, number],
        [destLat, destLng] as [number, number],
        ...latLngs,
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

      mapInstanceRef.current = map;
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [selectedRoute, originLat, originLng, destLat, destLng, originDisplayName, destDisplayName]);

  // 3. Smooth Vehicle Animation Loop - ONLY updates marker position & HUD, NEVER re-creates map!
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 150 / speedMultiplier;

    const interval = setInterval(() => {
      const waypoints = waypointsRef.current;
      const stops = stopsRef.current;
      if (waypoints.length === 0) return;

      setProgressIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= waypoints.length) {
          setIsPlaying(false);
          if (onArrived) onArrived();
          return waypoints.length - 1;
        }

        const currentPt = waypoints[prev];
        const nextPt = waypoints[nextIndex];

        // Smoothly glide marker on map safely
        if (
          busMarkerRef.current &&
          mapInstanceRef.current &&
          typeof mapInstanceRef.current.hasLayer === 'function' &&
          mapInstanceRef.current.hasLayer(busMarkerRef.current)
        ) {
          try {
            busMarkerRef.current.setLatLng([nextPt.lat, nextPt.lng] as [number, number]);
          } catch (err) {}
        }

        // Smoothly rotate heading
        const currentBearing = calculateBearing(currentPt, nextPt);
        setBearing(currentBearing);

        if (busIconElementRef.current) {
          const rotator = busIconElementRef.current.querySelector('.bus-rotator') as HTMLElement;
          if (rotator) {
            rotator.style.transform = `rotate(${currentBearing}deg)`;
          }
        }

        // Live speed variation
        const randomizedSpeed = Math.round(28 + Math.sin(nextIndex * 0.4) * 8 + Math.random() * 3);
        setCurrentSpeed(randomizedSpeed);

        // Update nearest stop name
        if (stops.length > 0) {
          const stopFraction = waypoints.length / stops.length;
          const stopIdx = Math.min(stops.length - 1, Math.floor(nextIndex / stopFraction));
          if (stops[stopIdx]) {
            setActiveStopName(stops[stopIdx].name);
          }
        }

        if (nextIndex > waypoints.length - 6) {
          setRampStatus('DEPLOYED');
        } else {
          setRampStatus('READY');
        }

        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, onArrived]);

  const totalWaypoints = waypointsRef.current.length || 100;
  const progressPercentage = Math.min(100, Math.round((progressIndex / (totalWaypoints - 1)) * 100));

  const currentPt = waypointsRef.current[progressIndex] || { lat: originLat, lng: originLng };
  const destPt = { lat: destLat, lng: destLng };
  const distRemainingKm = calculateDistanceKm(currentPt, destPt);
  const etaMinutesRemaining = Math.max(1, Math.round((distRemainingKm / (currentSpeed || 30)) * 60));

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 1. Header Telemetry HUD & Chennai Route Selector */}
      <div className="p-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center font-bold shadow-lg">
            <Bus className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-sky-500 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                MTC {selectedRoute}
              </span>
              <span className="text-xs font-bold text-slate-100 truncate max-w-[280px]">
                {activeChennaiRoute.routeName}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live Transit Feed • Vehicle #{activeChennaiRoute.vehicles[0]?.vehicleId || 'TN-01-AN-4821'}
            </p>
          </div>
        </div>

        {/* Chennai Route Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Route:</span>
          {Object.keys(CHENNAI_MTC_ROUTES).map((rNum) => (
            <button
              key={rNum}
              onClick={() => setSelectedRoute(rNum)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedRoute === rNum
                  ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rNum}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Interactive Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Floating Start & Destination Status Card */}
        <div className="absolute top-4 right-4 z-20 max-w-xs w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              A
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Start Point (Source)</span>
              <p className="text-xs font-bold text-slate-100 truncate">{originDisplayName}</p>
            </div>
          </div>

          <div className="border-t border-slate-800 my-1"></div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              B
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-rose-400">Destination (Target)</span>
              <p className="text-xs font-bold text-slate-100 truncate">{destDisplayName}</p>
            </div>
          </div>
        </div>

        {/* Floating Navigation HUD */}
        <div className="absolute top-4 left-4 z-20 max-w-xs w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> Next Stop
            </span>
            <span className="font-bold text-sky-300 truncate max-w-[140px]">{activeStopName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" /> Est. Arrival
              </span>
              <div className="text-sm font-black text-slate-100 mt-0.5">
                {etaMinutesRemaining} mins ({distRemainingKm.toFixed(1)} km)
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" /> Live Speed
              </span>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{currentSpeed} km/h</div>
            </div>
          </div>

          {/* Accessibility Telemetry HUD */}
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{wheelchairBaysAvailable}/2 Bays Free</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Ramp: {rampStatus}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
              <span>Trip Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Floating Simulation & Playback Controls */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Resume Live'}</span>
            </button>

            <button
              onClick={() => {
                setProgressIndex(0);
                setIsPlaying(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
              title="Restart Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed multipliers */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-400 font-bold mr-1 uppercase">Speed:</span>
            {[1, 2, 5, 10].map((mult) => (
              <button
                key={mult}
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  speedMultiplier === mult
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
