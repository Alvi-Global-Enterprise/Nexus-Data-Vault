'use client';

import React from 'react';
import { Layers, Search, RefreshCw, Database } from 'lucide-react';

interface NavbarProps {
  totalRecords: number;
  onOpenOmni: (query?: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function Navbar({ totalRecords, onOpenOmni, onRefresh, isLoading }: NavbarProps) {
  const [searchInput, setSearchInput] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length > 1) {
      onOpenOmni(searchInput.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#070b16]/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        
        {/* Left Logo & Total Records */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070b16]">
                <Layers className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">NEXUS VAULT</span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-cyan-400 border border-cyan-500/20">NEXT.JS</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-medium">
              {totalRecords > 0 ? `${totalRecords.toLocaleString()} Indexed Records` : 'Indexing records...'}
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Omni-search email, name, DNI, order # across all files..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-10 pr-12 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              /
            </kbd>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenOmni()}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Omni Match</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            title="Re-synchronize datasets"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
