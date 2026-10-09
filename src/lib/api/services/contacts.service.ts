import apiClient from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
  ContactsQueryParams,
  SpreadsheetImportResponse,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';

export const contactsService = {
  /**
   * List contacts with pagination, search, and filters
   */
  async getContacts(params?: ContactsQueryParams): Promise<PaginatedResponse<Contact>> {
    const response = await apiClient.get<PaginatedResponse<Contact>>(
      API_ENDPOINTS.CONTACTS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Upload & import spreadsheet (.xlsx, .xls, .csv) with multipart/form-data
   */
  async importSpreadsheet(
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<SpreadsheetImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<SpreadsheetImportResponse>(
      API_ENDPOINTS.CONTACTS.IMPORT,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  /**
   * Create a single contact manually
   */
  async createContact(payload: CreateContactPayload): Promise<ApiResponse<Contact>> {
    const response = await apiClient.post<ApiResponse<Contact>>(
      API_ENDPOINTS.CONTACTS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Get single contact details by ID
   */
  async getContact(id: number | string): Promise<ApiResponse<Contact>> {
    const response = await apiClient.get<ApiResponse<Contact>>(
      API_ENDPOINTS.CONTACTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Update contact by ID
   */
  async updateContact(
    id: number | string,
    payload: UpdateContactPayload
  ): Promise<ApiResponse<Contact>> {
    const response = await apiClient.put<ApiResponse<Contact>>(
      API_ENDPOINTS.CONTACTS.DETAIL(id),
      payload
    );
    return response.data;
  },

  /**
   * Soft-delete contact by ID
   */
  async deleteContact(id: number | string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.CONTACTS.DETAIL(id)
    );
    return response.data;
  },
};

export default contactsService;
