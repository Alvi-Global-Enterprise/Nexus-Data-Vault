'use client';

import React, { useState, useEffect } from 'react';
import { ShakepayUser } from '@/types';
import { Search, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface ShakepayTableProps {
  onSelectUser: (user: ShakepayUser) => void;
}

export function ShakepayTable({ onSelectUser }: ShakepayTableProps) {
  const [items, setItems] = useState<ShakepayUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [minReferrals, setMinReferrals] = useState(0);
  const [newsletter, setNewsletter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        search,
        min_referrals: String(minReferrals),
        newsletter
      });

      const res = await fetch(`/api/shakepay?${params}`);
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
    fetchUsers();
  }, [page, minReferrals, newsletter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/shakepay?limit=250&search=${encodeURIComponent(search)}&min_referrals=${minReferrals}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = ['id', 'email', 'shaketag', 'phone', 'referral_count', 'referral_date', 'newsletter', 'referral_url', 'shaking_sats'];
      let csv = keys.join(',') + '\n';
      data.items.forEach((row: any) => {
        const line = keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',');
        csv += line + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `shakepay_users_export_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Digital Banking & Shakepay Referral Users</h1>
          <p className="text-xs text-slate-400">
            21,844 Canadian crypto wallet users with Shaketag handles, invite counts, and ShakingSats reward hashes.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, shaketag, referral ID, or phone..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Referrals Tier:</span>
          <div className="flex gap-1">
            {[
              { val: 0, label: 'All' },
              { val: 1, label: '> 0 Invites' },
              { val: 10, label: '> 10 Invites' },
              { val: 50, label: '> 50 Leaders' }
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => { setMinReferrals(t.val); setPage(1); }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  minReferrals === t.val ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Newsletter:</span>
          <select
            value={newsletter}
            onChange={(e) => { setNewsletter(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-slate-950 py-1 px-2.5 text-xs text-white focus:outline-none"
          >
            <option value="all">Any</option>
            <option value="true">Subscribed</option>
            <option value="false">Unsubscribed</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 uppercase tracking-wider text-[11px] font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-4">Email Associated</th>
                <th className="py-3 px-4">Shaketag ID</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Referral Date</th>
                <th className="py-3 px-4">Total Invites</th>
                <th className="py-3 px-4">Reward Hash</th>
                <th className="py-3 px-4">Newsletter</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading digital banking users...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No Shakepay users match filters.</td>
                </tr>
              ) : (
                items.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3 px-4 font-bold text-white">{user.email}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">@{user.shaketag}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{user.phone || 'Masked'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{user.referral_date || '--'}</td>
                    <td className="py-3 px-4">
                      {user.referral_count > 0 ? (
                        <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-bold text-cyan-300 text-[11px]">
                          {user.referral_count} invites
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {user.shaking_sats ? `${user.shaking_sats.slice(0, 10)}...` : '--'}
                    </td>
                    <td className="py-3 px-4">
                      {user.newsletter ? (
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectUser(user); }}
                        className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{items.length}</span> of <span className="font-semibold text-white">{total.toLocaleString()}</span> users
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
