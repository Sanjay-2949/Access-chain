export interface LanguageConfig {
  code: string;           // IETF BCP 47 locale code
  name: string;           // English name
  nativeName: string;     // Native script name
  direction: 'ltr' | 'rtl'; // Text directionality
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'கன்னட / ಕನ್ನಡ', direction: 'ltr' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
];
