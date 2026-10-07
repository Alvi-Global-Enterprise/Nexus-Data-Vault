'use client';

import React, { useState, useEffect } from 'react';
import { SampleLead } from '@/types';
import { Search, Download, ChevronLeft, ChevronRight, Eye, MapPin } from 'lucide-react';

interface SampleTableProps {
  onSelectLead: (lead: SampleLead) => void;
}

export function SampleTable({ onSelectLead }: SampleTableProps) {
  const [items, setItems] = useState<SampleLead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let minAge = '', maxAge = '';
      if (ageFilter === '18-30') { minAge = '18'; maxAge = '30'; }
      else if (ageFilter === '31-50') { minAge = '31'; maxAge = '50'; }
      else if (ageFilter === '51-70') { minAge = '51'; maxAge = '70'; }
      else if (ageFilter === '70+') { minAge = '71'; }

      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        search,
        state: stateFilter
      });
      if (minAge) params.append('min_age', minAge);
      if (maxAge) params.append('max_age', maxAge);

      const res = await fetch(`/api/sample?${params}`);
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
    fetchLeads();
  }, [page, stateFilter, ageFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/sample?limit=250&search=${encodeURIComponent(search)}&state=${stateFilter}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = ['id', 'name', 'age', 'email', 'phones', 'address', 'state', 'value_raw'];
      let csv = keys.join(',') + '\n';
      data.items.forEach((row: any) => {
        const line = keys.map(k => {
          let val = row[k];
          if (Array.isArray(val)) val = val.join('; ');
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        }).join(',');
        csv += line + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `identity_leads_export_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enriched Identity & Net-Worth Leads</h1>
          <p className="text-xs text-slate-400">
            1,082 verified citizen profiles with primary emails, phone numbers, full addresses, and property valuations.
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
              placeholder="Search by name, email, city, street, or phone..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">State:</span>
          <select
            value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-slate-950 py-1 px-2.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All States</option>
            {['CA', 'TX', 'NY', 'FL', 'PA', 'IL', 'OH', 'MI', 'VA', 'WA', 'AZ'].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Age:</span>
          <select
            value={ageFilter}
            onChange={(e) => { setAgeFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-slate-950 py-1 px-2.5 text-xs text-white focus:outline-none"
          >
            <option value="all">Any Age</option>
            <option value="18-30">18 - 30 Yrs</option>
            <option value="31-50">31 - 50 Yrs</option>
            <option value="51-70">51 - 70 Yrs</option>
            <option value="70+">70+ Yrs</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 uppercase tracking-wider text-[11px] font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Primary Email</th>
                <th className="py-3 px-4">Primary Phone</th>
                <th className="py-3 px-4">Full Address</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Property / Net Worth</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading leads...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No leads match filters.</td>
                </tr>
              ) : (
                items.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3 px-4 font-bold text-white">{lead.name}</td>
                    <td className="py-3 px-4 font-mono">{lead.age ?? '--'}</td>
                    <td className="py-3 px-4">{lead.email || <span className="text-slate-500">None</span>}</td>
                    <td className="py-3 px-4 font-mono">{lead.phones?.[0] || <span className="text-slate-500">None</span>}</td>
                    <td className="py-3 px-4 text-slate-300">{lead.address || <span className="text-slate-500">Unlisted</span>}</td>
                    <td className="py-3 px-4">
                      {lead.state ? (
                        <span className="rounded bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 font-bold text-violet-300 text-[10px]">
                          {lead.state}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {lead.value_raw && lead.value_raw !== 'None' ? lead.value_raw : <span className="text-slate-500 font-normal">Undisclosed</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                        className="rounded border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300 hover:bg-violet-500/20 transition-all inline-flex items-center gap-1"
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

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{items.length}</span> of <span className="font-semibold text-white">{total.toLocaleString()}</span> leads
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
