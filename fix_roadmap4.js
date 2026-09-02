const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace("{segment.wheelchairBoarding !== false 'Yes' : 'No'}", "{segment.wheelchairBoarding !== false ? 'Yes' : 'No'}");
content = content.replace("Badge variant={isFeasible 'feasible' : 'danger'}", "Badge variant={isFeasible ? 'feasible' : 'danger'}");
content = content.replace("{isFeasible 'FEASIBLE' : 'NOT FEASIBLE'}", "{isFeasible ? 'FEASIBLE' : 'NOT FEASIBLE'}");
content = content.replace("setSelectedSeg(selectedSeg === seg.id null : seg.id)", "setSelectedSeg(selectedSeg === seg.id ? null : seg.id)");
content = content.replace(/\{saved .*?'Journey Saved to Profile' : 'Confirm & Save Journey'\}/, "{saved ? 'Journey Saved to Profile' : 'Confirm & Save Journey'}");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
