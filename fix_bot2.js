const fs = require('fs');
let content = fs.readFileSync('src/components/ai/AccessChainChatbot.tsx', 'utf8');

content = content.replace(/isListening\s+'bg-rose/g, "isListening ? 'bg-rose");
content = content.replace(/\{isListening\s+<MicOff/g, "{isListening ? <MicOff");

fs.writeFileSync('src/components/ai/AccessChainChatbot.tsx', content);
