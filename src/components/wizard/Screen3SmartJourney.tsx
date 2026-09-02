'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserX, ChevronRight, Settings } from 'lucide-react';

export default function Screen3SmartJourney() {
  const { 
    nextScreen, 
    prevScreen, 
    setScreen,
    peopleCount, 
    setPeopleCount,
    disabledCount, 
    setDisabledCount,
    disabilityCategories
  } = useJourneyWizardStore();

  const handleAccessConfig = () => {
    setScreen(4);
  };

  const handleContinue = () => {
    setScreen(5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button onClick={prevScreen} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500">Step 3 of 12</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Plan Your Journey</h2>
          <p className="text-slate-400">Tell us about your travel group</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-sky-400" />
              <span className="font-medium">Number of People</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
              >-</button>
              <span className="w-4 text-center font-bold">{peopleCount}</span>
              <button 
                onClick={() => setPeopleCount(Math.min(20, peopleCount + 1))}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
              >+</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <UserX className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">Accessibility Users</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDisabledCount(Math.max(0, disabledCount - 1))}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
              >-</button>
              <span className="w-4 text-center font-bold">{disabledCount}</span>
              <button 
                onClick={() => setDisabledCount(Math.min(peopleCount, disabledCount + 1))}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600"
              >+</button>
            </div>
          </div>

          <button 
            onClick={handleAccessConfig}
            className="w-full flex items-center justify-between p-4 bg-slate-800/80 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="font-medium">Accessibility Requirements</div>
                <div className="text-xs text-slate-400 mt-1">
                  {disabilityCategories.filter((c) => c.selected).length > 0 
                    ? `${disabilityCategories.filter((c) => c.selected).length} categories selected` 
                    : "Tap to configure"}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
