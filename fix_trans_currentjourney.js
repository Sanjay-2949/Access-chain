const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.replace("currentJourney.origin", "currentJourney?.origin");
content = content.replace("currentJourney.destination", "currentJourney?.destination");

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
