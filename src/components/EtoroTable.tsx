'use client';

import React, { useState, useEffect } from 'react';
import { EtoroRecord } from '@/types';
import { Search, Download, ChevronLeft, ChevronRight, Eye, TrendingUp, DollarSign, CreditCard, Globe } from 'lucide-react';

interface EtoroTableProps {
  onSelectRecord: (record: EtoroRecord) => void;
}

export function EtoroTable({ onSelectRecord }: EtoroTableProps) {
  const [items, setItems] = useState<EtoroRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{
    totalRecords: number;
    totalDepositsUsd: number;
    avgDepositUsd: number;
    platforms: string[];
  }>({
    totalRecords: 0,
    totalDepositsUsd: 0,
    avgDepositUsd: 0,
    platforms: []
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        platform: platformFilter,
        country: countryFilter
      });

      const res = await fetch(`/api/etoro?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch eToro records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, platformFilter, countryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        limit: '500',
        search,
        platform: platformFilter,
        country: countryFilter
      });
      const res = await fetch(`/api/etoro?${params}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = ['id', 'source', 'name', 'email', 'country', 'ip', 'deposit_amount_raw', 'deposit_currency', 'deposit_amount', 'deposit_platform', 'redate'];
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
      a.download = `etoro_investors_export_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & KPI Stat Highlights */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs">
                📈
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">eToro Global Investors &amp; Deposits</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Source file: <span className="font-mono text-slate-300">etoro.csv</span> · Verified trader accounts &amp; deposit transaction logs
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Total Deposits</span>
              <span className="font-mono text-base font-extrabold text-emerald-400">
                ${(meta.totalDepositsUsd || 0).toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Avg Deposit</span>
              <span className="font-mono text-base font-extrabold text-cyan-400">
                ${(meta.avgDepositUsd || 0).toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Verified Traders</span>
              <span className="font-mono text-base font-extrabold text-amber-400">
                {(meta.totalRecords || 0).toLocaleString()}
              </span>
            </div>
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
            placeholder="Search investor name, email, country, IP, deposit platform..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md focus:border-amber-500/50 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            {meta.platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Record Counter & Limit Selector */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          Showing {items.length > 0 ? ((page - 1) * limit + 1).toLocaleString() : 0} to{' '}
          {Math.min(page * limit, total).toLocaleString()} of {total.toLocaleString()} matched traders
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
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <span>Querying eToro dataset index...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Trader Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Country</th>
              <th className="px-4 py-3.5">Deposit Amount</th>
              <th className="px-4 py-3.5">Deposit Platform</th>
              <th className="px-4 py-3.5">IP Address</th>
              <th className="px-4 py-3.5">Registration Date</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No eToro investor records found matching criteria.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-sans font-bold text-xs uppercase">
                        {row.name ? row.name[0] : 'T'}
                      </div>
                      <div>
                        <span className="font-sans font-bold text-white capitalize block">
                          {row.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {row.source}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 whitespace-nowrap text-slate-300 font-sans">
                    {row.email}
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300 capitalize font-sans">
                      {row.country || 'Global'}
                    </span>
                  </td>

                  {/* Deposit Amount */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      ${row.deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Deposit Platform */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      <CreditCard className="h-2.5 w-2.5" />
                      {row.deposit_platform}
                    </span>
                  </td>

                  {/* IP Address */}
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                    {row.ip || '--'}
                  </td>

                  {/* ReDate */}
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                    {row.redate || '--'}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onSelectRecord(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 transition-all shadow-sm"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Details</span>
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
