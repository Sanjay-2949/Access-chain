import { SUPPORTED_LANGUAGES } from './languages';

export interface UIStrings {
  appTitle: string;
  tagline: string;
  navDemo: string;
  navJourney: string;
  navSports: string;
  navTourism: string;
  navOperator: string;
  navAnalytics: string;
  navReports: string;
  navPitchDeck: string;
  planJourney: string;
  launchDemo: string;
  feasibility: string;
  feasible: string;
  notFeasible: string;
  unknown: string;
  qualityScore: string;
  resilienceScore: string;
  fixJourney: string;
  simulateOutage: string;
  profileLabel: string;
  highContrast: string;
  languageLabel: string;
  journeyTitle: string;
  journeySubtitle: string;
  originLabel: string;
  destinationLabel: string;
  evaluateJourneyBtn: string;
  spofLabel: string;
  confidenceLabel: string;
}

export const TRANSLATIONS: Record<string, UIStrings> = {
  'en-US': {
    appTitle: 'AccessChain',
    tagline: "Don't just find an accessible destination. Complete an accessible journey.",
    navDemo: 'SIH Judge Demo',
    navJourney: 'Journey Planner',
    navSports: 'Sports & Matches',
    navTourism: 'Step-Free Tourism',
    navOperator: 'Venue Control',
    navAnalytics: 'Gap Analytics',
    navReports: 'Incident Queue',
    navPitchDeck: 'Pitch Deck PDF',
    planJourney: 'Plan Accessible Journey',
    launchDemo: 'Launch SIH Demo',
    feasibility: 'Journey Feasibility',
    feasible: 'FEASIBLE',
    notFeasible: 'NOT FEASIBLE',
    unknown: 'ACCESSIBILITY UNKNOWN',
    qualityScore: 'Accessibility Quality Score',
    resilienceScore: 'Journey Resilience Score',
    fixJourney: 'FIX MY JOURNEY',
    simulateOutage: 'Simulate Live Outage',
    profileLabel: 'Profile',
    highContrast: 'High Contrast',
    languageLabel: 'Language',
    journeyTitle: 'End-to-End Accessible Journey Planner',
    journeySubtitle: 'Evaluates continuous accessibility from origin to seat across transport, nodes, ramps, lifts, and toilets.',
    originLabel: 'Origin Location',
    destinationLabel: 'Destination Venue / Seat',
    evaluateJourneyBtn: 'Evaluate Journey Graph',
    spofLabel: 'Single Points of Failure',
    confidenceLabel: 'Data Confidence',
  },
  'ta-IN': {
    appTitle: 'ஆக்சஸ் செயின் (AccessChain)',
    tagline: 'அணுகக்கூடிய இடத்தை மட்டும் கண்டறிய வேண்டாம். முழுமையான அணுகக்கூடிய பயணத்தை நிறைவு செய்யுங்கள்.',
    navDemo: 'SIH நடுவர் டெமோ',
    navJourney: 'பயணத் திட்டம்',
    navSports: 'விளையாட்டு & போட்டிகள்',
    navTourism: 'தடையற்ற சுற்றுலா',
    navOperator: 'அரங்கக் கட்டுப்பாடு',
    navAnalytics: 'இடைவெளி பகுப்பாய்வு',
    navReports: 'சம்பவ அறிக்கை',
    navPitchDeck: 'Pitch Deck PDF',
    planJourney: 'அணுகக்கூடிய பயணத்தை திட்டமிடுக',
    launchDemo: 'SIH டெமோவைத் தொடங்கவும்',
    feasibility: 'பயண சாத்தியக்கூறு',
    feasible: 'சாத்தியமானது (FEASIBLE)',
    notFeasible: 'சாத்தியமற்றது (NOT FEASIBLE)',
    unknown: 'அணுகல் தகவல் தெரியவில்லை',
    qualityScore: 'அணுகல் தர மதிப்பெண்',
    resilienceScore: 'பயண மீள்தன்மை மதிப்பெண்',
    fixJourney: 'எனது பயணத்தை சரிசெய்',
    simulateOutage: 'நேரலை தடங்கலை மாதிரி செய்',
    profileLabel: 'சுயவிவரம்',
    highContrast: 'உயர் மாறுபாடு',
    languageLabel: 'மொழி',
    journeyTitle: 'முழுமையான அணுகக்கூடிய பயணத் திட்டம்',
    journeySubtitle: 'தொடக்கப் புள்ளியிலிருந்து இருக்கை வரை போக்குவரத்து, தூண்கள், சாய்வுபாதைகள் மற்றும் மின்தூக்கிகள் முழுவதும் மதிப்பிடுகிறது.',
    originLabel: 'தொடக்க இடம்',
    destinationLabel: 'சேருமிடம் / இருக்கை',
    evaluateJourneyBtn: 'பயண வரைபடத்தை மதிப்பிடுக',
    spofLabel: 'ஒற்றைப் புள்ளி தோல்விகள் (SPOF)',
    confidenceLabel: 'தரவு நம்பகத்தன்மை',
  },
  'kn-IN': {
    appTitle: 'ಆಕ್ಸೆಸ್ ಚೈನ್ (AccessChain)',
    tagline: 'ಕೇವಲ ಸುಗಮ ತಲುಪುವ ಸ್ಥಳ ಹುಡುಕಬೇಡಿ. ಸಂಪೂರ್ಣ ಸುಗಮ ಪ್ರಯಾಣವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
    navDemo: 'SIH ಜಡ್ಜ್ ಡೆಮೊ',
    navJourney: 'ಪ್ರಯಾಣ ಯೋಜನೆ',
    navSports: 'ಕ್ರೀಡೆ & ಪಂದ್ಯಗಳು',
    navTourism: 'ಮೆಟ್ಟಿಲು-ರಹಿತ ಪ್ರವಾಸೋದ್ಯಮ',
    navOperator: 'ಸ್ಥಳ ನಿಯಂತ್ರಣ',
    navAnalytics: 'ಕೊರತೆ ವಿಶ್ಲೇಷಣೆ',
    navReports: 'ಘಟನೆ ವರದಿ',
    navPitchDeck: 'Pitch Deck PDF',
    planJourney: 'ಸುಗಮ ಪ್ರಯಾಣ ಯೋಜನೆ ಮಾಡಿ',
    launchDemo: 'SIH ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ',
    feasibility: 'ಪ್ರಯಾಣದ ಸಾಧ್ಯತೆ',
    feasible: 'ಸಾಧ್ಯವಿದೆ (FEASIBLE)',
    notFeasible: 'ಸಾಧ್ಯವಿಲ್ಲ (NOT FEASIBLE)',
    unknown: 'ಸುಗಮತೆ ಅಜ್ಞಾತ',
    qualityScore: 'ಸುಗಮತೆ ಗುಣಮಟ್ಟ ಸ್ಕೋರ್',
    resilienceScore: 'ಪ್ರಯಾಣದ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ಸ್ಕೋರ್',
    fixJourney: 'ನನ್ನ ಪ್ರಯಾಣ ಸರಿಪಡಿಸಿ',
    simulateOutage: 'ಲೈವ್ ಅಡಚಣೆ ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ',
    profileLabel: 'ಪ್ರೊಫೈಲ್',
    highContrast: 'ಹೆಚ್ಚಿನ ವ್ಯತಿರಿಕ್ತತೆ',
    languageLabel: 'ಭಾಷೆ',
    journeyTitle: 'ಸಂಪೂರ್ಣ ಸುಗಮ ಪ್ರಯಾಣ ಯೋಜಕ',
    journeySubtitle: 'ಆರಂಭದಿಂದ ಆಸನದವರೆಗೆ ಸಾರಿಗೆ, ಎಲಿವೇಟರ್ ಮತ್ತು ಶೌಚಾಲಯಗಳ ಸುಗಮತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ.',
    originLabel: 'ಆರಂಭದ ಸ್ಥಳ',
    destinationLabel: 'ತಲುಪುವ ಸ್ಥಳ / ಆಸನ',
    evaluateJourneyBtn: 'ಪ್ರಯಾಣ ಗ್ರಾಫ್ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
    spofLabel: 'ಏಕ ಪಾಯಿಂಟ್ ವೈಫಲ್ಯಗಳು',
    confidenceLabel: 'ಡೇಟಾ ವಿಶ್ವಾಸಾರ್ಹತೆ',
  },
  'te-IN': {
    appTitle: 'యాక్సెస్ చైన్ (AccessChain)',
    tagline: 'కేవలం అందుబాటులో ఉన్న ప్రాంతాన్ని వెతకకండి. పూర్తి అందుబాటులో ఉన్న ప్రయాణాన్ని పూర్తి చేయండి.',
    navDemo: 'SIH జడ్జి డెమో',
    navJourney: 'ప్రయాణ ప్రణాళిక',
    navSports: 'క్రీడలు & మ్యాచ్‌లు',
    navTourism: 'అడ్డంకులు లేని పర్యాటకం',
    navOperator: 'వేదిక నియంత్రణ',
    navAnalytics: 'గ్యాప్ విశ్లేషణ',
    navReports: 'సంఘటన నివేదిక',
    navPitchDeck: 'Pitch Deck PDF',
    planJourney: 'సులభమైన ప్రయాణాన్ని ప్లాన్ చేయండి',
    launchDemo: 'SIH డెమో ప్రారంభించండి',
    feasibility: 'ప్రయాణ సాధ్యత',
    feasible: 'సాధ్యపడుతుంది (FEASIBLE)',
    notFeasible: 'సాధ్యపడదు (NOT FEASIBLE)',
    unknown: 'సమాచారం తెలియదు',
    qualityScore: 'యాక్సెసిబిలిటీ క్వాలిటీ స్కోర్',
    resilienceScore: 'ప్రయాణ స్థితిస్థాపకత స్కోర్',
    fixJourney: 'నా ప్రయాణాన్ని సరిచేయండి',
    simulateOutage: 'లైవ్ అంతరాయాన్ని సిమ్యులేట్ చేయండి',
    profileLabel: 'ప్రొఫైల్',
    highContrast: 'అధిక కాంట్రాస్ట్',
    languageLabel: 'భాష',
    journeyTitle: 'ఎండ్-టు-ఎండ్ సులభమైన ప్రయాణ ప్లానర్',
    journeySubtitle: 'ప్రారంభం నుండి సీటు వరకు రవాణా, లిఫ్ట్‌లు మరియు వాష్‌రూమ్‌ల యాక్సెసిబిలిటీని మూల్యాంకనం చేస్తుంది.',
    originLabel: 'ప్రారంభ ప్రాంతం',
    destinationLabel: 'చేరుకునే వేదిక / సీటు',
    evaluateJourneyBtn: 'ప్రయాణ గ్రాఫ్‌ను విశ్లేషించండి',
    spofLabel: 'సింగిల్ పాయింట్ వైఫల్యాలు',
    confidenceLabel: 'డేటా నమ్మకం',
  },
  'hi-IN': {
    appTitle: 'एक्सेसचेन (AccessChain)',
    tagline: 'केवल सुगम गंतव्य न खोजें। पूरी सुगम यात्रा पूर्ण करें।',
    navDemo: 'SIH जज डेमो',
    navJourney: 'यात्रा योजना',
    navSports: 'खेल एवं मैच',
    navTourism: 'सीढ़ी-मुक्त पर्यटन',
    navOperator: 'स्थल नियंत्रण',
    navAnalytics: 'अंतर विश्लेषण',
    navReports: 'घटना कतार',
    navPitchDeck: 'Pitch Deck PDF',
    planJourney: 'सुगम यात्रा की योजना बनाएं',
    launchDemo: 'SIH डेमो प्रारंभ करें',
    feasibility: 'यात्रा व्यवहार्यता',
    feasible: 'सुगम / संभव (FEASIBLE)',
    notFeasible: 'असुगम / असंभव (NOT FEASIBLE)',
    unknown: 'अज्ञात सुगमता',
    qualityScore: 'सुगमता गुणवत्ता स्कोर',
    resilienceScore: 'यात्रा लचीलापन स्कोर',
    fixJourney: 'मेरी यात्रा ठीक करें',
    simulateOutage: 'लाइव व्यवधान का अनुकरण करें',
    profileLabel: 'प्रोफ़ाइल',
    highContrast: 'उच्च कंट्रास्ट',
    languageLabel: 'भाषा',
    journeyTitle: 'एंड-टू-एंड सुगम यात्रा योजनाकार',
    journeySubtitle: 'आरंभ से सीट तक परिवहन, लिफ्ट और शौचालयों की निरंतर सुगमता का मूल्यांकन करता है।',
    originLabel: 'आरंभिक स्थान',
    destinationLabel: 'गंतव्य स्थल / सीट',
    evaluateJourneyBtn: 'यात्रा ग्राफ का मूल्यांकन करें',
    spofLabel: 'एकल विफलता बिंदु (SPOF)',
    confidenceLabel: 'डेटा विश्वसनीयता',
  },
};

export function getTranslation(key: keyof UIStrings, localeCode: string = 'en-US'): string {
  const langDict = TRANSLATIONS[localeCode] || TRANSLATIONS['en-US'];
  return langDict[key] || TRANSLATIONS['en-US'][key] || key;
}
