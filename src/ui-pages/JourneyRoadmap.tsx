'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore, type JourneySegment } from '../stores/useJourneyStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
 ShieldCheck,
 AlertTriangle,
 Info,
 ChevronDown,
 ChevronUp,
 CheckCircle2,
 AlertOctagon,
 ArrowRight,
} from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  walk: 'Walk',
  metro: 'Metro',
  bus: 'Bus',
  train: 'Train',
  uber: 'Cab',
  ramp: 'Ramp',
  elevator: 'Elevator',
  transfer: 'Transfer',
};

function SegmentCard({
 segment,
 isSelected,
 onClick,
}: {
 segment: JourneySegment;
 isSelected: boolean;
 onClick: () => void;
}) {
 const isAccessible = segment.accessibility === 'ACCESSIBLE';

 return (
 <div
 onClick={onClick}
 className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
 isSelected
 ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]'
 : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40'
 }`}
 >
 <div className="flex items-start gap-3.5">
 <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
 <span className="text-xl">{TYPE_ICONS[segment.type] || '📍'}</span>
 <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
 {segment.dataSource.replace('_', ' ').split(' ')[0]}
 </span>
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
 <p className="text-sm font-bold text-[var(--foreground)] truncate">{segment.label}</p>
 <Badge variant={isAccessible ? 'feasible' : 'danger'}>
 {isAccessible ? 'Accessible' : 'Inaccessible'}
 </Badge>
 </div>

 <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
 <span>{segment.duration} mins</span>
 {segment.distance ? <span>• {segment.distance}m</span> : null}
 {segment.operator ? <span>• {segment.operator}</span> : null}
 {segment.fare ? <span className="font-bold text-[var(--feasible)]">• ₹{segment.fare}</span> : null}
 </p>

 {segment.warnings.length > 0 && (
 <div className="mt-2 flex flex-col gap-1">
 {segment.warnings.map((w, i) => (
 <p
 key={i}
 className="text-xs text-[var(--danger)] bg-[var(--danger-bg)] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium"
 >
 <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
 <span>{w}</span>
 </p>
 ))}
 </div>
 )}
 </div>

 <div className="text-[var(--muted-foreground)] pt-1">
 {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </div>
 </div>

 {/* Expanded Quick Specs tailored to disability profile */}
 {isSelected && (
 <div className="mt-2 pt-2.5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
 {segment.label.includes('Calm') || segment.label.includes('Landmark') || segment.label.includes('Quiet') ? (
 <>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Wayfinding</span>
 <span className="font-bold text-[var(--foreground)]">Landmark Guided</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Sensory Level</span>
 <span className="font-bold text-[var(--feasible)]">Quiet (&lt;35 dB)</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Transfers</span>
 <span className="font-bold text-[var(--foreground)]">0 (Direct)</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Data Confidence</span>
 <span className="font-bold text-[var(--primary)]">{segment.confidence}%</span>
 </div>
 </>
 ) : segment.label.includes('Tactile') || segment.label.includes('Audio') ? (
 <>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Guideway</span>
 <span className="font-bold text-[var(--foreground)]">Tactile TGSI</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Acoustic Signal</span>
 <span className="font-bold text-[var(--feasible)]">Voice &amp; Chime</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Overhead Clearance</span>
 <span className="font-bold text-[var(--foreground)]">2.1m Obstacle-Free</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Data Confidence</span>
 <span className="font-bold text-[var(--primary)]">{segment.confidence}%</span>
 </div>
 </>
 ) : segment.label.includes('LED') || segment.label.includes('Visual') ? (
 <>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Display Mode</span>
 <span className="font-bold text-[var(--foreground)]">LED Electronic</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Induction Loop</span>
 <span className="font-bold text-[var(--feasible)]">T-Coil Enabled</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Alert Type</span>
 <span className="font-bold text-[var(--foreground)]">Vibration &amp; Flash</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Data Confidence</span>
 <span className="font-bold text-[var(--primary)]">{segment.confidence}%</span>
 </div>
 </>
 ) : (
 <>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Passage Width</span>
 <span className="font-bold text-[var(--foreground)]">{segment.width || 180} cm</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Ramp Grade</span>
 <span className="font-bold text-[var(--feasible)]">1:12 (Step-Free)</span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Wheelchair Lift</span>
 <span className="font-bold text-[var(--foreground)]">
 {segment.wheelchairBoarding !== false ? 'Yes' : 'No'}
 </span>
 </div>
 <div>
 <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Data Confidence</span>
 <span className="font-bold text-[var(--primary)]">{segment.confidence}%</span>
 </div>
 </>
 )}
 </div>
 )}
 </div>
 );
}

export default function JourneyRoadmap() {
 const navigate = useNavigate();
 const { currentJourney, saveCurrentJourney, simulateOutage } = useJourneyStore();
 const [selectedSeg, setSelectedSeg] = useState<string | null>(null);
 const [saved, setSaved] = useState(false);

 if (!currentJourney) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <p className="text-[var(--muted-foreground)] mb-4">No journey planned yet.</p>
 <Button onClick={() => navigate('/journey/new')}>Plan a journey</Button>
 </div>
 </div>
 );
 }

 const isFeasible = currentJourney.feasible;
 const hasOutage = currentJourney.segments.some((s) => s.accessibility !== 'ACCESSIBLE');

 const handleSave = () => {
 saveCurrentJourney();
 setSaved(true);
 setTimeout(() => navigate('/home'), 1200);
 };

 return (
 <div className="max-w-2xl mx-auto px-5 py-7 flex flex-col gap-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <button
 onClick={() => navigate(-1)}
 className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
 >
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
 </button>
 <div>
 <h1 className="font-display text-xl font-bold text-[var(--foreground)]">Journey Roadmap</h1>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
 {currentJourney.origin.name.split(',')[0]} ➔ {currentJourney.destination.name.split(',')[0]}
 </p>
 </div>
 </div>
 </div>

 {/* Metrics Cards */}
 <div className="grid grid-cols-3 gap-3">
 <Card className="p-4 text-center bg-[var(--card)] border-[var(--border)] shadow-sm">
 <p className="text-xs text-[var(--muted-foreground)] mb-1 font-bold uppercase tracking-wider">Status</p>
 <Badge variant={isFeasible ? 'feasible' : 'danger'} size="md">
 {isFeasible ? 'FEASIBLE' : 'NOT FEASIBLE'}
 </Badge>
 </Card>
 <Card className="p-4 text-center bg-[var(--card)] border-[var(--border)] shadow-sm">
 <p className="text-xs text-[var(--muted-foreground)] mb-1 font-bold uppercase tracking-wider">Quality</p>
 <p className="text-2xl font-bold font-display text-[var(--feasible)]">
 {currentJourney.accessibilityQuality}
 <span className="text-xs font-normal text-[var(--muted-foreground)]">/100</span>
 </p>
 </Card>
 <Card className="p-4 text-center bg-[var(--card)] border-[var(--border)] shadow-sm">
 <p className="text-xs text-[var(--muted-foreground)] mb-1 font-bold uppercase tracking-wider">Resilience</p>
 <p className="text-2xl font-bold font-display text-[var(--primary)]">
 {currentJourney.resilience}
 <span className="text-xs font-normal text-[var(--muted-foreground)]">/100</span>
 </p>
 </Card>
 </div>

 {/* Short, Punchy 1-Line Feasibility Status Card (No Clutter, No Jargon) */}
 <div
 className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
 isFeasible
 ? 'bg-[var(--feasible-bg)] border-[var(--feasible)]/30 text-[var(--foreground)]'
 : 'bg-[var(--danger-bg)] border-[var(--danger)]/30 text-[var(--foreground)]'
 }`}
 >
 {isFeasible ? (
 <CheckCircle2 className="w-5 h-5 text-[var(--feasible)] shrink-0 mt-0.5" />
 ) : (
 <AlertOctagon className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
 )}
 <div className="flex-1 text-xs">
 {isFeasible ? (
 <div>
 <p className="font-bold text-sm text-[var(--feasible)]">100% Step-Free & Operational</p>
 <p className="text-[var(--muted-foreground)] mt-0.5">
 All ramps, step-free sidewalks, and transit boarding equipment on this route are fully verified and operational.
 </p>
 </div>
 ) : (
 <div>
 <p className="font-bold text-sm text-[var(--danger)]">Accessibility Obstacle Detected</p>
 <p className="text-[var(--muted-foreground)] mt-0.5">
 Elevator Outage detected on Gate 4 Platform. Click &ldquo;Find A Way&rdquo; to bypass via the accessible Gate 5 Ramp.
 </p>
 <button
 onClick={() => navigate('/journey/find-a-way')}
 className="mt-2 text-xs font-bold text-[var(--danger)] underline flex items-center gap-1"
 >
 <span>Switch to Verified Alternative Route</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Segments list */}
 <div>
 <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
 Route Segments — Tap to inspect
 </p>
 <div className="flex flex-col gap-3">
 {currentJourney.segments.map((seg) => (
 <SegmentCard
 key={seg.id}
 segment={seg}
 isSelected={selectedSeg === seg.id}
 onClick={() => setSelectedSeg(selectedSeg === seg.id ? null : seg.id)}
 />
 ))}
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-3 pt-2">
 <Button variant="outline" onClick={() => navigate('/journey/transport')}>
 Modify Transport
 </Button>
 <Button fullWidth onClick={handleSave}>
 {saved ? 'Journey Saved to Profile' : 'Confirm & Save Journey'}
 </Button>
 </div>

 {/* Outage Simulation for Hackathon Demo */}
 {process.env.NODE_ENV !== 'production' && (
 <div className="text-center pt-1">
 <button
 onClick={() => {
 simulateOutage('seg-lng-2');
 navigate('/journey/find-a-way');
 }}
 className="text-xs text-[var(--muted-foreground)] hover:text-[var(--warning)] transition-colors underline font-mono"
 >
 [DEV] Simulate Elevator Outage (Find A Way Demo)
 </button>
 </div>
 )}
 </div>
 );
}
