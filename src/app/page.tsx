'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TabsNav, TabType } from '@/components/TabsNav';
import { OverviewView } from '@/components/OverviewView';
import { CmsCryptoTable } from '@/components/CmsCryptoTable';
import { CryptoLeadsTable } from '@/components/CryptoLeadsTable';
import { EtoroTable } from '@/components/EtoroTable';
import { CoincustodyTable } from '@/components/CoincustodyTable';
import { SampleTable } from '@/components/SampleTable';
import { ShakepayTable } from '@/components/ShakepayTable';
import { BlockfiTable } from '@/components/BlockfiTable';
import { OmniSearchModal } from '@/components/OmniSearchModal';
import { DetailDrawer } from '@/components/DetailDrawer';
import { ContactsView } from '@/components/contacts/ContactsView';
import { CampaignsView } from '@/components/campaigns/CampaignsView';
import {
  OverviewStats,
  CoincustodyOrder,
  SampleLead,
  ShakepayUser,
  CmsCryptoRecord,
  CryptoLeadRecord,
  EtoroRecord
} from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDataset, setDrawerDataset] = useState<
    'coincustody' | 'sample' | 'shakepay' | 'cms_crypto' | 'crypto_leads' | 'etoro' | null
  >(null);
  const [drawerData, setDrawerData] = useState<any>(null);

  // OmniSearch query
  const [omniQuery, setOmniQuery] = useState('');

  // Target contact IDs when transitioning from Contacts to Campaigns
  const [campaignTargetContactIds, setCampaignTargetContactIds] = useState<number[]>([]);

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    // Client-side authentication verification
    if (typeof window !== 'undefined') {
      const hasCookie =
        document.cookie.includes('vault_session=') ||
        document.cookie.includes('nexus_auth_token=');
      const token = localStorage.getItem('nexus_auth_token');

      const isAuthed =
        hasCookie ||
        (token && token !== 'local_authenticated_token' && token.trim().length > 5);

      if (!isAuthed) {
        window.location.href = '/login';
        return;
      }
    }
    setIsAuthChecking(false);
    fetchStats();
  }, []);


  const handleOpenDrawer = (
    dataset: 'coincustody' | 'sample' | 'shakepay' | 'cms_crypto' | 'crypto_leads' | 'etoro',
    data: any
  ) => {
    setDrawerDataset(dataset);
    setDrawerData(data);
    setDrawerOpen(true);
  };

  const handleCrossMatchEmail = (email: string) => {
    setOmniQuery(email);
    setActiveTab('omni');
  };

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="font-mono text-xs text-slate-400 tracking-wider uppercase animate-pulse">
            Verifying Security Credentials...
          </p>
        </div>
      </div>
    );
  }

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
          cmsCrypto: stats?.counts.cmsCrypto || 0,
          cryptoLeads: stats?.counts.cryptoLeads || 0,
          etoro: stats?.counts.etoro || 0,
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

        {activeTab === 'contacts' && (
          <ContactsView
            onStartCampaignWithContacts={(contactIds) => {
              setCampaignTargetContactIds(contactIds);
              setActiveTab('campaigns');
            }}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsView
            initialContactIdsForNewCampaign={campaignTargetContactIds}
            onClearInitialContacts={() => setCampaignTargetContactIds([])}
          />
        )}

        {activeTab === 'cms-crypto' && (
          <CmsCryptoTable
            onSelectRecord={(rec) => handleOpenDrawer('cms_crypto', rec)}
          />
        )}

        {activeTab === 'crypto-leads' && (
          <CryptoLeadsTable
            onSelectLead={(lead) => handleOpenDrawer('crypto_leads', lead)}
          />
        )}

        {activeTab === 'etoro' && (
          <EtoroTable
            onSelectRecord={(rec) => handleOpenDrawer('etoro', rec)}
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
            onSelectCmsRecord={(rec) => handleOpenDrawer('cms_crypto', rec)}
            onSelectCryptoLead={(lead) => handleOpenDrawer('crypto_leads', lead)}
            onSelectEtoroRecord={(rec) => handleOpenDrawer('etoro', rec)}
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
        <span>Nexus Vault · Next.js 15 · TypeScript · Tailwind CSS · Multi-Dataset High Speed Indexing</span>
      </footer>
    </div>
  );
}

