import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function SavedJourneys() {
 const navigate = useNavigate();
 const { savedJourneys, deleteJourney, recheckJourney, setCurrentJourney } = useJourneyStore();
 const [rechecking, setRechecking] = useState<string | null>(null);

 const handleRecheck = async (id: string) => {
 setRechecking(id);
 await recheckJourney(id);
 setRechecking(null);
 };

 return (
 <div className="max-w-2xl mx-auto px-5 py-6">
 <h1 className="font-display text-xl font-bold text-[var(--foreground)] mb-5">Saved Journeys</h1>

 {savedJourneys.length === 0 && (
 <div className="text-center py-16">
 <div className="w-12 h-12 rounded-full bg-[var(--secondary)] flex items-center justify-center mx-auto mb-3">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
 </svg>
 </div>
 <p className="text-[var(--muted-foreground)] mb-4">No saved journeys yet.</p>
 <Button size="sm" onClick={() => navigate('/journey/new')}>Plan a journey</Button>
 </div>
 )}

 <div className="flex flex-col gap-4">
 {savedJourneys.map((j) => {
 const recheck = j.recheckResult;
 return (
 <Card key={j.id} className="p-4">
 <div className="flex items-start justify-between gap-3 mb-3">
 <div>
 <p className="font-semibold text-[var(--foreground)]">{j.origin.name} → {j.destination.name}</p>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
 {new Date(j.savedAt || j.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(j.savedAt || j.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 <Badge variant={j.feasible ? 'feasible' : 'danger'}>{j.feasible ? 'Feasible' : 'Not feasible'}</Badge>
 </div>

 <div className="flex gap-4 mb-3">
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-[var(--muted-foreground)]">Quality</span>
 <span className="font-mono text-sm font-semibold text-[var(--feasible)]">{j.accessibilityQuality}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-[var(--muted-foreground)]">Resilience</span>
 <span className="font-mono text-sm font-semibold text-[var(--primary)]">{j.resilience}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-[var(--muted-foreground)]">Duration</span>
 <span className="font-mono text-sm">{j.totalDuration} min</span>
 </div>
 </div>

 {/* Recheck result */}
 {recheck && (
 <div className={`mb-3 p-3 rounded-lg border text-sm ${recheck.feasible ? 'bg-[var(--feasible-bg)] border-[var(--feasible)]/20' : 'bg-[var(--warning-bg)] border-[var(--warning)]/20'}`}>
 <div className="flex items-center gap-2 mb-1">
 <Badge variant={recheck.feasible ? 'feasible' : 'warning'}>{recheck.feasible ? 'Still feasible' : 'WARNING'}</Badge>
 <span className="text-xs text-[var(--muted-foreground)]">Re-checked {new Date(recheck.checkedAt).toLocaleDateString()}</span>
 </div>
 {recheck.warnings.map((w, i) => <p key={i} className="text-xs text-[var(--warning)]">{w}</p>)}
 </div>
 )}

 <div className="flex gap-2">
 <Button size="sm" variant="ghost" onClick={() => { setCurrentJourney(j); navigate('/journey/roadmap'); }}>Open</Button>
 <Button size="sm" variant="ghost" disabled={rechecking === j.id} onClick={() => handleRecheck(j.id)}>
 {rechecking === j.id ? 'Checking...' : 'Re-check'}
 </Button>
 <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete this journey?')) deleteJourney(j.id); }}
 className="text-[var(--danger)] hover:bg-[var(--danger-bg)]">Delete</Button>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
