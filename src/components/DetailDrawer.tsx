'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MapPin, CreditCard, Shield, Truck, Code } from 'lucide-react';
import { CoincustodyOrder, SampleLead, ShakepayUser } from '@/types';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: 'coincustody' | 'sample' | 'shakepay' | 'cms_crypto' | 'crypto_leads' | 'etoro' | null;
  data: any;
  onCrossMatchEmail: (email: string) => void;
}

export function DetailDrawer({
  isOpen,
  onClose,
  dataset,
  data,
  onCrossMatchEmail
}: DetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDatasetBadge = () => {
    switch (dataset) {
      case 'coincustody': return 'Shopify & Binance Order';
      case 'sample': return 'Identity & Net-Worth Lead';
      case 'shakepay': return 'Shakepay Digital Banking User';
      case 'cms_crypto': return 'CMS Crypto Subscriber';
      case 'crypto_leads': return 'Coinbase Crypto Lead';
      case 'etoro': return 'eToro Investor Record';
      default: return 'Record Details';
    }
  };

  const getRecordTitle = () => {
    switch (dataset) {
      case 'coincustody': return `Order #${data.order_number || data.id}`;
      case 'sample': return data.name;
      case 'shakepay': return `@${data.shaketag}`;
      case 'cms_crypto': return data.name;
      case 'crypto_leads': return data.name;
      case 'etoro': return data.name;
      default: return `Record #${data.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-[#090e1c] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-slate-950/60 backdrop-blur-md">
          <div>
            <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {getDatasetBadge()}
            </span>
            <h2 className="mt-1 text-lg font-bold text-white tracking-tight capitalize">
              {getRecordTitle()}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Database ID #{data.id} {data.source_file ? `· Source: ${data.source_file}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title="Copy Raw JSON"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* === 1. COINCUSTODY SHOPIFY DETAILS === */}
          {dataset === 'coincustody' && (
            <>
              {/* Payment Section */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment & Financial Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Gateway</span>
                    <span className="font-bold text-white mt-0.5 inline-block">
                      {data.payment_method_norm.toLowerCase().includes('binance') ? '🪙 Binance Pay' : data.payment_method_norm}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Paid Amount</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 inline-block">
                      ${Number(data.total_price || 0).toLocaleString()} {data.currency || 'ARS'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Transaction ID</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.payment_id || '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fiscal Condition</span>
                    <span className="text-slate-200 mt-0.5 inline-block">{data.condicion_fiscal || 'Consumidor Final'}</span>
                  </div>
                </div>
              </div>

              {/* Customer ID Section */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Shield className="h-4 w-4" />
                  <span>Customer Identification</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-white">{data.email || 'N/A'}</span>
                      {data.email && (
                        <button
                          onClick={() => handleCopyText(data.email)}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Copy Email
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">National ID (DNI)</span>
                    <span className="font-mono font-bold text-white mt-0.5 inline-block">{data.numero_identificacion || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.phone || data.shipping_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Browser IP</span>
                    <span className="font-mono text-slate-400 mt-0.5 inline-block">{data.browser_ip || 'Masked'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Financial Status</span>
                    <span className="capitalize font-semibold text-slate-200 mt-0.5 inline-block">{data.financial_status || 'Paid'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Logistics */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Truck className="h-4 w-4" />
                  <span>Logistics & Shipment Tracking</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Carrier / Type</span>
                    <span className="text-white font-semibold mt-0.5 inline-block">{data.shipment_type || 'Direct Courier'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fulfillment Status</span>
                    <span className="text-slate-300 mt-0.5 inline-block">{data.fulfillment_status || 'Unfulfilled'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Carrier Tracking URL</span>
                    {data.shipment_tracking_url ? (
                      <a
                        href={data.shipment_tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-mono text-[11px] mt-1 break-all"
                      >
                        <span>{data.shipment_tracking_url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === 2. SAMPLE LEADS DETAILS === */}
          {dataset === 'sample' && (
            <>
              {/* Valuation Profile */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Valuation & Financial Estimate</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Property / Net Worth</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400 mt-0.5 inline-block">
                      {data.value_raw || 'Undisclosed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Age Profile</span>
                    <span className="font-bold text-white text-sm mt-0.5 inline-block">
                      {data.age ? `${data.age} Years Old` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Shield className="h-4 w-4" />
                  <span>Contact Information</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Email</span>
                    <span className="font-semibold text-white mt-0.5 inline-block">{data.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Associated Phone Numbers ({data.phones?.length || 0})</span>
                    <div className="mt-1 flex flex-wrap gap-1.5 font-mono">
                      {data.phones?.length ? (
                        data.phones.map((p: string, idx: number) => (
                          <span key={idx} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-slate-200 text-[11px]">
                            📞 {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <MapPin className="h-4 w-4" />
                  <span>Physical Residence</span>
                </div>
                <div className="text-xs space-y-2">
                  <p className="text-white font-medium">{data.address || 'Unlisted'}</p>
                  {data.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(data.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-cyan-400 hover:bg-white/10"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* === 3. SHAKEPAY DETAILS === */}
          {dataset === 'shakepay' && (
            <>
              {/* Referral Performance */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Referral Tree & Performance</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Invites Count</span>
                    <span className="font-mono text-base font-extrabold text-cyan-400 mt-0.5 inline-block">
                      {data.referral_count} Referrals
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Referral Date</span>
                    <span className="font-mono text-slate-300 mt-0.5 inline-block">{data.referral_date || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Referral Origin Link</span>
                    <a
                      href={data.referral_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[11px] mt-0.5 break-all"
                    >
                      <span>{data.referral_url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">ShakingSats Reward Hash</span>
                    <span className="font-mono text-slate-400 text-[11px] break-all block mt-0.5 bg-black/40 p-2 rounded border border-white/5">
                      {data.shaking_sats}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Shield className="h-4 w-4" />
                  <span>Account Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Associated</span>
                    <span className="font-semibold text-white mt-0.5 inline-block">{data.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Associated</span>
                    <span className="font-mono text-slate-300 mt-0.5 inline-block">{data.phone || 'Masked'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Newsletter Status</span>
                    <span className="font-semibold text-slate-200 mt-0.5 inline-block">
                      {data.newsletter ? 'Subscribed' : 'Unsubscribed'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === 4. CMS CRYPTO SUBSCRIBER DETAILS === */}
          {dataset === 'cms_crypto' && (
            <>
              {/* Identity & Contact */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Shield className="h-4 w-4" />
                  <span>Subscriber Identity &amp; Demographics</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-white capitalize mt-0.5 inline-block">{data.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <span className="font-semibold text-white capitalize mt-0.5 inline-block">{data.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.dob || '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Category</span>
                    <span className="text-emerald-400 font-semibold mt-0.5 inline-block">{data.category || 'Cryptocurrency'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-white">{data.email}</span>
                      <button
                        onClick={() => handleCopyText(data.email)}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.phone || '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IP Address</span>
                    <span className="font-mono text-cyan-400 mt-0.5 inline-block">{data.ip || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Location */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <MapPin className="h-4 w-4" />
                  <span>Physical Address &amp; Geolocation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Street Address</span>
                    <span className="text-white capitalize mt-0.5 inline-block">{data.address || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">City</span>
                    <span className="text-white capitalize mt-0.5 inline-block">{data.city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">State / Region</span>
                    <span className="font-bold text-white uppercase mt-0.5 inline-block">{data.state || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ZIP / Postal Code</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.zip || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Country</span>
                    <span className="text-slate-200 mt-0.5 inline-block">{data.country || 'USA'}</span>
                  </div>
                </div>
              </div>

              {/* Source & Batch */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <ExternalLink className="h-4 w-4" />
                  <span>Exchange Referral &amp; Source Batch</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Source Batch</span>
                    <span className="font-mono font-bold text-white mt-0.5 inline-block">{data.batch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Join / Subscription Date</span>
                    <span className="text-slate-200 mt-0.5 inline-block">{data.join_date || '--'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Referral Source Origin</span>
                    <a
                      href={data.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline break-all mt-0.5 inline-flex items-center gap-1"
                    >
                      <span>{data.source}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === 5. CRYPTO LEADS DETAILS === */}
          {dataset === 'crypto_leads' && (
            <>
              {/* Lead Identity */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Shield className="h-4 w-4" />
                  <span>Lead Identity &amp; Contact Info</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lead Name</span>
                    <span className="font-semibold text-white capitalize mt-0.5 inline-block">{data.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.dob || '--'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-white">{data.email}</span>
                      <button
                        onClick={() => handleCopyText(data.email)}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.phone || '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IP Address</span>
                    <span className="font-mono text-cyan-400 mt-0.5 inline-block">{data.ip || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Physical Location */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <MapPin className="h-4 w-4" />
                  <span>Location &amp; Address</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Street Address</span>
                    <span className="text-white capitalize mt-0.5 inline-block">{data.address || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">City</span>
                    <span className="text-white capitalize mt-0.5 inline-block">{data.city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">State</span>
                    <span className="font-bold text-white uppercase mt-0.5 inline-block">{data.state || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ZIP Code</span>
                    <span className="font-mono text-slate-200 mt-0.5 inline-block">{data.zip || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Batch Release</span>
                    <span className="font-mono text-cyan-400 font-bold mt-0.5 inline-block">{data.batch}</span>
                  </div>
                </div>
              </div>

              {/* Lead Source */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <ExternalLink className="h-4 w-4" />
                  <span>Lead Source &amp; Capture Timestamp</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Capture Timestamp</span>
                    <span className="text-slate-200 mt-0.5 inline-block">{data.datetime || '--'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Origin File</span>
                    <span className="font-mono text-slate-300 text-[11px] mt-0.5 inline-block">{data.source_file}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Source URL</span>
                    <a
                      href={data.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline break-all mt-0.5 inline-flex items-center gap-1"
                    >
                      <span>{data.source}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === 6. ETORO INVESTOR DETAILS === */}
          {dataset === 'etoro' && (
            <>
              {/* Deposit & Platform */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <CreditCard className="h-4 w-4" />
                  <span>Deposit &amp; Platform Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Deposit Amount</span>
                    <span className="font-mono font-bold text-emerald-400 text-base mt-0.5 inline-block">
                      ${data.deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.deposit_currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Deposit Gateway / Platform</span>
                    <span className="font-semibold text-white mt-0.5 inline-block">{data.deposit_platform}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trading Platform</span>
                    <span className="font-mono text-cyan-400 mt-0.5 inline-block">{data.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registration / Deposit Date</span>
                    <span className="text-slate-200 mt-0.5 inline-block">{data.redate || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Trader Identity & Origin */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Shield className="h-4 w-4" />
                  <span>Investor Profile &amp; Network</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Investor Name</span>
                    <span className="font-bold text-white capitalize mt-0.5 inline-block">{data.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Country</span>
                    <span className="font-semibold text-white capitalize mt-0.5 inline-block">{data.country}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-white">{data.email}</span>
                      <button
                        onClick={() => handleCopyText(data.email)}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IP Address</span>
                    <span className="font-mono text-cyan-400 mt-0.5 inline-block">{data.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Raw Deposit String</span>
                    <span className="font-mono text-slate-300 mt-0.5 inline-block">{data.deposit_amount_raw}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Cross-Dataset Match Button */}
          {data.email && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Cross-Dataset Deep Match</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Search if {data.email} exists in BlockFi or other files.</p>
              </div>
              <button
                onClick={() => {
                  onCrossMatchEmail(data.email);
                  onClose();
                }}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-600 transition-all"
              >
                Match Email ↗
              </button>
            </div>
          )}

          {/* Raw JSON Code Inspector */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Code className="h-4 w-4 text-cyan-400" />
                <span>Raw Record Inspector</span>
              </div>
              <button
                onClick={handleCopyJSON}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Copy JSON
              </button>
            </div>
            <pre className="max-h-60 overflow-auto font-mono text-[11px] text-indigo-200/90 leading-relaxed bg-black/60 p-3 rounded-lg border border-white/5">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}
