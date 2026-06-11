"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp, getSession, isSupabaseConfigured } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Déjà connecté (ou mode démo sans Supabase) → portail
    if (!isSupabaseConfigured) { router.replace('/dashboard'); return; }
    getSession().then(session => { if (session) router.replace('/dashboard'); });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'signin') {
      const err = await signIn(email, password);
      setLoading(false);
      if (err) { setError(err); return; }
      router.replace('/dashboard');
    } else {
      const err = await signUp(email, password);
      setLoading(false);
      if (err) { setError(err); return; }
      setInfo("Compte créé. Si la confirmation par e-mail est activée, vérifiez votre boîte de réception, puis connectez-vous.");
      setMode('signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#17314a] text-[#f7f3ec] flex flex-col">
      {/* Constellation */}
      {[
        { top: '10%', left: '15%' }, { top: '20%', left: '80%' }, { top: '35%', left: '8%' },
        { top: '55%', left: '90%' }, { top: '75%', left: '20%' }, { top: '85%', left: '70%' },
        { top: '15%', left: '50%' }, { top: '65%', left: '45%' },
      ].map((s, i) => (
        <span key={i} className="absolute w-0.5 h-0.5 rounded-full bg-[#f4b942] opacity-60" style={s} aria-hidden="true" />
      ))}

      <nav className="flex items-center justify-between px-6 lg:px-16 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#f4b942]" aria-hidden="true">★</span>
          <span className="font-headline text-2xl">Geronimo</span>
        </Link>
        <Link href="/" className="text-[#f7f3ec]/70 hover:text-[#f4b942] font-body text-sm transition-colors">
          ← Retour à l&rsquo;accueil
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <h1 className="font-headline font-light text-4xl mb-2">
            {mode === 'signin' ? 'Bon retour' : 'Bienvenue'}<span className="text-[#f4b942]">.</span>
          </h1>
          <p className="font-body text-[#f7f3ec]/70 mb-8">
            {mode === 'signin'
              ? 'Connectez-vous pour retrouver vos élèves et vos analyses.'
              : 'Créez votre compte enseignant — vos élèves ne seront visibles que par vous.'}
          </p>

          <form onSubmit={handleSubmit} className="bg-[#f7f3ec] text-[#17314a] rounded-md p-8 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold tracking-widest uppercase text-[#51606f]">Votre e-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="camille@ecole.fr"
                className="bg-white border border-[#b3aea1]/50 rounded-md px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-[#17314a]/30"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs font-semibold tracking-widest uppercase text-[#51606f]">Mot de passe</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="bg-white border border-[#b3aea1]/50 rounded-md px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-[#17314a]/30"
              />
            </label>

            {error && (
              <p className="font-body text-sm text-[#b5492f] bg-[#e87a5d]/15 border border-[#e87a5d]/40 rounded-md px-4 py-3" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="font-body text-sm text-[#27443a] bg-[#c2d9d0]/40 border border-[#7fa99b]/50 rounded-md px-4 py-3" role="status">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-4 bg-[#17314a] text-[#f7f3ec] font-body font-bold rounded-full hover:bg-[#102338] transition-colors disabled:opacity-60"
            >
              {loading ? 'Un instant…' : mode === 'signin' ? 'Se connecter →' : 'Créer mon compte →'}
            </button>

            <button
              type="button"
              onClick={() => { setMode(m => (m === 'signin' ? 'signup' : 'signin')); setError(null); setInfo(null); }}
              className="font-body text-sm text-[#51606f] hover:text-[#17314a] transition-colors"
            >
              {mode === 'signin' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </form>

          <p className="font-body text-xs text-[#f7f3ec]/50 mt-6 text-center">
            Les données de vos élèves sont protégées : chaque enseignant n&rsquo;accède qu&rsquo;à ses propres élèves.
          </p>
        </div>
      </main>
    </div>
  );
}
