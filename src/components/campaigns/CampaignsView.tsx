'use client';

import React, { useState } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Bot,
  Layout,
  Users,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  X,
  Radio,
  Sliders,
  Flame,
} from 'lucide-react';
import {
  useCampaigns,
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useAttachRecipients,
  useCampaignRecipients,
  useTriggerAiGeneration,
  useApproveCampaign,
  useDispatchCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useCancelCampaign,
  useCampaignStatus,
  useCampaignDeliveryStats,
  useContacts,
} from '@/lib/api';
import {
  Campaign,
  EmailMode,
  AiProvider,
  CampaignStatus,
  CreateCampaignPayload,
  EmailTemplate,
} from '@/types/api';
import { EmailTemplateModal } from './EmailTemplateModal';
import { EMAIL_TEMPLATES } from '@/lib/templates/emailTemplates';

interface CampaignsViewProps {
  initialContactIdsForNewCampaign?: number[];
  onClearInitialContacts?: () => void;
}

export function CampaignsView({
  initialContactIdsForNewCampaign = [],
  onClearInitialContacts,
}: CampaignsViewProps) {
  // Query state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(initialContactIdsForNewCampaign.length > 0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<number | null>(null);

  // New Campaign Form State
  const [newName, setNewName] = useState('Product Announcement Campaign');
  const [newMode, setNewMode] = useState<EmailMode>('generate');
  const [newProvider, setNewProvider] = useState<AiProvider>('gemini');
  const [newPrompt, setNewPrompt] = useState(
    'Create an engaging, high-converting product release email highlighting our new features and speed.'
  );
  const [newTone, setNewTone] = useState<'professional' | 'urgent' | 'friendly' | 'enthusiastic'>('enthusiastic');
  const [newAudience, setNewAudience] = useState('Tech & Crypto Subscribers');
  const [newSubject, setNewSubject] = useState('');
  const [newBodyHtml, setNewBodyHtml] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [targetContactIds, setTargetContactIds] = useState<number[]>(initialContactIdsForNewCampaign);

  // API Queries & Mutations
  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
    isRefetching,
  } = useCampaigns({
    page,
    per_page: 25,
    status: (statusFilter as CampaignStatus) || undefined,
    search: search.trim() || undefined,
  });

  const { data: contactsData } = useContacts({ per_page: 100 });

  const createMutation = useCreateCampaign();
  const deleteMutation = useDeleteCampaign();
  const attachRecipientsMutation = useAttachRecipients();
  const triggerAiMutation = useTriggerAiGeneration();
  const approveMutation = useApproveCampaign();
  const dispatchMutation = useDispatchCampaign();
  const pauseMutation = usePauseCampaign();
  const resumeMutation = useResumeCampaign();
  const cancelMutation = useCancelCampaign();

  // Active Campaign Detail & Status Hooks
  const { data: activeCampaignData } = useCampaign(activeCampaignId || 0, !!activeCampaignId);
  const activeCampaign = activeCampaignData?.data;

  const { data: statusReportData } = useCampaignStatus(activeCampaignId || 0, {
    enabled: !!activeCampaignId,
    refetchInterval:
      activeCampaign?.status === 'sending' || activeCampaign?.status === 'generating'
        ? 2000
        : false,
  });

  const { data: recipientsData } = useCampaignRecipients(activeCampaignId || 0, undefined, !!activeCampaignId);

  const statusReport = statusReportData?.data;
  const campaigns = campaignsData?.data || [];

  // Handlers
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setNewSubject(template.subjectDefault);
    setNewBodyHtml(template.htmlContent);
    // If user picks a template, direct mode fits naturally, or polish
    if (newMode === 'generate') {
      setNewMode('direct');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const payload: CreateCampaignPayload = {
      name: newName,
      email_mode: newMode,
      ai_provider: newMode !== 'direct' ? newProvider : undefined,
      ai_prompt: newMode !== 'direct' ? newPrompt : undefined,
      subject: newSubject || (selectedTemplate?.subjectDefault ?? 'Important Announcement'),
      email_body: newBodyHtml || (selectedTemplate?.htmlContent ?? '<p>Hello {{firstName}},</p>'),
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      const createdCampaign = res.data;

      // Attach contacts if selected
      if (createdCampaign?.id && targetContactIds.length > 0) {
        await attachRecipientsMutation.mutateAsync({
          id: createdCampaign.id,
          contactIds: targetContactIds,
        });
      }

      setIsCreateOpen(false);
      if (onClearInitialContacts) onClearInitialContacts();
      if (createdCampaign?.id) {
        setActiveCampaignId(createdCampaign.id);
      }
      refetchCampaigns();
    } catch (err: any) {
      alert(err?.message || 'Failed to create campaign');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteMutation.mutateAsync(id);
      if (activeCampaignId === id) setActiveCampaignId(null);
      refetchCampaigns();
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'sending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'approved':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'review':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'generating':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse';
      case 'paused':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-[#0a1124] to-slate-900/90 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070b16]">
              <Send className="h-7 w-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                MailForge AI Campaigns
              </h1>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-400 border border-cyan-500/20">
                REST API v1
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              AI copywriting, responsive email template presets, human review gates, and live SES/SMTP dispatch engine.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all shadow-lg shadow-cyan-500/10"
          >
            <Layout className="h-4 w-4" />
            <span>Browse 4 UI Templates</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Campaign</span>
          </button>

          <button
            onClick={() => refetchCampaigns()}
            disabled={isLoadingCampaigns || isRefetching}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Campaigns"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090d1a] p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name or subject line..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:bg-white/10 focus:outline-none transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CampaignStatus)}
          className="rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          <option value="">All Campaign Statuses</option>
          <option value="draft">Draft</option>
          <option value="generating">Generating (AI)</option>
          <option value="review">Review Ready</option>
          <option value="approved">Approved</option>
          <option value="sending">Sending (Live)</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoadingCampaigns ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span>Fetching campaigns from REST API...</span>
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#080d1c] py-16 text-center text-slate-400">
            <Send className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No campaigns created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click "Create Campaign" or choose one of the 4 UI templates to launch your first delivery.
            </p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const isSelected = camp.id === activeCampaignId;
            const progress =
              camp.total_recipients > 0
                ? Math.round((camp.sent_count / camp.total_recipients) * 100)
                : 0;

            return (
              <div
                key={camp.id}
                onClick={() => setActiveCampaignId(camp.id)}
                className={`relative cursor-pointer rounded-3xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500 bg-[#0d172e] shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-white/10 bg-[#090e1c] hover:border-white/20 hover:bg-[#0c1326]'
                }`}
              >
                <div>
                  {/* Top Status & Mode */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                        camp.status
                      )}`}
                    >
                      {camp.status}
                    </span>

                    <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 uppercase">
                      {camp.email_mode === 'generate' ? '🤖 AI Gen' : camp.email_mode === 'polish' ? '✨ Polish' : '📝 Direct'}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-1">
                    {camp.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 font-sans mb-4">
                    {camp.subject || 'No subject line specified yet'}
                  </p>
                </div>

                <div>
                  {/* Delivery Metrics Bar */}
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Progress ({camp.sent_count}/{camp.total_recipients})</span>
                      <span className="text-cyan-400 font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Action Chips */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(camp.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-1 font-bold text-cyan-400 hover:underline">
                        <span>Workspace</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Campaign Detail / Controller Drawer & Live Monitor */}
      {activeCampaign && (
        <div className="rounded-3xl border border-cyan-500/40 bg-[#090f21] p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4">
          {/* Header of Active Campaign */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white">{activeCampaign.name}</h2>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                    activeCampaign.status
                  )}`}
                >
                  {activeCampaign.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Subject: <span className="text-cyan-300 font-medium">{activeCampaign.subject || 'Not set'}</span> · Created:{' '}
                {new Date(activeCampaign.created_at).toLocaleString()}
              </p>
            </div>

            {/* Campaign In-Flight Lifecycle Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* If Draft & AI mode: Trigger AI */}
              {activeCampaign.status === 'draft' && activeCampaign.email_mode !== 'direct' && (
                <button
                  onClick={() => triggerAiMutation.mutate({ id: activeCampaign.id })}
                  disabled={triggerAiMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  <Bot className="h-4 w-4" />
                  <span>{triggerAiMutation.isPending ? 'Queuing AI...' : 'Generate with AI'}</span>
                </button>
              )}

              {/* If Review: Approve Button */}
              {activeCampaign.status === 'review' && (
                <button
                  onClick={() => approveMutation.mutate(activeCampaign.id)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Approve Content</span>
                </button>
              )}

              {/* If Approved or Paused: Dispatch */}
              {(activeCampaign.status === 'approved' || activeCampaign.status === 'draft') && (
                <button
                  onClick={() => dispatchMutation.mutate(activeCampaign.id)}
                  disabled={dispatchMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{dispatchMutation.isPending ? 'Starting Dispatch...' : 'Dispatch Campaign'}</span>
                </button>
              )}

              {/* If Sending: Pause */}
              {activeCampaign.status === 'sending' && (
                <button
                  onClick={() => pauseMutation.mutate(activeCampaign.id)}
                  disabled={pauseMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause Delivery</span>
                </button>
              )}

              {/* If Paused: Resume */}
              {activeCampaign.status === 'paused' && (
                <button
                  onClick={() => resumeMutation.mutate(activeCampaign.id)}
                  disabled={resumeMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume Delivery</span>
                </button>
              )}

              {/* Cancel Button */}
              {['sending', 'paused', 'queued', 'approved'].includes(activeCampaign.status) && (
                <button
                  onClick={() => cancelMutation.mutate(activeCampaign.id)}
                  disabled={cancelMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                onClick={() => setActiveCampaignId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Real-time Status Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-white/5 bg-[#0e162c] p-4 text-center">
              <div className="text-2xl font-black text-white font-mono">
                {statusReport?.total_recipients ?? activeCampaign.total_recipients}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Total Recipients</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e162c] p-4 text-center">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {statusReport?.sent_count ?? activeCampaign.sent_count}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Successfully Sent</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e162c] p-4 text-center">
              <div className="text-2xl font-black text-amber-400 font-mono">
                {statusReport?.queued_count ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">In Queue</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e162c] p-4 text-center">
              <div className="text-2xl font-black text-rose-400 font-mono">
                {statusReport?.failed_count ?? activeCampaign.failed_count}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Delivery Bounces</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#0e162c] p-4 text-center">
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {statusReport?.delivery_progress ??
                  (activeCampaign.total_recipients > 0
                    ? Math.round((activeCampaign.sent_count / activeCampaign.total_recipients) * 100)
                    : 0)}
                %
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Delivery Completion</div>
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="rounded-2xl border border-white/10 bg-[#070b16] p-4">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-300">
              <span>Email Body Preview</span>
              <span className="font-mono text-[11px] text-cyan-400">Rendered HTML</span>
            </div>
            <div className="w-full max-h-[350px] overflow-y-auto rounded-xl border border-white/5 bg-[#0b0f19] p-4">
              {activeCampaign.email_body ? (
                <div
                  dangerouslySetInnerHTML={{ __html: activeCampaign.email_body }}
                  className="prose prose-invert max-w-none text-xs"
                />
              ) : (
                <div className="text-slate-500 font-mono text-xs">No email content generated yet.</div>
              )}
            </div>
          </div>

          {/* Attached Recipients Table */}
          {recipientsData && recipientsData.data.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#080d1c] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Attached Recipients & Delivery States ({recipientsData.meta.total})
                </h4>
              </div>
              <div className="overflow-x-auto max-h-[220px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Attempts</th>
                      <th className="py-2 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {recipientsData.data.map((rec) => (
                      <tr key={rec.id}>
                        <td className="py-2 px-3 text-white">{rec.email}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              rec.status === 'sent'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : rec.status === 'failed'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-slate-500/10 text-slate-300'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">{rec.attempts}</td>
                        <td className="py-2 px-3 text-slate-500">
                          {rec.sent_at ? new Date(rec.sent_at).toLocaleTimeString() : 'Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Modal Wizard */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b1021] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <Send className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Create New Email Campaign</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              {/* Campaign Name */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Q4 Institutional Investor Alpha Briefing"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Email Creation Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setNewMode('generate')}
                    className={`cursor-pointer rounded-2xl border p-3.5 text-center transition-all ${
                      newMode === 'generate'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <Bot className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="font-bold text-white">AI Generate</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Prompt-driven copywriting</div>
                  </div>

                  <div
                    onClick={() => setNewMode('direct')}
                    className={`cursor-pointer rounded-2xl border p-3.5 text-center transition-all ${
                      newMode === 'direct'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <Layout className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="font-bold text-white">Use UI Template</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Choose from 4 designs</div>
                  </div>

                  <div
                    onClick={() => setNewMode('polish')}
                    className={`cursor-pointer rounded-2xl border p-3.5 text-center transition-all ${
                      newMode === 'polish'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <Sparkles className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                    <div className="font-bold text-white">AI Polish</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Refine rough draft</div>
                  </div>
                </div>
              </div>

              {/* Template Picker Trigger */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Email Template:</span>
                    <span className="text-cyan-400 font-mono">
                      {selectedTemplate ? selectedTemplate.name : 'Choose a Sample Template'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select from SaaS Launch, Crypto Alpha, Executive Letter, or VIP Promo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"
                >
                  {selectedTemplate ? 'Change Template' : 'Pick Template'}
                </button>
              </div>

              {/* If AI Generate / Polish: Prompts */}
              {newMode !== 'direct' && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">AI Engine</label>
                      <select
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value as AiProvider)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-white"
                      >
                        <option value="gemini">Google Gemini Pro</option>
                        <option value="openai">OpenAI GPT-4o</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Tone & Voice</label>
                      <select
                        value={newTone}
                        onChange={(e) => setNewTone(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-white"
                      >
                        <option value="enthusiastic">Enthusiastic & High Energy</option>
                        <option value="professional">Professional & Corporate</option>
                        <option value="urgent">Urgent & Time-Sensitive</option>
                        <option value="friendly">Friendly & Warm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">AI Instructions / Prompt *</label>
                    <textarea
                      rows={3}
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder="Describe what the email should communicate..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Subject Line */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Exclusive Market Insights & Updates"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Attach Target Recipients Checkbox count */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Recipients</label>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span>
                      {targetContactIds.length > 0
                        ? `${targetContactIds.length} contact(s) pre-selected from database`
                        : `All active contacts in book (${contactsData?.meta.total || 0})`}
                    </span>
                  </div>
                  {targetContactIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTargetContactIds([])}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating Campaign...' : 'Save & Launch Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4 Email Templates Showcase Modal */}
      <EmailTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

    </div>
  );
}

export default CampaignsView;
