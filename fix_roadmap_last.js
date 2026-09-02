const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace(/\{saved\s+['"].*?'\s+:\s+'Confirm & Save Journey'\}/, "{saved ? 'Journey Saved to Profile' : 'Confirm & Save Journey'}");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
