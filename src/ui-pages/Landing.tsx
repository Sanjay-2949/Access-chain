import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--sidebar-bg)' }}>
      <div className="flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-8 shadow-lg shadow-teal-900/40">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">AccessChain</h1>
        <p className="text-[var(--primary)] text-base font-medium mb-3">Accessible journeys. Empowered lives.</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          We don't just find a route. We determine whether the entire journey actually works for you — and help you recover when it doesn't.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/auth?mode=login')}>
            Log in
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/auth?mode=register')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            New user
          </Button>
        </div>

        <p className="text-slate-500 text-xs mt-8">
          Accessibility-first travel intelligence platform
        </p>
      </div>
    </div>
  );
}
