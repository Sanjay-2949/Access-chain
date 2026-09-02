const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace(/\{isAccessible .*? : .*?\}/g, "{isAccessible ? 'Accessible' : 'Inaccessible'}");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
