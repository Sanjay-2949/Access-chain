'use client';

import React from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Eye,
  Ear,
  MessageSquare,
  Activity,
  Compass,
  Volume2,
  Sparkles,
} from 'lucide-react';

export default function Screen8JourneyRoadmap() {
  const { prevScreen, nextScreen, disabilityCategories, originLocation, destinationLocation } =
    useJourneyWizardStore();

  const isCognitive = disabilityCategories.some((c) => c.id === 'cognitive' && c.selected);
  const isVision = disabilityCategories.some((c) => c.id === 'vision' && c.selected);
  const isHearing = disabilityCategories.some((c) => c.id === 'hearing' && c.selected);
  const isSpeech = disabilityCategories.some((c) => c.id === 'speech' && c.selected);
  const isMobility = disabilityCategories.some((c) => c.id === 'mobility' && c.selected) || (!isCognitive && !isVision && !isHearing && !isSpeech);

  const originName = originLocation?.name || 'Medavakkam Koot Road';
  const destName = destinationLocation?.name || 'Jerusalem College / Jeppiaar';

  // Dynamic Segments tailored to selected disability profile
  const getDynamicSegments = () => {
    if (isCognitive) {
      return [
        {
          id: 1,
          type: 'LANDMARK WALK',
          icon: '🚶',
          from: originName,
          to: 'Bus Bay 2 (Near Green Signboard)',
          duration: '4 min',
          distance: '250m',
          accessible: true,
          badge: 'Low-Stress Wayfinding',
          details: 'Follow simple green floor strip past the Clock Tower. Zero complex crossings.',
          feature: 'Simple Pictorial Signage',
        },
        {
          id: 2,
          type: 'CALM TRANSIT',
          icon: '🚌',
          from: 'Bus Bay 2',
          to: 'College Gate Stop',
          duration: '14 min',
          distance: '2.4km',
          accessible: true,
          badge: 'Direct Corridor (0 Transfers)',
          details: 'Board MTC Electric AC Bus. Low noise level (<40dB), single-seat quiet zone.',
          feature: 'Visual Stop Counter Active',
        },
        {
          id: 3,
          type: 'DIRECT ARRIVAL',
          icon: '📍',
          from: 'College Gate Stop',
          to: destName,
          duration: '2 min',
          distance: '100m',
          accessible: true,
          badge: 'High-Contrast Path',
          details: 'Follow high-contrast icon markers straight into the Main Reception.',
          feature: 'Calm Waiting Zone Available',
        },
      ];
    }

    if (isVision) {
      return [
        {
          id: 1,
          type: 'TACTILE PATH',
          icon: '🦯',
          from: originName,
          to: 'Bus Stop Boarding Bay',
          duration: '5 min',
          distance: '300m',
          accessible: true,
          badge: 'Tactile Paving (TGSI)',
          details: 'Continuous tactile blister paving with zero protruding overhead obstacles (2.1m clear).',
          feature: 'Audio Beacon Active',
        },
        {
          id: 2,
          type: 'AUDIO TRANSIT',
          icon: '🚌',
          from: 'Bus Stop Boarding Bay',
          to: 'Accessible Bus Stop',
          duration: '15 min',
          distance: '2.4km',
          accessible: true,
          badge: 'Audio Stop Announcements',
          details: 'Bilingual voice announcements inside bus and acoustic boarding chime.',
          feature: 'Bilingual Voice Alerts',
        },
        {
          id: 3,
          type: 'GUIDED ENTRY',
          icon: '📍',
          from: 'Accessible Bus Stop',
          to: destName,
          duration: '2 min',
          distance: '90m',
          accessible: true,
          badge: 'Tactile Guideway',
          details: 'Tactile ground indicators lead directly to the accessible entrance turnstile.',
          feature: 'Auditory Gate Beacon',
        },
      ];
    }

    if (isHearing) {
      return [
        {
          id: 1,
          type: 'VISUAL ROUTE',
          icon: '👀',
          from: originName,
          to: 'Bus Platform A',
          duration: '4 min',
          distance: '280m',
          accessible: true,
          badge: 'High-Visibility LED Signs',
          details: 'Clear electronic visual wayfinding boards with live digital status updates.',
          feature: 'Haptic Phone Sync Active',
        },
        {
          id: 2,
          type: 'DIGITAL TRANSIT',
          icon: '🚌',
          from: 'Bus Platform A',
          to: 'Terminal Stop',
          duration: '15 min',
          distance: '2.4km',
          accessible: true,
          badge: 'Interior LED Route Display',
          details: 'Full-cabin electronic visual stop displays with flashing arrival beacon.',
          feature: 'Hearing Loop (T-Coil) Enabled',
        },
        {
          id: 3,
          type: 'DIRECT ENTRY',
          icon: '📍',
          from: 'Terminal Stop',
          to: destName,
          duration: '2 min',
          distance: '100m',
          accessible: true,
          badge: 'Digital QR Check-in',
          details: 'Contactless visual QR scanner at entry portal with vibration confirmation.',
          feature: 'Visual Flashing Gate Indicator',
        },
      ];
    }

    if (isSpeech) {
      return [
        {
          id: 1,
          type: 'DIGITAL PATH',
          icon: '📱',
          from: originName,
          to: 'Boarding Point',
          duration: '4 min',
          distance: '280m',
          accessible: true,
          badge: 'Contactless Digital Flow',
          details: 'Tap-to-communicate digital kiosk and pre-booked electronic transit pass.',
          feature: 'Zero Verbal Interaction Required',
        },
        {
          id: 2,
          type: 'SMART TRANSIT',
          icon: '🚌',
          from: 'Boarding Point',
          to: 'Campus Stop',
          duration: '15 min',
          distance: '2.4km',
          accessible: true,
          badge: 'Auto-Validated Ticket',
          details: 'Electronic QR gate validation on bus. Silent digital SOS button in app.',
          feature: 'Text-First Support Online',
        },
        {
          id: 3,
          type: 'AUTO ENTRY',
          icon: '📍',
          from: 'Campus Stop',
          to: destName,
          duration: '2 min',
          distance: '100m',
          accessible: true,
          badge: 'QR Turnstile Gate',
          details: 'Self-service digital access portal leading directly to campus lobby.',
          feature: 'Silent Emergency Assistance',
        },
      ];
    }

    // Default: Mobility / Wheelchair
    return [
      {
        id: 1,
        type: 'STEP-FREE WALK',
        icon: '♿',
        from: originName,
        to: 'Low-Floor Bus Bay',
        duration: '4 min',
        distance: '220m',
        accessible: true,
        badge: '1:12 Gradient Low Slope',
        details: 'Smooth concrete walkway with continuous dual handrails and zero kerb steps.',
        feature: 'Level Boarding Platform',
      },
      {
        id: 2,
        type: 'ACCESSIBLE BUS',
        icon: '🚌',
        from: 'Low-Floor Bus Bay',
        to: 'Gate 1 Bus Stop',
        duration: '15 min',
        distance: '2.4km',
        accessible: true,
        badge: 'Automated Hydraulic Ramp',
        details: 'MTC Low-Floor Electric Bus with pneumatic kneeling suspension & 2 wheelchair bays.',
        feature: 'Wheelchair Floor Lockers',
      },
      {
        id: 3,
        type: 'RAMP ENTRANCE',
        icon: '📍',
        from: 'Gate 1 Bus Stop',
        to: destName,
        duration: '2 min',
        distance: '80m',
        accessible: true,
        badge: 'Verified Ramp Footing (12.8718, 80.2198)',
        details: '1500mm wide automatic sensor sliding door with level threshold (<6mm).',
        feature: 'CPWD Accessibility Certified',
      },
    ];
  };

  const segments = getDynamicSegments();

  const getProfileTitle = () => {
    if (isCognitive) return { title: 'Cognitive & Sensory Accessibility Profile', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
    if (isVision) return { title: 'Visual Accessibility & Tactile Profile', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    if (isHearing) return { title: 'Hearing & Visual Notification Profile', icon: Ear, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    if (isSpeech) return { title: 'Speech & Text-First Profile', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    return { title: 'Mobility & Wheelchair Profile', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' };
  };

  const profile = getProfileTitle();
  const ProfileIcon = profile.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={prevScreen}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
          Step 8 of 12 • Tailored Roadmap
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${profile.bg} ${profile.border} border ${profile.color} text-xs font-bold shadow-inner`}>
            <ProfileIcon className="w-4 h-4" />
            <span>{profile.title}</span>
          </div>
          <h2 className="text-2xl font-black text-white">Your Custom Accessible Route</h2>
          <p className="text-xs text-slate-400">
            Tailored specifically for your selected accommodation preferences
          </p>
        </div>

        {/* Dynamic Route Segments List */}
        <div className="space-y-3 relative">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-800"></div>

          {segments.map((seg) => (
            <div key={seg.id} className="relative flex gap-4 p-3 items-start group">
              <div className="mt-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center flex-shrink-0 z-10 text-xs shadow-md group-hover:scale-110 transition-transform">
                {seg.icon}
              </div>

              <div className="flex-grow bg-slate-800/50 hover:bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg transition-all">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    <span>{seg.type}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
                    <Clock className="w-3 h-3" /> {seg.duration} ({seg.distance})
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-medium mb-2">
                  <strong className="text-white">{seg.from}</strong> → <strong className="text-sky-300">{seg.to}</strong>
                </div>

                <p className="text-xs text-slate-400 mb-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  {seg.details}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {seg.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 text-[11px] font-bold border border-sky-500/20">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    {seg.feature}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={prevScreen}
            className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all uppercase tracking-wider"
          >
            Modify Preferences
          </button>
          <button
            onClick={nextScreen}
            className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all uppercase tracking-wider"
          >
            Confirm & Proceed
          </button>
        </div>
      </motion.div>
    </div>
  );
}
