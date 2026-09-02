'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { useUiPreferencesStore } from '@/stores/uiPreferencesStore';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguageCode, setLanguageCode } = useUiPreferencesStore();

  const handleLanguageChange = (code: string) => {
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (selected) {
      setLanguageCode(code);
      document.documentElement.dir = selected.direction;
      document.documentElement.lang = selected.code;
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 shadow-sm">
      <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      <select
        value={currentLanguageCode}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent text-slate-100 text-xs font-semibold focus:outline-none max-w-[140px] truncate cursor-pointer"
        aria-label="Select Global Language & Locale"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">
            {l.nativeName} ({l.name})
          </option>
        ))}
      </select>
    </div>
  );
};
