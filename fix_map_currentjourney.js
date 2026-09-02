const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("currentJourney.origin", "currentJourney?.origin");
content = content.replace("currentJourney.destination", "currentJourney?.destination");
content = content.replace("currentJourney.totalDuration", "currentJourney?.totalDuration");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
