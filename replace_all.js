const fs = require('fs');

const removeEmojis = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove typical UI emojis that were used
    const emojis = ['?', '??', '??', '??', '??', '??', '??', '??', '???', '??', '??', '??', '??', '?', '???', '??', '??', '?????', '?????'];
    for (const emoji of emojis) {
      content = content.split(emoji).join('');
    }
    // Remove trailing spaces left by deleted emojis
    content = content.replace(/  +/g, ' ');
    fs.writeFileSync(filePath, content);
  }
};

removeEmojis('src/ui-pages/SavedJourneys.tsx');
removeEmojis('src/ui-pages/TransportModification.tsx');
removeEmojis('src/ui-pages/ActiveJourney.tsx');
removeEmojis('src/components/journey/ArrivalVerificationModal.tsx');
removeEmojis('src/ui-pages/Home.tsx');
removeEmojis('src/ui-pages/JourneyRoadmap.tsx');
removeEmojis('src/ui-pages/MapView.tsx');
removeEmojis('src/components/ai/AccessChainChatbot.tsx');

