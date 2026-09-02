'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';

export default function Screen1StartingPage() {
  const nextScreen = useJourneyWizardStore((state) => state.nextScreen);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 z-[-1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent z-[-1]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-6 sm:p-8 flex flex-col items-center text-center space-y-8"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="bg-sky-500/20 p-3 rounded-2xl">
            <LinkIcon className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            AccessChain
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-200">
            Plan accessible journeys based on your individual requirements
          </h2>
          <p className="text-slate-400">
            Discover routes and transport options tailored to your needs. 
            Navigate your city with confidence and ease.
          </p>
        </div>

        <div className="w-full space-y-4 pt-8">
          <button 
            onClick={nextScreen}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            NEW USER
          </button>
          <button 
            onClick={nextScreen}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            LOGIN
          </button>
        </div>
      </motion.div>
    </div>
  );
}
