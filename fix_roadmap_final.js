const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace("{isFeasible (", "{isFeasible ? (");
content = content.replace(/\{saved .*?'Journey Saved to Profile' : 'Confirm & Save Journey'\}/, "{saved ? 'Journey Saved to Profile' : 'Confirm & Save Journey'}");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
