const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("showTraffic\n 'bg-emerald", "showTraffic ?\n 'bg-emerald");
content = content.replace("showTraffic\r\n 'bg-emerald", "showTraffic ?\n 'bg-emerald");
content = content.replace(/showTraffic\s+'bg-emerald/g, "showTraffic ? 'bg-emerald");
content = content.replace("{showTraffic 'Traffic ON' : 'Traffic OFF'}", "{showTraffic ? 'Traffic ON' : 'Traffic OFF'}");

content = content.replace("r.id === selectedRouteId\n 'bg-sky-500", "r.id === selectedRouteId ?\n 'bg-sky-500");
content = content.replace("r.id === selectedRouteId\r\n 'bg-sky-500", "r.id === selectedRouteId ?\n 'bg-sky-500");
content = content.replace(/r.id === selectedRouteId\s+'text-sky-400'/g, "r.id === selectedRouteId ? 'text-sky-400'");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
