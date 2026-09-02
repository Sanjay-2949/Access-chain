const fs = require('fs');
let content = fs.readFileSync('src/components/ai/AccessChainChatbot.tsx', 'utf8');

content = content.replace("messagesEndRef.current.scrollIntoView", "messagesEndRef.current?.scrollIntoView");

fs.writeFileSync('src/components/ai/AccessChainChatbot.tsx', content);
