const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/SavedJourneys.tsx', 'utf8');
content = content.replace("{rechecking === j.id 'Checking...' : 'Re-check'}", "{rechecking === j.id ? 'Checking...' : 'Re-check'}");
fs.writeFileSync('src/ui-pages/SavedJourneys.tsx', content);
