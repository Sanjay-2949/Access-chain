const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace(" : isSpeech ? ' Contactless QR Self-Check-In Portal'\n :\n : ' Field-Verified", " : isSpeech ? ' Contactless QR Self-Check-In Portal'\n : ' Field-Verified");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
