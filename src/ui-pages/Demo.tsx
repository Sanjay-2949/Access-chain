import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

type DemoPhase = 'intro' | 'profile' | 'routing' | 'feasible' | 'outage' | 'spof' | 'findway' | 'recovered';

const DEMO_JOURNEY = {
  id: 'demo-journey-1',
  origin: { placeId: 'chennai-central', name: 'Chennai Central', address: 'Chennai Central Railway Station', lat: 13.0827, lng: 80.2707 },
  destination: { placeId: 'stadium', name: 'MA Chidambaram Stadium', address: 'Chepauk, Chennai', lat: 13.0582, lng: 80.2793 },
  segments: [
    { id: 'seg-walk-entrance', type: 'walk' as const, label: 'Walk to Chennai Central', from: 'Chennai Central', to: 'Central Entrance', duration: 3, distance: 200, accessibility: 'ACCESSIBLE' as const, warnings: [], confidence: 95, dataSource: 'RECENTLY_VERIFIED' as const },
    { id: 'seg-elevator-gate4', type: 'elevator' as const, label: 'Gate 4 Elevator', from: 'Central Entrance', to: 'Metro Platform', duration: 2, accessibility: 'ACCESSIBLE' as const, warnings: [], confidence: 82, dataSource: 'RECENTLY_VERIFIED' as const, elevatorAvailable: true },
    { id: 'seg-metro', type: 'metro' as const, label: 'Chennai Metro – Green Line', from: 'Metro Platform', to: 'Transfer Station', duration: 18, distance: 4200, accessibility: 'ACCESSIBLE' as const, warnings: [], confidence: 92, dataSource: 'LIVE' as const, operator: 'CMRL', fare: 30 },
    { id: 'seg-bus', type: 'bus' as const, label: 'MTC Bus 23C', from: 'Transfer Station', to: 'Stadium', duration: 12, distance: 1800, accessibility: 'ACCESSIBLE' as const, warnings: [], confidence: 75, dataSource: 'USER_REPORTED' as const, operator: 'MTC', fare: 15, wheelchairBoarding: true },
  ],
  feasible: true,
  accessibilityQuality: 94,
  resilience: 88,
  warnings: [],
  alternatives: [],
  createdAt: new Date().toISOString(),
  totalDuration: 35,
  totalDistance: 6200,
};

export default function Demo() {
  const [phase, setPhase] = useState<DemoPhase>('intro');
  const [findingWay, setFindingWay] = useState(false);
  const [findLog, setFindLog] = useState<string[]>([]);
  const navigate = useNavigate();
  const { setCurrentJourney } = useJourneyStore();
  const { login } = useAppStore();

  const advance = async (next: DemoPhase) => {
    if (next === 'routing') {
      login({ id: 'demo-user', name: 'KMS', email: 'kms@demo.com', provider: 'email', role: 'user' });
    }
    if (next === 'feasible') {
      setCurrentJourney(DEMO_JOURNEY);
    }
    if (next === 'findway') {
      setFindingWay(true);
      const logs = ['Checking alternatives…', 'Checking accessibility constraints…', 'Checking transport connections…', 'Alternative found.'];
      for (let i = 0; i < logs.length; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setFindLog((l) => [...l, logs[i]]);
      }
      setFindingWay(false);
    }
    setPhase(next);
  };

  const recoveredJourney = {
    ...DEMO_JOURNEY,
    segments: DEMO_JOURNEY.segments.map((s) =>
      s.id === 'seg-elevator-gate4'
        ? { ...s, id: 'seg-ramp-gate5', label: 'Gate 5 Ramp', type: 'ramp' as const, accessibility: 'ACCESSIBLE' as const, warnings: [], confidence: 88, dataSource: 'RECENTLY_VERIFIED' as const }
        : s
    ),
    feasible: true, accessibilityQuality: 87, resilience: 79,
    warnings: ['Route updated: Gate 4 elevator replaced with Gate 5 ramp.'],
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      {/* Demo banner */}
      <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg mb-5 font-mono text-xs font-semibold tracking-wider">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        DEMO MODE — SIH Interactive Demonstration
      </div>

      <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-2">AccessChain Live Demo</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">Walk through a complete journey scenario: routing, outage detection, SPOF analysis, and recovery.</p>

      {/* Phase indicator */}
      <div className="flex gap-1.5 flex-wrap mb-8">
        {(['intro', 'profile', 'routing', 'feasible', 'outage', 'spof', 'findway', 'recovered'] as DemoPhase[]).map((p, i) => (
          <div key={p} className={`h-1.5 rounded-full flex-1 min-w-6 transition-all ${['intro', 'profile', 'routing', 'feasible', 'outage', 'spof', 'findway', 'recovered'].indexOf(phase) >= i ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
        ))}
      </div>

      {/* Phase content */}
      {phase === 'intro' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-display font-bold text-[var(--foreground)] mb-2">Scenario</h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">A wheelchair user (KMS, 70cm wheelchair width) wants to travel from Chennai Central Railway Station to MA Chidambaram Stadium. AccessChain will evaluate every connection for accessibility feasibility.</p>
          </Card>
          <Button fullWidth onClick={() => advance('profile')}>Begin demonstration →</Button>
        </div>
      )}

      {phase === 'profile' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-display font-bold text-[var(--foreground)] mb-3">User profile</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-[var(--muted-foreground)]">Name</span></div><div className="font-medium">KMS</div>
              <div><span className="text-[var(--muted-foreground)]">Mobility</span></div><div className="font-medium">Manual wheelchair</div>
              <div><span className="text-[var(--muted-foreground)]">Wheelchair width</span></div><div className="font-mono font-semibold text-[var(--primary)]">70 cm</div>
              <div><span className="text-[var(--muted-foreground)]">Step-free required</span></div><div className="font-medium text-[var(--feasible)]">Yes</div>
              <div><span className="text-[var(--muted-foreground)]">Max walk distance</span></div><div className="font-mono">400 m</div>
            </div>
          </Card>
          <Button fullWidth onClick={() => advance('routing')}>Run accessibility routing →</Button>
        </div>
      )}

      {phase === 'routing' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-display font-bold text-[var(--foreground)] mb-3">Routing pipeline</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Google Places', desc: 'Origin: Chennai Central · Destination: Stadium' },
                { label: 'AccessChain graph construction', desc: 'Nodes: 8 · Edges: 9' },
                { label: 'Constraint filtering', desc: 'Wheelchair: 70cm · Step-free: required · Walk: ≤400m' },
                { label: 'Multi-constraint pathfinding', desc: 'Algorithm: Dijkstra with accessibility weights' },
                { label: 'SPOF analysis', desc: 'Checking single points of failure in route graph' },
                { label: 'Metrics computation', desc: 'Quality: 94 · Resilience: 88' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--feasible)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{step.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Button fullWidth onClick={() => advance('feasible')}>View feasible route →</Button>
        </div>
      )}

      {phase === 'feasible' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-[var(--feasible-bg)]">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="feasible" size="md">FEASIBLE</Badge>
              <span className="text-sm text-[var(--muted-foreground)]">Accessibility Quality: 94 · Resilience: 88</span>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">Chennai Central → Stadium</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Walk → Gate 4 Elevator → Metro (CMRL) → Bus (MTC 23C) → Walk to Stadium</p>
          </div>
          <Card className="p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Route segments</p>
            <div className="flex flex-col gap-2">
              {DEMO_JOURNEY.segments.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <Badge variant="feasible">{s.accessibility}</Badge>
                  <span className="font-medium text-[var(--foreground)]">{s.label}</span>
                  <span className="text-[var(--muted-foreground)]">· {s.duration}min</span>
                </div>
              ))}
            </div>
          </Card>
          <Button fullWidth onClick={() => advance('outage')}>Simulate outage →</Button>
        </div>
      )}

      {phase === 'outage' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5 border-[var(--danger)] bg-[var(--danger-bg)]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="font-semibold text-[var(--danger)]">Infrastructure outage detected</p>
            </div>
            <p className="text-sm text-[var(--foreground)] font-medium">Gate 4 Elevator — OUT OF SERVICE</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Reported by: Station Staff · Confidence: High</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Journey status updated</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="danger">NOT FEASIBLE</Badge>
              <span className="text-xs text-[var(--muted-foreground)]">Gate 4 elevator is the only connection between Central Entrance and Metro Platform</span>
            </div>
          </Card>
          <Button fullWidth onClick={() => advance('spof')}>Analyse single point of failure →</Button>
        </div>
      )}

      {phase === 'spof' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-display font-bold text-[var(--foreground)] mb-3">Single Point of Failure Analysis</h2>
            <div className="font-mono text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] p-3 rounded leading-relaxed">
              <p className="text-[var(--foreground)] font-semibold mb-1">Route graph analysis</p>
              <p>Central Entrance → [Gate 4 Elevator] → Metro Platform</p>
              <p className="text-[var(--danger)] mt-1">↓ Gate 4 Elevator: OUTAGE (no alternative path)</p>
              <p className="text-[var(--warning)] mt-1">→ Single Point of Failure detected</p>
              <p className="mt-1">Graph redundancy: 0 (no ramp in graph for this edge)</p>
            </div>
          </Card>
          <Card className="p-4 border-[var(--danger)]">
            <Badge variant="danger" size="md">SINGLE POINT OF FAILURE</Badge>
            <p className="text-sm text-[var(--foreground)] mt-2">The Gate 4 Elevator is the only accessible route from the station concourse to the metro platform. No ramp exists as an alternative in this segment.</p>
          </Card>
          <Button fullWidth onClick={() => advance('findway')}>Find A Way →</Button>
        </div>
      )}

      {phase === 'findway' && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display font-bold text-[var(--foreground)] mb-1">Find A Way</h2>
          <div className="flex flex-col gap-2">
            {['Checking alternatives…', 'Checking accessibility constraints…', 'Checking transport connections…', 'Alternative found.'].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all ${findLog.includes(step) ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${findLog.includes(step) ? 'bg-[var(--feasible)]' : 'bg-[var(--border)]'}`}>
                  {findLog.includes(step) && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {step}
              </div>
            ))}
            {findingWay && <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />Processing…</div>}
          </div>
          {findLog.includes('Alternative found.') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-[var(--danger-bg)] rounded-lg">
                <span>✕</span>
                <div><p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase">Old</p><p className="text-sm text-[var(--danger)] font-medium">Gate 4 Elevator</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--feasible-bg)] rounded-lg">
                <span>✓</span>
                <div><p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase">New</p><p className="text-sm text-[var(--feasible)] font-medium">Gate 5 Ramp</p></div>
              </div>
              <Button fullWidth onClick={() => advance('recovered')}>View recovered route →</Button>
            </div>
          )}
        </div>
      )}

      {phase === 'recovered' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-[var(--feasible-bg)]">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="feasible" size="md">FEASIBLE — ROUTE RECOVERED</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div><p className="text-xs text-[var(--muted-foreground)]">Accessibility Quality</p><p className="font-display font-bold text-xl text-[var(--feasible)]">87<span className="text-xs font-normal text-[var(--muted-foreground)]">/100</span></p></div>
              <div><p className="text-xs text-[var(--muted-foreground)]">Journey Resilience</p><p className="font-display font-bold text-xl text-[var(--primary)]">79<span className="text-xs font-normal text-[var(--muted-foreground)]">/100</span></p></div>
            </div>
          </div>
          <Card className="p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Updated route segments</p>
            <div className="flex flex-col gap-2">
              {recoveredJourney.segments.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <Badge variant="feasible">{s.accessibility}</Badge>
                  <span className={`font-medium ${s.id === 'seg-ramp-gate5' ? 'text-[var(--feasible)]' : 'text-[var(--foreground)]'}`}>{s.label}</span>
                  {s.id === 'seg-ramp-gate5' && <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded font-semibold">ALTERNATIVE</span>}
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">What happened</p>
            <div className="text-xs font-mono text-[var(--muted-foreground)] leading-loose">
              <p>1. Gate 4 Elevator → OUTAGE detected</p>
              <p>2. Journey feasibility → NOT FEASIBLE</p>
              <p>3. SPOF analysis → critical dependency identified</p>
              <p>4. "Find A Way" triggered → graph re-evaluated</p>
              <p>5. Gate 5 Ramp → found in infrastructure graph</p>
              <p>6. Constraint check → width compatible, step-free ✓</p>
              <p>7. Journey → FEASIBLE restored</p>
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPhase('intro'); setFindLog([]); }}>Restart demo</Button>
            <Button fullWidth onClick={() => { setCurrentJourney(recoveredJourney); navigate('/journey/roadmap'); }}>View in app</Button>
          </div>
        </div>
      )}
    </div>
  );
}

