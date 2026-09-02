const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace(/segment\.label\.includes\('Audio'\)\s+\(/g, "segment.label.includes('Audio') ? (");
content = content.replace(/segment\.label\.includes\('Visual'\)\s+\(/g, "segment.label.includes('Visual') ? (");
content = content.replace(/segment\.label\.includes\('QR'\)\s+\(/g, "segment.label.includes('QR') ? (");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
