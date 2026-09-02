const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace("Badge variant={isAccessible 'feasible' : 'danger'}", "Badge variant={isAccessible ? 'feasible' : 'danger'}");
content = content.replace("{isAccessible 'o\" Accessible' : 'o- Inaccessible'}", "{isAccessible ? 'Accessible' : 'Inaccessible'}");
content = content.replace("{isAccessible 'o\" Accessible' : 'o- Inaccessible'}", "{isAccessible ? 'Accessible' : 'Inaccessible'}");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
