'use client';

import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Mail, Sparkles } from 'lucide-react';

export type TabType = 'overview' | 'coincustody' | 'sample' | 'shakepay' | 'blockfi' | 'omni';

interface TabsNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  counts: {
    coincustody: number;
    sample: number;
    shakepay: number;
    blockfi: number;
  };
}

export function TabsNav({ activeTab, onSelectTab, counts }: TabsNavProps) {
  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'coincustody' as TabType,
      label: 'Shopify & Binance Orders',
      icon: ShoppingCart,
      badge: counts.coincustody.toLocaleString(),
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'sample' as TabType,
      label: 'Identity & Net-Worth Leads',
      icon: Users,
      badge: counts.sample.toLocaleString(),
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      id: 'shakepay' as TabType,
      label: 'Digital Banking / Shakepay',
      icon: CreditCard,
      badge: `${(counts.shakepay / 1000).toFixed(1)}k`,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'blockfi' as TabType,
      label: 'BlockFi Crypto Emails',
      icon: Mail,
      badge: `${Math.round(counts.blockfi / 1000)}k`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'omni' as TabType,
      label: 'Omni Match Lookup',
      icon: Sparkles,
      badge: 'CROSS-CHECK',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    }
  ];

  return (
    <nav className="sticky top-16 z-30 border-b border-white/10 bg-[#090e1c]/90 backdrop-blur-md px-4 sm:px-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full border px-1.5 py-0.2 font-mono text-[10px] font-semibold ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
