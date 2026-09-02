import { useNavigate } from 'react-router';
import { useAppStore } from '../stores/useAppStore';
import { useJourneyStore } from '../stores/useJourneyStore';
import { useTranslation } from '../lib/i18n';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

function MetricRing({ value, label, color }: { value: number; label: string; color: string }) {
 const r = 26, c = 2 * Math.PI * r;
 const dash = (value / 100) * c;
 return (
 <div className="flex flex-col items-center gap-1">
 <div className="relative w-16 h-16">
 <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
 <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="5"/>
 <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
 strokeDasharray={`${dash} ${c}`} strokeLinecap="round"/>
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="font-mono text-sm font-semibold text-[var(--foreground)]">{value}</span>
 </div>
 </div>
 <span className="text-[11px] text-[var(--muted-foreground)] text-center leading-tight">{label}</span>
 </div>
 );
}

export default function Home() {
 const navigate = useNavigate();
 const { user, language, accessibilityProfile, notifications, markNotificationRead } = useAppStore();
 const { savedJourneys, resetWizard } = useJourneyStore();
 const t = useTranslation(language);
 const unread = notifications.filter((n) => !n.read);
 const recent = savedJourneys.slice(0, 3);

 const startJourney = () => {
 resetWizard();
 navigate('/journey/new');
 };

 return (
 <div className="max-w-3xl mx-auto px-5 py-7 flex flex-col gap-6">
 {/* Greeting */}
 <div>
 <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-0.5">
 {t('home.greeting')} {user?.name?.split(' ')[0] || 'KMS'}
 </h1>
 <p className="text-[var(--muted-foreground)] text-sm">{t('home.subtitle')}</p>
 </div>

 {/* Unread notifications */}
 {unread.length > 0 && (
 <div className="flex flex-col gap-2">
 {unread.map((n) => (
 <Card key={n.id} className="p-3 border-l-2 border-l-[var(--warning)]">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="text-sm font-medium text-[var(--foreground)]">{n.title}</p>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.message}</p>
 </div>
 <button onClick={() => markNotificationRead(n.id)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
 </button>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Hero CTA */}
 <div className="rounded-xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1823 0%, #0EA5A0 100%)' }}>
 <div className="absolute right-0 top-0 w-48 h-48 opacity-10">
 <svg viewBox="0 0 200 200" className="w-full h-full">
 <circle cx="100" cy="100" r="80" fill="white"/>
 <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="2"/>
 <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="2"/>
 </svg>
 </div>
 <h2 className="font-display text-xl font-bold mb-1">{t('home.newJourney')}</h2>
 <p className="text-sm text-white/70 mb-4 max-w-xs">{t('home.newJourneySubtitle')}</p>
 <Button variant="primary" size="md" onClick={startJourney} className="bg-white text-[var(--sidebar-bg)] hover:bg-white/90">
 {t('home.startJourney')}
 </Button>
 </div>

 {/* Quick cards */}
 <div className="grid grid-cols-2 gap-3">
 <Card className="p-4" hoverable onClick={() => navigate('/saved-journeys')}>
 <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-3">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
 </svg>
 </div>
 <p className="text-sm font-medium text-[var(--foreground)]">{t('home.rateLastTrip')}</p>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Share your experience</p>
 </Card>
 <Card className="p-4" hoverable onClick={() => navigate('/settings?tab=accessibility')}>
 <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-3">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="5" r="2"/><path d="M12 9v6l3 3"/><circle cx="9" cy="18" r="3"/><path d="M17.5 14.5A6 6 0 0 1 9 21"/>
 </svg>
 </div>
 <p className="text-sm font-medium text-[var(--foreground)]">{t('home.accessibilityProfile')}</p>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
 {accessibilityProfile.mobility.wheelchair ? 'Manual wheelchair ' : ''}
 {accessibilityProfile.mobility.wheelchairWidth}cm
 </p>
 </Card>
 </div>

 {/* Recent trips */}
 {recent.length > 0 && (
 <div>
 <div className="flex items-center justify-between mb-3">
 <h2 className="font-display font-semibold text-[var(--foreground)]">{t('home.recentTrips')}</h2>
 <button onClick={() => navigate('/saved-journeys')} className="text-xs text-[var(--primary)] hover:underline">View all</button>
 </div>
 <div className="flex flex-col gap-2">
 {recent.map((j) => (
 <Card key={j.id} className="p-4 flex items-center gap-4" hoverable onClick={() => navigate('/saved-journeys')}>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-[var(--foreground)] truncate">
 {j.origin.name} → {j.destination.name}
 </p>
 <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
 {new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {new Date(j.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 <div className="flex items-center gap-3 flex-shrink-0">
 <Badge variant={j.feasible ? 'feasible' : 'danger'}>{j.feasible ? 'Feasible' : 'Not feasible'}</Badge>
 <div className="flex gap-3">
 <MetricRing value={j.accessibilityQuality} label="Quality" color="var(--feasible)" />
 <MetricRing value={j.resilience} label="Resilience" color="var(--primary)" />
 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* AccessChain explanation */}
 <Card className="p-5 bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]">
 <h3 className="font-display font-semibold text-white mb-1">Travel confidently</h3>
 <p className="text-sm text-slate-400 leading-relaxed">
 AccessChain checks the continuity of your journey for accessibility, safety and comfort — evaluating every connection, not just the route.
 </p>
 <button className="text-[var(--primary)] text-sm mt-2 hover:underline">Learn more</button>
 </Card>
 </div>
 );
}
