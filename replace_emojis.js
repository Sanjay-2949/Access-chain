const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/TransportModification.tsx', 'utf8');

content = content.split('o" 100% Accessible').join('100% Accessible');
content = content.split('? 100% Accessible').join('100% Accessible');
content = content.split('?? ').join('');
content = content.split('?? ').join('');
content = content.split('?? ').join('');
content = content.split('? ').join('');
content = content.split('?').join('');
content = content.split('').join('');
content = content.split('? ').join('');

fs.writeFileSync('src/ui-pages/TransportModification.tsx', content);
