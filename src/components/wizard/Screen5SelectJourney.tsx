'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Zap, Heart, HelpCircle } from 'lucide-react';

export default function Screen5SelectJourney() {
  const { prevScreen, nextScreen, journeyType, setJourneyType } = useJourneyWizardStore();

  const handleSelect = (type: any) => {
    setJourneyType(type);
    nextScreen();
  };

  const OPTIONS = [
    { id: 'tourism', label: 'Tourism', desc: 'Explore accessible attractions', icon: MapPin },
    { id: 'fast-travel', label: 'Fast Travel', desc: 'Quickly reach your destination', icon: Zap },
    { id: 'community', label: 'Support the Community', desc: 'Help improve accessibility data', icon: Heart },
    { id: 'help', label: 'Help', desc: 'Get assistance with your journey', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button onClick={prevScreen} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500">Step 5 of 12</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-2xl font-bold">Choose Your Journey Type</h2>
          <p className="text-slate-400">How would you like to travel today?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isSelected = journeyType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col h-full gap-3 ${
                  isSelected 
                    ? 'bg-sky-500/10 border-sky-500' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`p-3 rounded-xl w-fit ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-300'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{opt.label}</h3>
                  <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
