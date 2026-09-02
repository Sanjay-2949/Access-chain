'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { A11yToolbar } from '@/components/accessibility/A11yToolbar';
import { AlertTriangle, Camera, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [issueType, setIssueType] = useState('Elevator Unavailable');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <A11yToolbar />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Community Incident Reporting & Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Report Real-World Accessibility Outage
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Crowdsourced reports enter an auditor verification pipeline before updating live graph edges.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Report Successfully Submitted</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you! Your report has entered the auditor verification queue. Community confidence model updated.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Submit Another Incident
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Category
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="Elevator Unavailable">Elevator Unavailable / Maintenance</option>
                  <option value="Ramp Blocked">Ramp Blocked / Damaged</option>
                  <option value="Wheelchair Taxi Unavailable">Wheelchair Taxi Unavailable</option>
                  <option value="Accessible Toilet Closed">Accessible Toilet Closed</option>
                  <option value="Stairs Discovered">Stairs Discovered / Missing Signage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Exact Location
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context (e.g., Gate 3 elevator out of order due to maintenance)..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer">
                <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-300">
                  Attach Photo / Video Evidence
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Incident Report</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
