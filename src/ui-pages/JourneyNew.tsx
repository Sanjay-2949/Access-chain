import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Step 1: Smart Journey (people count)
function StepSmartJourney() {
  const { wizard, updateWizard, setWizardStep } = useJourneyStore();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">Smart Journey</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Tell us about your group so we can plan the right route.</p>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Number of people travelling</label>
          <div className="flex items-center gap-4">
            <button onClick={() => updateWizard({ totalPeople: Math.max(1, wizard.totalPeople - 1), accessibilityCount: Math.min(wizard.accessibilityCount, Math.max(1, wizard.totalPeople - 1)) })}
              className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors font-bold text-lg">−</button>
            <span className="text-2xl font-bold font-display w-8 text-center">{wizard.totalPeople}</span>
            <button onClick={() => updateWizard({ totalPeople: wizard.totalPeople + 1 })}
              className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors font-bold text-lg">+</button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Number requiring accessibility support</label>
          <div className="flex items-center gap-4">
            <button onClick={() => updateWizard({ accessibilityCount: Math.max(0, wizard.accessibilityCount - 1) })}
              className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors font-bold text-lg">−</button>
            <span className="text-2xl font-bold font-display w-8 text-center">{wizard.accessibilityCount}</span>
            <button onClick={() => updateWizard({ accessibilityCount: Math.min(wizard.totalPeople, wizard.accessibilityCount + 1) })}
              className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors font-bold text-lg">+</button>
          </div>
          {wizard.accessibilityCount > wizard.totalPeople && <p className="text-xs text-[var(--danger)] mt-1">Cannot exceed total people</p>}
        </div>
      </div>
      <Button fullWidth onClick={() => setWizardStep(2)}>Continue</Button>
    </div>
  );
}

// Step 2: Type of accessibility
function StepAccessibilityType() {
  const { wizard, updateWizard, setWizardStep } = useJourneyStore();
  const { updateProfile } = useAppStore();
  const types = ['Mobility', 'Vision', 'Hearing', 'Cognitive', 'Speech', 'I prefer not to say'];
  const toggle = (t: string) => {
    if (t === 'I prefer not to say') {
      updateWizard({ accessibilityTypes: ['I prefer not to say'] });
      updateProfile({
        mobility: { wheelchair: false, wheelchairWidth: 0, walkingAid: false, limitedWalking: false, maxWalkingDistance: 2000 },
        vision: { visualAssistance: false, highContrast: false },
        hearing: { visualNotifications: false },
        cognitive: { simplifiedInstructions: false, fewerTransfers: false },
        speech: { textFirst: false },
      });
      return;
    }
    const current = wizard.accessibilityTypes.filter((x) => x !== 'I prefer not to say');
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t];
    updateWizard({ accessibilityTypes: next });

    const hasMobility = next.includes('Mobility');
    const hasVision = next.includes('Vision');
    const hasHearing = next.includes('Hearing');
    const hasCognitive = next.includes('Cognitive');
    const hasSpeech = next.includes('Speech');

    updateProfile({
      mobility: {
        wheelchair: hasMobility,
        wheelchairWidth: hasMobility ? (wizard.mobilityConfig?.wheelchairWidth || 70) : 0,
        walkingAid: hasMobility ? !!wizard.mobilityConfig?.walkingAid : false,
        limitedWalking: hasMobility ? !!wizard.mobilityConfig?.limitedWalking : false,
        maxWalkingDistance: hasMobility ? (wizard.mobilityConfig?.maxWalkingDistance || 500) : 2000,
      },
      vision: { visualAssistance: hasVision, highContrast: hasVision },
      hearing: { visualNotifications: hasHearing },
      cognitive: { simplifiedInstructions: hasCognitive, fewerTransfers: hasCognitive },
      speech: { textFirst: hasSpeech },
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">Accessibility requirements</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Select all that apply. This helps us find the right route.</p>
      </div>
      <div className="flex flex-col gap-2">
        {types.map((type) => {
          const selected = wizard.accessibilityTypes.includes(type);
          return (
            <button key={type} onClick={() => toggle(type)}
              className={`flex items-center gap-3 px-4 py-3 rounded border text-sm text-left transition-all ${selected ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)]' : 'border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--foreground)]'}`}>
              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'}`}>
                {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {type}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
        <Button fullWidth onClick={() => setWizardStep(wizard.accessibilityTypes.includes('Mobility') ? 3 : 4)}>Continue</Button>
      </div>
    </div>
  );
}

// Step 3: Mobility configuration
function StepMobility() {
  const { wizard, updateWizard, setWizardStep } = useJourneyStore();
  const { updateProfile } = useAppStore();
  const mc = wizard.mobilityConfig;
  const update = (k: string, v: boolean | number) => {
    const nextMc = { ...mc, [k]: v };
    updateWizard({ mobilityConfig: nextMc });
    updateProfile({
      mobility: {
        wheelchair: !!nextMc.wheelchair,
        wheelchairWidth: nextMc.wheelchair ? (nextMc.wheelchairWidth || 70) : 0,
        walkingAid: !!nextMc.walkingAid,
        limitedWalking: !!nextMc.limitedWalking,
        maxWalkingDistance: nextMc.maxWalkingDistance || 500,
      },
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">Mobility configuration</h2>
        <p className="text-sm text-[var(--muted-foreground)]">These settings directly affect which routes we suggest.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { key: 'wheelchair', label: 'Wheelchair user' },
          { key: 'walkingAid', label: 'Walking aid' },
          { key: 'limitedWalking', label: 'Limited walking distance' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={mc[key as keyof typeof mc] as boolean} onChange={(e) => update(key, e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)]">{label}</span>
          </label>
        ))}

        {mc.wheelchair && (
          <div className="mt-1 p-4 bg-[var(--secondary)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Wheelchair width
                <span className="ml-1 cursor-help text-[var(--muted-foreground)]" title="AccessChain uses this measurement when evaluating passages and boarding areas.">?</span>
              </label>
              <span className="font-mono text-sm font-semibold text-[var(--primary)]">{mc.wheelchairWidth} cm</span>
            </div>
            <input type="range" min={50} max={100} value={mc.wheelchairWidth} onChange={(e) => update('wheelchairWidth', Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-[11px] text-[var(--muted-foreground)] mt-1"><span>50 cm</span><span>100 cm</span></div>
          </div>
        )}

        {mc.limitedWalking && (
          <div className="p-4 bg-[var(--secondary)] rounded-lg">
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Maximum walking distance</label>
            <div className="flex items-center gap-3">
              <input type="number" min={50} max={2000} step={50} value={mc.maxWalkingDistance}
                onChange={(e) => update('maxWalkingDistance', Number(e.target.value))}
                className="w-24 px-2 py-1 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--card)]" />
              <span className="text-sm text-[var(--muted-foreground)]">metres</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setWizardStep(2)}>Back</Button>
        <Button fullWidth onClick={() => setWizardStep(4)}>Continue</Button>
      </div>
    </div>
  );
}

// Step 4: Select journey type
function StepSelectJourney() {
  const { wizard, updateWizard, setWizardStep } = useJourneyStore();
  const navigate = useNavigate();
  const options = [
    { id: 'fastTravel', icon: '⚡', label: 'Fast Travel', desc: 'Plan an accessible route now' },
    { id: 'tourism', icon: '🗺️', label: 'Tourism', desc: 'Plan ahead for a future date' },
    { id: 'community', icon: '🤝', label: 'Support the Community', desc: 'Request or offer assistance' },
    { id: 'help', icon: '❓', label: 'Help', desc: 'Learn how to use AccessChain' },
  ];
  const select = (id: string) => {
    updateWizard({ journeyType: id as typeof wizard.journeyType });
    if (id === 'fastTravel') { setWizardStep(5); }
    else if (id === 'community') navigate('/community');
    else if (id === 'help') navigate('/help');
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">What are you planning?</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Choose the type of journey or assistance you need.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <Card key={opt.id} hoverable onClick={() => select(opt.id)} className="p-4">
            <div className="text-2xl mb-2">{opt.icon}</div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{opt.label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{opt.desc}</p>
          </Card>
        ))}
      </div>
      {wizard.accessibilityTypes.includes('tourism') && wizard.journeyType === 'tourism' && (
        <div>
          <label className="text-sm font-medium block mb-1">Travel date</label>
          <input type="date" className="px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--card)]"
            onChange={(e) => updateWizard({ tourismDate: e.target.value })} />
        </div>
      )}
      <Button variant="outline" onClick={() => setWizardStep(3)}>Back</Button>
    </div>
  );
}

import { GooglePlacesAutocomplete, PlaceResult } from '../components/map/GooglePlacesAutocomplete';

// Step 5: Fast Travel (origin/destination)
function StepFastTravel() {
  const { wizard, updateWizard, setWizardStep, setCurrentJourney, setRouting } = useJourneyStore();
  const { accessibilityProfile } = useAppStore();
  const navigate = useNavigate();
  const [originQuery, setOriginQuery] = useState(wizard.origin?.name || '');
  const [destQuery, setDestQuery] = useState(wizard.destination?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSelectOrigin = (place: PlaceResult) => {
    updateWizard({
      origin: {
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
      },
    });
    setOriginQuery(place.name);
  };

  const handleSelectDest = (place: PlaceResult) => {
    updateWizard({
      destination: {
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
      },
    });
    setDestQuery(place.name);
  };

  const swapLocations = () => {
    const tempO = wizard.origin || { placeId: 'org-custom', name: originQuery || 'Origin', address: originQuery, lat: 12.96, lng: 80.2 };
    const tempD = wizard.destination || { placeId: 'dest-custom', name: destQuery || 'Destination', address: destQuery, lat: 13.08, lng: 80.27 };
    updateWizard({ origin: tempD, destination: tempO });
    const prevO = originQuery;
    setOriginQuery(destQuery);
    setDestQuery(prevO);
  };

  const findRoute = async () => {
    const originPlace = wizard.origin || (originQuery.trim() ? {
      placeId: `org-${Date.now()}`,
      name: originQuery.trim(),
      address: `${originQuery.trim()}, Chennai, Tamil Nadu`,
      lat: 12.9602,
      lng: 80.2015,
    } : null);

    const destPlace = wizard.destination || (destQuery.trim() ? {
      placeId: `dest-${Date.now()}`,
      name: destQuery.trim(),
      address: `${destQuery.trim()}, Chennai, Tamil Nadu`,
      lat: 13.0827,
      lng: 80.2707,
    } : null);

    if (!originPlace || !destPlace) return;

    updateWizard({ origin: originPlace, destination: destPlace });
    setLoading(true);
    setRouting(true);
    const { computeRoute } = await import('../lib/routing/accessibilityEngine');
    const journey = await computeRoute(originPlace, destPlace, accessibilityProfile);
    setCurrentJourney(journey);
    setRouting(false);
    setLoading(false);
    navigate('/journey/map');
  };

  const isFormValid = (originQuery.trim().length > 0 || !!wizard.origin) && (destQuery.trim().length > 0 || !!wizard.destination);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--foreground)] mb-1">Fast Travel</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Enter your origin and destination using live Google Maps search.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Origin Search with GPS Detection */}
        <GooglePlacesAutocomplete
          label="From (Origin)"
          value={originQuery}
          onChange={setOriginQuery}
          onSelectPlace={handleSelectOrigin}
          placeholder="Search starting location (e.g. Jerusalem College, My Current Location)..."
          showCurrentLocationButton={true}
        />

        <div className="flex justify-center -my-1">
          <button
            onClick={swapLocations}
            type="button"
            className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--card)] flex items-center justify-center hover:bg-[var(--secondary)] transition-all shadow-sm hover:scale-110"
            title="Swap Origin & Destination"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          </button>
        </div>

        {/* Destination Search */}
        <GooglePlacesAutocomplete
          label="To (Destination)"
          value={destQuery}
          onChange={setDestQuery}
          onSelectPlace={handleSelectDest}
          placeholder="Search destination venue (e.g. Sree Balaji Dental Hospital, Chennai Central)..."
          showCurrentLocationButton={false}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setWizardStep(4)}>Back</Button>
        <Button fullWidth disabled={!isFormValid || loading} onClick={findRoute}>
          {loading ? 'Finding Accessible Route…' : 'Find Accessible Route'}
        </Button>
      </div>
    </div>
  );
}

const STEPS = [StepSmartJourney, StepAccessibilityType, StepMobility, StepSelectJourney, StepFastTravel];
const STEP_LABELS = ['Group', 'Accessibility', 'Mobility', 'Journey type', 'Route'];

export default function JourneyNew() {
  const { wizard } = useJourneyStore();
  const navigate = useNavigate();
  const step = wizard.step;
  const StepComponent = STEPS[step - 1];

  return (
    <div className="max-w-xl mx-auto px-5 py-7">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => navigate('/home')} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mr-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${i + 1 === step ? 'bg-[var(--primary)] text-white' : i + 1 < step ? 'bg-[var(--feasible)] text-white' : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px w-4 ${i + 1 < step ? 'bg-[var(--feasible)]' : 'bg-[var(--border)]'}`}/>}
          </div>
        ))}
      </div>
      <StepComponent />
    </div>
  );
}
