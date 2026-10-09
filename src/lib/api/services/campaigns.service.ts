import apiClient from '../axios';
import { API_ENDPOINTS } from '../endpoints';
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

export const campaignsService = {
  /**
   * List campaigns with pagination and filters
   */
  async getCampaigns(params?: CampaignsQueryParams): Promise<PaginatedResponse<Campaign>> {
    const response = await apiClient.get<PaginatedResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Create a new campaign draft
   */
  async createCampaign(payload: CreateCampaignPayload): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Get single campaign details by ID
   */
  async getCampaign(id: number | string): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.get<ApiResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Update campaign draft by ID
   */
  async updateCampaign(
    id: number | string,
    payload: UpdateCampaignPayload
  ): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.put<ApiResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.DETAIL(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete campaign draft
   */
  async deleteCampaign(id: number | string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.CAMPAIGNS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Attach contacts as recipients to campaign
   */
  async attachRecipients(
    id: number | string,
    contactIds: number[]
  ): Promise<ApiResponse<{ campaign_id: number; total_recipients: number }>> {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; total_recipients: number }>
    >(API_ENDPOINTS.CAMPAIGNS.RECIPIENTS(id), { contact_ids: contactIds });
    return response.data;
  },

  /**
   * List campaign recipients with individual delivery statuses
   */
  async getRecipients(
    id: number | string,
    params?: RecipientsQueryParams
  ): Promise<PaginatedResponse<CampaignRecipient>> {
    const response = await apiClient.get<PaginatedResponse<CampaignRecipient>>(
      API_ENDPOINTS.CAMPAIGNS.RECIPIENTS(id),
      { params }
    );
    return response.data;
  },

  /**
   * Trigger AI copywriting or polish in background
   */
  async triggerAiGeneration(
    id: number | string,
    payload?: TriggerAiPayload
  ): Promise<ApiResponse<{ campaign_id: number; status: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; status: string }>
    >(API_ENDPOINTS.CAMPAIGNS.GENERATE(id), payload || {});
    return response.data;
  },

  /**
   * Approve campaign copy (human gate before dispatching)
   */
  async approveCampaign(id: number | string): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.APPROVE(id)
    );
    return response.data;
  },

  /**
   * Dispatch / Send campaign to all attached recipients
   */
  async dispatchCampaign(
    id: number | string
  ): Promise<
    ApiResponse<{ campaign_id: number; status: string; enqueued_recipients: number }>
  > {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; status: string; enqueued_recipients: number }>
    >(API_ENDPOINTS.CAMPAIGNS.DISPATCH(id));
    return response.data;
  },

  /**
   * Pause in-flight campaign
   */
  async pauseCampaign(
    id: number | string
  ): Promise<ApiResponse<{ campaign_id: number; status: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; status: string }>
    >(API_ENDPOINTS.CAMPAIGNS.PAUSE(id));
    return response.data;
  },

  /**
   * Resume paused campaign
   */
  async resumeCampaign(
    id: number | string
  ): Promise<ApiResponse<{ campaign_id: number; status: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; status: string }>
    >(API_ENDPOINTS.CAMPAIGNS.RESUME(id));
    return response.data;
  },

  /**
   * Cancel campaign permanently
   */
  async cancelCampaign(
    id: number | string
  ): Promise<ApiResponse<{ campaign_id: number; status: string }>> {
    const response = await apiClient.post<
      ApiResponse<{ campaign_id: number; status: string }>
    >(API_ENDPOINTS.CAMPAIGNS.CANCEL(id));
    return response.data;
  },

  /**
   * Get live campaign status report & delivery progress metrics
   */
  async getCampaignStatus(id: number | string): Promise<ApiResponse<CampaignStatusReport>> {
    const response = await apiClient.get<ApiResponse<CampaignStatusReport>>(
      API_ENDPOINTS.CAMPAIGNS.STATUS(id)
    );
    return response.data;
  },

  /**
   * Get aggregate delivery statistics
   */
  async getDeliveryStats(id: number | string): Promise<ApiResponse<CampaignDeliveryStats>> {
    const response = await apiClient.get<ApiResponse<CampaignDeliveryStats>>(
      API_ENDPOINTS.CAMPAIGNS.DELIVERY_STATUS(id)
    );
    return response.data;
  },
};

export default campaignsService;
