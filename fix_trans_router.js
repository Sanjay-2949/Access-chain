const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.replace("from 'reactrouter'", "from 'react-router'");

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
