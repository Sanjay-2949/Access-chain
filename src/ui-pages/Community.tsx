import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCommunityStore } from '../stores/useCommunityStore';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Handshake, HeartHandshake, MapPin, CheckCircle, Coins, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { GooglePlacesAutocomplete } from '../components/map/GooglePlacesAutocomplete';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.floor(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-xs font-mono ml-1">{rating}</span>
    </span>
  );
}

function AssistantCard({ assistant, onRequest }: { assistant: ReturnType<typeof useCommunityStore.getState>['assistants'][0]; onRequest: (id: string) => void }) {
  return (
    <Card className="p-4">
      <div className="flex gap-3 mb-3">
        <img src={assistant.photo} alt={assistant.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-[var(--secondary)]" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[var(--foreground)] text-sm">{assistant.name}</p>
            <Badge variant={assistant.type === 'NGO' ? 'default' : assistant.type === 'Paid' ? 'warning' : 'feasible'}>
              {assistant.type === 'NGO' ? 'NGO' : assistant.type === 'Paid' ? 'Paid' : 'Volunteer'}
            </Badge>
            {assistant.verification === 'Verified' && (
              <span className="text-[10px] text-[var(--feasible)] flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={assistant.rating} />
            <span className="text-xs text-[var(--muted-foreground)]">{assistant.completedJourneys} journeys</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {assistant.experience.map((e) => <span key={e} className="text-[11px] bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2 py-0.5 rounded">{e}</span>)}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">{assistant.available ? '🟢 ' : '⚫ '}</span>
          <span className="text-xs text-[var(--foreground)]">{assistant.available ? `Available${assistant.availableAt ? ' at ' + assistant.availableAt : ' now'}` : 'Not available'}</span>
          <span className="text-xs text-[var(--muted-foreground)] ml-2">{assistant.distance} km away</span>
        </div>
        <Button size="sm" onClick={() => onRequest(assistant.id)} disabled={!assistant.available}>Request</Button>
      </div>
    </Card>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const [view, setView] = useState<'main' | 'need' | 'help' | 'search' | 'requested' | 'contribute'>('main');
  const [requestId, setRequestId] = useState<string | null>(null);
  const { filteredAssistants, filters, setFilters, requestAssistance } = useCommunityStore();
  const { savedJourneys } = useJourneyStore();
  const { accessPoints, badges } = useAppStore();
  const assistants = filteredAssistants();

  const handleRequest = (assistantId: string) => {
    const journey = savedJourneys[0];
    const id = requestAssistance({
      userId: 'current-user',
      assistantId,
      journeyId: journey?.id || 'demo-journey',
      journeyDescription: journey ? `${journey.origin.name} → ${journey.destination.name}` : 'Demo journey',
      assistanceType: 'Entire journey',
      assistantType: assistants.find((a) => a.id === assistantId)?.type || 'Volunteer',
    });
    setRequestId(id);
    setView('requested');
  };

  if (view === 'requested') {
    return (
      <div className="max-w-md mx-auto px-5 py-10 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[var(--feasible-bg)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--feasible)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)]">Assistance requested</h2>
        <p className="text-sm text-[var(--muted-foreground)] text-center">Your request has been sent. The assistant will accept or decline shortly.</p>
        <div className="w-full p-4 bg-[var(--secondary)] rounded-lg">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Request ID</p>
          <p className="font-mono text-sm">{requestId}</p>
        </div>
        <Button fullWidth onClick={() => navigate('/home')}>Back to home</Button>
      </div>
    );
  }

  if (view === 'search') {
    return (
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView('need')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="font-display text-xl font-bold text-[var(--foreground)]">Find an assistant</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(['Volunteer', 'NGO', 'Paid'] as const).map((type) => (
            <button key={type} onClick={() => setFilters({ type: filters.type.includes(type) ? filters.type.filter((t) => t !== type) : [...filters.type, type] })}
              className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filters.type.includes(type) ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>
              {type}
            </button>
          ))}
          <button onClick={() => setFilters({ verified: !filters.verified })}
            className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filters.verified ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>
            Verified only
          </button>
          <button onClick={() => setFilters({ availableNow: !filters.availableNow })}
            className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filters.availableNow ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>
            Available now
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {assistants.map((a) => (
            <AssistantCard key={a.id} assistant={a} onRequest={handleRequest} />
          ))}
          {assistants.length === 0 && (
            <p className="text-center text-[var(--muted-foreground)] py-8">No assistants match your filters.</p>
          )}
        </div>
      </div>
    );
  }

  if (view === 'need') {
    const journey = savedJourneys[0];
    const assistanceOptions = ['Entire journey', 'Specific transfer', 'Station navigation', 'Boarding assistance', 'Destination assistance', 'Luggage', 'Companion'];
    const [selectedType, setSelectedType] = useState('');
    return (
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView('main')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="font-display text-xl font-bold text-[var(--foreground)]">I need assistance</h1>
        </div>

        {journey && (
          <Card className="p-4 mb-5">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-semibold mb-2">Your journey</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--feasible)]" />
                <span className="font-medium">{journey.origin.name}</span>
              </div>
              {journey.segments.slice(0, 3).map((s) => (
                <div key={s.id} className="ml-1 pl-4 border-l border-[var(--border)] py-0.5">
                  <span className="text-xs text-[var(--muted-foreground)]">{s.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
                <span className="font-medium">{journey.destination.name}</span>
              </div>
            </div>
          </Card>
        )}

        <p className="text-sm font-medium text-[var(--foreground)] mb-3">Where do you need help?</p>
        <div className="flex flex-col gap-2 mb-5">
          {assistanceOptions.map((opt) => (
            <button key={opt} onClick={() => setSelectedType(opt)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded border text-sm text-left transition-all ${selectedType === opt ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--card)]'}`}>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedType === opt ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'}`}>
                {selectedType === opt && <div className="w-2 h-2 rounded-full bg-white" />}
              </span>
              {opt}
            </button>
          ))}
        </div>
        <Button fullWidth disabled={!selectedType} onClick={() => setView('search')}>Find assistants</Button>
      </div>
    );
  }

  if (view === 'help') {
    return (
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView('main')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="font-display text-xl font-bold text-[var(--foreground)]">I want to help</h1>
        </div>
        <VolunteerRegistrationForm onDone={() => setView('main')} />
      </div>
    );
  }

  if (view === 'contribute') {
    return (
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setView('main')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="font-display text-xl font-bold text-[var(--foreground)]">Contribute Data</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">Help the community by verifying infrastructure details and accessibility metrics.</p>
        <ContributeInfrastructureForm onDone={() => setView('main')} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8 space-y-6">
      {/* AccessPoints Rewards Wallet Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Your Community Rewards</div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {accessPoints} <span className="text-xs text-amber-400/80">PTS</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            {badges[badges.length - 1] || 'Community Scout'}
          </span>
          <div className="text-[10px] text-slate-500 mt-1">Tier Status</div>
        </div>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-1">Support the Community</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Connect with volunteers and assistants, or give back by helping others.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Card hoverable onClick={() => setView('need')} className="p-6">
          <div className="text-3xl mb-3">🤲</div>
          <h2 className="font-display font-bold text-[var(--foreground)] mb-1">I need assistance</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Find a verified volunteer, NGO, or paid assistant for your journey.</p>
        </Card>
        <Card hoverable onClick={() => setView('help')} className="p-6">
          <div className="text-3xl mb-3">🌟</div>
          <h2 className="font-display font-bold text-[var(--foreground)] mb-1">I want to help</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Register as a volunteer or paid assistant and help others travel confidently.</p>
        </Card>
        <Card hoverable onClick={() => setView('contribute')} className="p-6">
          <div className="text-3xl mb-3">📍</div>
          <h2 className="font-display font-bold text-[var(--foreground)] mb-1">Verify Infrastructure (+25 PTS)</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Report broken elevators, measure ramp inclines, and verify paths.</p>
        </Card>
      </div>
    </div>
  );
}

function ContributeInfrastructureForm({ onDone }: { onDone: () => void }) {
  const { addOutage } = useJourneyStore();
  const { awardPoints } = useAppStore();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    location: '',
    infraType: 'Elevator',
    status: 'Working',
    doorWidth: '',
    cabinDepth: '',
    incline: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isWorking = form.status === 'Working';
    addOutage({
      id: `outage-${Date.now()}`,
      infrastructure: `${form.infraType} (${form.notes || (isWorking ? 'Verified functional' : 'Barrier reported')})`,
      location: form.location || 'Chennai Station',
      category: form.infraType.toUpperCase() as any,
      status: isWorking ? 'Operational' : 'Outage',
      reportedBy: 'You (Community Contributor)',
      reportedAt: new Date().toISOString(),
      verifiedAt: isWorking ? new Date().toISOString() : undefined,
      confidence: 'Medium',
      confidenceScore: isWorking ? 20 : 75,
      upvotes: isWorking ? 0 : 1,
      downvotes: isWorking ? 1 : 0,
      verifiedByCrowd: true,
      affectedSegments: [],
    });
    awardPoints(25, `Contributed accessibility audit for ${form.location}`);
    setDone(true);
    setTimeout(onDone, 2000);
  };

  if (done) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">✅</div>
      <p className="font-semibold text-[var(--feasible)]">Data submitted successfully!</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-2">Earned +25 AccessPoints! Thank you for contributing to the accessibility map.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <GooglePlacesAutocomplete
          label="Station or Location"
          value={form.location}
          onChange={(val) => setForm({ ...form, location: val })}
          onSelectPlace={(place) => setForm({ ...form, location: place.name })}
          placeholder="e.g. Chennai Central"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Infrastructure Type</label>
        <div className="flex gap-2">
          {(['Elevator', 'Ramp', 'Pathway'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, infraType: t })}
              className={`px-3 py-1.5 rounded border text-sm transition-all ${form.infraType === t ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Status</label>
        <div className="flex gap-2">
          {(['Working', 'Broken'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, status: t })}
              className={`flex-1 px-3 py-2 rounded border text-sm transition-all ${form.status === t ? (t === 'Working' ? 'border-[var(--feasible)] bg-[var(--feasible-bg)] text-[var(--feasible)]' : 'border-[var(--danger)] bg-[var(--danger-bg)] text-[var(--danger)]') : 'border-[var(--border)] text-[var(--foreground)]'}`}>{t}</button>
          ))}
        </div>
      </div>

      {form.infraType === 'Elevator' && (
        <div className="grid grid-cols-2 gap-3 p-3 border border-[var(--border)] bg-[var(--secondary)] rounded-lg">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Door Width (cm)</label>
            <input type="number" value={form.doorWidth} onChange={(e) => setForm({ ...form, doorWidth: e.target.value })}
              placeholder="e.g. 90" className="w-full px-3 py-1.5 border border-[var(--border)] rounded text-sm bg-[var(--card)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Cabin Depth (cm)</label>
            <input type="number" value={form.cabinDepth} onChange={(e) => setForm({ ...form, cabinDepth: e.target.value })}
              placeholder="e.g. 140" className="w-full px-3 py-1.5 border border-[var(--border)] rounded text-sm bg-[var(--card)]" />
          </div>
        </div>
      )}

      {form.infraType === 'Ramp' && (
        <div className="p-3 border border-[var(--border)] bg-[var(--secondary)] rounded-lg">
          <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1">Estimated Incline (Degrees or Ratio)</label>
          <input type="text" value={form.incline} onChange={(e) => setForm({ ...form, incline: e.target.value })}
            placeholder="e.g. 1:12 or 5 deg" className="w-full px-3 py-1.5 border border-[var(--border)] rounded text-sm bg-[var(--card)]" />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Additional Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any specific obstacles or context?" rows={2}
          className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>

      <Button type="submit" fullWidth className="mt-2">Submit Report</Button>
    </form>
  );
}

function VolunteerRegistrationForm({ onDone }: { onDone: () => void }) {
  const { registerVolunteer } = useCommunityStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', gender: '', type: 'Volunteer' as 'Volunteer' | 'Paid', languages: [] as string[], experience: [] as string[] });
  const [done, setDone] = useState(false);

  const langs = ['Tamil', 'English', 'Hindi', 'Kannada', 'Telugu'];
  const expOptions = ['Wheelchair assistance', 'Elderly assistance', 'Vision assistance', 'Cognitive support', 'Public transport', 'Navigation'];

  const toggleArr = (key: 'languages' | 'experience', val: string) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerVolunteer({ ...form, availability: 'Flexible', serviceArea: form.location, assistanceCategories: form.experience });
    setDone(true);
    setTimeout(onDone, 2000);
  };

  if (done) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">✓</div>
      <p className="font-semibold text-[var(--feasible)]">Application submitted for verification!</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {[{ key: 'name', label: 'Full name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' }, { key: 'location', label: 'Location / city', type: 'text' }].map(({ key, label, type }) => (
        <div key={key}>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-1">{label}</label>
          <input type={type} value={(form as unknown as Record<string, string>)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" required />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Service type</label>
        <div className="flex gap-2">
          {(['Volunteer', 'Paid'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`px-3 py-1.5 rounded border text-sm transition-all ${form.type === t ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Languages</label>
        <div className="flex flex-wrap gap-1.5">
          {langs.map((l) => (
            <button key={l} type="button" onClick={() => toggleArr('languages', l)}
              className={`px-2.5 py-1 rounded text-xs border transition-all ${form.languages.includes(l) ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)]'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--foreground)] block mb-1">Experience</label>
        <div className="flex flex-wrap gap-1.5">
          {expOptions.map((e) => (
            <button key={e} type="button" onClick={() => toggleArr('experience', e)}
              className={`px-2.5 py-1 rounded text-xs border transition-all ${form.experience.includes(e) ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)]'}`}>{e}</button>
          ))}
        </div>
      </div>
      <Button type="submit" fullWidth className="mt-2">Submit for verification</Button>
    </form>
  );
}

