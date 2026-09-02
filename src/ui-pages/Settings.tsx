import { useNavigate, useSearchParams } from 'react-router';
import { useAppStore, type Language, type TextSize } from '../stores/useAppStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const LANGS: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
];

export default function Settings() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, language, setLanguage, textSize, setTextSize, highContrast, setHighContrast, reducedMotion, setReducedMotion, notifPrefs, setNotifPrefs, accessibilityProfile, updateProfile } = useAppStore();
  const activeTab = params.get('tab') || 'account';

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'language', label: 'Language' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'booking', label: 'Booking' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  const mc = accessibilityProfile.mobility;
  const updateMc = (k: string, v: boolean | number) => updateProfile({ mobility: { ...mc, [k]: v } as typeof mc });

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h1 className="font-display text-xl font-bold text-[var(--foreground)] mb-5">Settings</h1>

      <div className="flex gap-1 flex-wrap mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => navigate(`/settings?tab=${t.id}`)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${activeTab === t.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'account' && (
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Account</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--muted-foreground)]">Name</span>
                <span className="text-sm font-medium">{user?.name || 'KMS'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[var(--muted-foreground)]">Email</span>
                <span className="text-sm font-medium">{user?.email || '—'}</span>
              </div>
            </div>
          </Card>
          <Button variant="danger" onClick={handleLogout}>Log out</Button>
        </div>
      )}

      {activeTab === 'accessibility' && (
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Mobility profile</h2>
            <div className="flex flex-col gap-3">
              {[{ key: 'wheelchair', label: 'Wheelchair user' }, { key: 'walkingAid', label: 'Walking aid' }, { key: 'limitedWalking', label: 'Limited walking distance' }].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[var(--foreground)]">{label}</span>
                  <input type="checkbox" checked={mc[key as keyof typeof mc] as boolean} onChange={(e) => updateMc(key, e.target.checked)} className="accent-[var(--primary)]" />
                </label>
              ))}
              {mc.wheelchair && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm text-[var(--foreground)]">Wheelchair width</label>
                    <span className="font-mono text-sm font-semibold text-[var(--primary)]">{mc.wheelchairWidth} cm</span>
                  </div>
                  <input type="range" min={50} max={100} value={mc.wheelchairWidth} onChange={(e) => updateMc('wheelchairWidth', Number(e.target.value))}
                    className="w-full accent-[var(--primary)]" />
                </div>
              )}
              {mc.limitedWalking && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-[var(--foreground)]">Max walking distance</label>
                  <input type="number" min={50} max={2000} step={50} value={mc.maxWalkingDistance}
                    onChange={(e) => updateMc('maxWalkingDistance', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-[var(--card)]" />
                  <span className="text-sm text-[var(--muted-foreground)]">m</span>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Display</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">Text size</p>
                <div className="flex gap-2">
                  {([['normal', 'Normal'], ['large', 'Large'], ['xlarge', 'Extra Large']] as [TextSize, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => setTextSize(val)}
                      className={`px-3 py-1.5 rounded border text-sm transition-all ${textSize === val ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--foreground)]'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">High contrast mode</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Increase contrast for better visibility</p>
                </div>
                <button onClick={() => setHighContrast(!highContrast)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${highContrast ? 'left-6' : 'left-1'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Reduced motion</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Minimize animations</p>
                </div>
                <button onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${reducedMotion ? 'left-6' : 'left-1'}`} />
                </button>
              </label>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'language' && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Language</h2>
          <div className="flex flex-col gap-1">
            {LANGS.map((lang) => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-between px-4 py-3 rounded border transition-all ${language === lang.code ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent hover:bg-[var(--secondary)]'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${language === lang.code ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'}`}>
                    {language === lang.code && <div className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{lang.label}</span>
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{lang.native}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Notifications</h2>
          {[
            { key: 'outage', label: 'Outage alerts', desc: 'When a saved journey is affected by an outage' },
            { key: 'journey', label: 'Journey updates', desc: 'Status changes to your current journey' },
            { key: 'community', label: 'Community requests', desc: 'Assistance requests and responses' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-b-0 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
              </div>
              <button onClick={() => setNotifPrefs({ [key]: !notifPrefs[key as keyof typeof notifPrefs] })}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifPrefs[key as keyof typeof notifPrefs] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifPrefs[key as keyof typeof notifPrefs] ? 'left-6' : 'left-1'}`} />
              </button>
            </label>
          ))}
        </Card>
      )}

      {activeTab === 'privacy' && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Privacy</h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Community assistants only see information required to fulfil your request. Your accessibility profile details are not exposed publicly. Platform identity verification is separate from personal medical information.
          </p>
        </Card>
      )}

      {activeTab === 'booking' && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Booking providers</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">Configure your preferred transport booking providers.</p>
          <div className="flex flex-col gap-3">
            {[{ name: 'RedBus', status: 'Configuration required' }, { name: 'Uber', status: 'External booking' }].map(({ name, status }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
