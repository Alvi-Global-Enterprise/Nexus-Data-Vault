'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface BlockfiTableProps {
  onCrossMatchEmail: (email: string) => void;
}

export function BlockfiTable({ onCrossMatchEmail }: BlockfiTableProps) {
  const [items, setItems] = useState<Array<{ id: number; email: string }>>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        search,
        domain
      });

      const res = await fetch(`/api/blockfi?${params}`);
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, domain]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmails();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">BlockFi Crypto Investor Database</h1>
          <p className="text-xs text-slate-400">
            654,251 verified registered accounts from the BlockFi crypto ecosystem with instant sub-millisecond search.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400">
          654,251 Indexed Emails
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email substring (e.g. john, proton, crypto, mark...)"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Domains:</span>
          <div className="flex flex-wrap gap-1">
            {['all', 'gmail.com', 'protonmail.com', 'yahoo.com', 'hotmail.com', 'icloud.com'].map((d) => (
              <button
                key={d}
                onClick={() => { setDomain(d); setPage(1); }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  domain === d ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 uppercase tracking-wider text-[11px] font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-4 w-20"># Index</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Domain Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Deep Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Querying 654k records...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">No emails match query.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const domainPart = item.email.split('@')[1] || '--';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onCrossMatchEmail(item.email)}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">#{item.id}</td>
                      <td className="py-3 px-4 font-bold text-white">{item.email}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{domainPart}</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          BlockFi Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); onCrossMatchEmail(item.email); }}
                          className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all inline-flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Cross-Match</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{items.length}</span> of <span className="font-semibold text-white">{total.toLocaleString()}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
