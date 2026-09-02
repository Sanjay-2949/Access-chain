const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace(/\{segment\.distance\s+<span/g, "{segment.distance ? <span");
content = content.replace(/\{segment\.operator\s+<span/g, "{segment.operator ? <span");
content = content.replace(/\{segment\.fare\s+<span/g, "{segment.fare ? <span");
content = content.replace(/\{isSelected\s+<ChevronUp/g, "{isSelected ? <ChevronUp");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
