const fs = require('fs');
let content = fs.readFileSync('src/ui-pages/MapView.tsx', 'utf8');

content = content.replace(/const destEmoji = isCognitive.*?<\/svg>;/s, "const destEmoji = isCognitive ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z\"/><path d=\"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z\"/></svg>' : isVision ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>' : isHearing ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0\"/><path d=\"M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4\"/></svg>' : isSpeech ? '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z\"/></svg>' : '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>';");

content = content.replace("isCognitive 'CALM", "isCognitive ? 'CALM");
content = content.replace("isVision 'TACTILE", "isVision ? 'TACTILE");
content = content.replace("isHearing 'LED", "isHearing ? 'LED");
content = content.replace("isSpeech 'QR", "isSpeech ? 'QR");

content = content.replace(/isCognitive\s+' Verified/, "isCognitive ? ' Verified");
content = content.replace(/isVision\s+' Continuous/, "isVision ? ' Continuous");
content = content.replace(/isHearing\s+' Real-Time/, "isHearing ? ' Real-Time");
content = content.replace(/isSpeech\s+' Contactless/, "isSpeech ? ' Contactless");
content = content.replace(/\s+' Field-Verified Wheelchair Ramp Entrance';/, "\n : ' Field-Verified Wheelchair Ramp Entrance';");

content = content.replace(/\\$\{r\.transitLine `/, "\\${r.transitLine ? `");
content = content.replace(/\{origin\.name\.split\(\',\/\)\[0\]\} \{destination\.name/, "{origin.name.split(',')[0]} -> {destination.name");

fs.writeFileSync('src/ui-pages/MapView.tsx', content);
