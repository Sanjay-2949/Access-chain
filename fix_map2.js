const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("const tileUrl = showTraffic\n 'https", "const tileUrl = showTraffic ?\n 'https");
content = content.replace("const tileUrl = showTraffic\r\n 'https", "const tileUrl = showTraffic ?\n 'https");
content = content.replace(/const tileUrl = showTraffic\s+'https/g, "const tileUrl = showTraffic ? 'https");

content = content.replace("origin.lat && origin.lat > 0 origin.lat :", "origin.lat && origin.lat > 0 ? origin.lat :");
content = content.replace("origin.lng && origin.lng > 0 origin.lng :", "origin.lng && origin.lng > 0 ? origin.lng :");
content = content.replace("destination.lat && destination.lat > 0 destination.lat :", "destination.lat && destination.lat > 0 ? destination.lat :");
content = content.replace("destination.lng && destination.lng > 0 destination.lng :", "destination.lng && destination.lng > 0 ? destination.lng :");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
