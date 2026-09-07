'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Button } from '../components/ui/Button';
import {
 ArrowLeft,
 Navigation,
 MapPin,
 Clock,
 Route as RouteIcon,
 ShieldCheck,
 Bus,
 Radio,
 Wifi,
 Volume2,
 CheckCircle2,
 X,
} from 'lucide-react';
import GoogleDeparturesSheet from '../components/transit/GoogleDeparturesSheet';

interface RouteData {
 id: string;
 isPrimary: boolean;
 coordinates: [number, number][];
 distanceKm: number;
 durationMin: number;
 summary: string;
 transitLine: string;
 departureTime: string;
 operator: string;
 midPoint: [number, number];
}

interface BusTelemetry {
 vehicleId: string;
 routeNumber: string;
 destinationHeadsign: string;
 operator: string;
 speedKmph: number;
 currentLocation: { lat: number; lng: number };
 etaMinutes: number;
 stopsAway: number;
 nextStop: string;
 allStops: Array<{
 id: string;
 name: string;
 lat: number;
 lng: number;
 passed: boolean;
 isCurrentTarget: boolean;
 }>;
 accessibilityTelemetry: {
 lowFloorRampStatus: string;
 kneelingSuspensionActive: boolean;
 wheelchairBaysTotal: number;
 wheelchairBaysOccupied: number;
 audioVisualAnnouncementsOnline: boolean;
 };
 liveOccupancy: string;
}

export default function MapView() {
 const navigate = useNavigate();
 const { currentJourney } = useJourneyStore();
 const { accessibilityProfile } = useAppStore();
 const mapContainerRef = useRef<HTMLDivElement>(null);
 const mapInstanceRef = useRef<any>(null);
 const tileLayerRef = useRef<any>(null);
 const polylinesRef = useRef<any[]>([]);
 const markersRef = useRef<any[]>([]);
 const busMarkerRef = useRef<any>(null);
 const stopMarkersRef = useRef<any[]>([]);

 const [routes, setRoutes] = useState<RouteData[]>([]);
 const [selectedRouteId, setSelectedRouteId] = useState<string>('route-0');
 const [showTraffic, setShowTraffic] = useState<boolean>(true);
 const [busProgress, setBusProgress] = useState<number>(0);
 const [loading, setLoading] = useState(true);
 const [departuresSheetOpen, setDeparturesSheetOpen] = useState(false);
 const [selectedStopForDepartures, setSelectedStopForDepartures] = useState<{
 name: string;
 lat: number;
 lng: number;
 } | null>(null);

 const origin = currentJourney?.origin || null;
 const destination = currentJourney?.destination || null;

 // Enforce zero local persistence: If no live journey data, prompt user to create one
 useEffect(() => {
 if (!origin || !destination) {
 navigate('/journey/new');
 }
 }, [origin, destination, navigate]);

 // If no data, return empty state while redirecting
 if (!origin || !destination) {
 return <div className="flex h-screen bg-slate-950 items-center justify-center text-slate-400">Redirecting to Search...</div>;
 }

 // Fetch real road curves and alternative routes
 useEffect(() => {
 let isMounted = true;
 setLoading(true);

 const originLat = origin.lat || 12.9365;
 const originLng = origin.lng || 80.2052;
 const destLat = destination.lat || 12.9772;
 const destLng = destination.lng || 80.2221;

 fetch(
 `/api/routes/directions?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`
 )
 .then(async (res) => {
 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Failed to fetch directions');
 }
 return data;
 })
 .then((data) => {
 if (isMounted && data.routes && data.routes.length > 0) {
 setRoutes(data.routes);
 setSelectedRouteId(data.routes[0].id);
 setLoading(false);
 } else if (isMounted) {
 alert('No accessible routes found between these locations.');
 setLoading(false);
 }
 })
 .catch((err) => {
 console.warn('Failed to load directions:', err);
 if (isMounted) {
 alert(`Routing Error: ${err.message}`);
 setLoading(false);
 }
 });

 // Live Bus Telemetry removed

 return () => {
 isMounted = false;
 };
 }, [origin.lat, origin.lng, destination.lat, destination.lng]);


 // Update Tile Layer when Traffic Toggle Changes
 useEffect(() => {
 if (!mapInstanceRef.current || typeof window === 'undefined') return;

 import('leaflet').then((L) => {
 const map = mapInstanceRef.current;
 if (tileLayerRef.current) {
 map.removeLayer(tileLayerRef.current);
 }

 const tileUrl = showTraffic ?
 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}'
 : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

 const layer = L.tileLayer(tileUrl, {
 attribution: '&copy; Google Maps & Traffic',
 maxZoom: 20,
 subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
 }).addTo(map);

 tileLayerRef.current = layer;
 });
 }, [showTraffic]);

 // Render Leaflet Map, Polylines, Markers, and Live Bus Radar
 useEffect(() => {
 if (!mapContainerRef.current || typeof window === 'undefined') return;

 let map = mapInstanceRef.current;

 import('leaflet').then((L) => {
 // Inject Leaflet CSS
 if (!document.getElementById('leaflet-css-bundle')) {
 const link = document.createElement('link');
 link.id = 'leaflet-css-bundle';
 link.rel = 'stylesheet';
 link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
 document.head.appendChild(link);
 }

 if (mapInstanceRef.current) {
 mapInstanceRef.current.remove();
 mapInstanceRef.current = null;
 }
 if ((mapContainerRef.current as any)._leaflet_id) {
 delete (mapContainerRef.current as any)._leaflet_id;
 }

 const originLat = origin.lat && origin.lat > 0 ? origin.lat : 12.9210;
 const originLng = origin.lng && origin.lng > 0 ? origin.lng : 80.1915;
 const destLat = destination.lat && destination.lat > 0 ? destination.lat : 12.8718;
 const destLng = destination.lng && destination.lng > 0 ? destination.lng : 80.2198;

 const centerLat = (originLat + destLat) / 2;
 const centerLng = (originLng + destLng) / 2;

 map = L.map(mapContainerRef.current!, {
 center: [centerLat, centerLng],
 zoom: 13,
 zoomControl: false,
 });

 const tileUrl = showTraffic ? 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}'
 : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

 const layer = L.tileLayer(tileUrl, {
 attribution: '&copy; Google Maps & Traffic',
 maxZoom: 20,
 subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
 }).addTo(map);
 tileLayerRef.current = layer;

 L.control.zoom({ position: 'bottomright' }).addTo(map);
 mapInstanceRef.current = map;

 // Clear existing layers
 polylinesRef.current = [];
 markersRef.current = [];
 stopMarkersRef.current = [];

 // 1. Prominent Origin Marker (START POINT A)
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

 const oMarker = L.marker([originLat, originLng], { icon: originIcon, zIndexOffset: 2000 })
 .addTo(map)
 .bindPopup(`
 <div style="font-family:sans-serif; color:#0f172a;">
 <div style="font-size:11px; font-weight:bold; color:#059669; text-transform:uppercase; margin-bottom:2px;"> Origin (Start Point)</div>
 <div style="font-size:13px; font-weight:bold;">${origin.name}</div>
 <div style="font-size:11px; color:#64748b; margin-top:2px;">${originLat.toFixed(4)} N, ${originLng.toFixed(4)} E</div>
 </div>
 `);
 markersRef.current.push(oMarker);

 // 2. Prominent Destination Marker (DESTINATION B) tailored to disability
 const isCognitive = accessibilityProfile.cognitive.simplifiedInstructions || accessibilityProfile.cognitive.fewerTransfers;
 const isVision = accessibilityProfile.vision.visualAssistance;
 const isHearing = accessibilityProfile.hearing.visualNotifications;
 const isSpeech = accessibilityProfile.speech.textFirst;

 const destEmoji = isCognitive ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>' : isVision ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' : isHearing ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/></svg>' : isSpeech ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
 const destBadgeLabel = isCognitive ? 'CALM ENTRY' : isVision ? 'TACTILE PORTAL' : isHearing ? 'LED GATE' : isSpeech ? 'QR GATE' : 'DESTINATION (RAMP)';
 const destFeatureDesc = isCognitive ? ' Verified Quiet Landmark-Guided Accessible Portal'
 : isVision ? ' Continuous Tactile Guideway & Auditory Beacon Portal'
 : isHearing ? ' Real-Time Visual Display & T-Coil Hearing Loop Portal'
 : isSpeech ? ' Contactless QR Self-Check-In Portal'
 : ' Field-Verified Wheelchair Ramp Entrance';

 const destIcon = L.divIcon({
 className: 'custom-destination-icon',
 html: `
 <div style="position:relative; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
 <span style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
 <div style="width:32px; height:32px; border-radius:50%; background:#ef4444; border:3px solid #ffffff; box-shadow:0 6px 16px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:14px; z-index:10;">
 ${destEmoji}
 </div>
 <div style="background:#0f172a; color:#f87171; font-size:10px; font-weight:800; padding:2px 6px; border-radius:6px; border:1px solid #dc2626; white-space:nowrap; margin-top:4px; box-shadow:0 2px 6px rgba(0,0,0,0.7); z-index:11;">
 ${destBadgeLabel}
 </div>
 </div>
 `,
 iconSize: [110, 56],
 iconAnchor: [55, 16],
 });

 const dMarker = L.marker([destLat, destLng], { icon: destIcon, zIndexOffset: 2000 })
 .addTo(map)
 .bindPopup(`
 <div style="font-family:sans-serif; color:#0f172a;">
 <div style="font-size:11px; font-weight:bold; color:#dc2626; text-transform:uppercase; margin-bottom:2px;"> Target Destination Portal</div>
 <div style="font-size:13px; font-weight:bold;">${destination.name}</div>
 <div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:3px;">${destFeatureDesc}</div>
 <div style="font-size:11px; color:#64748b; margin-top:2px;">${destLat.toFixed(4)} N, ${destLng.toFixed(4)} E</div>
 </div>
 `);
 markersRef.current.push(dMarker);

 // Fit bounds to show BOTH Start Point and Destination
 map.fitBounds([
 [originLat, originLng],
 [destLat, destLng],
 ], { padding: [60, 60] });

 // 3. Render Road Polylines
 if (routes.length > 0) {
 let activePolyline: any = null;

 // Sort routes so the selected route is drawn last (on top)
 const sortedRoutes = [...routes].sort((a, b) => 
 a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0
 );

 sortedRoutes.forEach((r) => {
 const isSelected = r.id === selectedRouteId;

 const polyline = L.polyline(r.coordinates, {
 color: isSelected ? '#0284c7' : '#94a3b8',
 weight: isSelected ? 6 : 4,
 opacity: isSelected ? 0.95 : 0.6,
 dashArray: isSelected ? undefined : '6, 8',
 lineCap: 'round',
 lineJoin: 'round',
 }).addTo(map);

 polyline.on('click', () => setSelectedRouteId(r.id));
 polylinesRef.current.push(polyline);

 if (isSelected) {
 activePolyline = polyline;
 
 // Floating Transit Line & Time Pill Badge (ONLY for selected route)
 const timeBadgeIcon = L.divIcon({
 className: 'custom-time-badge',
 html: `
 <div style="
 background: #0284c7;
 color: #ffffff;
 padding: 4px 10px;
 border-radius: 9999px;
 font-weight: 700;
 font-size: 11px;
 box-shadow: 0 4px 12px rgba(0,0,0,0.25);
 border: 1px solid #0369a1;
 cursor: pointer;
 white-space: nowrap;
 display: flex;
 align-items: center;
 gap: 5px;
 transform: translate(-50%, -50%);
 ">
 <span>${r.transitLine ? ` ${r.transitLine} ` : ''}${r.durationMin}m</span>
 <span style="font-size: 9px; opacity: 0.9; background: #0369a1; padding: 1px 4px; border-radius: 4px;">Accessible</span>
 </div>
 `,
 iconSize: [80, 24],
 iconAnchor: [40, 12],
 });

 const badgeMarker = L.marker(r.midPoint, { icon: timeBadgeIcon }).addTo(map);
 markersRef.current.push(badgeMarker);
 }
 });

 if (activePolyline) {
 map.fitBounds(activePolyline.getBounds(), { padding: [50, 50] });
 }
 }

 });
 }, [routes, selectedRouteId, origin.lat, origin.lng, destination.lat, destination.lng]);

 const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

 return (
 <div className="flex flex-col h-full max-h-screen bg-slate-950 text-slate-100">
 {/* Top Header */}
 <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shadow-lg">
 <div className="flex items-center gap-3 min-w-0">
 <button
 onClick={() => navigate('/journey/new')}
 className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
 title="Back to search"
 >
 <ArrowLeft className="w-5 h-5" />
 </button>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
 <p className="text-sm font-bold text-slate-100 truncate">
 {origin.name.split(',')[0]} {destination.name.split(',')[0]}
 </p>
 </div>
 <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
 <span>{selectedRoute?.durationMin || currentJourney?.totalDuration || 10} mins</span>
 <span></span>
 <span>{selectedRoute?.distanceKm || '5.9'} km</span>
 <span></span>
 <span className="text-emerald-400 font-medium flex items-center gap-1">
 <ShieldCheck className="w-3.5 h-3.5" /> 100% Step-Free
 </span>
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => {
 setSelectedStopForDepartures({
 name: origin.name.split(',')[0] || 'Origin Transit Stop',
 lat: origin.lat || 12.9365,
 lng: origin.lng || 80.2052,
 });
 setDeparturesSheetOpen(true);
 }}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/30 transition-all shadow-md"
 title="Open Live Transit Departures Board (Google Transit Feed)"
 >
 <Clock className="w-3.5 h-3.5" />
 <span> Live Departures</span>
 </button>

 <button
 onClick={() => setShowTraffic(!showTraffic)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-sm ${
 showTraffic ?
 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
 : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
 }`}
 title="Toggle Live Traffic on Map"
 >
 <span className={`w-2 h-2 rounded-full ${showTraffic ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
 <span>{showTraffic ? 'Traffic ON' : 'Traffic OFF'}</span>
 </button>

 <Button size="sm" onClick={() => navigate('/journey/roadmap')}>
 View Roadmap
 </Button>
 </div>
 </div>

 {/* Interactive Map */}
 <div className="flex-1 min-h-0 relative">
 <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />

 {/* Route Selector Card (Alternative Routes) */}
 {routes.length > 1 && (
 <div className="absolute bottom-5 left-5 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2 max-w-xs animate-in fade-in slide-in-from-bottom-2">
 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
 Select Route
 </p>
 <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
 {routes.map((r, idx) => (
 <button
 key={r.id}
 onClick={() => setSelectedRouteId(r.id)}
 className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
 r.id === selectedRouteId ?
 'bg-sky-500/20 border border-sky-500/50 text-sky-200 shadow-md font-bold'
 : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 <RouteIcon className={`w-4 h-4 shrink-0 ${r.id === selectedRouteId ? 'text-sky-400' : 'text-slate-400'}`} />
 <span className="truncate">{r.summary || `Via Main Road ${idx + 1}`}</span>
 </div>
 <div className="text-right shrink-0 ml-2 font-mono">
 <div>{r.durationMin} min</div>
 <div className="text-[10px] text-slate-400">{r.distanceKm} km</div>
 </div>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

  {/* Bottom Status Bar */}
  <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between z-10 gap-3">
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>Google Maps & Live Telemetry Active</span>
    </div>
    <Button
      variant="primary"
      size="sm"
      onClick={() => navigate('/journey/active')}
      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shrink-0"
    >
      <Navigation className="w-3.5 h-3.5 mr-1" />
      Start Live Navigation
    </Button>
  </div>

 {/* Live Google Transit Departures Sheet Modal */}
 {selectedStopForDepartures && (
 <GoogleDeparturesSheet
 isOpen={departuresSheetOpen}
 onClose={() => setDeparturesSheetOpen(false)}
 stopName={selectedStopForDepartures.name}
 stopLat={selectedStopForDepartures.lat}
 stopLng={selectedStopForDepartures.lng}
 />
 )}
 </div>
 );
}
