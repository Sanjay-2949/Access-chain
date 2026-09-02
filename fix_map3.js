const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace("a.id === selectedRouteId 1 : b.id === selectedRouteId -1 : 0", "a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0");
content = content.replace("color: isSelected '#0284c7' : '#94a3b8'", "color: isSelected ? '#0284c7' : '#94a3b8'");
content = content.replace("weight: isSelected 6 : 4", "weight: isSelected ? 6 : 4");
content = content.replace("opacity: isSelected 0.95 : 0.6", "opacity: isSelected ? 0.95 : 0.6");
content = content.replace("dashArray: isSelected undefined : '6, 8'", "dashArray: isSelected ? undefined : '6, 8'");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
