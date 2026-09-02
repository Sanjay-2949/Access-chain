const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("<span>${r.transitLine ` ${r.transitLine} ` : ''}${r.durationMin}m</span>", "<span>${r.transitLine ? ` ${r.transitLine} ` : ''}${r.durationMin}m</span>");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
