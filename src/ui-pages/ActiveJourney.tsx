import React, { useState } from "react";
import { useJourneyStore } from "@/stores/useJourneyStore";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export default function ActiveJourney() {
 const { currentJourney } = useJourneyStore();
 const navigate = useNavigate();
 const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

 if (!currentJourney) {
 return (
 <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
 <p>No active journey. Please plan a route first.</p>
 <Button onClick={() => navigate("/journey/new")} className="ml-4">Plan Route</Button>
 </div>
 );
 }

 const isCompleted = currentSegmentIndex >= currentJourney.segments.length;
 const currentSegment = currentJourney.segments[currentSegmentIndex];

 const advanceToNextSegment = () => {
 setCurrentSegmentIndex((prev) => prev + 1);
 };

 if (isCompleted) {
 return (
 <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
 </div>
 <h2 className="text-2xl font-bold mb-2">Journey Complete!</h2>
 <p className="text-slate-400 mb-6">You have reached your destination. Thank you for contributing to the accessibility map!</p>
 <Button onClick={() => navigate("/home")}>Return to Dashboard</Button>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
 <header className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0">
 <h1 className="font-bold">Active Navigation</h1>
 <p className="text-xs text-slate-400">Step {currentSegmentIndex + 1} of {currentJourney.segments.length}</p>
 </header>

 <main className="flex-1 p-6 flex flex-col items-center justify-center">
 <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
 <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full mb-4">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
 </div>
 <h2 className="text-xl font-bold mb-2">{currentSegment.label}</h2>
 <p className="text-slate-400 text-sm mb-8">
 From: {currentSegment.from} <br/>
 To: {currentSegment.to}
 </p>

 <Button fullWidth size="lg" onClick={advanceToNextSegment}>
 Complete Step & Continue
 </Button>
 </div>
 </main>

 </div>
 );
}

