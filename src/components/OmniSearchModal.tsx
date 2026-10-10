'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ShoppingCart, Users, CreditCard, Mail, Shield, Zap, TrendingUp } from 'lucide-react';
import {
  CoincustodyOrder,
  SampleLead,
  ShakepayUser,
  CmsCryptoRecord,
  CryptoLeadRecord,
  EtoroRecord
} from '@/types';

interface OmniSearchModalProps {
  initialQuery?: string;
  onSelectOrder: (order: CoincustodyOrder) => void;
  onSelectLead: (lead: SampleLead) => void;
  onSelectUser: (user: ShakepayUser) => void;
  onSelectCmsRecord?: (record: CmsCryptoRecord) => void;
  onSelectCryptoLead?: (lead: CryptoLeadRecord) => void;
  onSelectEtoroRecord?: (record: EtoroRecord) => void;
}

export function OmniSearchModal({
  initialQuery = '',
  onSelectOrder,
  onSelectLead,
  onSelectUser,
  onSelectCmsRecord,
  onSelectCryptoLead,
  onSelectEtoroRecord
}: OmniSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    coincustody: CoincustodyOrder[];
    sample: SampleLead[];
    shakepay: ShakepayUser[];
    blockfi: Array<{ id: number; email: string }>;
    cmsCrypto: CmsCryptoRecord[];
    cryptoLeads: CryptoLeadRecord[];
    etoro: EtoroRecord[];
  }>({
    coincustody: [],
    sample: [],
    shakepay: [],
    blockfi: [],
    cmsCrypto: [],
    cryptoLeads: [],
    etoro: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q || q.length < 2) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/omnisearch?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || {
        coincustody: [],
        sample: [],
        shakepay: [],
        blockfi: [],
        cmsCrypto: [],
        cryptoLeads: [],
        etoro: []
      });
      setMatchCount(data.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-6">
      {/* Search Hero */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cross-Dataset Intelligence Matcher</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Find Any Identity Across All 7 Datasets
        </h1>
        <p className="mt-1 text-xs text-slate-400 max-w-lg">
          Simultaneously searches CMS Crypto subscribers, Coinbase leads, eToro investors, Shopify orders, PII Leads, Shakepay, and BlockFi emails.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-cyan-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter email, full name, phone number, city, or IP address..."
              className="w-full rounded-full border border-white/15 bg-white/10 py-3 pl-12 pr-32 text-sm text-white placeholder-slate-400 shadow-inner focus:border-cyan-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Deep Match'}
            </button>
          </div>
        </form>

        {/* Suggestion hints */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span>Quick queries:</span>
          {['abdul', 'coinbase', 'joyceisabel1994152@bk.ru', 'NETELLER', 'miami'].map((hint) => (
            <button
              key={hint}
              onClick={() => { setQuery(hint); performSearch(hint); }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Results Layout */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
            <span>Query: <strong className="text-white font-bold">&quot;{query}&quot;</strong></span>
            <span>Total matches: <strong className="text-emerald-400 font-bold">{matchCount}</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* 1. CMS Crypto Subscribers */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">CMS Crypto</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  {results.cmsCrypto?.length || 0}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {!results.cmsCrypto?.length ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching subscribers</div>
                ) : (
                  results.cmsCrypto.map((record) => (
                    <div
                      key={`cms-${record.batch}-${record.id}`}
                      onClick={() => onSelectCmsRecord && onSelectCmsRecord(record)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="text-xs font-bold text-white capitalize">{record.name}</div>
                      <div className="text-[11px] text-slate-300 truncate">{record.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-semibold">{record.batch}</span>
                        <span className="text-slate-400">{record.city}, {record.state}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Coinbase Crypto Leads */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Coinbase Leads</span>
                </div>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400">
                  {results.cryptoLeads?.length || 0}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {!results.cryptoLeads?.length ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching leads</div>
                ) : ( 
                  results.cryptoLeads.map((lead) => (
                    <div
                      key={`cl-${lead.batch}-${lead.id}`}
                      onClick={() => onSelectCryptoLead && onSelectCryptoLead(lead)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="text-xs font-bold text-white capitalize">{lead.name}</div>
                      <div className="text-[11px] text-slate-300 truncate">{lead.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400 font-semibold">{lead.batch}</span>
                        <span className="text-slate-400">{lead.city}, {lead.state}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. eToro Investors */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">eToro Traders</span>
                </div>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                  {results.etoro?.length || 0}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {!results.etoro?.length ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching traders</div>
                ) : (
                  results.etoro.map((etoroRec) => (
                    <div
                      key={`etoro-${etoroRec.id}`}
                      onClick={() => onSelectEtoroRecord && onSelectEtoroRecord(etoroRec)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-amber-500/30 transition-all"
                    >
                      <div className="text-xs font-bold text-white capitalize">{etoroRec.name}</div>
                      <div className="text-[11px] text-slate-300 truncate">{etoroRec.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">${etoroRec.deposit_amount.toLocaleString()}</span>
                        <span className="text-amber-400 font-semibold">{etoroRec.deposit_platform}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. Coincustody Bucket */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Shopify Orders</span>
                </div>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                  {results.coincustody.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {results.coincustody.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching orders</div>
                ) : (
                  results.coincustody.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-amber-500/30 transition-all"
                    >
                      <div className="font-mono text-xs font-bold text-white">Order #{order.order_number || order.id}</div>
                      <div className="text-[11px] text-slate-300 truncate">{order.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 font-semibold">{order.payment_method_norm}</span>
                        <span className="font-mono text-slate-400">${Number(order.total_price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 5. Sample Leads Bucket */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Identity Leads</span>
                </div>
                <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-xs font-bold text-violet-400">
                  {results.sample.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {results.sample.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching leads</div>
                ) : (
                  results.sample.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-violet-500/30 transition-all"
                    >
                      <div className="text-xs font-bold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-300 truncate">{lead.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-violet-400 font-bold">{lead.state || 'US'}</span>
                        <span className="font-mono text-emerald-400 font-semibold">{lead.value_raw}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 6. Shakepay Bucket */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Shakepay Users</span>
                </div>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-bold text-cyan-400">
                  {results.shakepay.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {results.shakepay.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching accounts</div>
                ) : (
                  results.shakepay.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => onSelectUser(user)}
                      className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-2.5 hover:bg-white/5 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="font-mono text-xs font-bold text-cyan-400">@{user.shaketag}</div>
                      <div className="text-[11px] text-slate-300 truncate">{user.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{user.phone}</span>
                        <span className="text-cyan-300 font-semibold">{user.referral_count} invites</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 7. BlockFi Bucket */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col h-96">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">BlockFi Emails</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                  {results.blockfi.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {results.blockfi.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">No matching emails</div>
                ) : (
                  results.blockfi.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs font-mono text-slate-200 break-all"
                    >
                      <div className="text-[10px] text-slate-500">Index #{entry.id}</div>
                      <div className="text-emerald-300">{entry.email}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
