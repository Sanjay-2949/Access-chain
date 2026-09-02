'use client';

import React from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Brain,
  Eye,
  Ear,
  MessageSquare,
  Activity,
  Sparkles,
} from 'lucide-react';

export default function Screen11FinalDashboard() {
  const {
    prevScreen,
    nextScreen,
    failureTriggered,
    triggerFailure,
    startReroute,
    completeReroute,
    rerouteInProgress,
    rerouteComplete,
    disabilityCategories,
  } = useJourneyWizardStore();
  

  const isCognitive = disabilityCategories.some((c) => c.id === 'cognitive' && c.selected);
  const isVision = disabilityCategories.some((c) => c.id === 'vision' && c.selected);
  const isHearing = disabilityCategories.some((c) => c.id === 'hearing' && c.selected);
  const isSpeech = disabilityCategories.some((c) => c.id === 'speech' && c.selected);
  const isMobility = disabilityCategories.some((c) => c.id === 'mobility' && c.selected) || (!isCognitive && !isVision && !isHearing && !isSpeech);

  const handleSimulateFailure = () => {
    triggerFailure();
    
  };

  const handleReroute = () => {
    startReroute();
    setTimeout(() => {
      
      completeReroute();
    }, 2000);
  };

  // Dynamic Features Verified list
  const getVerifiedFeatures = () => {
    if (isCognitive) {
      return [
        'Simplified Visual Breadcrumbs',
        'Direct Corridor (0 Transfers)',
        'Low-Sensory Quiet Zone (<40dB)',
        'Pictorial Landmark Signage',
        'Calm Waiting Spot Reserved',
        'Easy Step-by-Step Guidance',
      ];
    }
    if (isVision) {
      return [
        'Tactile Paving (TGSI Guiding Path)',
        'Auditory Stop Beacon Active',
        'Bilingual Voice Announcements',
        'Zero Overhanging Obstacles (2.1m Clear)',
        'High-Contrast Floor Markings',
        'Assisted Boarding Audio Chime',
      ];
    }
    if (isHearing) {
      return [
        'Interior & Platform LED Displays',
        'Hearing Loop (T-Coil) Enabled',
        'Visual Flashing Arrival Beacon',
        'Vibration Alert Phone Sync',
        'Digital Screen-Reader Transcripts',
        'Real-Time Text Delay Radar',
      ];
    }
    if (isSpeech) {
      return [
        'Contactless QR Turnstile Check-in',
        'Zero Verbal Exchange Required',
        'Text-First Customer Support',
        'Self-Service Digital Boarding',
        'Silent One-Tap Emergency SOS',
        'Digital Map Direction Sharing',
      ];
    }
    return [
      '1:12 Low-Gradient Concrete Ramps',
      'Hydraulic Low-Floor Bus with Ramp',
      '2 Dedicated Wheelchair Bays Free',
      '1500mm Automatic Sensor Doors',
      'Level Boarding Surface (<6mm Kerb)',
      'Accessible Restrooms Verified',
    ];
  };

  // Dynamic Failure & Reroute Simulation Content
  const getOutageContent = () => {
    if (isCognitive) {
      return {
        issueTitle: '⚠ Heavy Construction Noise & Sudden Detour at Gate 2',
        issueDesc: 'Sensory Overload & Route Confusion Alert Detected.',
        buttonLabel: 'FIND CALM ALTERNATIVE',
        restoredTitle: 'Alternative Found: Diverted via Quiet Garden Path with Simple Visual Icons',
      };
    }
    if (isVision) {
      return {
        issueTitle: '⚠ Tactile Paving Maintenance at Gate 2 Corridor',
        issueDesc: 'TGSI Discontinuity Detected on Primary Path.',
        buttonLabel: 'FIND TACTILE ALTERNATIVE',
        restoredTitle: 'Alternative Found: Rerouted via Continuous Tactile Guideway & Audio Beacon at Gate 1',
      };
    }
    if (isHearing) {
      return {
        issueTitle: '⚠ Platform LED Display Offline at Bay 2',
        issueDesc: 'Visual Announcement Information Gap Detected.',
        buttonLabel: 'ACTIVATE DIGITAL BACKUP',
        restoredTitle: 'Digital Backup Online: Real-Time Mobile Visual Transcripts & LED Sync Restored',
      };
    }
    if (isSpeech) {
      return {
        issueTitle: '⚠ Digital QR Turnstile Offline at Gate 3',
        issueDesc: 'Self-Service Contactless Portal Impeded.',
        buttonLabel: 'FIND DIGITAL GATEWAY',
        restoredTitle: 'Alternative Found: Digital NFC Fast-Track Gate Activated at Gate 1',
      };
    }
    return {
      issueTitle: '⚠ Gate 3 Elevator Outage',
      issueDesc: 'Single Point of Failure Detected on your current route.',
      buttonLabel: 'FIND STEP-FREE REROUTE',
      restoredTitle: 'Alternative Found: Step-Free Route Updated via Gate 1 1:12 Ramp',
    };
  };

  const outage = getOutageContent();
  const features = getVerifiedFeatures();

  const getProfileHeader = () => {
    if (isCognitive) return { title: 'Cognitive & Sensory Accessibility Audit', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
    if (isVision) return { title: 'Visual & Tactile Accessibility Audit', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    if (isHearing) return { title: 'Hearing & Visual Telemetry Audit', icon: Ear, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    if (isSpeech) return { title: 'Speech & Digital Interaction Audit', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    return { title: 'Mobility & Physical Accessibility Audit', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
  };

  const profileHeader = getProfileHeader();
  const ProfileIcon = profileHeader.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-8">
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <button
          onClick={prevScreen}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
          Step 11 of 12 • Continuity Audit
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-2">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${profileHeader.bg} ${profileHeader.border} border ${profileHeader.color} text-xs font-bold shadow-inner`}>
            <ProfileIcon className="w-4 h-4" />
            <span>{profileHeader.title}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">YOUR VERIFIED JOURNEY</h2>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full font-bold tracking-widest text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5" /> CONTINUOUSLY FEASIBLE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-black text-sky-400 mb-1">
              96<span className="text-lg text-slate-500">/100</span>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accommodation Match
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-black text-emerald-400 mb-1">
              92<span className="text-lg text-slate-500">/100</span>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Network Resilience
            </div>
          </div>
        </div>

        {/* Dynamic Accommodations Verified Checklist */}
        <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" /> Tailored Accommodations Verified
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Live Outage & Autonomous Reroute Simulator */}
        <div className="border-t border-slate-800 pt-6 pb-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Live Outage & Dynamic Recovery Simulator
            </h3>

            {!failureTriggered ? (
              <button
                onClick={handleSimulateFailure}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Simulate Live Infrastructure Outage
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-start gap-3 shadow-inner">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="block text-sm mb-1 text-rose-200">{outage.issueTitle}</strong>
                    {outage.issueDesc}
                  </div>
                </div>

                {!rerouteComplete ? (
                  <button
                    onClick={handleReroute}
                    disabled={rerouteInProgress}
                    className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider"
                  >
                    {rerouteInProgress ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Computing Autonomous Alternative...
                      </>
                    ) : (
                      outage.buttonLabel
                    )}
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs flex items-center gap-3 shadow-md font-semibold"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    {outage.restoredTitle}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <button
          onClick={nextScreen}
          className="w-full py-4 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          Proceed to Save Journey
        </button>
      </motion.div>
    </div>
  );
}
