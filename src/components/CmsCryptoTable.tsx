'use client';

import React, { useState, useEffect } from 'react';
import { CmsCryptoRecord } from '@/types';
import { Search, Download, ChevronLeft, ChevronRight, Eye, Shield, Globe, Filter } from 'lucide-react';

interface CmsCryptoTableProps {
  onSelectRecord: (record: CmsCryptoRecord) => void;
}

export function CmsCryptoTable({ onSelectRecord }: CmsCryptoTableProps) {
  const [items, setItems] = useState<CmsCryptoRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState('all');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
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
        state: stateFilter,
        gender: genderFilter,
        source: sourceFilter
      });

      const res = await fetch(`/api/cms-crypto?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch CMS crypto records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, batch, stateFilter, genderFilter, sourceFilter]);

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
        state: stateFilter,
        gender: genderFilter,
        source: sourceFilter
      });
      const res = await fetch(`/api/cms-crypto?${params}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = ['id', 'batch', 'name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'ip', 'source', 'gender', 'dob', 'join_date'];
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
      a.download = `cms_cryptocurrency_export_${Date.now()}.csv`;
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
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                ₿
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">CMS Cryptocurrency Subscribers</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-file database preview: <span className="font-mono text-slate-300">CMS_cryptocurrency_01-01-2026.csv</span> &amp; <span className="font-mono text-slate-300">CMS_cryptocurrency_05-01-2025.csv</span>
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => { setBatch('all'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All Batches ({meta.totalAcrossAllBatches ? meta.totalAcrossAllBatches.toLocaleString() : '45.9k'})
            </button>
            <button
              onClick={() => { setBatch('01-01-2026'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === '01-01-2026'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Jan 01, 2026 ({meta.count2026 ? meta.count2026.toLocaleString() : '22.9k'})
            </button>
            <button
              onClick={() => { setBatch('05-01-2025'); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                batch === '05-01-2025'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              May 01, 2025 ({meta.count2025 ? meta.count2025.toLocaleString() : '23.0k'})
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
            placeholder="Search subscriber email, name, phone, IP, city, state, or exchange source..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md focus:border-emerald-500/50 focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md focus:border-emerald-500/50 focus:outline-none"
          >
            <option value="all">All Exchanges</option>
            <option value="coinbase">Coinbase</option>
            <option value="mxc">MXC</option>
            <option value="okcoin">OKCoin</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Record Counter & Limit Selector */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          Showing {items.length > 0 ? ((page - 1) * limit + 1).toLocaleString() : 0} to{' '}
          {Math.min(page * limit, total).toLocaleString()} of {total.toLocaleString()} matched subscribers
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
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span>Querying in-memory CMS index...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Subscriber</th>
              <th className="px-4 py-3.5">Contact Email</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Location</th>
              <th className="px-4 py-3.5">Exchange / Source</th>
              <th className="px-4 py-3.5">Batch</th>
              <th className="px-4 py-3.5">Join Date</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No cryptocurrency subscriber records found matching your filters.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={`${row.batch}-${row.id}`}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Name & Gender */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans font-bold text-xs uppercase">
                        {row.fname ? row.fname[0] : 'U'}
                      </div>
                      <div>
                        <span className="font-sans font-bold text-white capitalize block">
                          {row.name}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">
                          {row.gender || 'Unknown'} {row.dob ? `· DOB: ${row.dob}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-300 font-sans font-medium">{row.email}</div>
                    <div className="text-[10px] text-slate-500">{row.ip || 'No IP recorded'}</div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {row.phone || '--'}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-300 font-sans capitalize">
                      {row.city || 'Unknown'}{row.state ? `, ${row.state}` : ''}
                    </div>
                    <div className="text-[10px] text-slate-500">{row.zip || row.country}</div>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <Globe className="h-2.5 w-2.5" />
                      {row.source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'MXC/Coinbase'}
                    </span>
                  </td>

                  {/* Batch */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${
                        row.batch === '01-01-2026'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-violet-500/30 bg-violet-500/10 text-violet-400'
                      }`}
                    >
                      {row.batch === '01-01-2026' ? 'Jan 2026' : 'May 2025'}
                    </span>
                  </td>

                  {/* Join Date */}
                  <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-400">
                    {row.join_date || '--'}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectRecord(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 transition-all shadow-sm"
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
