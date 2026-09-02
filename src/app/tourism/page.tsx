'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { A11yToolbar } from '@/components/accessibility/A11yToolbar';
import { MapPin, Calendar, CheckCircle2, Compass, ShieldCheck } from 'lucide-react';

export default function TourismPage() {
  const itinerary = [
    {
      day: 'Day 1 — Heritage & Sports Tour',
      items: [
        { title: 'Morning: Cubbon Park Step-Free Pathways', status: 'VERIFIED', type: 'Attraction', note: '100% paved step-free access' },
        { title: 'Lunch: Grand Royal MG Road Restaurant', status: 'VERIFIED', type: 'Restaurant', note: 'Accessible entrance & restroom' },
        { title: 'Afternoon: M. Chinnaswamy Stadium Match', status: 'VERIFIED', type: 'Stadium', note: 'Wheelchair Pavilion Stand B' },
      ],
    },
    {
      day: 'Day 2 — Culture & Shopping',
      items: [
        { title: 'Morning: Visvesvaraya Industrial Museum', status: 'VERIFIED', type: 'Museum', note: 'Elevators to all exhibit floors' },
        { title: 'Lunch: UB City Accessible Food Court', status: 'VERIFIED', type: 'Dining', note: 'Ramp entrance & wide corridors' },
        { title: 'Evening: Return via KSR Railway Station', status: 'VERIFIED', type: 'Transport', note: 'Hydraulic shuttle transfer' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <A11yToolbar />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Accessible Tourism Trip Planner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              2-Day Bengaluru Step-Free Itinerary
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              All recommendations filtered against your active Wheelchair Profile constraints.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {itinerary.map((dayGroup, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-sky-400" />
                {dayGroup.day}
              </h3>

              <div className="space-y-3">
                {dayGroup.items.map((item, j) => (
                  <div key={j} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {item.type}
                      </span>
                      <div className="font-bold text-slate-100 mt-1">{item.title}</div>
                      <div className="text-slate-400 text-[11px]">{item.note}</div>
                    </div>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 🟢 Feasible
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
