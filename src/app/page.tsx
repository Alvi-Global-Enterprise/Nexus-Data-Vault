'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TabsNav, TabType } from '@/components/TabsNav';
import { OverviewView } from '@/components/OverviewView';
import { CoincustodyTable } from '@/components/CoincustodyTable';
import { SampleTable } from '@/components/SampleTable';
import { ShakepayTable } from '@/components/ShakepayTable';
import { BlockfiTable } from '@/components/BlockfiTable';
import { OmniSearchModal } from '@/components/OmniSearchModal';
import { DetailDrawer } from '@/components/DetailDrawer';
import { OverviewStats, CoincustodyOrder, SampleLead, ShakepayUser } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDataset, setDrawerDataset] = useState<'coincustody' | 'sample' | 'shakepay' | null>(null);
  const [drawerData, setDrawerData] = useState<any>(null);

  // OmniSearch query
  const [omniQuery, setOmniQuery] = useState('');

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenDrawer = (dataset: 'coincustody' | 'sample' | 'shakepay', data: any) => {
    setDrawerDataset(dataset);
    setDrawerData(data);
    setDrawerOpen(true);
  };

  const handleCrossMatchEmail = (email: string) => {
    setOmniQuery(email);
    setActiveTab('omni');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header Navbar */}
      <Navbar
        totalRecords={stats?.counts.total || 0}
        onOpenOmni={(q) => {
          if (q) setOmniQuery(q);
          setActiveTab('omni');
        }}
        onRefresh={fetchStats}
        isLoading={isLoadingStats}
      />

      {/* 2. Tabs Navigation Bar */}
      <TabsNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={{
          coincustody: stats?.counts.coincustody || 0,
          sample: stats?.counts.sample || 0,
          shakepay: stats?.counts.shakepay || 0,
          blockfi: stats?.counts.blockfi || 0,
        }}
      />

      {/* 3. Main Views Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'overview' && (
          <OverviewView
            stats={stats}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'coincustody' && (
          <CoincustodyTable
            onSelectOrder={(order) => handleOpenDrawer('coincustody', order)}
          />
        )}

        {activeTab === 'sample' && (
          <SampleTable
            onSelectLead={(lead) => handleOpenDrawer('sample', lead)}
          />
        )}

        {activeTab === 'shakepay' && (
          <ShakepayTable
            onSelectUser={(user) => handleOpenDrawer('shakepay', user)}
          />
        )}

        {activeTab === 'blockfi' && (
          <BlockfiTable
            onCrossMatchEmail={handleCrossMatchEmail}
          />
        )}

        {activeTab === 'omni' && (
          <OmniSearchModal
            initialQuery={omniQuery}
            onSelectOrder={(order) => handleOpenDrawer('coincustody', order)}
            onSelectLead={(lead) => handleOpenDrawer('sample', lead)}
            onSelectUser={(user) => handleOpenDrawer('shakepay', user)}
          />
        )}
      </main>

      {/* 4. Deep Detail Slide-out Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        dataset={drawerDataset}
        data={drawerData}
        onCrossMatchEmail={handleCrossMatchEmail}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <span>Nexus Vault · Next.js 15 · TypeScript · Tailwind CSS · In-Memory Fast Indexing</span>
      </footer>
    </div>
  );
}
