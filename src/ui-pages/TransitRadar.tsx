'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  TransitVehiclePosition,
} from '../lib/transit/types';
import {
  Bus,
  Train,
  Navigation,
  RefreshCw,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Gauge,
  Compass,
} from 'lucide-react';

export default function TransitRadar() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [agencyFilter, setAgencyFilter] = useState<'ALL' | 'MTC' | 'CMRL'>('ALL');
  const [baysOnly, setBaysOnly] = useState(false);
  const [vehicles, setVehicles] = useState<TransitVehiclePosition[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Fetch real-time vehicles from our GTFS-RT API
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/transit/realtime?agency=${agencyFilter}&lowFloorOnly=${baysOnly}`
      );
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('[Transit Radar] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 4000);
    return () => clearInterval(interval);
  }, [agencyFilter, baysOnly]);

  // Leaflet Map Initialization (runs once)
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!document.getElementById('leaflet-css-bundle')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-bundle';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Default center around Chennai Central / Guindy corridor
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([13.0067, 80.2025], 12);

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 200);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update vehicle markers when vehicles list updates
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove obsolete markers
      const currentIds = new Set(vehicles.map((v) => v.vehicleId));
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        if (!currentIds.has(id)) {
          try { map.removeLayer(marker); } catch {}
          delete markersRef.current[id];
        }
      });

      // Add or update markers
      vehicles.forEach((v) => {
        const isMetro = v.agency === 'CMRL';
        const isSelected = v.vehicleId === selectedVehicleId;
        const lat = v.currentCoordinates.lat;
        const lng = v.currentCoordinates.lng;

        const iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: ${
              isMetro ? 'rgba(2,132,199,0.3)' : 'rgba(16,185,129,0.3)'
            }; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${
              isMetro ? '#0284c7' : '#059669'
            }; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: ${
          isSelected ? 'scale(1.25)' : 'scale(1)'
        }; transition: transform 0.2s ease;">
              ${isMetro ? '🚆' : '🚌'}
            </div>
            <div style="position: absolute; bottom: -18px; background: #0f172a; color: #ffffff; border: 1px solid ${
              isMetro ? '#0284c7' : '#059669'
            }; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.6);">
              ${v.routeShortName}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'transit-radar-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (markersRef.current[v.vehicleId]) {
          markersRef.current[v.vehicleId].setLatLng([lat, lng]);
          markersRef.current[v.vehicleId].setIcon(icon);
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map);
          marker.on('click', () => {
            setSelectedVehicleId(v.vehicleId);
          });
          markersRef.current[v.vehicleId] = marker;
        }
      });
    });
  }, [vehicles, selectedVehicleId]);

  // Center camera on selected vehicle
  const handleSelectVehicle = (vehicle: TransitVehiclePosition) => {
    setSelectedVehicleId(vehicle.vehicleId);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [vehicle.currentCoordinates.lat, vehicle.currentCoordinates.lng],
        15,
        { animate: true, duration: 0.6 }
      );
    }
  };

  const handleSpeakStatus = (vehicle: TransitVehiclePosition) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const text = `${vehicle.operator}. Route ${vehicle.routeShortName} to ${vehicle.headsign}. ${
        vehicle.accessibility.availableWheelchairBays
      } of ${vehicle.accessibility.totalWheelchairBays} wheelchair bays available. Certified low floor.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || vehicles[0];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-950 text-white overflow-hidden">
      {/* SIDE PANEL: CONTROLS & FLEET LIST */}
      <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Navigation className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-base font-bold text-white font-display">Live Transit Radar</h1>
                <p className="text-[11px] text-slate-400">GTFS-Realtime MTC & CMRL Fleet</p>
              </div>
            </div>
            <button
              onClick={fetchVehicles}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Fleet Positions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>

          {/* Agency Filter Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            {(['ALL', 'MTC', 'CMRL'] as const).map((ag) => (
              <button
                key={ag}
                onClick={() => setAgencyFilter(ag)}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  agencyFilter === ag
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ag === 'ALL' ? 'All Transit' : ag === 'MTC' ? 'MTC Buses' : 'CMRL Metro'}
              </button>
            ))}
          </div>

          {/* Wheelchair Bays Toggle */}
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Available Wheelchair Bays Only
            </span>
            <input
              type="checkbox"
              checked={baysOnly}
              onChange={(e) => setBaysOnly(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-700"
            />
          </label>
        </div>

        {/* Fleet Count & Timestamp */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Tracking: <strong className="text-white">{vehicles.length}</strong> vehicles</span>
          <span>Updated: {lastUpdated}</span>
        </div>

        {/* Scrollable Vehicle List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {vehicles.map((v) => {
            const isMetro = v.agency === 'CMRL';
            const isSelected = v.vehicleId === selectedVehicleId;

            return (
              <div
                key={v.vehicleId}
                onClick={() => handleSelectVehicle(v)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isMetro ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isMetro ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{v.routeShortName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({v.vehicleId})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        To: {v.headsign}
                      </div>
                    </div>
                  </div>

                  <Badge variant="feasible" size="sm">
                    ♿ {v.accessibility.availableWheelchairBays}/{v.accessibility.totalWheelchairBays} Bays
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    {v.speedKmph} km/h
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {v.accessibility.hasKneelingSuspension
                      ? 'Hydraulic Kneeling'
                      : 'Zero-Gap Level Boarding'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN MAP AREA */}
      <div className="flex-1 relative flex flex-col">
        {/* LEAFLET CONTAINER */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />

        {/* FLOATING SELECTED VEHICLE TELEMETRY CARD */}
        {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 z-20 animate-in fade-in slide-in-from-bottom-2">
            <Card className="bg-slate-900/95 backdrop-blur-md border border-sky-500/40 p-4 shadow-2xl rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedVehicle.agency} REALTIME
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Audited Low-Floor
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedVehicle.operator} · {selectedVehicle.routeShortName}
                  </h2>
                  <p className="text-xs text-slate-300">Headsign: {selectedVehicle.headsign}</p>
                </div>

                <button
                  onClick={() => handleSpeakStatus(selectedVehicle)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors shadow"
                  title="Voice Accessibility Announcement"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Realtime Specifications */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Wheelchair Bays:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {selectedVehicle.accessibility.availableWheelchairBays} of{' '}
                    {selectedVehicle.accessibility.totalWheelchairBays} Free
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Boarding Assist:</span>
                  <span className="font-bold text-sky-300">
                    {selectedVehicle.agency === 'CMRL'
                      ? '40mm Level Gap'
                      : 'Hydraulic Kneeling Ramp'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Speed:</span>
                  <span className="text-slate-200 font-mono">{selectedVehicle.speedKmph} km/h</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Audio Guidance:</span>
                  <span className="text-emerald-400">Synchronized Online</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/journey/new')}
                  className="text-xs font-semibold"
                >
                  Plan Journey With This Route
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
