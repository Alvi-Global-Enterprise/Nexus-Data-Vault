'use client';

import React from 'react';
import { OverviewStats } from '@/types';
import { TabType } from './TabsNav';
import { ShoppingCart, Users, CreditCard, Mail, DollarSign, MapPin, Globe, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

interface OverviewViewProps {
  stats: OverviewStats | null;
  onNavigateTab: (tab: TabType) => void;
}

export function OverviewView({ stats, onNavigateTab }: OverviewViewProps) {
  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span>Loading intelligent analytics...</span>
        </div>
      </div>
    );
  }

  const pb = stats.coincustody.paymentBreakdown;
  const maxPb = Math.max(...Object.values(pb), 1);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crypto &amp; Commerce Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time categorized index of all datasets integrated with MailForge AI REST APIs &amp; Campaign Dispatcher.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400">
          <span>⚡ {stats.counts.total.toLocaleString()} records indexed in {stats.indexTimeMs}ms</span>
        </div>
      </div>

      {/* MailForge AI REST API Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('campaigns')}
          className="group cursor-pointer rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/60 p-5 backdrop-blur-xl transition-all hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">MailForge AI Campaigns</span>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  4 UI Templates
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch personalized emails with responsive templates &amp; AI copywriting.
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab('contacts')}
          className="group cursor-pointer rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-5 backdrop-blur-xl transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Audience &amp; Contacts Book</span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                  Excel/CSV Import
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Smart header detection, contact management, and audience targeting.
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>

      {/* Hero Metric Cards Grid (New Datasets Included) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. CMS Crypto Subscribers */}
        <div
          onClick={() => onNavigateTab('cms-crypto')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CMS Crypto Subscribers</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {(stats.counts.cmsCrypto || 0).toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">
              Jan 26 ({(stats.counts.cmsCrypto2026 || 0).toLocaleString()}) &amp; May 25
            </span>
            <span className="font-mono text-slate-500">CMS Files</span>
          </div>
        </div>

        {/* 2. Coinbase Crypto Leads */}
        <div
          onClick={() => onNavigateTab('crypto-leads')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Coinbase Crypto Leads</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {(stats.counts.cryptoLeads || 0).toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-400">
              Jan 26 &amp; May 25 Batches
            </span>
            <span className="font-mono text-slate-500">CRYPTO_*.csv</span>
          </div>
        </div>

        {/* 3. eToro Investors */}
        <div
          onClick={() => onNavigateTab('etoro')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">eToro Global Deposits</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {(stats.counts.etoro || 0).toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400">
              ${(stats.etoro?.totalDepositsUsd || 0).toLocaleString()} Volume
            </span>
            <span className="font-mono text-slate-500">etoro.csv</span>
          </div>
        </div>

        {/* 4. Shopify & Binance Orders */}
        <div
          onClick={() => onNavigateTab('coincustody')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shopify &amp; Binance Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {stats.counts.coincustody.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400">
              {stats.coincustody.binanceCount} Binance Checkouts
            </span>
            <span className="font-mono text-slate-500">coincustody.io</span>
          </div>
        </div>

        {/* 5. Enriched Leads */}
        <div
          onClick={() => onNavigateTab('sample')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-violet-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Identity &amp; Net-Worth Leads</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {stats.counts.sample.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-400">Full Address &amp; Phones</span>
            <span className="font-mono text-slate-500">sample.csv</span>
          </div>
        </div>

        {/* 6. Shakepay Users */}
        <div
          onClick={() => onNavigateTab('shakepay')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Digital Banking Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {stats.counts.shakepay.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-400">Shaketags &amp; Referral Trees</span>
            <span className="font-mono text-slate-500">shakepay_full.txt</span>
          </div>
        </div>

        {/* 7. BlockFi Emails */}
        <div
          onClick={() => onNavigateTab('blockfi')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">BlockFi Crypto Emails</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {stats.counts.blockfi.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">Verified Platform Emails</span>
            <span className="font-mono text-slate-500">blockfi_full.txt</span>
          </div>
        </div>
      </div>

      {/* Analytical Detail Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. eToro Deposit Gateways */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">eToro Deposit Platforms</h2>
              <p className="text-xs text-slate-400">Gateway distribution in etoro.csv</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {stats.etoro?.platformBreakdown &&
              Object.entries(stats.etoro.platformBreakdown).map(([platform, count]) => {
                const totalEtoro = stats.counts.etoro || 1;
                const pct = Math.round((count / totalEtoro) * 100);
                return (
                  <div key={platform} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{platform}</span>
                      <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => onNavigateTab('etoro')}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>Explore eToro Dataset</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 2. CMS Crypto Exchange Referrals */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CMS Crypto Source Exchanges</h2>
              <p className="text-xs text-slate-400">Exchange origins across 45.9k records</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {stats.cmsCrypto?.topSources.map(({ source, count }) => (
              <div
                key={source}
                onClick={() => onNavigateTab('cms-crypto')}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs hover:bg-white/5 hover:border-emerald-500/30 transition-all"
              >
                <span className="font-semibold text-slate-200">{source}</span>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                  {count.toLocaleString()} leads
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('cms-crypto')}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>Explore CMS Subscribers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3. Top US States in Leads */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Geographic Lead Distribution</h2>
              <p className="text-xs text-slate-400">High-concentration US states in sample.csv</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {stats.sample.topStates.map(({ state, count }) => (
              <div
                key={state}
                onClick={() => onNavigateTab('sample')}
                className="flex items-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
              >
                <span className="font-bold text-violet-400">{state}</span>
                <span className="font-mono text-slate-400 text-[11px]">{count} leads</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('sample')}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>Explore Enriched Leads</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

