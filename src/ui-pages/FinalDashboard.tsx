import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useState } from 'react';

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export default function FinalDashboard() {
  const navigate = useNavigate();
  const { currentJourney, saveCurrentJourney } = useJourneyStore();
  const { accessibilityProfile } = useAppStore();
  const [saved, setSaved] = useState(false);

  if (!currentJourney) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[var(--muted-foreground)] mb-4">No journey to display.</p>
          <Button onClick={() => navigate('/journey/new')}>Plan a journey</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    saveCurrentJourney();
    setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
        <h1 className="font-display text-xl font-bold text-[var(--foreground)]">Journey Summary</h1>
      </div>

      {/* Status card */}
      <div className={`rounded-xl p-5 ${currentJourney.feasible ? 'bg-[var(--feasible-bg)]' : 'bg-[var(--danger-bg)]'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentJourney.feasible ? 'bg-[var(--feasible)]' : 'bg-[var(--danger)]'}`}>
            {currentJourney.feasible ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </div>
          <div>
            <p className={`font-display font-bold text-lg ${currentJourney.feasible ? 'text-[var(--feasible)]' : 'text-[var(--danger)]'}`}>
              {currentJourney.feasible ? 'FEASIBLE' : 'NOT FEASIBLE'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">{currentJourney.origin.name} → {currentJourney.destination.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Accessibility Quality</p>
            <p className="font-display font-bold text-2xl text-[var(--foreground)]">{currentJourney.accessibilityQuality}<span className="text-sm font-normal text-[var(--muted-foreground)]">/100</span></p>
            <MetricBar value={currentJourney.accessibilityQuality} color="var(--feasible)" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">Journey Resilience</p>
            <p className="font-display font-bold text-2xl text-[var(--foreground)]">{currentJourney.resilience}<span className="text-sm font-normal text-[var(--muted-foreground)]">/100</span></p>
            <MetricBar value={currentJourney.resilience} color="var(--primary)" />
          </div>
        </div>
      </div>

      {/* Accessibility profile */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Accessibility profile used</p>
        <div className="flex flex-wrap gap-2">
          {/* Cognitive */}
          {accessibilityProfile.cognitive?.simplifiedInstructions && <Badge variant="default">🧠 Simplified Visual Breadcrumbs</Badge>}
          {accessibilityProfile.cognitive?.fewerTransfers && <Badge variant="default">🧠 Direct Corridor (0 Transfers)</Badge>}
          {accessibilityProfile.cognitive?.simplifiedInstructions && <Badge variant="default">🧠 Quiet Zone (&lt;40dB)</Badge>}

          {/* Vision */}
          {accessibilityProfile.vision?.visualAssistance && <Badge variant="default">👁️ Tactile Paving (TGSI)</Badge>}
          {accessibilityProfile.vision?.visualAssistance && <Badge variant="default">👁️ Auditory Beacon & Voice Alerts</Badge>}
          {accessibilityProfile.vision?.highContrast && <Badge variant="default">👁️ High Contrast Signage</Badge>}

          {/* Hearing */}
          {accessibilityProfile.hearing?.visualNotifications && <Badge variant="default">👂 Interior & Platform LED</Badge>}
          {accessibilityProfile.hearing?.visualNotifications && <Badge variant="default">👂 Hearing Loop (T-Coil)</Badge>}
          {accessibilityProfile.hearing?.visualNotifications && <Badge variant="default">👂 Vibration Sync Alerts</Badge>}

          {/* Speech */}
          {accessibilityProfile.speech?.textFirst && <Badge variant="default">💬 Contactless QR Entry</Badge>}
          {accessibilityProfile.speech?.textFirst && <Badge variant="default">💬 Zero Verbal Interaction</Badge>}
          {accessibilityProfile.speech?.textFirst && <Badge variant="default">💬 Text-First Support</Badge>}

          {/* Mobility */}
          {accessibilityProfile.mobility?.wheelchair && <Badge variant="default">♿ Manual wheelchair</Badge>}
          {accessibilityProfile.mobility?.wheelchair && <Badge variant="default">♿ Width: {accessibilityProfile.mobility.wheelchairWidth}cm</Badge>}
          {accessibilityProfile.mobility?.limitedWalking && <Badge variant="default">♿ Step-free required</Badge>}
          {accessibilityProfile.mobility?.limitedWalking && <Badge variant="default">♿ Max walk: {accessibilityProfile.mobility.maxWalkingDistance}m</Badge>}
        </div>
      </Card>

      {/* Journey roadmap summary */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Route</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--feasible)]" />
            <span className="font-medium">{currentJourney.origin.name}</span>
          </div>
          {currentJourney.segments.map((seg) => (
            <div key={seg.id} className="ml-1 pl-4 border-l border-[var(--border)] flex items-center gap-2 py-1">
              <span className="text-xs text-[var(--muted-foreground)]">{seg.label}</span>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">·</span>
              <span className="text-xs font-mono">{seg.duration}min</span>
              <Badge variant={seg.accessibility === 'ACCESSIBLE' ? 'feasible' : seg.accessibility === 'UNKNOWN' ? 'unknown' : 'danger'}>{seg.accessibility}</Badge>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
            <span className="font-medium">{currentJourney.destination.name}</span>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      {currentJourney.warnings.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Warnings</p>
          {currentJourney.warnings.map((w, i) => (
            <p key={i} className="text-sm text-[var(--warning)] flex items-start gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {w}
            </p>
          ))}
        </Card>
      )}

      {/* Alternatives */}
      {currentJourney.alternatives.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Alternative routes</p>
          {currentJourney.alternatives.map((alt) => (
            <div key={alt.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{alt.description}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Quality {alt.accessibilityQuality} · Resilience {alt.resilience}</p>
              </div>
              <Badge variant={alt.feasible ? 'feasible' : 'danger'}>{alt.feasible ? 'Feasible' : 'Not feasible'}</Badge>
            </div>
          ))}
        </Card>
      )}

      {/* Explainable Decision Audit Card (AccessDecision) */}
      <Card className="p-4 border-l-4 border-l-sky-500 bg-slate-900/80">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Explainable AccessDecision Record
          </p>
          <span className="text-[10px] font-mono bg-slate-950 text-sky-400 px-2 py-0.5 rounded border border-slate-800 font-bold">
            policy: a11y-v2.1
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-emerald-400">Why this route was selected:</span>
            <ul className="mt-1 list-disc list-inside text-slate-300 space-y-1">
              <li>Verified step-free origin connection via 1:12 concrete ramp (laser-audited)</li>
              <li>Electric low-floor transit with hydraulic kneeling mechanism confirmed</li>
              <li>Subway ground underpass avoids 28-step footbridge barrier</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="font-semibold text-rose-400">Rejected Alternative Itineraries:</span>
            <div className="mt-1.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-200">
              <span className="font-bold">Candidate Route A (Bus 51 Express):</span> Rejected because Guindy Station transfer requires climbing a 28-step pedestrian overpass with no functional elevator.
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/journey/active')}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-950/40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Start Live GPS Navigation
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => navigate('/journey/roadmap')}>View roadmap</Button>
          <Button fullWidth disabled={saved} onClick={handleSave}>
            {saved ? '✓ Journey saved' : 'Save journey'}
          </Button>
        </div>
      </div>
    </div>
  );
}
