'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { A11yToolbar } from '@/components/accessibility/A11yToolbar';
import { Trophy, ShieldCheck, CheckCircle2, AlertOctagon, UserCheck, Dumbbell, Flag } from 'lucide-react';

export default function SportsPage() {
  const [selectedSport, setSelectedSport] = useState('Para-Cricket');

  const ReadinessChecklist = [
    { title: 'Airport to Venue Transport', status: 'VERIFIED', icon: CheckCircle2, note: 'Hydraulic ramp shuttle reserved' },
    { title: 'Accessible Hotel Accommodation', status: 'VERIFIED', icon: CheckCircle2, note: 'Step-free roll-in shower room' },
    { title: 'Training Facility Access', status: 'PARTIALLY_VERIFIED', icon: AlertOctagon, note: 'Auxiliary gym lift requires key card' },
    { title: 'Stadium Gate & Seating', status: 'VERIFIED', icon: CheckCircle2, note: 'Wheelchair Stand B & companion seat W-13' },
    { title: 'Return Transit Connection', status: 'VERIFIED', icon: CheckCircle2, note: 'Post-match priority shuttle' },
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
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Sports & Para-Athlete Competition Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Stadium Match & Competition Readiness
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tailored accessibility evaluation for sports spectators, para-athletes, and sports teams.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Sport Category</div>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md px-2 py-1 text-xs font-semibold"
              >
                <option value="Para-Cricket">Para-Cricket / Wheelchair Cricket</option>
                <option value="Wheelchair Basketball">Wheelchair Basketball</option>
                <option value="Para-Athletics">Para-Athletics Track & Field</option>
                <option value="Spectator Match">Cricket World Cup Spectator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Competition Readiness Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Competition Journey Status Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Flag className="w-4 h-4 text-amber-400" />
              Para-Athlete Competition Journey Chain
            </h3>

            <div className="space-y-3">
              {ReadinessChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.note}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stadium Infrastructure Map Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              M. Chinnaswamy Stadium Access Facilities
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] font-medium">ENTRANCE GATE:</span>
                <p className="font-bold text-slate-100 mt-0.5">Gate 5 Step-Free Ramp</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] font-medium">DESIGNATED SEATING:</span>
                <p className="font-bold text-slate-100 mt-0.5">Pavilion Stand B (W-12)</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] font-medium">COMPANION SEATING:</span>
                <p className="font-bold text-slate-100 mt-0.5">Adjacent Seat W-13</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] font-medium">ACCESSIBLE RESTROOM:</span>
                <p className="font-bold text-slate-100 mt-0.5">Stand B (12 meters away)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
