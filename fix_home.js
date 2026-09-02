const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/Home.tsx', 'utf8');

content = content.replace(/\{accessibilityProfile\.mobility\.wheelchair\s+'Manual wheelchair.*?' : ''\}/, "{accessibilityProfile.mobility.wheelchair ? 'Manual wheelchair ' : ''}");
content = content.replace(/Badge variant=\{j\.feasible\s+'feasible' : 'danger'\}/g, "Badge variant={j.feasible ? 'feasible' : 'danger'}");
content = content.replace(/\{j\.feasible\s+'Feasible' : 'Not feasible'\}/g, "{j.feasible ? 'Feasible' : 'Not feasible'}");

fs.writeFileSync('src/ui-pages/Home.tsx', content);
