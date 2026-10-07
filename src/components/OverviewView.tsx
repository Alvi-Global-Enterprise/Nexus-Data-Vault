'use client';

import React from 'react';
import { OverviewStats } from '@/types';
import { TabType } from './TabsNav';
import { ShoppingCart, Users, CreditCard, Mail, DollarSign, MapPin, Globe, ArrowRight } from 'lucide-react';

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
            Crypto & Commerce Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time categorized index of all 4 local datasets: Customer Orders, PII Leads, Digital Banking, and Crypto holders.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400">
          <span>⚡ {stats.counts.total.toLocaleString()} records indexed in {stats.indexTimeMs}ms</span>
        </div>
      </div>

      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shopify Orders */}
        <div
          onClick={() => onNavigateTab('coincustody')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shopify & Binance Orders</span>
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

        {/* Enriched Leads */}
        <div
          onClick={() => onNavigateTab('sample')}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-violet-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Identity & Net-Worth Leads</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-white">
            {stats.counts.sample.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-400">Full Address & Phones</span>
            <span className="font-mono text-slate-500">sample.csv</span>
          </div>
        </div>

        {/* Shakepay Users */}
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
            <span className="font-semibold text-cyan-400">Shaketags & Referral Trees</span>
            <span className="font-mono text-slate-500">shakepay_full.txt</span>
          </div>
        </div>

        {/* BlockFi Emails */}
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
        
        {/* 1. Payment Methods Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Shopify Payment Gateways</h2>
              <p className="text-xs text-slate-400">Binance Pay vs Mercado Pago vs Cash/Bank</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(pb).map(([method, count]) => {
              const pct = Math.round((count / stats.counts.coincustody) * 100);
              let barColor = 'from-slate-500 to-slate-400';
              if (method.toLowerCase().includes('binance')) barColor = 'from-amber-500 to-yellow-400';
              else if (method.toLowerCase().includes('mercado')) barColor = 'from-sky-500 to-cyan-400';
              else if (method.toLowerCase().includes('transferencia')) barColor = 'from-emerald-500 to-teal-400';

              return (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{method}</span>
                    <span className="font-mono text-slate-400">{count} orders ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                      style={{ width: `${(count / maxPb) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigateTab('coincustody')}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>Filter Shopify Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 2. Top US States in Leads */}
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

        {/* 3. Top Email Domains in BlockFi */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">BlockFi Email Domains</h2>
              <p className="text-xs text-slate-400">Dominant email services in 654k records</p>
            </div>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {stats.blockfi.topDomains.map(({ domain, count }) => (
              <div
                key={domain}
                onClick={() => onNavigateTab('blockfi')}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs hover:bg-white/5 hover:border-emerald-500/30 transition-all"
              >
                <span className="font-mono text-slate-200">{domain}</span>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                  {count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('blockfi')}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>Search 654k Email Base</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
