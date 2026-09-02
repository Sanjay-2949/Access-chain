'use client';

import React from 'react';
import { Type, Eye, Languages, Accessibility, Maximize, Minus, Plus, Settings2 } from 'lucide-react';
import { useUiPreferencesStore } from '@/stores/uiPreferencesStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sun, UserCheck, ShieldAlert } from 'lucide-react';

export const A11yToolbar: React.FC = () => {
  const {
    isHighContrast,
    toggleHighContrast,
    textSizeLevel,
    setTextSizeLevel,
    isReducedMotion,
    toggleReducedMotion
  } = useUiPreferencesStore();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: App Identity */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-sky-400">
            <Accessibility className="w-4 h-4" />
            <span>Accessibility Preferences</span>
          </span>
        </div>

        {/* Right: WCAG A11y Quick Toggles & Global Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Global Language Switcher Dropdown */}
          <LanguageSwitcher />

          <button
            onClick={toggleHighContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              isHighContrast
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle High Contrast Mode (WCAG 2.1 AAA)"
            aria-pressed={isHighContrast}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">High Contrast</span>
          </button>

          <button
            onClick={() =>
              setTextSizeLevel(
                textSizeLevel === 'normal'
                  ? 'large'
                  : textSizeLevel === 'large'
                  ? 'xlarge'
                  : 'normal'
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Adjust Font Size Level"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="capitalize">{textSizeLevel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
