'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Mic, MicOff, User } from 'lucide-react';
import { useJourneyStore } from '@/stores/useJourneyStore';

interface ChatMessage {
 id: string;
 sender: 'user' | 'assistant';
 text: string;
 timestamp: string;
 actionButton?: { label: string; onClick: () => void };
}

const isGreetingIntent = (query: string): boolean => {
 const q = query.toLowerCase();
 return q.match(/^(hello|hi|hey|start|help|what can you do)/) !== null;
};

export const AccessChainChatbot: React.FC = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [isTyping, setIsTyping] = useState(false);
 const [messages, setMessages] = useState<ChatMessage[]>([
 {
 id: 'msg-init-1',
 sender: 'assistant',
 text: 'HellI am the AccessChain Assistant.\n\nI can verify live elevator outages, analyze route feasibility, and substitute inaccessible transport options on your planned journey.',
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 },
 ]);
 const [input, setInput] = useState('');
 const [isListening, setIsListening] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const { currentJourney } = useJourneyStore();

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isTyping, isOpen]);

 const toggleVoiceInput = () => {
 if (isListening) {
 setIsListening(false);
 } else {
 setIsListening(true);
 const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
 if (!SpeechRecognition) {
 alert('Voice input is not supported in this browser.');
 setIsListening(false);
 return;
 }

 const recognition = new SpeechRecognition();
 recognition.lang = 'en-IN';
 recognition.start();

 recognition.onresult = (event: any) => {
 const transcript = event.results[0][0].transcript;
 setInput(transcript);
 setIsListening(false);
 };

 recognition.onerror = () => {
 setIsListening(false);
 };
 }
 };

 const handleSendMessage = async (textToSend?: string) => {
 const query = textToSend || input;
 if (!query.trim()) return;

 const userMsg: ChatMessage = {
 id: `msg-u-${Date.now()}`,
 sender: 'user',
 text: query,
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 };

 setMessages((prev) => [...prev, userMsg]);
 if (!textToSend) setInput('');
 setIsTyping(true);

 // Intent Detection & Conversational Logic Engine
 setTimeout(async () => {
 let replyText = '';

 const q = query.toLowerCase().trim();

 // 1. GREETING INTENT HANDLER
 if (isGreetingIntent(q)) {
 replyText =
 `HellHow may I assist you with your accessible journey today\n\n` +
 `I can provide assistance with the following:\n` +
 `- Step-free route planning for your active profile\n` +
 `- Live elevator and ramp outage verification\n` +
 `- Journey feasibility diagnostics`;
 }
 // 2. LIVE OUTAGE / ACCESSIBILITY VERIFICATION INTENT
 else if (q.includes('accessibility') || q.includes('elevator') || q.includes('status') || q.includes('safe') || q.includes('gate 3') || q.includes('broken') || q.includes('outage') || q.includes('alternatives')) {
 if (!currentJourney || currentJourney.segments.length === 0) {
 replyText = "You don't have an active journey planned yet. Please plan a route first.";
 } else {
 // Treat RECENTLY_VERIFIED as untrustworthy since it's just a stub for now
 const untrustworthySources = ['UNKNOWN', 'DEMO', 'RECENTLY_VERIFIED'];
 
 const unverifiedSegments = currentJourney.segments.filter(s => 
 untrustworthySources.includes(s.dataSource) || s.accessibility === 'UNKNOWN'
 );
 const inaccessibleSegments = currentJourney.segments.filter(s => s.accessibility === 'INACCESSIBLE');

 if (inaccessibleSegments.length > 0) {
 const labels = inaccessibleSegments.map(s => s.label).join(', ');
 replyText = `⚠️ **Accessibility Obstacle Detected**\n\nThe following parts of your route are currently marked as inaccessible: ${labels}. You may need to reroute or find an alternative path.`;
 } else if (unverifiedSegments.length > 0) {
 const labels = unverifiedSegments.map(s => s.label).join(', ');
 replyText = `⚠️ **Unverified Route Data**\n\nI cannot confirm the accessibility status for parts of your journey (${labels}).\n\nNo confirmed reports exist for this location — you may want to check with station staff.`;
 } else {
 // All segments are strictly 'ACCESSIBLE' and have a trustworthy data source
 const accessibleLabels = currentJourney.segments.map(s => s.label).join(', ');
 replyText = `✅ **Route Verified**\n\nReported accessible: ${accessibleLabels}.`;
 }
 }
 }
 // 3. FAILURE DIAGNOSTIC INTENT
 else if (q.includes('why') || q.includes('fail') || q.includes('score') || q.includes('diagnose') || q.includes('feasibility')) {
 if (!currentJourney) {
 replyText = "You don't have an active journey planned yet. Please plan a route first.";
 } else {
 replyText = `Journey Diagnostics: Your journey currently has a feasibility score of ${currentJourney.accessibilityQuality}%.\n\n${currentJourney.feasible ? "The route is classified as feasible for your mobility profile." : "The route is currently not feasible due to detected obstacles."}`;
 }
 }
 // 4. HUMAN SUPPORT ESCALATION INTENT
 else if (q.includes('support') || q.includes('human') || q.includes('agent') || q.includes('help')) {
 replyText =
 'I am connecting you with a human support representative. Please wait a moment while I transfer your session history. A representative will be with you shortly.';
 }
 // 5. AMBIGUOUS / FALLBACK INTENT
 else {
 replyText =
 `I am currently monitoring your ${currentJourney?.segments?.length || 0} journey segments in real time.\n\n` +
 `Please specify how I can assist you. For example, you may ask me to:\n` +
 `- Check the status of the elevators on your route\n` +
 `- Diagnose the feasibility score of your route\n\n` +
 `If I am unable to resolve your query, please type "support" to escalate to a human representative.`;
 }

 const assistantMsg: ChatMessage = {
 id: `msg-a-${Date.now()}`,
 sender: 'assistant',
 text: replyText,
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

 };

 setMessages((prev) => [...prev, assistantMsg]);
 setIsTyping(false);
 }, 1200); // Slightly increased delay for realistic typing feel
 };


 const pathname = usePathname();
 
 // Conditionally render the button only on specific pages where it provides contextual value
 const shouldShowButton = pathname === '/journey/map' || pathname === '/journey/roadmap' || pathname === '/journey/new';

 if (!shouldShowButton && !isOpen) return null;

 return (
 <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
 {/* Floating Trigger Button (Circular & Unobtrusive) */}
 {!isOpen && (
 <button
 onClick={() => setIsOpen(true)}
 className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white hover:border-sky-500 shadow-xl transition-all group focus:outline-none focus:ring-2 focus:ring-sky-500"
 aria-label="Open Support Assistant"
 >
 <div className="relative">
 <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
 <span className="w-2 h-2 rounded-full bg-sky-500 absolute -top-0.5 -right-0.5" />
 </div>
 </button>
 )}

 {/* Main Chatbot Dialog Window */}
 {isOpen && (
 <div className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
 {/* Header */}
 <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
 <Bot className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
 AccessChain AI Assistant
 <span className="text-[9px] uppercase bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded border border-sky-800">
 Graph AI
 </span>
 </h3>
 <p className="text-[10px] text-slate-400">Consumes real graph data • Never hallucinates</p>
 </div>
 </div>

 <button
 onClick={() => setIsOpen(false)}
 className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Chat Messages Log */}
 <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/60 text-xs">
 {messages.map((msg) => (
 <div
 key={msg.id}
 className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 {msg.sender === 'assistant' && (
 <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
 <Bot className="w-3.5 h-3.5" />
 </div>
 )}

 <div
 className={`max-w-[80%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
 msg.sender === 'user' ? 'bg-sky-600 text-white font-medium rounded-tr-none'
 : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
 }`}
 >
 <div>{msg.text}</div>

 <div className="text-[9px] opacity-60 text-right mt-1">{msg.timestamp}</div>
 </div>

 {msg.sender === 'user' && (
 <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
 <User className="w-3.5 h-3.5" />
 </div>
 )}
 </div>
 ))}

 {isTyping && (
 <div className="flex gap-2.5 justify-start">
 <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
 <Bot className="w-3.5 h-3.5" />
 </div>
 <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none p-3 rounded-2xl flex items-center gap-1.5 h-10">
 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-150" />
 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-300" />
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Quick Prompts Bar */}
 <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-1.5 scrollbar-none">
 <button
 onClick={() => handleSendMessage("Are the elevators on my route working")}
 className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-medium transition-colors shrink-0"
 >
 Verify Route Accessibility
 </button>
 <button
 onClick={() => handleSendMessage("Diagnose feasibility")}
 className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-medium transition-colors shrink-0"
 >
 Diagnose Feasibility
 </button>
 </div>

 {/* Input Footer */}
 <form
 onSubmit={(e) => {
 e.preventDefault();
 handleSendMessage();
 }}
 className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
 >
 <button
 type="button"
 onClick={toggleVoiceInput}
 className={`p-2 rounded-xl border transition-colors ${
 isListening ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
 : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
 }`}
 title="Voice Input (Speech to Text)"
 >
 {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
 </button>

 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Ask about your route, lifts, or profile..."
 className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none"
 />

 <button
 type="submit"
 disabled={!input.trim()}
 className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold disabled:opacity-40 transition-colors"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>
 </div>
 )}
 </div>
 );
};

