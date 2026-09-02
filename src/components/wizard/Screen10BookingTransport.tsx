'use client';

import React from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, ShieldAlert, Ticket, CheckCircle2 } from 'lucide-react';

export default function Screen10BookingTransport() {
  const { prevScreen, nextScreen, selectedTransportId, selectedTiming } = useJourneyWizardStore();

  const getTransportDetails = () => {
    switch (selectedTransportId) {
      case 'mtc-570':
        return {
          name: 'MTC Bus 570 (Deluxe AC)',
          operator: 'MTC Chennai',
          departure: selectedTiming === 'plus15' ? '14:40' : selectedTiming === 'plus30' ? '14:55' : '14:25',
          price: '₹35',
        };
      case 'mtc-19b':
        return {
          name: 'MTC Bus 19B (Standard Low-Entry)',
          operator: 'MTC Chennai',
          departure: selectedTiming === 'plus15' ? '14:45' : selectedTiming === 'plus30' ? '15:00' : '14:30',
          price: '₹18',
        };
      case 'mtc-51b':
      default:
        return {
          name: 'MTC Bus 51B (Electric Low-Floor)',
          operator: 'MTC Chennai Realtime',
          departure: selectedTiming === 'plus15' ? '14:35' : selectedTiming === 'plus30' ? '14:50' : '14:20',
          price: '₹25',
        };
    }
  };

  const transport = getTransportDetails();

  const handleBook = () => {
    window.open('https://www.redbus.in/bus-tickets/chennai-bus-booking', '_blank');
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
          Step 10 of 12 • Partner Reservation
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-4">
          <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/30">
            <Ticket className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Book Accessible Seat</h2>
          <p className="text-xs text-slate-400">Complete reservation via verified partner integration</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-700/60">
            <div>
              <div className="text-xs font-semibold text-slate-400">Operator</div>
              <div className="font-bold text-base text-slate-100">{transport.operator}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400">Estimated Fare</div>
              <div className="font-mono font-black text-xl text-sky-400">{transport.price}</div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Selected Route</span>
              <span className="font-semibold text-slate-200">{transport.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scheduled Departure</span>
              <span className="font-mono font-medium text-slate-200">{transport.departure}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Accessibility Reservation</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Priority Bay Reserved
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
          <p>
            You are connecting through AccessChain's verified transit gateway to partner ticketing. Your accessibility preferences have been forwarded.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleBook}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Ticket Booking</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={nextScreen}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            Skip Booking &amp; View Summary
          </button>
        </div>
      </motion.div>
    </div>
  );
}
