export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
  },
  CONTACTS: {
    BASE: '/contacts',
    IMPORT: '/contacts/import',
    DETAIL: (id: number | string) => `/contacts/${id}`,
  },
  CAMPAIGNS: {
    BASE: '/campaigns',
    DETAIL: (id: number | string) => `/campaigns/${id}`,
    RECIPIENTS: (id: number | string) => `/campaigns/${id}/recipients`,
    GENERATE: (id: number | string) => `/campaigns/${id}/generate`,
    APPROVE: (id: number | string) => `/campaigns/${id}/approve`,
    DISPATCH: (id: number | string) => `/campaigns/${id}/dispatch`,
    PAUSE: (id: number | string) => `/campaigns/${id}/pause`,
    RESUME: (id: number | string) => `/campaigns/${id}/resume`,
    CANCEL: (id: number | string) => `/campaigns/${id}/cancel`,
    STATUS: (id: number | string) => `/campaigns/${id}/status`,
    DELIVERY_STATUS: (id: number | string) => `/campaigns/${id}/delivery-status`,
  },
} as const;

export default API_ENDPOINTS;
