import { NavLink, useNavigate } from 'react-router';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/i18n';

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ContactsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const CommunityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BookmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const DemoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const WheelchairIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><path d="M12 9v6l3 3"/><circle cx="9" cy="18" r="3"/><path d="M17.5 14.5A6 6 0 0 1 9 21"/>
  </svg>
);
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const RadarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6a6 6 0 1 0 6 6"/><path d="M12 10a2 2 0 1 0 2 2"/><line x1="12" y1="12" x2="20" y2="4"/>
  </svg>
);

interface SidebarProps { onClose?: () => void; }

export function Sidebar({ onClose }: SidebarProps) {
  const { user, language, notifications } = useAppStore();
  const navigate = useNavigate();
  const t = useTranslation(language);
  const unread = notifications.filter((n) => !n.read).length;

  const navItem = (to: string, icon: React.ReactNode, label: string, badge?: number) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[var(--sidebar-accent)] text-white font-medium'
            : 'text-[var(--sidebar-fg)] hover:bg-white/10'
        }`
      }
    >
      <span className="opacity-80">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-[var(--warning)] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>
      )}
    </NavLink>
  );

  return (
    <aside className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)', color: 'var(--sidebar-fg)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button onClick={() => { navigate('/home'); onClose?.(); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded bg-[var(--sidebar-accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight text-white">{t('app.name')}</span>
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItem('/home', <HomeIcon />, t('nav.home'))}
        {navItem('/contacts', <ContactsIcon />, t('nav.contacts'))}
        {navItem('/settings', <SettingsIcon />, t('nav.settings'))}
        {navItem('/community', <CommunityIcon />, t('nav.community'))}
        {navItem('/help', <HelpIcon />, t('nav.help'))}

        <div className="my-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />

        {navItem('/saved-journeys', <BookmarkIcon />, t('nav.saved'))}
        {navItem('/outages', <AlertIcon />, t('nav.outages'), unread)}
        {navItem('/transit/radar', <RadarIcon />, 'Live Transit Radar')}
        <NavLink
          to="/demo"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-150 ${
              isActive ? 'bg-[var(--sidebar-accent)] text-white font-medium' : 'text-[var(--warning)] hover:bg-white/10'
            }`
          }
        >
          <span className="opacity-80"><DemoIcon /></span>
          <span className="flex-1">{t('nav.demo')}</span>
        </NavLink>

        {/* Notifications */}
        <div className="mt-2">
          <button
            onClick={() => { navigate('/outages'); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-[var(--sidebar-fg)] hover:bg-white/10 transition-all"
          >
            <BellIcon />
            <span className="flex-1 text-left">Notifications</span>
            {unread > 0 && (
              <span className="bg-[var(--danger)] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">{unread}</span>
            )}
          </button>
        </div>
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={() => { navigate('/settings'); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--sidebar-accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'KM'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'KMS'}</p>
            <div className="flex items-center gap-1 text-[var(--sidebar-muted)]">
              <WheelchairIcon />
              <span className="text-[11px]">Manual Wheelchair</span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
