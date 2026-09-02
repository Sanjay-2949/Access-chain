import React, { useState } from "react";
import { JourneySegment } from "@/stores/useJourneyStore";
import { Button } from "@/components/ui/Button";

interface Props {
 segment: JourneySegment;
 onSubmit: (worked: boolean, note?: string) => void;
 onDismiss: () => void;
}

export const ArrivalVerificationModal: React.FC<Props> = ({ segment, onSubmit, onDismiss }) => {
 const [worked, setWorked] = useState<boolean | null>(null);
 const [note, setNote] = useState("");

 const handleSubmit = () => {
 if (worked === null) return;
 onSubmit(worked, note.trim() !== "" ? note.trim() : undefined);
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
 <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
 <div className="p-5 flex-1">
 <h3 className="text-lg font-bold text-white mb-2 leading-tight">
 Help verify this route
 </h3>
 <p className="text-slate-300 text-sm mb-6">
 Was the <strong className="text-sky-400">{segment.label}</strong> still working and accessible
 </p>

 <div className="space-y-3">
 <button
 onClick={() => setWorked(true)}
 className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
 worked === true ? 
 "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
 : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600"
 }`}
 >
 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${worked === true ? "border-emerald-500" : "border-slate-500"}`}>
 {worked === true && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
 </div>
 Yes, it worked
 </button>
 <button
 onClick={() => setWorked(false)}
 className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
 worked === false ? 
 "bg-rose-500/20 border-rose-500 text-rose-400" 
 : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600"
 }`}
 >
 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${worked === false ? "border-rose-500" : "border-slate-500"}`}>
 {worked === false && <div className="w-2 h-2 rounded-full bg-rose-500" />}
 </div>
 No, it was broken / inaccessible
 </button>
 </div>

 {worked !== null && (
 <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-200">
 <label className="text-xs font-semibold text-slate-400 block mb-1.5">
 Add a note (optional)
 </label>
 <input
 type="text"
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="e.g., Construction blocking ramp"
 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
 />
 </div>
 )}
 </div>

 <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
 <button 
 onClick={onDismiss}
 className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
 >
 Skip
 </button>
 <Button 
 onClick={handleSubmit} 
 disabled={worked === null}
 className="px-6 rounded-lg"
 >
 Submit
 </Button>
 </div>
 </div>
 </div>
 );
};

