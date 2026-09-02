const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.replace("{opt.availableWheelchairBays > 0 ? \ Open : 'None'}", "{opt.availableWheelchairBays > 0 ? \\ Open\ : 'None'}");

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
