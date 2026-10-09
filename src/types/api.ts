export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
  access_token?: string;
  user?: T;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface UserProfile {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
  [key: string]: any;
}

export interface LoginResponseData {
  token?: string;
  access_token?: string;
  token_type?: string;
  user?: UserProfile;
  message?: string;
  success?: boolean;
  data?: {
    user?: UserProfile;
    token?: string;
  };
  [key: string]: any;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================================
// CONTACTS API TYPES
// ==========================================

export type ContactSource = 'excel' | 'csv' | 'manual' | 'api' | 'google_sheets';

export interface Contact {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  company: string | null;
  job_title: string | null;
  phone: string | null;
  external_id: string | null;
  source: ContactSource;
  source_reference: string | null;
  custom_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  external_id?: string;
  custom_data?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {}

export interface ContactsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  source?: ContactSource;
  is_active?: boolean;
  sort_by?: 'id' | 'first_name' | 'last_name' | 'email' | 'created_at' | 'updated_at';
  sort_dir?: 'asc' | 'desc';
}

export interface SpreadsheetImportSummary {
  total_rows: number;
  valid_rows: number;
  created: number;
  duplicates_in_file: number;
  already_existing: number;
  invalid: number;
}

export interface SpreadsheetInvalidRow {
  row: number;
  email: string;
  reason: string;
}

export interface SpreadsheetImportResponse {
  success: boolean;
  message: string;
  summary: SpreadsheetImportSummary;
  invalid_rows: SpreadsheetInvalidRow[];
}

// ==========================================
// CAMPAIGNS API TYPES
// ==========================================

export type EmailMode = 'direct' | 'generate' | 'polish';
export type AiProvider = 'gemini' | 'openai';

export type CampaignStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'approved'
  | 'queued'
  | 'sending'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed';

export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  subject: string | null;
  email_body: string | null;
  email_body_text: string | null;
  raw_input_email: string | null;
  email_mode: EmailMode;
  ai_provider: AiProvider | null;
  ai_prompt: string | null;
  status: CampaignStatus;
  source_type: string | null;
  source_reference: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  is_review_required: boolean;
  scheduled_at: string | null;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignPayload {
  name: string;
  email_mode: EmailMode;
  ai_provider?: AiProvider;
  ai_prompt?: string;
  subject?: string;
  email_body?: string;
  email_body_text?: string;
  raw_input_email?: string;
  scheduled_at?: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  subject?: string;
  email_body?: string;
  email_body_text?: string;
  ai_prompt?: string;
  scheduled_at?: string;
}

export interface CampaignsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: CampaignStatus;
  email_mode?: EmailMode;
  sort?: 'id' | 'name' | 'status' | 'created_at' | 'scheduled_at' | 'started_at';
  direction?: 'asc' | 'desc';
}

export interface AttachRecipientsPayload {
  contact_ids: number[];
}

export interface CampaignRecipient {
  id: number;
  campaign_id: number;
  contact_id: number;
  email: string;
  subject: string | null;
  status: 'draft' | 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  last_error: string | null;
  custom_attributes: Record<string, any>;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export interface RecipientsQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  sort_by?: 'id' | 'email' | 'status' | 'attempts' | 'sent_at' | 'failed_at' | 'created_at';
  sort_dir?: 'asc' | 'desc';
}

export interface TriggerAiPayload {
  ai_prompt?: string;
  tone?: 'professional' | 'urgent' | 'friendly' | 'enthusiastic';
  target_audience?: string;
  key_points?: string;
}

export interface CampaignStatusReport {
  campaign_id: number;
  campaign_status: CampaignStatus;
  email_mode: EmailMode;
  total_recipients: number;
  queued_count: number;
  processing_count: number;
  sent_count: number;
  failed_count: number;
  cancelled_count: number;
  generation_status: 'none' | 'generating' | 'completed' | 'error';
  generation_error: string | null;
  delivery_progress: number;
  timestamps: {
    created_at: string | null;
    updated_at: string | null;
    scheduled_at: string | null;
    approved_at: string | null;
    started_at: string | null;
    completed_at: string | null;
  };
}

export interface CampaignDeliveryStats {
  campaign_id: number;
  total: number;
  draft: number;
  queued: number;
  processing: number;
  sent: number;
  failed: number;
  cancelled: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

// ==========================================
// EMAIL TEMPLATE UI DEFINITIONS
// ==========================================

export interface EmailTemplate {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  category: 'newsletter' | 'crypto' | 'promotional' | 'outreach';
  description: string;
  subjectDefault: string;
  htmlContent: string;
  textContent: string;
  previewSnippet: string;
}
