'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLogin, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    loginMutation.mutate(
      { email: username, password },
      {
        onSuccess: async (data) => {
          // Sync with local Next.js Edge session for dashboard route access
          try {
            await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username,
                password,
                token: data?.token || data?.access_token,
              }),
            });
          } catch (e) {
            console.error('Session sync error', e);
          }
          router.push('/');
          router.refresh();
        },
        onError: async (err: any) => {
          // If remote API credentials failed, try local fallback credentials
          try {
            const fallbackRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password }),
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success) {
              setAuthToken('local_authenticated_token');
              router.push('/');
              router.refresh();
              return;
            }
          } catch (fallbackErr) {
            // ignore
          }

          setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
        },
      }
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="ambient-glow-1 opacity-40" />
      <div className="ambient-glow-2 opacity-30" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/80">
        
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070b16]">
              <ShieldCheck className="h-7 w-7 text-cyan-400" />
            </div>
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-white">
            NEXUS DATA VAULT
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] text-indigo-300 border border-indigo-500/20">
              ALVI GLOBAL ENTERPRISE
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Authorized administrative access only. Routes and APIs are strictly protected.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Username / Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Account Identifier / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="fionawhite@yopmail.co or alviglobal.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {loginMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Verifying credentials with API...</span>
              </div>
            ) : (
              <>
                <span>Access Intelligence Console</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-6 border-t border-white/5 pt-4 text-center text-[11px] text-slate-500 font-mono">
          <span>Protected by Next.js Edge Middleware & HTTP-Only Session</span>
        </div>

      </div>
    </div>
  );
}
