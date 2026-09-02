'use client';

import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { A11yToolbar } from '@/components/accessibility/A11yToolbar';
import { Printer, Download, Compass, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PitchDeckPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <A11yToolbar />
        <Navbar />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 print:p-0 print:m-0 print:max-w-none">
        {/* Floating Print Action Banner (Hidden on Print) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">AccessChain SIH Master Pitch Deck</h2>
              <p className="text-xs text-slate-400">PDF compiled & printable format</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-slate-800 print:border-black/20 pb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest print:text-sky-700">
              Smart India Hackathon (SIH) Official Master Presentation
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white print:text-black mt-1">
              AccessChain — Pitch Deck & Architecture Specification
            </h1>
            <p className="text-sm text-slate-400 print:text-slate-700 mt-1 italic">
              "Don't just find an accessible destination. Complete an accessible journey."
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-sky-400 print:text-sky-800">1. Core Understanding of the Problem</h2>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed">
              Current accessibility platforms evaluate destinations independently. A hotel, metro line, airport, or stadium may individually claim to be accessible, but a person’s <strong>entire journey fails if even one connecting link is inaccessible</strong> (e.g. non-wheelchair vehicle, broken lift without ramp alternative). Travelers face fragmented, static, and unreliable information across multiple apps, leading to travel anxiety and unexpected stranded situations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-sky-400 print:text-sky-800">2. What is the Solution?</h2>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed">
              AccessChain models origin, transit steps, transfers, venue gates, internal corridors, elevators, seating, and restrooms as connected <strong>Nodes</strong> and <b>Edges</b> in an <strong>Accessibility Continuity Graph</strong>. It answers: <em>"Can THIS SPECIFIC PERSON with THEIR EXPLICIT ACCESSIBILITY REQUIREMENTS complete THIS ENTIRE JOURNEY?"</em> If a link breaks or suffers a live outage, AccessChain automatically detects single points of failure (SPOFs) and calculates smart alternatives (<em>"Find A Way"</em>).
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-sky-400 print:text-sky-800">3. What is Uniquely Present?</h2>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 print:text-slate-800 space-y-1.5 leading-relaxed">
              <li><strong>Accessibility Continuity Graph:</strong> Node-edge spatial graph validating edge-by-edge constraints rather than simple place pin dropping.</li>
              <li><strong>Decoupled Three Core Metrics:</strong> Decouples <em>FEASIBILITY</em> (FEASIBLE / NOT FEASIBLE), <em>ACCESSIBILITY QUALITY (0-100)</em>, and <em>JOURNEY RESILIENCE (0-100)</em>.</li>
              <li><strong>Tri-State Knowledge Engine:</strong> Strictly enforces <em>UNKNOWN != FALSE</em> to prevent missing data from falsely assuming accessibility or inaccessibility.</li>
              <li><strong>Live Temporal Re-Evaluation:</strong> Real-time graph updates (e.g., Gate 3 lift outage) trigger automatic re-evaluation via Gate 5 ramp.</li>
              <li><strong>SIH Interactive Demo Mode (/demo):</strong> Deterministic 7-state demo machine simulating failure detection, 1-click shuttle repair, live outage, and rerouting.</li>
            </ul>
          </section>

          {/* Section 4 & 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-sky-400 print:text-sky-800">4 & 5. Competitive Differentiation & Benchmarking</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-800 print:border-black/30">
                <thead>
                  <tr className="bg-slate-950 print:bg-slate-200 font-bold text-slate-200 print:text-black">
                    <th className="p-2.5 border border-slate-800 print:border-black/30">Feature / Benchmark</th>
                    <th className="p-2.5 border border-slate-800 print:border-black/30">Google Maps</th>
                    <th className="p-2.5 border border-slate-800 print:border-black/30">Wheelmap</th>
                    <th className="p-2.5 border border-slate-800 print:border-black/30 text-sky-400 print:text-sky-800">AccessChain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-black/20 text-slate-300 print:text-slate-900">
                  <tr>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-semibold">End-to-End Continuity Graph</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-bold text-emerald-400 print:text-emerald-700">100% Graph-Based</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-semibold">Multi-Constraint Matching</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">Partial</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-bold text-emerald-400 print:text-emerald-700">Full Profile Matching</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-semibold">Live Outage Rerouting</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-bold text-emerald-400 print:text-emerald-700">Real-Time Auto Reroute</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-semibold">SPOF & Resilience Metric</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30">No</td>
                    <td className="p-2.5 border border-slate-800 print:border-black/30 font-bold text-emerald-400 print:text-emerald-700">SPOF Counter & Resilience</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6, 7, 8 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-sky-400 print:text-sky-800">6, 7 & 8. Business Model, Tools & Technical Stack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 print:bg-slate-100 rounded-xl border border-slate-800 print:border-black/20 space-y-1">
                <div className="font-bold text-white print:text-black">Business Path</div>
                <p className="text-slate-400 print:text-slate-700">
                  B2C Freemium, B2B SaaS for Stadiums & Hotels, B2G Destination Heatmap Licensing, and API Data Monetization for booking portals.
                </p>
              </div>

              <div className="p-4 bg-slate-950 print:bg-slate-100 rounded-xl border border-slate-800 print:border-black/20 space-y-1">
                <div className="font-bold text-white print:text-black">Tech Stack & Algorithms</div>
                <p className="text-slate-400 print:text-slate-700">
                  Next.js 14, React 19, TypeScript, Tailwind CSS, Zustand, Prisma + PostgreSQL, Vitest, Dijkstra Multi-Constraint Routing Engine.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
