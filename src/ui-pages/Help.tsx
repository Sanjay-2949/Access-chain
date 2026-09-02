import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/Card';

const FAQ_CATEGORIES: Record<string, { q: string; a: string; navigate?: string }[]> = {
  'Getting Started': [
    { q: 'What is AccessChain?', a: 'AccessChain is an accessibility-continuity intelligence platform. It determines whether your entire journey is feasible given your specific accessibility requirements — not just whether a route exists, but whether every connection, corridor, elevator, and boarding point works for you.' },
    { q: 'How do I create a journey?', a: 'From the Home screen, tap "Start Journey →". You will be guided through a step-by-step wizard: group size, accessibility requirements, mobility configuration, and then route search.' },
  ],
  'Accessibility': [
    { q: 'How does accessible routing work?', a: 'AccessChain builds a graph of every infrastructure node (elevators, ramps, corridors, platforms) and evaluates each connection against your profile. A route is only marked Feasible when every critical link is compatible with your requirements.' },
    { q: 'What does UNKNOWN mean?', a: 'UNKNOWN means AccessChain has no verified operating-status information for that infrastructure. UNKNOWN is never interpreted as accessible or inaccessible. The system will warn you and suggest verified alternatives where possible.' },
    { q: 'How is wheelchair width used?', a: 'AccessChain compares your wheelchair width against the measured width of corridors, passages, and boarding areas. If a passage is narrower than your wheelchair, that route segment is marked infeasible.' },
  ],
  'Journeys': [
    { q: 'What is Accessibility Quality?', a: 'Accessibility Quality (0–100) measures how well the route serves your accessibility requirements. 100 means every connection is verified accessible. Lower scores reflect UNKNOWN states or low-confidence data.' },
    { q: 'What is Journey Resilience?', a: 'Journey Resilience (0–100) measures how dependent your route is on a single infrastructure element. Low resilience means if one element fails, the journey becomes infeasible. Higher resilience means alternatives exist.' },
    { q: 'What is a Single Point of Failure (SPOF)?', a: 'A SPOF is a route segment where there is no alternative if it becomes unavailable — for example, if an elevator is the only way between two platforms and no ramp exists.' },
  ],
  'Community Assistance': [
    { q: 'How do I find a volunteer?', a: 'From the Home screen, navigate to "Support the Community" → "I need assistance". Choose your journey and the type of help you need, then browse verified assistants filtered by type, rating, and experience.' },
    { q: 'How do I register as a volunteer?', a: 'From "Support the Community" → "I want to help". Complete the registration form with your languages, experience, and availability. Your profile will be submitted for verification before becoming visible.' },
    { q: 'How are assistants verified?', a: 'Verification states are: Pending, Verified, Rejected, or Suspended. Only Verified assistants are shown with the verification badge. Background checks are only indicated when genuinely performed.' },
  ],
  'Safety': [
    { q: 'How do I report an issue?', a: 'During a journey, use the "Report issue" option. You can report broken elevators, blocked ramps, inaccessible transport, or inappropriate behaviour. Infrastructure reports are validated before affecting routing data.' },
  ],
  'Booking': [
    { q: 'How does booking work?', a: 'Where provider APIs are configured, AccessChain shows available options with accessibility status. For providers without direct booking APIs, AccessChain provides a deep link to the provider app. Booking is never fabricated.' },
    { q: 'Why was I redirected externally?', a: 'When a provider does not provide a direct booking API or requires additional authorization, AccessChain redirects you to the provider\'s own app or website to complete booking.' },
  ],
  'Account': [
    { q: 'How do I change my wheelchair width?', a: 'Open Settings → Accessibility → Mobility profile → Wheelchair width slider. Changes apply immediately to future route calculations.', navigate: '/settings?tab=accessibility' },
  ],
};

export default function Help() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>('Getting Started');
  const [openQ, setOpenQ] = useState<string | null>(null);

  const allFaqs = Object.entries(FAQ_CATEGORIES).flatMap(([cat, qs]) => qs.map((q) => ({ ...q, cat })));
  const results = search.length > 1 ? allFaqs.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h1 className="font-display text-xl font-bold text-[var(--foreground)] mb-2">Help & Support</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-5">Find answers about using AccessChain.</p>

      {/* Search */}
      <div className="relative mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search how to use AccessChain…"
          className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>

      {/* Search results */}
      {results && (
        <div className="mb-6">
          {results.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No results for "{search}".</p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((item) => (
                <Card key={item.q} className="p-4" hoverable onClick={() => setOpenQ(openQ === item.q ? null : item.q)}>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.q}</p>
                  {openQ === item.q && (
                    <div className="mt-2">
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.a}</p>
                      {item.navigate && (
                        <button onClick={() => navigate(item.navigate!)} className="text-sm text-[var(--primary)] mt-2 hover:underline flex items-center gap-1">
                          Take me there →
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ categories */}
      {!results && (
        <div className="flex flex-col gap-3">
          {Object.entries(FAQ_CATEGORIES).map(([cat, questions]) => (
            <div key={cat}>
              <button onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] hover:text-[var(--primary)] transition-colors">
                {cat}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${openCategory === cat ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openCategory === cat && (
                <div className="flex flex-col gap-1 pt-2 pb-2">
                  {questions.map((item) => (
                    <div key={item.q} className="border border-[var(--border)] rounded-lg overflow-hidden">
                      <button onClick={() => setOpenQ(openQ === item.q ? null : item.q)}
                        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors text-left">
                        {item.q}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 mt-0.5 transition-transform ${openQ === item.q ? 'rotate-180' : ''}`}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      {openQ === item.q && (
                        <div className="px-4 pb-4 border-t border-[var(--border)]">
                          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-3">{item.a}</p>
                          {(item as typeof item & { navigate?: string }).navigate && (
                            <button onClick={() => navigate((item as typeof item & { navigate?: string }).navigate!)}
                              className="text-sm text-[var(--primary)] mt-2 hover:underline flex items-center gap-1">
                              Take me there →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
