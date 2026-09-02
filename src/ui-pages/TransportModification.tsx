'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Bus, Train, Car, Zap, RefreshCw, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface TransportOption {
 id: string;
 label: string;
 routeNumber: string;
 type: 'bus' | 'metro' | 'train' | 'cab' | 'shuttle';
 operator: string;
 departure: string;
 arrival: string;
 duration: number;
 fare: number;
 accessible: boolean;
 wheelchairRamp: boolean;
 ac: boolean;
 lowFloor: boolean;
 seats: number;
 availableWheelchairBays: number;
 frequency: string;
 liveStatus: string;
 dataSource: string;
}

export default function TransportModification() {
 const navigate = useNavigate();
 const { currentJourney } = useJourneyStore();
 const [options, setOptions] = useState<TransportOption[]>([]);
 const [selectedId, setSelectedId] = useState<string>('');
 const [isIntercity, setIsIntercity] = useState(false);
 const [distanceKm, setDistanceKm] = useState(5.9);
 const [loading, setLoading] = useState(true);

 const origin = currentJourney?.origin || null;
 const destination = currentJourney?.destination || null;

 useEffect(() => {
 if (!origin || !destination) {
 navigate('/journey/new');
 }
 }, [origin, destination, navigate]);

 if (!origin || !destination) {
 return <div className="flex h-screen bg-[var(--background)] items-center justify-center text-[var(--muted-foreground)]">Redirecting to Search...</div>;
 }

 useEffect(() => {
 let isMounted = true;
 setLoading(true);

 const url = `/api/transport/routes?originLat=${origin.lat}&originLng=${origin.lng}&destLat=${destination.lat}&destLng=${destination.lng}&originName=${encodeURIComponent(origin.name)}&destName=${encodeURIComponent(destination.name)}`;

 fetch(url)
 .then((res) => res.json())
 .then((data) => {
 if (isMounted && data.options) {
 setOptions(data.options);
 setIsIntercity(!!data.isIntercity);
 setDistanceKm(data.distanceKm || 5.9);
 if (data.options.length > 0) {
 setSelectedId(data.options[0].id);
 }
 setLoading(false);
 }
 })
 .catch((err) => {
 console.warn('Transport API fetch error:', err);
 if (isMounted) setLoading(false);
 });

 return () => {
 isMounted = false;
 };
 }, [origin.lat, origin.lng, destination.lat, destination.lng, origin.name, destination.name]);

 const selectedOpt = options.find((o) => o.id === selectedId) || options[0];

 const getIcon = (type: string) => {
 switch (type) {
 case 'bus':
 return <Bus className="w-5 h-5 text-[var(--primary)]" />;
 case 'train':
 case 'metro':
 return <Train className="w-5 h-5 text-indigo-600" />;
 case 'cab':
 return <Car className="w-5 h-5 text-amber-600" />;
 case 'shuttle':
 return <Zap className="w-5 h-5 text-emerald-600" />;
 default:
 return <Bus className="w-5 h-5 text-[var(--primary)]" />;
 }
 };

 return (
 <div className="max-w-2xl mx-auto px-5 py-7">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <button
 onClick={() => navigate(-1)}
 className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
 >
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
 </button>
 <div>
 <h1 className="font-display text-xl font-bold text-[var(--foreground)]">
 {isIntercity ? 'Intercity Transit Options' : 'Transit Options'}
 </h1>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
 {origin.name.split(',')[0]} ➔ {destination.name.split(',')[0]} ({distanceKm} km)
 </p>
 </div>
 </div>

 <button
 onClick={() => window.location.reload()}
 className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5 transition-colors shadow-sm"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
 <span>Live Refresh</span>
 </button>
 </div>

 {/* Transit Options List */}
 <div className="flex flex-col gap-3.5 mb-6">
 {loading && (
 <div className="p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-3 shadow-sm">
 <RefreshCw className="w-6 h-6 animate-spin text-[var(--primary)]" />
 <p className="text-sm">Fetching real-time schedules and wheelchair accessibility data...</p>
 </div>
 )}

 {!loading &&
 options.map((opt) => {
 const isSelected = selectedId === opt.id;
 return (
 <label
 key={opt.id}
 className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
 isSelected
 ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-2 ring-[var(--primary)]/30'
 : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 shadow-sm'
 }`}
 >
 <div className="pt-1">
 <input
 type="radio"
 name="transport"
 value={opt.id}
 checked={isSelected}
 onChange={() => setSelectedId(opt.id)}
 className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
 />
 </div>

 <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
 {getIcon(opt.type)}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
 <p className="text-sm font-bold text-[var(--foreground)] truncate">
 {opt.label}
 </p>
 <Badge variant={opt.accessible ? 'feasible' : 'danger'}>
 {opt.accessible ? '100% Accessible' : 'Limited Access'}
 </Badge>
 </div>

 {/* Subtitle & Frequency */}
 <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2.5">
 <span className="font-semibold text-[var(--foreground)]">{opt.operator}</span>
 <span>•</span>
 <span className="text-[var(--feasible)] font-bold">● {opt.liveStatus.replace('_', ' ')}</span>
 <span>•</span>
 <span>{opt.frequency}</span>
 </div>

 {/* Clean 4-Column Summary Box */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-[var(--border)] text-xs">
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Timing</span>
 <span className="font-semibold text-[var(--foreground)]">
 {opt.departure} → {opt.arrival}
 </span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Duration</span>
 <span className="font-semibold text-[var(--foreground)]">{opt.duration} mins</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Fare</span>
 <span className="font-bold text-[var(--feasible)]">₹{opt.fare}</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] uppercase block">Wheelchair Bays</span>
 <span className="font-semibold text-[var(--foreground)]">
 {opt.availableWheelchairBays > 0 ? `${opt.availableWheelchairBays} Open` : 'None'}
 </span>
 </div>
 </div>
 </div>
 </label>
 );
 })}
 </div>

 {/* Booking Alert for Cab */}
 {selectedOpt?.type === 'cab' && (
 <Card className="p-3.5 mb-5 border-[var(--warning)]/40 bg-[var(--warning-bg)] text-xs flex items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0 text-[var(--warning)]" />
 <span className="text-[var(--foreground)]">Uber Assist dispatches certified hydraulic ramp vehicles.</span>
 </div>
 <a
 href="https://m.uber.com"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1 bg-[var(--warning)] text-white font-bold px-3 py-1 rounded text-xs shrink-0 hover:brightness-110"
 >
 <span>Open Uber</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 </Card>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3">
 <Button variant="outline" onClick={() => navigate(-1)}>
 Back
 </Button>
 <Button
 fullWidth
 onClick={() => {
 if (selectedOpt?.type === 'cab') {
 window.open('https://m.uber.com', '_blank');
 }
 navigate('/journey/final');
 }}
 >
 {selectedOpt?.type === 'cab' ? 'Book on Uber Assist' : 'Confirm & Proceed'}
 </Button>
 </div>
 </div>
 );
}
