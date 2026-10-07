export interface CoincustodyOrder {
  id: number;
  order_number: string;
  email: string;
  contact_email?: string;
  phone?: string;
  financial_status: string;
  fulfillment_status?: string;
  total_price: string;
  total_price_num: number;
  currency: string;
  created_at: string;
  browser_ip?: string;
  customer_id?: string;
  shipping_name?: string;
  shipping_address1?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_zip?: string;
  shipping_country?: string;
  shipping_phone?: string;
  payment_method: string;
  payment_method_norm: string;
  numero_identificacion?: string;
  condicion_fiscal?: string;
  payment_id?: string;
  shipment_type?: string;
  shipment_tracking_url?: string;
  note_attributes_json?: string;
  parsed_notes?: Array<{ name: string; value: any }>;
}

export interface SampleLead {
  id: number;
  name: string;
  age: number | null;
  email: string;
  phones: string[];
  address: string;
  state: string;
  value_raw: string;
  value_clean: string;
}

export interface ShakepayUser {
  id: number;
  email: string;
  phone: string;
  shaketag: string;
  referral_url: string;
  referral_count: number;
  referral_date: string;
  newsletter: boolean;
  shaking_sats: string;
  invitation_third_party?: string;
  invitation_rewards?: string;
  invitation_shakepay?: string;
}

export interface BlockfiEntry {
  id: number;
  email: string;
}

export interface CmsCryptoRecord {
  id: number;
  batch: '01-01-2026' | '05-01-2025';
  source_file: string;
  email: string;
  fname: string;
  lname: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  ip: string;
  join_date: string;
  source: string;
  dob: string;
  gender: string;
  country: string;
  category: string;
}

export interface CryptoLeadRecord {
  id: number;
  batch: '01-01-2026' | '05-01-2025';
  source_file: string;
  email: string;
  fname: string;
  lname: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  ip: string;
  datetime: string;
  source: string;
  dob: string;
}

export interface EtoroRecord {
  id: number;
  source_file: string;
  source: string;
  name: string;
  email: string;
  country: string;
  ip: string;
  deposit_amount_raw: string;
  deposit_currency: string;
  deposit_amount: number;
  deposit_platform: string;
  redate: string;
}

export interface OverviewStats {
  counts: {
    coincustody: number;
    sample: number;
    shakepay: number;
    blockfi: number;
    cmsCrypto: number;
    cmsCrypto2026: number;
    cmsCrypto2025: number;
    cryptoLeads: number;
    cryptoLeads2026: number;
    cryptoLeads2025: number;
    etoro: number;
    total: number;
  };
  coincustody: {
    paymentBreakdown: Record<string, number>;
    totalOrderVolume: number;
    binanceCount: number;
    mercadoPagoCount: number;
    transferenciaCount: number;
    efectivoCount: number;
  };
  sample: {
    topStates: Array<{ state: string; count: number }>;
  };
  shakepay: {
    topReferrers: ShakepayUser[];
    withNewsletter: number;
  };
  blockfi: {
    topDomains: Array<{ domain: string; count: number }>;
  };
  cmsCrypto: {
    topStates: Array<{ state: string; count: number }>;
    topSources: Array<{ source: string; count: number }>;
    genderBreakdown: Record<string, number>;
  };
  cryptoLeads: {
    topStates: Array<{ state: string; count: number }>;
    topSources: Array<{ source: string; count: number }>;
  };
  etoro: {
    totalDepositsUsd: number;
    avgDepositUsd: number;
    platformBreakdown: Record<string, number>;
    topCountries: Array<{ country: string; count: number }>;
  };
  indexTimeMs: number;
}

