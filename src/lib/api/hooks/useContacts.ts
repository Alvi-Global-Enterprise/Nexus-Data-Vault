import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import contactsService from '../services/contacts.service';
import {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
  ContactsQueryParams,
  SpreadsheetImportResponse,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';

export const CONTACTS_QUERY_KEYS = {
  all: ['contacts'] as const,
  lists: () => [...CONTACTS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ContactsQueryParams) => [...CONTACTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...CONTACTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...CONTACTS_QUERY_KEYS.details(), id] as const,
};


export function useContacts(params?: ContactsQueryParams) {
  return useQuery<PaginatedResponse<Contact>, Error>({
    queryKey: CONTACTS_QUERY_KEYS.list(params),
    queryFn: () => contactsService.getContacts(params),
    placeholderData: (previousData) => previousData,
  });
}


export function useContact(id: number | string, enabled = true) {
  return useQuery<ApiResponse<Contact>, Error>({
    queryKey: CONTACTS_QUERY_KEYS.detail(id),
    queryFn: () => contactsService.getContact(id),
    enabled: enabled && !!id,
  });
}


export function useImportSpreadsheet() {
  const queryClient = useQueryClient();

  return useMutation<SpreadsheetImportResponse, Error, File>({
    mutationFn: (file: File) => contactsService.importSpreadsheet(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.lists() });
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Contact>, Error, CreateContactPayload>({
    mutationFn: (payload: CreateContactPayload) => contactsService.createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.lists() });
    },
  });
}
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Contact>,
    Error,
    { id: number | string; payload: UpdateContactPayload }
  >({
    mutationFn: ({ id, payload }) => contactsService.updateContact(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.lists() });  
    },
  });
}

/**
 * Delete contact mutation
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, number | string>({
    mutationFn: (id: number | string) => contactsService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.lists() });
    },
  });
}
