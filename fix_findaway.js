const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/FindAWay.tsx', 'utf8');

content = content.replace("currentJourney.spof", "currentJourney?.spof");

fs.writeFileSync('src/ui-pages/FindAWay.tsx', content);
