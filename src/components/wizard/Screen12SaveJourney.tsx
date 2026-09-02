'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Screen12SaveJourney() {
  const { prevScreen, resetWizard, originLocation, destinationLocation, journeySaved, saveJourney } = useJourneyWizardStore();

  const handleSave = () => {
    saveJourney('journey_' + Date.now());
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#3b82f6', '#10b981']
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        {!journeySaved && (
          <button onClick={prevScreen} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <span className="text-sm text-slate-500">Step 12 of 12</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-4">
          {journeySaved ? (
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/30">
              <Save className="w-10 h-10 text-sky-400" />
            </div>
          )}
          <h2 className="text-3xl font-bold">{journeySaved ? 'Journey Saved!' : 'Save this journey?'}</h2>
          <p className="text-slate-400">
            {journeySaved ? 'You can access this route anytime from your dashboard.' : 'Save this accessible route so you can access it again later.'}
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-sky-500" />
            <div className="text-sm">
              <div className="text-slate-400">Route</div>
              <div className="font-medium">{originLocation?.name || 'Origin'} to {destinationLocation?.name || 'Destination'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <div className="text-sm">
              <div className="text-slate-400">Date</div>
              <div className="font-medium">Today</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          {!journeySaved ? (
            <>
              <button 
                onClick={handleSave}
                className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                SAVE JOURNEY
              </button>
              <button 
                onClick={resetWizard}
                className="w-full py-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                NOT NOW
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                resetWizard();
                window.location.href = '/home';
              }}
              className="w-full py-4 rounded-xl font-bold text-sm bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              Return to Home
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
