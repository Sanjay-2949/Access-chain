const fs = require('fs');
let content = fs.readFileSync('src/components/journey/ArrivalVerificationModal.tsx', 'utf8');
content = content.replace('worked === true \n "bg', 'worked === true ? \n "bg');
content = content.replace('worked === true \r\n "bg', 'worked === true ? \n "bg');
content = content.replace(/worked === true\s+"bg/g, 'worked === true ? "bg');

content = content.replace('worked === false \n "bg', 'worked === false ? \n "bg');
content = content.replace('worked === false \r\n "bg', 'worked === false ? \n "bg');
content = content.replace(/worked === false\s+"bg/g, 'worked === false ? "bg');

content = content.replace('{worked === true \n "border', '{worked === true ? "border');
content = content.replace('{worked === true \r\n "border', '{worked === true ? "border');
content = content.replace(/worked === true\s+"border/g, 'worked === true ? "border');

content = content.replace('{worked === false \n "border', '{worked === false ? "border');
content = content.replace('{worked === false \r\n "border', '{worked === false ? "border');
content = content.replace(/worked === false\s+"border/g, 'worked === false ? "border');

fs.writeFileSync('src/components/journey/ArrivalVerificationModal.tsx', content);
