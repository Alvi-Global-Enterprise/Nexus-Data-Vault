'use client';

import React, { useState, useRef } from 'react';
import {
  Users,
  Upload,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Mail,
  Building,
  Phone,
  RefreshCw,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useImportSpreadsheet,
} from '@/lib/api';
import {
  Contact,
  ContactSource,
  CreateContactPayload,
  SpreadsheetImportResponse,
} from '@/types/api';

interface ContactsViewProps {
  onStartCampaignWithContacts?: (contactIds: number[]) => void;
}

export function ContactsView({ onStartCampaignWithContacts }: ContactsViewProps) {
  // Query params
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<ContactSource | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'id' | 'first_name' | 'email' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected contacts
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);

  // Modals & Panels
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form State for create/edit
  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');

  // Import file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<SpreadsheetImportResponse | null>(null);

  // Hooks
  const {
    data: contactsData,
    isLoading: isLoadingContacts,
    refetch: refetchContacts,
    isRefetching,
  } = useContacts({
    page,
    per_page: 25,
    search: search.trim() || undefined,
    source: (sourceFilter as ContactSource) || undefined,
    is_active: isActiveFilter,
    sort_by: sortBy,
    sort_dir: sortDir,
  });

  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const importMutation = useImportSpreadsheet();

  const contacts = contactsData?.data || [];
  const meta = contactsData?.meta;

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingContact(null);
    setFormEmail('');
    setFormFirstName('');
    setFormLastName('');
    setFormCompany('');
    setFormPhone('');
    setFormJobTitle('');
    setIsContactModalOpen(true);
  };

  const handleOpenEditModal = (c: Contact) => {
    setEditingContact(c);
    setFormEmail(c.email);
    setFormFirstName(c.first_name || '');
    setFormLastName(c.last_name || '');
    setFormCompany(c.company || '');
    setFormPhone(c.phone || '');
    setFormJobTitle(c.job_title || '');
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) return;

    if (editingContact) {
      await updateMutation.mutateAsync({
        id: editingContact.id,
        payload: {
          email: formEmail,
          first_name: formFirstName,
          last_name: formLastName,
          company: formCompany,
          phone: formPhone,
          job_title: formJobTitle,
        },
      });
    } else {
      await createMutation.mutateAsync({
        email: formEmail,
        first_name: formFirstName,
        last_name: formLastName,
        company: formCompany,
        phone: formPhone,
        job_title: formJobTitle,
      });
    }
    setIsContactModalOpen(false);
  };

  const handleDeleteContact = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteMutation.mutateAsync(id);
      setSelectedContactIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importMutation.mutateAsync(file);
      setImportSummary(res);
      refetchContacts();
    } catch (err: any) {
      alert(err?.message || 'Spreadsheet import failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-[#0a1124] to-slate-900/90 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070b16]">
              <Users className="h-7 w-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Audience & Contact Book
              </h1>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-500/20">
                REST API v1
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Manage subscribers, upload Excel/CSV sheets with auto-header mapping, and target audiences for AI campaigns.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all shadow-lg shadow-cyan-500/10"
          >
            <Upload className="h-4 w-4" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add Single Contact</span>
          </button>

          {selectedContactIds.length > 0 && onStartCampaignWithContacts && (
            <button
              onClick={() => onStartCampaignWithContacts(selectedContactIds)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all animate-pulse"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
              <span>Launch Campaign ({selectedContactIds.length})</span>
            </button>
          )}

          <button
            onClick={() => refetchContacts()}
            disabled={isLoadingContacts || isRefetching}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Contact List"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Spreadsheet Upload Drawer / Panel */}
      {isImportOpen && (
        <div className="rounded-3xl border border-cyan-500/30 bg-[#0c1429] p-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Upload & Import Spreadsheet (Excel & CSV)
              </h3>
            </div>
            <button
              onClick={() => setIsImportOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/[0.03] p-8 text-center hover:border-cyan-400 hover:bg-cyan-500/[0.07] transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-white">
                {importMutation.isPending
                  ? 'Processing & Validating Spreadsheet...'
                  : 'Click or drop spreadsheet here'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports .xlsx, .xls, and .csv (Max 10MB)
              </p>
            </div>

            {/* Smart Detection Info */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <Sparkles className="h-4 w-4" />
                <span>Smart Auto-Mapping Features</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                The MailForge backend automatically detects email variations (<code className="text-cyan-300">email</code>, <code className="text-cyan-300">subscriber_email</code>, <code className="text-cyan-300">lead_email</code>, <code className="text-cyan-300">mail</code>).
              </p>
              <p className="leading-relaxed text-slate-400">
                Names (<code className="text-cyan-300">first_name</code>, <code className="text-cyan-300">last_name</code>, <code className="text-cyan-300">subscriber_fname</code>) and phone numbers are mapped seamlessly. Extra attributes are safely stored inside <code className="text-cyan-300">custom_data</code>.
              </p>
            </div>
          </div>

          {/* Import Summary Results */}
          {importSummary && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-3">
                <CheckCircle2 className="h-5 w-5" />
                <span>{importSummary.message}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-black/40 p-3 border border-white/5">
                  <div className="text-xl font-black text-white">{importSummary.summary.total_rows}</div>
                  <div className="text-[11px] text-slate-400 uppercase mt-0.5">Total Rows</div>
                </div>
                <div className="rounded-xl bg-black/40 p-3 border border-white/5">
                  <div className="text-xl font-black text-emerald-400">{importSummary.summary.created}</div>
                  <div className="text-[11px] text-slate-400 uppercase mt-0.5">Created Contacts</div>
                </div>
                <div className="rounded-xl bg-black/40 p-3 border border-white/5">
                  <div className="text-xl font-black text-amber-400">{importSummary.summary.duplicates_in_file}</div>
                  <div className="text-[11px] text-slate-400 uppercase mt-0.5">Duplicates</div>
                </div>
                <div className="rounded-xl bg-black/40 p-3 border border-white/5">
                  <div className="text-xl font-black text-rose-400">{importSummary.summary.invalid}</div>
                  <div className="text-[11px] text-slate-400 uppercase mt-0.5">Invalid Rows</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090d1a] p-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email, name, company, or phone..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:bg-white/10 focus:outline-none transition-all"
          />
        </div>

        {/* Source Dropdown Filter */}
        <div className="flex items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as ContactSource);
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Sources</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="manual">Manual</option>
            <option value="api">API</option>
            <option value="google_sheets">Google Sheets</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
            onChange={(e) => {
              const val = e.target.value;
              setIsActiveFilter(val === '' ? undefined : val === 'true');
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Contacts Data Table */}
      <div className="rounded-3xl border border-white/10 bg-[#080d1c] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e162b] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Company & Job</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingContacts ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                      <span>Fetching contacts via REST API...</span>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-600" />
                      <span className="font-semibold text-slate-300">No contacts found</span>
                      <span className="text-xs text-slate-500">
                        Upload an Excel/CSV spreadsheet or click "Add Single Contact".
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-cyan-500/[0.04]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(contact.id)}
                          className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs uppercase border border-cyan-500/20">
                            {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {contact.full_name || contact.first_name
                                ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                                : 'Unnamed'}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">{contact.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {contact.company ? (
                          <div>
                            <span className="font-medium text-slate-200">{contact.company}</span>
                            {contact.job_title && (
                              <div className="text-[11px] text-slate-500">{contact.job_title}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {contact.phone || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-300 border border-white/10 uppercase">
                          {contact.source}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            contact.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {contact.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            title="Edit Contact"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 px-6 py-4 bg-[#0a0f21] gap-3">
            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{meta.from || 0}</span> to{' '}
              <span className="font-bold text-white">{meta.to || 0}</span> of{' '}
              <span className="font-bold text-white">{meta.total}</span> total contacts
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-xs text-slate-400 px-2">
                Page {meta.current_page} of {meta.last_page}
              </span>

              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1224] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingContact ? 'Edit Contact' : 'Create New Contact'}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">First Name</label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Company</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="Director"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold text-slate-950 hover:opacity-95 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingContact
                    ? 'Update Contact'
                    : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ContactsView;
