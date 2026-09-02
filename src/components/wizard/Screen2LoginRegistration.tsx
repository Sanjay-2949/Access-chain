'use client';
import { useJourneyWizardStore } from '@/lib/store/journeyWizardStore';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Apple } from 'lucide-react';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export default function Screen2LoginRegistration() {
  const { nextScreen, prevScreen, setUser } = useJourneyWizardStore();
  const [email, setEmail] = useState('');

  const handleEmailContinue = () => {
    if (email) {
      setUser({ id: 'email-user', email, name: email.split('@')[0], authMethod: 'email' });
      nextScreen();
    }
  };

  const handleGuest = () => {
    setUser({ id: 'guest-user', email: 'guest@example.com', name: 'Guest', authMethod: 'guest' });
    nextScreen();
  };

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      // Decode JWT payload (Base64Url to Base64 to JSON)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      
      setUser({ 
        id: decoded.sub, 
        email: decoded.email, 
        name: decoded.name, 
        authMethod: 'google' 
      });
      nextScreen();
    } catch (e) {
      console.error("Failed to decode Google JWT", e);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'filled_black', size: 'large', width: 320, shape: 'pill' }
        );
      }
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button onClick={prevScreen} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm text-slate-500">Step 2 of 12</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold">Welcome to AccessChain</h2>
          <p className="text-slate-400">Choose how you'd like to sign in</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
            <button 
              onClick={handleEmailContinue}
              disabled={!email}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Continue with Email
            </button>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex justify-center">
            <div id="google-signin-button" className="min-h-[40px] flex items-center justify-center w-full">
              {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <span className="text-sm text-slate-500">Google Login requires Client ID</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Apple className="w-5 h-5" />
              <span className="font-medium">Sign in with Apple</span>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Coming Soon</span>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button onClick={handleGuest} className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
