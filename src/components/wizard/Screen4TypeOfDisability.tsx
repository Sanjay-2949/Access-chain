'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Eye, Brain, Ear, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { id: 'mobility', label: 'Mobility', icon: Activity, emoji: '♿' },
  { id: 'vision', label: 'Vision', icon: Eye, emoji: '👁️' },
  { id: 'cognitive', label: 'Cognitive', icon: Brain, emoji: '🧠' },
  { id: 'hearing', label: 'Hearing', icon: Ear, emoji: '👂' },
  { id: 'speech', label: 'Speech', icon: MessageSquare, emoji: '💬' },
];

const SUB_OPTIONS: Record<string, {id: string, label: string}[]> = {
  mobility: [
    { id: 'wheelchair', label: 'Wheelchair user' },
    { id: 'walker', label: 'Uses walker/crutches' },
    { id: 'steps', label: 'Cannot use steps' },
  ]
};

export default function Screen4TypeOfDisability() {
  const { 
    prevScreen,
    setScreen,
    disabilityCategories,
    toggleDisabilityCategory,
    setPreferNotToSay,
    wheelchairWidthCm,
    setWheelchairWidth,
    maxWalkingDistanceM,
    setMaxWalkingDistance
  } = useJourneyWizardStore();

  const handleContinue = () => {
    setScreen(5);
  };

  const handlePreferNotToSay = () => {
    setPreferNotToSay(true);
    setScreen(5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button onClick={prevScreen} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500">Step 4 of 12</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 h-[70vh] flex flex-col"
      >
        <div className="text-center space-y-2 shrink-0">
          <h2 className="text-2xl font-bold">Accessibility Requirements</h2>
          <p className="text-slate-400">Select applicable categories</p>
        </div>

        <div className="space-y-3 overflow-y-auto pr-2 flex-grow scrollbar-thin scrollbar-thumb-slate-700">
          {CATEGORIES.map(cat => {
            const storeCat = disabilityCategories.find(c => c.id === cat.id);
            const isSelected = storeCat?.selected ?? false;
            return (
              <div key={cat.id} className="space-y-2">
                <button
                  onClick={() => toggleDisabilityCategory(cat.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-medium text-slate-200">{cat.label}</span>
                </button>

                <AnimatePresence>
                  {isSelected && cat.id === 'mobility' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-slate-950/50 rounded-xl space-y-5 ml-4 border border-slate-800">
                        <div className="space-y-3">
                          {SUB_OPTIONS.mobility.map(sub => (
                            <label key={sub.id} className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950" />
                              <span className="text-sm text-slate-300">{sub.label}</span>
                            </label>
                          ))}
                        </div>
                        
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Wheelchair Width</span>
                              <span className="text-sky-400">{wheelchairWidthCm} cm</span>
                            </div>
                            <input 
                              type="range" min="40" max="100" 
                              value={wheelchairWidthCm}
                              onChange={(e) => setWheelchairWidth(Number(e.target.value))}
                              className="w-full accent-sky-500" 
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-400">Max Walking Distance</span>
                              <span className="text-sky-400">{maxWalkingDistanceM} m</span>
                            </div>
                            <input 
                              type="range" min="100" max="2000" step="50"
                              value={maxWalkingDistanceM}
                              onChange={(e) => setMaxWalkingDistance(Number(e.target.value))}
                              className="w-full accent-sky-500" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-4 shrink-0">
          <button 
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            Continue
          </button>
          <button 
            onClick={handlePreferNotToSay}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            I Prefer Not to Say
          </button>
        </div>
      </motion.div>
    </div>
  );
}
