import { useState } from 'react';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export default function OutageAlerts() {
  const { outages } = useJourneyStore();
  const { notifications, markNotificationRead } = useAppStore();
  const unread = notifications.filter((n) => !n.read && n.type === 'outage');

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h1 className="font-display text-xl font-bold text-[var(--foreground)] mb-5">Outage Alerts</h1>

      {/* Unread notifications */}
      {unread.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Alerts for your saved journeys</p>
          <div className="flex flex-col gap-2">
            {unread.map((n) => (
              <Card key={n.id} className="p-4 border-l-2 border-l-[var(--danger)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{n.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.message}</p>
                  </div>
                  <button onClick={() => markNotificationRead(n.id)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All outages */}
      <div>
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Infrastructure status</p>
        <div className="flex flex-col gap-3">
          {outages.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--foreground)]">{o.infrastructure}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{o.location}</p>
                </div>
                <Badge variant={o.status === 'Operational' ? 'feasible' : o.status === 'Outage' ? 'danger' : 'unknown'}>
                  {o.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div><span className="text-[var(--muted-foreground)]">Reported by: </span><span>{o.reportedBy}</span></div>
                <div><span className="text-[var(--muted-foreground)]">Confidence: </span><span className={o.confidence === 'High' ? 'text-[var(--feasible)]' : o.confidence === 'Low' ? 'text-[var(--danger)]' : ''}>{o.confidence}</span></div>
                <div><span className="text-[var(--muted-foreground)]">Reported: </span><span>{new Date(o.reportedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
                {o.verifiedAt && <div><span className="text-[var(--muted-foreground)]">Verified: </span><span>{new Date(o.verifiedAt).toLocaleDateString()}</span></div>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Report an issue */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Report infrastructure issue</p>
        <p className="text-sm text-[var(--muted-foreground)]">Help others by reporting broken elevators, blocked ramps, or inaccessible areas.</p>
        <ReportForm />
      </div>
    </div>
  );
}

function ReportForm() {
  const { addOutage } = useJourneyStore();
  const [form, setForm] = useState({ infrastructure: '', location: '', reportedBy: 'User report' });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOutage({ id: Date.now().toString(), ...form, status: 'Outage', reportedAt: new Date().toISOString(), confidence: 'Low', affectedSegments: [] });
    setDone(true);
    setForm({ infrastructure: '', location: '', reportedBy: 'User report' });
  };

  if (done) return <p className="text-sm text-[var(--feasible)] mt-3">✓ Report submitted. Thank you for helping the community.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-3">
      <input value={form.infrastructure} onChange={(e) => setForm((f) => ({ ...f, infrastructure: e.target.value }))} placeholder="What is the issue? (e.g. Elevator at Gate 3)"
        className="px-3 py-2 border border-[var(--border)] rounded text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" required />
      <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location (e.g. Chennai Central)"
        className="px-3 py-2 border border-[var(--border)] rounded text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" required />
      <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded text-sm font-medium hover:bg-[#0c9490] transition-colors">Submit report</button>
    </form>
  );
}

