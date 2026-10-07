'use client';

import React, { useState, useEffect } from 'react';
import { CryptoLeadRecord } from '@/types';
import { Search, Download, ChevronLeft, ChevronRight, Eye, Shield, Globe, MapPin } from 'lucide-react';

interface CryptoLeadsTableProps {
  onSelectLead: (lead: CryptoLeadRecord) => void;
}

export function CryptoLeadsTable({ onSelectLead }: CryptoLeadsTableProps) {
  const [items, setItems] = useState<CryptoLeadRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState('all');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ count2026: number; count2025: number; totalAcrossAllBatches: number }>({
    count2026: 0,
    count2025: 0,
    totalAcrossAllBatches: 0
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        batch,
        state: stateFilter
      });

      const res = await fetch(`/api/crypto-leads?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch crypto leads records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, batch, stateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        limit: '250',
        search,
        batch,
        state: stateFilter
      });
      const res = await fetch(`/api/crypto-leads?${params}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = ['id', 'batch', 'name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'ip', 'datetime', 'source', 'dob'];
      let csv = keys.join(',') + '\n';
      data.items.forEach((row: any) => {
        const line = keys.map(k => {
          let v = String(row[k] || '');
          if (v.includes(',') || v.includes('"') || v.includes('\n')) {
            v = `"${v.replace(/"/g, '""')}"`;
          }
          return v;
        }).join(',');
        csv += line + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crypto_leads_export_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Batch Selector */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
                ⚡
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">Coinbase Crypto Investors &amp; Leads</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-file database preview: <span className="font-mono text-slate-300">CRYPTO_01-01-2026.csv</span> &amp; <span className="font-mono text-slate-300">CRYPTO_05-01-2025.csv</span>
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => { setBatch('all'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Batches ({meta.totalAcrossAllBatches ? meta.totalAcrossAllBatches.toLocaleString() : '13.6k'})
            </button>
            <button
              onClick={() => { setBatch('01-01-2026'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === '01-01-2026'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Jan 01, 2026 ({meta.count2026 ? meta.count2026.toLocaleString() : '6.8k'})
            </button>
            <button
              onClick={() => { setBatch('05-01-2025'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === '05-01-2025'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              May 01, 2025 ({meta.count2025 ? meta.count2025.toLocaleString() : '6.8k'})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, phone, address, city, state, or IP..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-300 transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Record Counter & Limit Selector */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          Showing {items.length > 0 ? ((page - 1) * limit + 1).toLocaleString() : 0} to{' '}
          {Math.min(page * limit, total).toLocaleString()} of {total.toLocaleString()} matched leads
        </div>
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="rounded border border-white/10 bg-slate-900 px-2 py-0.5 text-xs text-slate-300"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span>Querying crypto leads index...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Lead Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Address</th>
              <th className="px-4 py-3.5">City / State</th>
              <th className="px-4 py-3.5">Source</th>
              <th className="px-4 py-3.5">Batch</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No crypto investor lead records found.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={`${row.batch}-${row.id}`}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-sans font-bold text-xs uppercase">
                        {row.fname ? row.fname[0] : 'C'}
                      </div>
                      <div>
                        <span className="font-sans font-bold text-white capitalize block">
                          {row.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {row.dob ? `DOB: ${row.dob}` : 'Verified Lead'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email & IP */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-300 font-sans font-medium">{row.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{row.ip || 'No IP'}</div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {row.phone || '--'}
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3 whitespace-nowrap max-w-xs truncate text-slate-400 font-sans capitalize">
                    {row.address || '--'}
                  </td>

                  {/* City/State */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-300 font-sans capitalize">
                      {row.city || 'Unknown'}{row.state ? `, ${row.state}` : ''}
                    </div>
                    <div className="text-[10px] text-slate-500">{row.zip}</div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      <Globe className="h-2.5 w-2.5" />
                      Coinbase
                    </span>
                  </td>

                  {/* Batch */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        row.batch === '01-01-2026'
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {row.batch === '01-01-2026' ? 'Jan 2026' : 'May 2025'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectLead(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all shadow-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <span className="font-mono text-xs text-slate-400">
          Page <span className="font-bold text-white">{page}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span>
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
