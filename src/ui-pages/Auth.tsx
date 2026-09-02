import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/useAppStore';

export default function Auth() {
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'login';
  const [tab, setTab] = useState<'login' | 'register'>(mode as 'login' | 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    if (tab === 'register' && !name) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login({ id: Date.now().toString(), name: name || email.split('@')[0], email, provider: 'email', role: 'user' });
    navigate('/home');
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || (typeof window !== 'undefined' ? (window as any).__ENV__?.GOOGLE_CLIENT_ID : '');
      if (clientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const decoded = JSON.parse(jsonPayload);
              login({ id: decoded.sub, name: decoded.name, email: decoded.email, provider: 'google', role: 'user' });
              navigate('/home');
            } catch (e) {
              console.error("Failed to decode Google JWT", e);
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: 320 }
        );
      }
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sidebar-bg)' }}>
      <div className="w-full max-w-sm px-6">
        {/* Back */}
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1.5 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>

        <div className="bg-[#1A2332] border border-white/10 rounded-xl p-7">
          <div className="mb-6">
            <h1 className="font-display text-xl font-bold text-white mb-1">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-400 text-sm">
              {tab === 'login' ? 'Sign in to your AccessChain account.' : 'Start your accessible journey planning.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[#0D1823] rounded-lg p-1 mb-5 gap-1">
            {(['login', 'register'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded transition-all duration-150 ${tab === t ? 'bg-[var(--primary)] text-white' : 'text-slate-400 hover:text-white'}`}>
                {t === 'login' ? 'Log in' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google */}
          <div className="flex justify-center mb-3">
            <div id="google-signin-button" className="min-h-[40px] flex items-center justify-center w-full">
              {!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || (typeof window !== 'undefined' && (window as any).__ENV__?.GOOGLE_CLIENT_ID)) && (
                <span className="text-xs text-slate-500">Google Login requires Client ID in .env</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10"/>
            <span className="text-slate-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10"/>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === 'register' && (
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" type="text"
                  className="w-full px-3 py-2 bg-[#0D1823] border border-white/10 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" type="email"
                className="w-full px-3 py-2 bg-[#0D1823] border border-white/10 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" type="password"
                className="w-full px-3 py-2 bg-[#0D1823] border border-white/10 rounded text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button variant="primary" size="md" fullWidth type="submit" disabled={loading} className="mt-1">
              {loading ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
