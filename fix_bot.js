const fs = require('fs');
let content = fs.readFileSync('src/components/ai/AccessChainChatbot.tsx', 'utf8');

content = content.replace("msg.sender === 'user' 'justify-end' : 'justify-start'", "msg.sender === 'user' ? 'justify-end' : 'justify-start'");
content = content.replace("msg.sender === 'user'\\n 'bg-sky-600", "msg.sender === 'user'\\n ? 'bg-sky-600");
content = content.replace(/msg\.sender === 'user'\s+'bg-sky-600/g, "msg.sender === 'user' ? 'bg-sky-600");
content = content.replace("isListening 'bg-sky-500/20 text-sky-400 border-sky-500/30 animate-pulse' : 'hover:bg-slate-800 text-slate-400 hover:text-sky-300'", "isListening ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 animate-pulse' : 'hover:bg-slate-800 text-slate-400 hover:text-sky-300'");
content = content.replace("msg.actionButton.type === 'navigate' 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'", "msg.actionButton.type === 'navigate' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'");
content = content.replace(/msg\.actionButton\.type === 'navigate'\s+'bg-sky/, "msg.actionButton.type === 'navigate' ? 'bg-sky");
content = content.replace(/isListening\s+'bg-sky/, "isListening ? 'bg-sky");

// Also check line 149
content = content.replace(/currentJourney\.segments\.length \|\| 0/g, "currentJourney?.segments?.length || 0");

fs.writeFileSync('src/components/ai/AccessChainChatbot.tsx', content);
