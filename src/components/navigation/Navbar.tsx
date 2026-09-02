'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiPreferencesStore } from '@/stores/uiPreferencesStore';
import { getTranslation, UIStrings } from '@/lib/i18n/translations';
import {
  Compass,
  MapPin,
  Trophy,
  BarChart3,
  AlertTriangle,
  PlayCircle,
  Building2,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentLanguageCode } = useUiPreferencesStore();

  const navLinks: Array<{ href: string; key: keyof UIStrings; icon: any; highlight?: boolean }> = [
    { href: '/pitch-deck', key: 'navPitchDeck', icon: Sparkles },
    { href: '/journey/new', key: 'navJourney', icon: Compass, highlight: true },
    { href: '/sports', key: 'navSports', icon: Trophy },
    { href: '/tourism', key: 'navTourism', icon: MapPin },
    { href: '/analytics', key: 'navAnalytics', icon: BarChart3 },
    { href: '/reports', key: 'navReports', icon: AlertTriangle },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800/80 sticky top-10 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                {getTranslation('appTitle', currentLanguageCode)}
                <span className="text-[10px] uppercase font-bold tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded">
                  SIH
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5 truncate max-w-[200px] sm:max-w-none">
                {getTranslation('tagline', currentLanguageCode)}
              </p>
            </div>
          </Link>

          {/* Dynamic Translated Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const label = getTranslation(link.key, currentLanguageCode);

              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md hover:scale-105 transition-all mr-1"
                  >
                    <Icon className="w-3.5 h-3.5 fill-current" />
                    <span>{label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
