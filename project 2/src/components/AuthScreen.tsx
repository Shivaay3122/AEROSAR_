import { useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Radio, Loader2, Lock, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onAuthed: (session: Session) => void;
}

export default function AuthScreen({ onAuthed }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [mode, email, password]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-base overflow-hidden relative">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--accent-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--accent-cyan) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-radar/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-xl bg-cyan-dim border border-cyan/30 flex items-center justify-center mb-4 shadow-glow">
            <Radio className="w-8 h-8 text-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">AEROSAR</h1>
          <p className="text-muted text-sm mt-1">Aircraft Search &amp; Rescue Intelligence System</p>
        </div>

        {/* Auth card */}
        <div className="bg-panel border border-subtle rounded-xl shadow-elevated p-6 animate-slide-up">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-input rounded-lg mb-6">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-cyan text-base'
                  : 'text-muted hover:text-primary'
              }`}
              style={mode === 'signin' ? { color: '#080D18' } : undefined}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-cyan text-base'
                  : 'text-muted hover:text-primary'
              }`}
              style={mode === 'signup' ? { color: '#080D18' } : undefined}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-subtle rounded-lg text-sm text-primary placeholder-faint focus:outline-none focus:border-cyan/50 transition-colors"
                  placeholder="operator@aerosar.io"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-input border border-subtle rounded-lg text-sm text-primary placeholder-faint focus:outline-none focus:border-cyan/50 transition-colors"
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-critical-dim border border-critical/20 rounded-lg text-xs text-critical">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan text-base font-semibold rounded-lg hover:bg-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              style={{ color: '#080D18' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin-sm" />
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-faint mt-4">
            {mode === 'signup' ? 'Account created instantly — no email confirmation required.' : 'Use your operator credentials to access the system.'}
          </p>
        </div>

        <p className="text-center text-[10px] text-faint mt-6">
          AEROSAR is a prototype for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
