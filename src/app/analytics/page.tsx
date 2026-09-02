'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { A11yToolbar } from '@/components/accessibility/A11yToolbar';
import { BarChart3, MapPin, AlertTriangle, ShieldCheck, TrendingUp, Compass } from 'lucide-react';

export default function AnalyticsPage() {
  const cityMetrics = [
    { city: 'Chennai Tourism Ecosystem', overall: 76, transport: 72, hotels: 81, sports: 91, lastMile: 57 },
    { city: 'Bengaluru Sports Ecosystem', overall: 84, transport: 79, hotels: 88, sports: 96, lastMile: 64 },
    { city: 'Mumbai Transport Ecosystem', overall: 68, transport: 61, hotels: 79, sports: 85, lastMile: 48 },
    { city: 'Hyderabad Event Ecosystem', overall: 79, transport: 74, hotels: 83, sports: 90, lastMile: 60 },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <A11yToolbar />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Government & Destination Accessibility Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              City Accessibility Gap Analytics & Heatmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cross-sector accessibility monitoring across transit, hotels, sports venues, and last-mile connectivity.
            </p>
          </div>
        </div>

        {/* Spatial Gap Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cityMetrics.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="font-bold text-sm text-slate-100">{item.city}</div>
                <div className="text-sm font-black text-sky-400">{item.overall} / 100</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Public Transit:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{item.transport}%</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Hotels & Hospitality:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{item.hotels}%</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Sports & Stadiums:</span>
                  <div className="font-bold text-slate-200 mt-0.5">{item.sports}%</div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Last-Mile Mobility:</span>
                  <div className="font-bold text-rose-400 mt-0.5">{item.lastMile}% (Critical Gap)</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
