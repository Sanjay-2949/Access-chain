const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.replace("{opt.availableWheelchairBays > 0 ? ${opt.availableWheelchairBays} Open : 'None'}", "{opt.availableWheelchairBays > 0 ? `${opt.availableWheelchairBays} Open` : 'None'}");

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
