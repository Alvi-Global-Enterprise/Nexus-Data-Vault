import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignsService from '../services/campaigns.service';
import {
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CampaignsQueryParams,
  CampaignRecipient,
  RecipientsQueryParams,
  TriggerAiPayload,
  CampaignStatusReport,
  CampaignDeliveryStats,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';

export const CAMPAIGNS_QUERY_KEYS = {
  all: ['campaigns'] as const,
  lists: () => [...CAMPAIGNS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: CampaignsQueryParams) => [...CAMPAIGNS_QUERY_KEYS.lists(), params] as const,
  details: () => [...CAMPAIGNS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...CAMPAIGNS_QUERY_KEYS.details(), id] as const,
  recipients: (id: number | string, params?: RecipientsQueryParams) =>
    [...CAMPAIGNS_QUERY_KEYS.detail(id), 'recipients', params] as const,
  status: (id: number | string) => [...CAMPAIGNS_QUERY_KEYS.detail(id), 'status'] as const,
  delivery: (id: number | string) => [...CAMPAIGNS_QUERY_KEYS.detail(id), 'delivery'] as const,
};

/**
 * Fetch paginated campaigns list
 */
export function useCampaigns(params?: CampaignsQueryParams) {
  return useQuery<PaginatedResponse<Campaign>, Error>({
    queryKey: CAMPAIGNS_QUERY_KEYS.list(params),
    queryFn: () => campaignsService.getCampaigns(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single campaign details
 */
export function useCampaign(id: number | string, enabled = true) {
  return useQuery<ApiResponse<Campaign>, Error>({
    queryKey: CAMPAIGNS_QUERY_KEYS.detail(id),
    queryFn: () => campaignsService.getCampaign(id),
    enabled: enabled && !!id,
  });
}

/**
 * Create campaign mutation
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Campaign>, Error, CreateCampaignPayload>({
    mutationFn: (payload: CreateCampaignPayload) => campaignsService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Update campaign draft mutation
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Campaign>,
    Error,
    { id: number | string; payload: UpdateCampaignPayload }
  >({
    mutationFn: ({ id, payload }) => campaignsService.updateCampaign(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Delete campaign mutation
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, number | string>({
    mutationFn: (id: number | string) => campaignsService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Attach recipients mutation
 */
export function useAttachRecipients() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; total_recipients: number }>,
    Error,
    { id: number | string; contactIds: number[] }
  >({
    mutationFn: ({ id, contactIds }) => campaignsService.attachRecipients(id, contactIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Fetch campaign recipients list with delivery states
 */
export function useCampaignRecipients(
  id: number | string,
  params?: RecipientsQueryParams,
  enabled = true
) {
  return useQuery<PaginatedResponse<CampaignRecipient>, Error>({
    queryKey: CAMPAIGNS_QUERY_KEYS.recipients(id, params),
    queryFn: () => campaignsService.getRecipients(id, params),
    enabled: enabled && !!id,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Trigger AI generation mutation
 */
export function useTriggerAiGeneration() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; status: string }>,
    Error,
    { id: number | string; payload?: TriggerAiPayload }
  >({
    mutationFn: ({ id, payload }) => campaignsService.triggerAiGeneration(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.status(variables.id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Approve campaign mutation
 */
export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Campaign>, Error, number | string>({
    mutationFn: (id: number | string) => campaignsService.approveCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Dispatch / Send campaign mutation
 */
export function useDispatchCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; status: string; enqueued_recipients: number }>,
    Error,
    number | string
  >({
    mutationFn: (id: number | string) => campaignsService.dispatchCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.status(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Pause campaign mutation
 */
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; status: string }>,
    Error,
    number | string
  >({
    mutationFn: (id: number | string) => campaignsService.pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.status(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Resume campaign mutation
 */
export function useResumeCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; status: string }>,
    Error,
    number | string
  >({
    mutationFn: (id: number | string) => campaignsService.resumeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.status(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Cancel campaign mutation
 */
export function useCancelCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ campaign_id: number; status: string }>,
    Error,
    number | string
  >({
    mutationFn: (id: number | string) => campaignsService.cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.status(id) });
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Live campaign status report hook (auto-pollable)
 */
export function useCampaignStatus(
  id: number | string,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery<ApiResponse<CampaignStatusReport>, Error>({
    queryKey: CAMPAIGNS_QUERY_KEYS.status(id),
    queryFn: () => campaignsService.getCampaignStatus(id),
    enabled: options?.enabled ?? !!id,
    refetchInterval: options?.refetchInterval ?? 3000,
  });
}

/**
 * Live aggregate delivery stats hook
 */
export function useCampaignDeliveryStats(
  id: number | string,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery<ApiResponse<CampaignDeliveryStats>, Error>({
    queryKey: CAMPAIGNS_QUERY_KEYS.delivery(id),
    queryFn: () => campaignsService.getDeliveryStats(id),
    enabled: options?.enabled ?? !!id,
    refetchInterval: options?.refetchInterval ?? 3000,
  });
}
