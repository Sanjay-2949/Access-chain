const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace(/segment\.label\.includes\('Quiet'\)\s+\(/g, "segment.label.includes('Quiet') ? (");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
