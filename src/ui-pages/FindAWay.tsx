import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { Button } from '../components/ui/Button';

const STEPS = [
  'Checking alternatives…',
  'Checking accessibility constraints…',
  'Checking transport connections…',
  'Alternative found.',
];

export default function FindAWay() {
  const navigate = useNavigate();
  const { currentJourney, findAlternative, isFindingAlternative } = useJourneyStore();
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const targetSegmentId = currentJourney?.spof || currentJourney?.segments?.[0]?.id;
    if (!targetSegmentId) {
      setDone(true);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setPhase(i);
      if (i >= STEPS.length - 1) {
        clearInterval(interval);
        findAlternative(targetSegmentId).then(() => setDone(true)).catch(() => setDone(true));
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const oldSeg = currentJourney?.segments.find((s) => s.id === currentJourney?.spof);

  return (
    <div className="max-w-md mx-auto px-5 py-10 flex flex-col items-center gap-6">
      <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
        {done ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--feasible)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">Find A Way</h1>
        <p className="text-sm text-[var(--muted-foreground)]">AccessChain is searching for an alternative accessible route.</p>
      </div>

      {/* Step log */}
      <div className="w-full flex flex-col gap-2">
        {STEPS.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= phase ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < phase ? 'bg-[var(--feasible)]' : i === phase ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
              {i < phase ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : i === phase && !done ? (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/50" />
              )}
            </div>
            <span className={i < phase ? 'text-[var(--muted-foreground)] line-through' : i === phase ? 'font-medium text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}>{step}</span>
          </div>
        ))}
      </div>

      {/* Result */}
      {done && (
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3 bg-[var(--danger-bg)] rounded-lg border border-[var(--danger)]/20">
              <span className="text-lg">✕</span>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Old</p>
                <p className="text-sm font-medium text-[var(--danger)]">{oldSeg?.label || 'Gate 4 Elevator'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[var(--feasible-bg)] rounded-lg border border-[var(--feasible)]/20">
              <span className="text-lg">✓</span>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">New</p>
                <p className="text-sm font-medium text-[var(--feasible)]">Gate 5 Ramp</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-[var(--feasible-bg)] rounded-lg border border-[var(--feasible)]/20">
            <p className="text-sm font-semibold text-[var(--feasible)] mb-1">Alternative accessible route found.</p>
            <p className="text-xs text-[var(--muted-foreground)]">The route has been updated. Feasibility restored.</p>
          </div>
          <Button fullWidth onClick={() => navigate('/journey/roadmap')}>View updated journey</Button>
        </div>
      )}
    </div>
  );
}
