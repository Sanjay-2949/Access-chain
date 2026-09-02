'use client';

import React, { useState } from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Bus, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

const CHENNAI_TRANSIT_OPTIONS = [
  {
    id: 'mtc-51b',
    name: 'MTC Bus 51B (Electric Low-Floor)',
    operator: 'Metropolitan Transport Corp (Chennai)',
    time: '14:20 - 14:35',
    accessible: 'accessible',
    wheelchair: true,
    fare: '₹25',
  },
  {
    id: 'mtc-570',
    name: 'MTC Bus 570 (Deluxe AC Express)',
    operator: 'Metropolitan Transport Corp (Chennai)',
    time: '14:25 - 14:45',
    accessible: 'accessible',
    wheelchair: true,
    fare: '₹35',
  },
  {
    id: 'mtc-19b',
    name: 'MTC Bus 19B (Standard Low-Entry)',
    operator: 'Metropolitan Transport Corp (Chennai)',
    time: '14:30 - 14:40',
    accessible: 'limited',
    wheelchair: false,
    fare: '₹18',
  },
];

export default function Screen9TransportModification() {
  const {
    prevScreen,
    nextScreen,
    disabilityCategories,
    selectTransport,
    setSelectedTiming,
    selectedTransportId,
    selectedTiming: storeTiming,
  } = useJourneyWizardStore();

  const [selected, setSelected] = useState(selectedTransportId || 'mtc-51b');
  const [timing, setTiming] = useState(storeTiming || 'original');

  const isWheelchairUser = disabilityCategories.some((c) => c.id === 'mobility' && c.selected);

  const handleConfirm = () => {
    selectTransport(selected);
    setSelectedTiming(timing);
    nextScreen();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button
          onClick={prevScreen}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
          Step 9 of 12 • Transport Options
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-black text-white">Modify Transit Vehicle</h2>
          <p className="text-xs text-slate-400">
            Select verified accessible bus schedules along your transit corridor
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Departure Headway
            </span>
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-500"
            >
              <option value="original">Original Schedule</option>
              <option value="plus15">+15 Minutes (Next Headway)</option>
              <option value="plus30">+30 Minutes (Less Crowded)</option>
            </select>
          </div>

          {CHENNAI_TRANSIT_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            const disabled = isWheelchairUser && !opt.wheelchair;

            return (
              <div
                key={opt.id}
                onClick={() => !disabled && setSelected(opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  disabled
                    ? 'opacity-50 grayscale bg-slate-800/20 border-slate-800'
                    : isSelected
                    ? 'bg-sky-500/10 border-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-slate-100 truncate">{opt.name}</h3>
                      <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-sky-400 border border-slate-800 shrink-0">
                        {opt.fare}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.operator}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {opt.time}
                      </span>
                      {opt.accessible === 'accessible' && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Fully Accessible
                        </span>
                      )}
                      {opt.accessible === 'limited' && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Limited
                        </span>
                      )}
                      {disabled && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          No Wheelchair Ramp
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${
                      isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-slate-950 rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-4 mt-2 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <span>Confirm Transport Option</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
