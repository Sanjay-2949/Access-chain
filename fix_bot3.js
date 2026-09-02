const fs = require('fs');
let content = fs.readFileSync('src/components/ai/AccessChainChatbot.tsx', 'utf8');

content = content.replace(/\{currentJourney\.feasible\s+"The/g, "{currentJourney.feasible ? \"The");
// I'll also just aggressively replace any missed question marks if I can find them, but it's hard.

fs.writeFileSync('src/components/ai/AccessChainChatbot.tsx', content);
