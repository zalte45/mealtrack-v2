'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Utensils, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
        router.push('/counter');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email: demoEmail,
      password: demoPassword,
      redirect: false,
    });

    if (res?.error) {
      setError('Quick login failed.');
      setLoading(false);
    } else {
      router.push('/counter');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8FF] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3525CD] to-indigo-500 text-white shadow-lg shadow-indigo-600/30">
            <Utensils className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Meal<span className="text-[#3525CD]">Track</span> SaaS
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Provider Operational Login & Counter Shell
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@mealtrack.com"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3525CD] py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-[#2A1DB5] focus:outline-none focus:ring-2 focus:ring-[#3525CD] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Counter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Demo Accounts */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner@mealtrack.com', 'password123')}
                className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-center text-xs transition hover:bg-indigo-100/60"
              >
                <span className="font-bold text-[#3525CD]">Owner Role</span>
                <span className="text-[11px] text-slate-500">owner@mealtrack.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff@mealtrack.com', 'password123')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center text-xs transition hover:bg-slate-100"
              >
                <span className="font-bold text-slate-700">Staff Role</span>
                <span className="text-[11px] text-slate-500">staff@mealtrack.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          MealTrack V2 • Ledger-First Provider Operational System
        </p>
      </div>
    </div>
  );
}
