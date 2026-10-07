'use client';

import React, { useState, useEffect } from 'react';
import { CoincustodyOrder } from '@/types';
import { Search, Download, ExternalLink, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface CoincustodyTableProps {
  onSelectOrder: (order: CoincustodyOrder) => void;
}

export function CoincustodyTable({ onSelectOrder }: CoincustodyTableProps) {
  const [items, setItems] = useState<CoincustodyOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        search,
        payment,
        status
      });
      const res = await fetch(`/api/coincustody?${params}`);
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
    fetchOrders();
  }, [page, payment, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/coincustody?limit=250&search=${encodeURIComponent(search)}&payment=${payment}&status=${status}`);
      const data = await res.json();
      if (!data.items?.length) return;

      const keys = Object.keys(data.items[0]).filter(k => k !== 'parsed_notes');
      let csv = keys.join(',') + '\n';
      data.items.forEach((row: any) => {
        const line = keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',');
        csv += line + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `coincustody_orders_export_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Shopify & Binance Checkout Orders</h1>
          <p className="text-xs text-slate-400">
            280 E-commerce hardware custody orders with Binance payments, Argentine DNI, and carrier tracking.
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

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-wrap items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, order #, DNI (identity), tracking URL..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Payment Gateway Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gateway:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => { setPayment('all'); setPage(1); }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                payment === 'all' ? 'bg-white text-slate-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setPayment('binance'); setPage(1); }}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                payment === 'binance' ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              🪙 Binance Pay
            </button>
            <button
              onClick={() => { setPayment('mercado pago'); setPage(1); }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                payment === 'mercado pago' ? 'bg-sky-400 text-slate-950 font-bold' : 'bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20'
              }`}
            >
              💳 Mercado Pago
            </button>
            <button
              onClick={() => { setPayment('transferencia'); setPage(1); }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                payment === 'transferencia' ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              🏦 Transferencia
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
          <div className="flex gap-1">
            {['all', 'paid', 'voided', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatus(st); setPage(1); }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                  status === st ? 'bg-white text-slate-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 uppercase tracking-wider text-[11px] font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Email</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Financial Status</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">ID Number (DNI)</th>
                <th className="py-3 px-4">Shipment & Carrier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                items.map((order) => {
                  const isBinance = order.payment_method_norm.toLowerCase().includes('binance');
                  const isMercado = order.payment_method_norm.toLowerCase().includes('mercado');
                  const isPaid = order.financial_status.toLowerCase() === 'paid';
                  const isVoided = order.financial_status.toLowerCase() === 'voided';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        #{order.order_number || order.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {order.email || <span className="text-slate-500">Anonymous</span>}
                      </td>
                      <td className="py-3 px-4">
                        {isBinance ? (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-400">
                            🪙 Binance Pay
                          </span>
                        ) : isMercado ? (
                          <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-semibold text-sky-400">
                            💳 Mercado Pago
                          </span>
                        ) : (
                          <span className="inline-flex rounded border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
                            {order.payment_method_norm}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                            Paid
                          </span>
                        ) : isVoided ? (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
                            Voided
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-400 border border-yellow-500/20">
                            {order.financial_status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ${Number(order.total_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {order.numero_identificacion || <span className="text-slate-500">--</span>}
                      </td>
                      <td className="py-3 px-4">
                        {order.shipment_tracking_url ? (
                          <a
                            href={order.shipment_tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            <span>{order.shipment_type || 'Track'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500">{order.shipment_type || 'Direct'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{items.length}</span> of <span className="font-semibold text-white">{total.toLocaleString()}</span> orders
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
