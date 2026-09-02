'use client';

import React from 'react';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Map as MapIcon,
  ArrowRight,
  Brain,
  Eye,
  Ear,
  MessageSquare,
  Activity,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import LiveBusRadarMap to prevent SSR issues with Leaflet
const LiveBusRadarMap = dynamic(
  () => import('../transit/LiveBusRadarMap').then((mod) => mod.LiveBusRadarMap),
  { ssr: false }
);

export default function Screen7GoogleMaps() {
  const { prevScreen, nextScreen, originLocation, destinationLocation, disabilityCategories } =
    useJourneyWizardStore();

  const isCognitive = disabilityCategories.some((c) => c.id === 'cognitive' && c.selected);
  const isVision = disabilityCategories.some((c) => c.id === 'vision' && c.selected);
  const isHearing = disabilityCategories.some((c) => c.id === 'hearing' && c.selected);
  const isSpeech = disabilityCategories.some((c) => c.id === 'speech' && c.selected);

  const origin = {
    name: originLocation?.name || 'Origin (Medavakkam / Current Location)',
    lat: originLocation?.latitude || 12.9210,
    lng: originLocation?.longitude || 80.1915,
  };

  const destination = {
    name: destinationLocation?.name || 'Destination (Jerusalem College / Jeppiaar)',
    lat: destinationLocation?.latitude || 12.8718,
    lng: destinationLocation?.longitude || 80.2198,
  };

  const getSubtitle = () => {
    if (isCognitive) {
      return 'Tracking low-sensory electric bus #51B with direct visual breadcrumbs & calm transfer-free navigation.';
    }
    if (isVision) {
      return 'Tracking low-floor bus #51B with audio stop announcements, acoustic beacon, and tactile arrival paths.';
    }
    if (isHearing) {
      return 'Tracking low-floor bus #51B with full visual LED displays, vibration alerts, and digital transcripts.';
    }
    if (isSpeech) {
      return 'Tracking bus #51B with contactless QR validation and self-service digital gate access.';
    }
    return 'Live tracking low-floor bus #51B with hydraulic ramp availability and step-free destination portal.';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <button
          onClick={prevScreen}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Real-Time Transit Radar • Step 7 of 12
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col space-y-4 p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="font-black text-xl text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-sky-400" />
              Live Bus Navigation & Accessible Routing
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{getSubtitle()}</p>
          </div>

          <button
            onClick={nextScreen}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span>Proceed to Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Real-Time Live Bus Radar Canvas */}
        <div className="w-full">
          <LiveBusRadarMap
            origin={origin}
            destination={destination}
            routeNumber="51B"
            routeName="MTC Electric Low-Floor Bus"
          />
        </div>
      </motion.div>
    </div>
  );
}
