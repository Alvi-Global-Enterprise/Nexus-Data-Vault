'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Edit3,
  Eye,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  X,
  Radio,
  Sliders,
  Flame,
  Save,
  Code,
  Copy,
  Wand2,
  Info,
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
  CAMPAIGNS_QUERY_KEYS,
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
import { RichTextEditor } from './RichTextEditor';

const DYNAMIC_TAGS = [
  { label: 'First Name', tag: '{{ firstName }}' },
  { label: 'Last Name', tag: '{{ lastName }}' },
  { label: 'Company', tag: '{{ company }}' },
  { label: 'Email', tag: '{{ email }}' },
];

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

  // Modals & UI States
  const [isCreateOpen, setIsCreateOpen] = useState(initialContactIdsForNewCampaign.length > 0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<number | null>(null);

  // Toast Notification state
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // New Campaign Form State (3 Modes: direct, generate, polish)
  const [newName, setNewName] = useState('New Product Announcement');
  const [newMode, setNewMode] = useState<EmailMode>('direct');
  const [newProvider, setNewProvider] = useState<AiProvider>('gemini');
  const [newPrompt, setNewPrompt] = useState(
    'Create an engaging, high-converting product release email highlighting our new features and speed.'
  );
  const [newRawEmail, setNewRawEmail] = useState('');
  const [newTone, setNewTone] = useState<'professional' | 'urgent' | 'friendly' | 'enthusiastic'>('enthusiastic');
  const [newSubject, setNewSubject] = useState('Exclusive Product Announcement');
  const [newBodyHtml, setNewBodyHtml] = useState(
    '<p>Hello,</p>\n<p>We are thrilled to share an exclusive update regarding your account.</p>\n<p>Best regards,<br>The Team</p>'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [targetContactIds, setTargetContactIds] = useState<number[]>(initialContactIdsForNewCampaign);

  // Active Campaign Editable State
  const [editingSubject, setEditingSubject] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [bodyViewMode, setBodyViewMode] = useState<'preview' | 'code'>('preview');
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [regenerateTone, setRegenerateTone] = useState<'professional' | 'urgent' | 'friendly' | 'enthusiastic'>('enthusiastic');

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

  const queryClient = useQueryClient();
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
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
    refetchInterval: (query) => {
      const report = query.state.data?.data;
      if (report) {
        const isGen =
          report.generation_status === 'generating' ||
          (report.campaign_status === 'generating' &&
            report.generation_status !== 'completed' &&
            report.generation_status !== 'error');
        const isSending =
          report.campaign_status === 'sending' ||
          (report.total_recipients > 0 &&
            (report.queued_count > 0 || report.processing_count > 0));

        // Only poll if generating or actively sending (2.5s per backend specification)
        return isGen || isSending ? 2500 : false;
      }

      // Initial fallback if active campaign detail indicates pending background work
      if (activeCampaign?.status === 'generating' || activeCampaign?.status === 'sending') {
        return 2500;
      }
      return false;
    },
  });

  const { data: recipientsData } = useCampaignRecipients(activeCampaignId || 0, undefined, !!activeCampaignId);

  const statusReport = statusReportData?.data;
  const campaigns = campaignsData?.data || [];

  // Effective status: real-time statusReport takes immediate priority over cached activeCampaign
  const effectiveStatus: CampaignStatus =
    (statusReport?.campaign_status as CampaignStatus) || activeCampaign?.status || 'draft';

  // Sync activeCampaign details into editable state
  useEffect(() => {
    if (activeCampaign) {
      setEditingSubject(activeCampaign.subject || '');
      setEditingBody(activeCampaign.email_body || '');
      setRegeneratePrompt(activeCampaign.ai_prompt || '');
    }
  }, [activeCampaign?.id, activeCampaign?.subject, activeCampaign?.email_body, activeCampaign?.ai_prompt]);

  // Sync state in real time: when status or generation completes, invalidate query cache to refresh detail/list
  const prevGenRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    prevGenRef.current = null;
    prevStatusRef.current = null;
  }, [activeCampaignId]);

  useEffect(() => {
    if (!statusReport || !activeCampaignId) return;

    const currentGen = statusReport.generation_status;
    const currentStatus = statusReport.campaign_status;

    const genFinished =
      (prevGenRef.current === 'generating' || activeCampaign?.status === 'generating') &&
      (currentGen === 'completed' || currentGen === 'error');

    const statusChanged =
      (prevStatusRef.current !== null && prevStatusRef.current !== currentStatus) ||
      (activeCampaign && activeCampaign.status !== currentStatus);

    if (genFinished) {
      if (currentGen === 'completed') {
        showToast('success', 'AI copy generation completed! Review and edit your content below.');
      } else if (currentGen === 'error') {
        showToast('error', `AI generation failed: ${statusReport.generation_error || 'Internal error'}`);
      }
    }

    if (genFinished || statusChanged) {
      // Refresh campaign detail (to get generated subject, email body, updated status)
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(activeCampaignId) });
      // Refresh campaigns list so the cards update status
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
      // Refresh recipients list if delivery progress changed
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.recipients(activeCampaignId) });
    }

    prevGenRef.current = currentGen;
    prevStatusRef.current = currentStatus;
  }, [
    statusReport?.generation_status,
    statusReport?.campaign_status,
    activeCampaignId,
    activeCampaign?.status,
    queryClient,
  ]);

  // Insert tag helper
  const handleInsertTag = (tag: string, targetField: 'subject' | 'body' | 'prompt' | 'raw') => {
    navigator.clipboard?.writeText(tag);
    if (targetField === 'subject') {
      setEditingSubject((prev) => `${prev} ${tag}`);
    } else if (targetField === 'body') {
      setEditingBody((prev) => `${prev} ${tag}`);
    } else if (targetField === 'prompt') {
      setNewPrompt((prev) => `${prev} ${tag}`);
    } else if (targetField === 'raw') {
      setNewRawEmail((prev) => `${prev} ${tag}`);
    }
    showToast('info', 'Tag inserted into editor!');
  };

  // Handlers
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setNewSubject(template.subjectDefault);
    setNewBodyHtml(template.htmlContent);
    setNewMode('direct');
    showToast('info', `Loaded template: "${template.name}" into Direct Mode.`);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('error', 'Please enter a campaign name');
      return;
    }

    if (newMode === 'direct') {
      if (!newSubject.trim()) {
        showToast('error', 'Please enter an email subject line for direct mode');
        return;
      }
      if (!newBodyHtml.trim()) {
        showToast('error', 'Please enter an email body for direct mode');
        return;
      }
    } else if (newMode === 'generate') {
      if (!newPrompt.trim()) {
        showToast('error', 'Please enter an AI prompt for copy generation');
        return;
      }
    } else if (newMode === 'polish') {
      if (!newRawEmail.trim()) {
        showToast('error', 'Please paste your rough draft email to polish');
        return;
      }
      if (!newPrompt.trim()) {
        showToast('error', 'Please enter instructions on how AI should polish your draft');
        return;
      }
    }

    const payload: CreateCampaignPayload = {
      name: newName.trim(),
      email_mode: newMode,
      ai_provider: newProvider,
      ai_prompt: newMode !== 'direct' ? newPrompt.trim() : undefined,
      raw_input_email: newMode === 'polish' ? newRawEmail.trim() : undefined,
      subject: newMode === 'direct' ? newSubject.trim() : undefined,
      email_body: newMode === 'direct' ? newBodyHtml.trim() : undefined,
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

        // If AI mode (generate or polish), trigger AI generation immediately!
        if (newMode === 'generate' || newMode === 'polish') {
          showToast('info', 'AI Copywriter initiated! Generating email copy in background...');
          await triggerAiMutation.mutateAsync({
            id: createdCampaign.id,
            payload: {
              ai_prompt: newPrompt.trim() || undefined,
              tone: newTone,
            },
          });
        } else {
          showToast('success', 'Campaign draft created! Review and approve before dispatch.');
        }
      }
      refetchCampaigns();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to create campaign');
    }
  };

  const handleSaveDraft = async () => {
    if (!activeCampaignId) return;
    try {
      await updateMutation.mutateAsync({
        id: activeCampaignId,
        payload: {
          subject: editingSubject,
          email_body: editingBody,
        },
      });
      showToast('success', 'Campaign subject & body saved successfully!');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to save changes');
    }
  };

  const handleRegenerate = async () => {
    if (!activeCampaignId) return;
    try {
      setIsRegenerateModalOpen(false);
      showToast('info', 'AI Copywriter initiated! Generating new draft...');
      await triggerAiMutation.mutateAsync({
        id: activeCampaignId,
        payload: {
          ai_prompt: regeneratePrompt.trim() || undefined,
          tone: regenerateTone,
        },
      });
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to trigger regeneration');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteMutation.mutateAsync(id);
        if (activeCampaignId === id) setActiveCampaignId(null);
        showToast('info', 'Campaign deleted');
        refetchCampaigns();
      } catch (err: any) {
        showToast('error', err?.response?.data?.message || err?.message || 'Failed to delete campaign');
      }
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
      showToast('success', 'Campaign content approved! Ready for live dispatch.');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to approve campaign');
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await dispatchMutation.mutateAsync(id);
      showToast('success', 'Campaign dispatch initiated! Live delivery progress active.');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to dispatch campaign');
    }
  };

  const handlePause = async (id: number) => {
    try {
      await pauseMutation.mutateAsync(id);
      showToast('info', 'Campaign delivery paused');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to pause campaign');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await resumeMutation.mutateAsync(id);
      showToast('success', 'Campaign delivery resumed');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || err?.message || 'Failed to resume campaign');
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Are you sure you want to cancel this campaign?')) {
      try {
        await cancelMutation.mutateAsync(id);
        showToast('info', 'Campaign delivery cancelled');
      } catch (err: any) {
        showToast('error', err?.response?.data?.message || err?.message || 'Failed to cancel campaign');
      }
    }
  };

  const hasUnsavedChanges =
    activeCampaign &&
    (editingSubject !== (activeCampaign.subject || '') ||
      editingBody !== (activeCampaign.email_body || ''));

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
    <div className="space-y-6 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 transition-all max-w-md border-white/10 bg-[#0d142b]/95 text-xs text-white">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-cyan-400 shrink-0" />}
          <span className="flex-1 font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
              3 Production Modes: Direct manual editor, AI Gemini generator, and AI draft polisher with live dispatch.
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
              Click &quot;Create Campaign&quot; to test Direct Mode, AI Generate, or AI Polish.
            </p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const isSelected = camp.id === activeCampaignId;
            const liveCampStatus = isSelected && statusReport ? statusReport.campaign_status : camp.status;
            const liveSentCount = isSelected && statusReport ? statusReport.sent_count : camp.sent_count;
            const liveTotalRecipients = isSelected && statusReport ? statusReport.total_recipients : camp.total_recipients;
            const progress =
              liveTotalRecipients > 0
                ? Math.round((liveSentCount / liveTotalRecipients) * 100)
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
                        liveCampStatus
                      )}`}
                    >
                      {liveCampStatus}
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
                      <span className="text-slate-400">Progress ({liveSentCount}/{liveTotalRecipients})</span>
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
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-white">{activeCampaign.name}</h2>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                    effectiveStatus
                  )}`}
                >
                  {effectiveStatus}
                </span>

                <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs font-mono text-cyan-300 uppercase">
                  Mode: {activeCampaign.email_mode === 'generate' ? 'AI Generate' : activeCampaign.email_mode === 'polish' ? 'AI Polish' : 'Direct'}
                </span>

                {statusReport?.generation_status === 'generating' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
                    <Bot className="h-3 w-3 animate-spin" />
                    AI Generating
                  </span>
                )}
                {statusReport?.generation_status === 'completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    <Check className="h-3 w-3" />
                    AI Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ID: <span className="text-slate-300 font-mono">#{activeCampaign.id}</span> · Created:{' '}
                {new Date(activeCampaign.created_at).toLocaleString()}
              </p>
              {statusReport?.generation_status === 'error' && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>AI generation failed: {statusReport.generation_error || 'Internal server error'}</span>
                </div>
              )}
            </div>

            {/* Campaign In-Flight Lifecycle Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Regenerate AI button for AI modes */}
              {activeCampaign.email_mode !== 'direct' &&
                (effectiveStatus === 'draft' || effectiveStatus === 'review') && (
                  <button
                    onClick={() => setIsRegenerateModalOpen(true)}
                    disabled={triggerAiMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Regenerate with AI</span>
                  </button>
                )}

              {/* Approval Step (Required before dispatch for draft or review campaigns) */}
              {(effectiveStatus === 'review' || effectiveStatus === 'draft') && (
                <button
                  onClick={() => handleApprove(activeCampaign.id)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{approveMutation.isPending ? 'Approving...' : 'Approve Campaign'}</span>
                </button>
              )}

              {/* If Approved: Dispatch (Strictly requires approved status) */}
              {effectiveStatus === 'approved' && (
                <button
                  onClick={() => handleDispatch(activeCampaign.id)}
                  disabled={dispatchMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  <Send className="h-4 w-4 stroke-[2.5]" />
                  <span>{dispatchMutation.isPending ? 'Starting Dispatch...' : 'Send Campaign'}</span>
                </button>
              )}

              {/* If Sending: Pause */}
              {effectiveStatus === 'sending' && (
                <button
                  onClick={() => handlePause(activeCampaign.id)}
                  disabled={pauseMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause Delivery</span>
                </button>
              )}

              {/* If Paused: Resume */}
              {effectiveStatus === 'paused' && (
                <button
                  onClick={() => handleResume(activeCampaign.id)}
                  disabled={resumeMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume Delivery</span>
                </button>
              )}

              {/* Cancel Button */}
              {['sending', 'paused', 'queued', 'approved'].includes(effectiveStatus) && (
                <button
                  onClick={() => handleCancel(activeCampaign.id)}
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
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">Delivery Progress</div>
            </div>
          </div>

          {/* AI Generating In-Flight Progress Animation */}
          {statusReport?.generation_status === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6 animate-pulse">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-purple-400 animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI is generating your email copy...</h4>
                <p className="text-xs text-purple-300/80 mt-1">
                  Google Gemini Pro is writing and formatting the subject and body. Polling status every 2.5s.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review & Editable Subject Line & Email Body */}
          <div className="rounded-2xl border border-white/10 bg-[#070b16] p-5 space-y-4">
            {/* Subject Line Field */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <span>Subject Line</span>
                  {hasUnsavedChanges && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                      Unsaved Changes
                    </span>
                  )}
                </label>
                {/* Dynamic tag insert buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-500 mr-1 font-mono">Insert tag:</span>
                  {DYNAMIC_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => handleInsertTag(t.tag, 'subject')}
                      className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all font-semibold"
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={editingSubject}
                onChange={(e) => setEditingSubject(e.target.value)}
                placeholder="Enter email subject line..."
                disabled={['sending', 'completed'].includes(effectiveStatus)}
                className="w-full rounded-xl border border-white/10 bg-[#0b0f1a] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all disabled:opacity-60"
              />
            </div>

            {/* Email Body Header: Tabs & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBodyViewMode('preview')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    bodyViewMode === 'preview'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Live HTML Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBodyViewMode('code')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    bodyViewMode === 'code'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Rich Text Editor</span>
                </button>
              </div>

              {/* Dynamic tag insert for body */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-500 mr-1 font-mono">Insert tag:</span>
                {DYNAMIC_TAGS.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => handleInsertTag(t.tag, 'body')}
                    className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all font-semibold"
                  >
                    + {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Display: Preview vs Rich Text Editor */}
            <div>
              {bodyViewMode === 'preview' ? (
                <div className="w-full min-h-[220px] max-h-[380px] overflow-y-auto rounded-xl border border-white/5 bg-[#0b0f19] p-4 text-xs">
                  {editingBody ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: editingBody }}
                      className="prose prose-invert max-w-none text-xs"
                    />
                  ) : (
                    <div className="text-slate-500 font-mono text-xs py-8 text-center">
                      No email body content available yet. Switch to &quot;Rich Text Editor&quot; or generate with AI.
                    </div>
                  )}
                </div>
              ) : (
                <RichTextEditor
                  value={editingBody}
                  onChange={setEditingBody}
                  disabled={['sending', 'completed'].includes(effectiveStatus)}
                  placeholder="Edit your email content here..."
                  minHeight="260px"
                />
              )}
            </div>

            {/* Save Changes Button Bar */}
            {['draft', 'review', 'approved'].includes(effectiveStatus) && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Changes save directly via PUT /campaigns/#{activeCampaign.id}
                </span>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={updateMutation.isPending || !hasUnsavedChanges}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{updateMutation.isPending ? 'Saving...' : 'Save Copy Changes'}</span>
                </button>
              </div>
            )}
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

      {/* Step 1 & 2: Create Campaign Modal Wizard (3 Modes) */}
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

              {/* Step 1: Mode Selection UI */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">Campaign Mode *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mode 1: Direct */}
                  <div
                    onClick={() => setNewMode('direct')}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all text-left relative ${
                      newMode === 'direct'
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500 shadow-lg shadow-cyan-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layout className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">Write Myself</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Manual custom subject & HTML body. No AI generation required.
                    </p>
                  </div>

                  {/* Mode 2: AI Generate */}
                  <div
                    onClick={() => setNewMode('generate')}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all text-left relative ${
                      newMode === 'generate'
                        ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 shadow-lg shadow-purple-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bot className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-white text-xs">Generate with AI</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Google Gemini Pro crafts subject & copy from your prompt & tone.
                    </p>
                  </div>

                  {/* Mode 3: AI Polish */}
                  <div
                    onClick={() => setNewMode('polish')}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all text-left relative ${
                      newMode === 'polish'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Wand2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">Polish My Draft</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Paste rough notes; AI elevates them into a high-converting email.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic tag insert bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-[11px]">
                <span className="text-slate-400 font-medium">Dynamic Tags Available:</span>
                {DYNAMIC_TAGS.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() =>
                      handleInsertTag(
                        t.tag,
                        newMode === 'direct'
                          ? 'body'
                          : newMode === 'polish'
                          ? 'raw'
                          : 'prompt'
                      )
                    }
                    className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/20"
                  >
                    + {t.label}
                  </button>
                ))}
              </div>

              {/* Direct Mode Inputs: Subject & HTML Body */}
              {newMode === 'direct' && (
                <div className="space-y-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.02] p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="font-bold text-white text-xs">Manual Email Content</span>
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20"
                    >
                      {selectedTemplate ? `Using: ${selectedTemplate.name}` : 'Browse 4 Presets'}
                    </button>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Subject Line *</label>
                    <input
                      type="text"
                      required={newMode === 'direct'}
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="e.g. Exclusive Q4 Alpha Briefing"
                      className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3.5 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-300 font-semibold block">Email Body (Rich Text Editor) *</label>
                      <span className="text-[10px] text-cyan-400 font-mono">WYSIWYG · Formats automatically</span>
                    </div>
                    <RichTextEditor
                      value={newBodyHtml}
                      onChange={setNewBodyHtml}
                      placeholder="Start writing your email message here... Style with bold, headings, bullets, links, etc."
                      minHeight="220px"
                    />
                  </div>
                </div>
              )}

              {/* AI Generate Mode Inputs: Prompt & Tone */}
              {newMode === 'generate' && (
                <div className="space-y-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.02] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">AI Engine</label>
                      <select
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value as AiProvider)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-white"
                      >
                        <option value="gemini">Google Gemini Pro (Fast & Creative)</option>
                        <option value="openai">OpenAI GPT-4o</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Tone of Voice</label>
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
                    <label className="text-slate-300 font-semibold block mb-1">AI Copywriter Prompt *</label>
                    <textarea
                      rows={3}
                      required={newMode === 'generate'}
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder="e.g. Write an announcement email for product discount with a 20% coupon code and personal greeting using {{ firstName }}..."
                      className="w-full rounded-xl border border-white/10 bg-[#0d1326] p-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* AI Polish Mode Inputs: Raw Input Email + Instructions */}
              {newMode === 'polish' && (
                <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Paste Rough Draft Email *
                    </label>
                    <textarea
                      rows={4}
                      required={newMode === 'polish'}
                      value={newRawEmail}
                      onChange={(e) => setNewRawEmail(e.target.value)}
                      placeholder="Paste your rough notes or draft email here: e.g. Hey guys, our new update is out, fixes bugs, 20% discount until Friday..."
                      className="w-full rounded-xl border border-white/10 bg-[#0d1326] p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

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
                      <label className="text-slate-300 font-semibold block mb-1">Desired Tone</label>
                      <select
                        value={newTone}
                        onChange={(e) => setNewTone(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-white"
                      >
                        <option value="professional">Professional & Corporate</option>
                        <option value="enthusiastic">Enthusiastic & High Energy</option>
                        <option value="urgent">Urgent & Time-Sensitive</option>
                        <option value="friendly">Friendly & Warm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Polish Instructions *
                    </label>
                    <textarea
                      rows={2}
                      required={newMode === 'polish'}
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder="e.g. Elevate this rough draft into a persuasive, elegant product email with clear CTA buttons."
                      className="w-full rounded-xl border border-white/10 bg-[#0d1326] p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Attach Target Recipients Checkbox count */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Recipients *</label>
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
                  disabled={createMutation.isPending || triggerAiMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {createMutation.isPending || triggerAiMutation.isPending
                    ? 'Processing Campaign...'
                    : newMode === 'direct'
                    ? 'Save Draft Campaign'
                    : 'Create & Run AI Generation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerate AI Modal */}
      {isRegenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#0b1021] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Regenerate Copy with AI</h3>
              </div>
              <button onClick={() => setIsRegenerateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tone</label>
                <select
                  value={regenerateTone}
                  onChange={(e) => setRegenerateTone(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2 text-white"
                >
                  <option value="enthusiastic">Enthusiastic & High Energy</option>
                  <option value="professional">Professional & Corporate</option>
                  <option value="urgent">Urgent & Time-Sensitive</option>
                  <option value="friendly">Friendly & Warm</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">AI Prompt / Revision Notes</label>
                <textarea
                  rows={3}
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  placeholder="Update instructions or focus on specific features..."
                  className="w-full rounded-xl border border-white/10 bg-[#0d1326] p-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRegenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={triggerAiMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-purple-500 font-bold text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {triggerAiMutation.isPending ? 'Queuing AI...' : 'Run AI Regeneration'}
                </button>
              </div>
            </div>
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
