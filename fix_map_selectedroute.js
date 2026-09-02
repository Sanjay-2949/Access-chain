const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("selectedRoute.durationMin", "selectedRoute?.durationMin");
content = content.replace("selectedRoute.distanceKm", "selectedRoute?.distanceKm");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
