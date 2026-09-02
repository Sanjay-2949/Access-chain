const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/JourneyRoadmap.tsx', 'utf8');

content = content.replace("isSelected\n 'border", "isSelected\n ? 'border");
content = content.replace("isSelected\r\n 'border", "isSelected\r\n ? 'border");
content = content.replace(/isSelected\s+'border/g, "isSelected ? 'border");

content = content.replace("isFeasible\n 'bg", "isFeasible\n ? 'bg");
content = content.replace("isFeasible\r\n 'bg", "isFeasible\r\n ? 'bg");
content = content.replace(/isFeasible\s+'bg/g, "isFeasible ? 'bg");

content = content.replace("isFeasible (", "isFeasible ? (");
content = content.replace("isFeasible\n (", "isFeasible\n ? (");

// fix TYPE_ICONS
content = content.replace(/const TYPE_ICONS: Record<string, string> = \{.*?^\};/ms, `const TYPE_ICONS: Record<string, string> = {
  walk: 'Walk',
  metro: 'Metro',
  bus: 'Bus',
  train: 'Train',
  uber: 'Cab',
  ramp: 'Ramp',
  elevator: 'Elevator',
  transfer: 'Transfer',
};`);

// also fix any dangling template literal issues if I broke one
content = content.replace(/\{s\.accessibility === \'ACCESSIBLE\' \`.*?\` : \`.*?\`\}/, "{s.accessibility === 'ACCESSIBLE' ? `text-emerald-500` : `text-amber-500`}");
content = content.replace(/segment\.accessibility === \'ACCESSIBLE\' \`.*?\` : \`.*?\`/, "segment.accessibility === 'ACCESSIBLE' ? `text-emerald-500` : `text-amber-500`");

fs.writeFileSync('src/ui-pages/JourneyRoadmap.tsx', content);
