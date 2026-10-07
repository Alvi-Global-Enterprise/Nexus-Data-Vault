import fs from 'fs';
import path from 'path';
import {
  CoincustodyOrder,
  SampleLead,
  ShakepayUser,
  CmsCryptoRecord,
  CryptoLeadRecord,
  EtoroRecord,
  OverviewStats
} from '@/types';

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

interface DataStore {
  coincustody: CoincustodyOrder[];
  sample: SampleLead[];
  shakepay: ShakepayUser[];
  blockfi: string[];
  blockfiDomains: Array<{ domain: string; count: number }>;
  cmsCrypto: CmsCryptoRecord[];
  cryptoLeads: CryptoLeadRecord[];
  etoro: EtoroRecord[];
  stats: OverviewStats | null;
  loaded: boolean;
}

// In Next.js dev mode, cache on global to avoid reloading on HMR
const globalForData = global as unknown as { __dataStore?: DataStore };

export const store: DataStore = globalForData.__dataStore || {
  coincustody: [],
  sample: [],
  shakepay: [],
  blockfi: [],
  blockfiDomains: [],
  cmsCrypto: [],
  cryptoLeads: [],
  etoro: [],
  stats: null,
  loaded: false
};

if (process.env.NODE_ENV !== 'production') {
  globalForData.__dataStore = store;
}

export function ensureDataLoaded(): DataStore {
  if (store.loaded) return store;

  const startTime = Date.now();

  function findDataFile(filename: string): string | null {
    const candidates = [
      path.join(process.cwd(), filename),
      path.join(__dirname, filename),
      path.join(__dirname, '..', filename),
      path.join(__dirname, '..', '..', filename),
      path.join(__dirname, '..', '..', '..', filename),
      path.join(__dirname, '..', '..', '..', '..', filename)
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return p;
      } catch {}
    }
    return null;
  }

  // 1. Coincustody Orders
  try {
    const filePath = findDataFile('coincustody.io.csv');
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = parseCSVLine(lines[0]).map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < 2) continue;
          const obj: any = { id: i };
          headers.forEach((h, idx) => {
            obj[h] = row[idx] !== undefined ? row[idx].trim() : '';
          });

          obj.order_number = obj.order_number || `ORD-${i}`;
          obj.total_price_num = parseFloat(obj.total_price) || 0;
          obj.payment_method_norm = (obj.payment_method || '').trim() || 'Unspecified';
          obj.financial_status_norm = (obj.financial_status || 'unknown').toLowerCase();
          
          obj.parsed_notes = [];
          if (obj.note_attributes_json) {
            try {
              obj.parsed_notes = JSON.parse(obj.note_attributes_json);
            } catch {
              obj.parsed_notes = [];
            }
          }

          store.coincustody.push(obj as CoincustodyOrder);
        }
      }
    }
  } catch (err: any) {
    console.error('[-] Error loading coincustody.io.csv:', err.message);
  }

  // 2. Sample Leads
  try {
    const filePath = findDataFile('sample.csv');
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      lines.forEach((line, idx) => {
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 3) {
          const name = parts[0] === 'None' ? 'Unknown Name' : parts[0];
          const age = parts[1] === 'None' ? null : (parseInt(parts[1], 10) || null);
          const email = parts[2] === 'None' ? '' : parts[2];
          const phonesStr = parts[3] || '';
          const phones = phonesStr ? phonesStr.split(',').map(p => p.trim()).filter(Boolean) : [];
          const address = parts[4] || '';
          const rawValue = parts[5] || '';
          
          let state = '';
          const stateMatch = address.match(/,\s*([A-Z]{2})\s*$/i);
          if (stateMatch) {
            state = stateMatch[1].toUpperCase();
          }

          store.sample.push({
            id: idx + 1,
            name,
            age,
            email,
            phones,
            address,
            state,
            value_raw: rawValue,
            value_clean: rawValue.replace(/[$, ]/g, '')
          });
        }
      });
    }
  } catch (err: any) {
    console.error('[-] Error loading sample.csv:', err.message);
  }

  // 3. Shakepay Users
  try {
    const filePath = findDataFile('shakepay_full.txt');
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < 2) continue;
          const obj: any = { id: i };
          headers.forEach((h, idx) => {
            obj[h] = row[idx] !== undefined ? row[idx].replace(/^"|"$/g, '').trim() : '';
          });

          obj.email = obj['Email Associated'] || '';
          obj.phone = obj['Phone Number Associated'] || '';
          obj.shaketag = obj['Shaketag ID'] || '';
          obj.referral_url = obj['Referral Origin ID'] || '';
          obj.referral_count = parseInt(obj['Referral Count Integer'], 10) || 0;
          obj.referral_date = obj['Referral Date'] || '';
          obj.newsletter = (obj['Newsletter'] || '').toLowerCase() === 'true';
          obj.shaking_sats = obj['ShakingSats Rewarded'] || '';

          store.shakepay.push(obj as ShakepayUser);
        }
      }
    }
  } catch (err: any) {
    console.error('[-] Error loading shakepay_full.txt:', err.message);
  }

  // 4. BlockFi Emails
  try {
    const filePath = findDataFile('blockfi_full.txt');
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const domainCounts: Record<string, number> = {};
      for (let i = 0; i < lines.length; i++) {
        const email = lines[i].trim();
        if (!email) continue;
        store.blockfi.push(email);

        const atIdx = email.lastIndexOf('@');
        if (atIdx !== -1) {
          const domain = email.slice(atIdx + 1).toLowerCase();
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        }
      }
      store.blockfiDomains = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([domain, count]) => ({ domain, count }));
    }
  } catch (err: any) {
    console.error('[-] Error loading blockfi_full.txt:', err.message);
  }

  // 5. CMS Cryptocurrency (CMS_cryptocurrency_01-01-2026.csv & CMS_cryptocurrency_05-01-2025.csv)
  function loadCmsCryptoFile(filename: string, batch: '01-01-2026' | '05-01-2025') {
    try {
      const filePath = findDataFile(filename);
      if (!filePath) return;
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;
      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 2) continue;
        const r: Record<string, string> = {};
        headers.forEach((h, idx) => {
          r[h] = row[idx] !== undefined ? row[idx].trim() : '';
        });
        const fname = r['subscriber_fname'] || '';
        const lname = r['subscriber_lname'] || '';
        const name = `${fname} ${lname}`.trim() || 'Unknown';

        store.cmsCrypto.push({
          id: store.cmsCrypto.length + 1,
          batch,
          source_file: filename,
          email: r['subscriber_email'] || '',
          fname,
          lname,
          name,
          address: r['subscriber_addr1'] || '',
          city: r['subscriber_city'] || '',
          state: (r['subscriber_state'] || '').toUpperCase(),
          zip: r['subscriber_zip'] || '',
          phone: r['subscriber_phone'] || '',
          ip: r['subscriber_ip'] || '',
          join_date: r['subscriber_joindate'] || '',
          source: r['subscriber_source'] || '',
          dob: r['subscriber_dob'] || '',
          gender: (r['subscriber_gender'] || '').toLowerCase(),
          country: r['subscriber_Country'] || 'USA',
          category: r['subscriber_Category'] || 'Cryptocurrency'
        });
      }
    } catch (err: any) {
      console.error(`[-] Error loading ${filename}:`, err.message);
    }
  }

  loadCmsCryptoFile('CMS_cryptocurrency_01-01-2026.csv', '01-01-2026');
  loadCmsCryptoFile('CMS_cryptocurrency_05-01-2025.csv', '05-01-2025');

  // 6. CRYPTO Leads (CRYPTO_01-01-2026.csv & CRYPTO_05-01-2025.csv)
  function loadCryptoLeadsFile(filename: string, batch: '01-01-2026' | '05-01-2025') {
    try {
      const filePath = findDataFile(filename);
      if (!filePath) return;
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;
      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 2) continue;
        const r: Record<string, string> = {};
        headers.forEach((h, idx) => {
          r[h] = row[idx] !== undefined ? row[idx].trim() : '';
        });
        const fname = r['Name'] || '';
        const lname = r['Last name'] || '';
        const name = `${fname} ${lname}`.trim() || 'Unknown';

        store.cryptoLeads.push({
          id: store.cryptoLeads.length + 1,
          batch,
          source_file: filename,
          email: r['Email'] || '',
          fname,
          lname,
          name,
          address: r['Address'] || '',
          city: r['City'] || '',
          state: (r['State'] || '').toUpperCase(),
          zip: r['Zip'] || '',
          phone: r['Phone'] || '',
          ip: r['IP'] || '',
          datetime: r['datetime'] || '',
          source: r['Source'] || '',
          dob: r['Date of birth'] || ''
        });
      }
    } catch (err: any) {
      console.error(`[-] Error loading ${filename}:`, err.message);
    }
  }

  loadCryptoLeadsFile('CRYPTO_01-01-2026.csv', '01-01-2026');
  loadCryptoLeadsFile('CRYPTO_05-01-2025.csv', '05-01-2025');

  // 7. eToro (etoro.csv)
  try {
    const filePath = findDataFile('etoro.csv');
    if (filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split('\t').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split('\t');
          if (row.length < 2) continue;
          const r: Record<string, string> = {};
          headers.forEach((h, idx) => {
            r[h] = row[idx] !== undefined ? row[idx].trim() : '';
          });

          const rawAmount = r['Deposit Amount'] || '';
          let currency = 'USD';
          let amount = 0;
          const match = rawAmount.match(/^([A-Za-z]+)\s*([\d,.]+)/);
          if (match) {
            currency = match[1].toUpperCase();
            amount = parseFloat(match[2].replace(/,/g, '')) || 0;
          } else {
            amount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;
          }

          store.etoro.push({
            id: i,
            source_file: 'etoro.csv',
            source: r['Source'] || 'etoro.com',
            name: r['Name'] || 'Unknown',
            email: r['Email'] || '',
            country: r['Country'] || 'Unknown',
            ip: r['IP'] || '',
            deposit_amount_raw: rawAmount,
            deposit_currency: currency,
            deposit_amount: amount,
            deposit_platform: r['Deposit platform'] || 'Unknown',
            redate: r['ReDate'] || ''
          });
        }
      }
    }
  } catch (err: any) {
    console.error('[-] Error loading etoro.csv:', err.message);
  }

  // --- Stats calculation ---
  const paymentBreakdown: Record<string, number> = {};
  let totalOrderVolume = 0;
  store.coincustody.forEach(o => {
    const pm = o.payment_method_norm || 'Unspecified';
    paymentBreakdown[pm] = (paymentBreakdown[pm] || 0) + 1;
    if (o.financial_status.toLowerCase() === 'paid') {
      totalOrderVolume += o.total_price_num;
    }
  });

  const sampleStates: Record<string, number> = {};
  store.sample.forEach(s => {
    if (s.state) {
      sampleStates[s.state] = (sampleStates[s.state] || 0) + 1;
    }
  });

  const shakepayTopReferrers = [...store.shakepay]
    .sort((a, b) => b.referral_count - a.referral_count)
    .slice(0, 10);

  // CMS stats
  const cmsStates: Record<string, number> = {};
  const cmsSources: Record<string, number> = {};
  const cmsGenders: Record<string, number> = { male: 0, female: 0, other: 0 };
  let cms2026Count = 0;
  let cms2025Count = 0;

  store.cmsCrypto.forEach(c => {
    if (c.batch === '01-01-2026') cms2026Count++;
    else if (c.batch === '05-01-2025') cms2025Count++;

    if (c.state) {
      cmsStates[c.state] = (cmsStates[c.state] || 0) + 1;
    }
    if (c.source) {
      // Simplify source name
      let cleanSource = c.source;
      try {
        const u = new URL(c.source);
        cleanSource = u.hostname.replace(/^www\./, '');
      } catch {}
      cmsSources[cleanSource] = (cmsSources[cleanSource] || 0) + 1;
    }
    if (c.gender === 'male' || c.gender === 'female') {
      cmsGenders[c.gender] = (cmsGenders[c.gender] || 0) + 1;
    } else {
      cmsGenders.other = (cmsGenders.other || 0) + 1;
    }
  });

  // Crypto Leads stats
  const cryptoStates: Record<string, number> = {};
  const cryptoSources: Record<string, number> = {};
  let crypto2026Count = 0;
  let crypto2025Count = 0;

  store.cryptoLeads.forEach(c => {
    if (c.batch === '01-01-2026') crypto2026Count++;
    else if (c.batch === '05-01-2025') crypto2025Count++;

    if (c.state) {
      cryptoStates[c.state] = (cryptoStates[c.state] || 0) + 1;
    }
    if (c.source) {
      let cleanSource = c.source;
      try {
        const u = new URL(c.source);
        cleanSource = u.hostname.replace(/^www\./, '');
      } catch {}
      cryptoSources[cleanSource] = (cryptoSources[cleanSource] || 0) + 1;
    }
  });

  // eToro stats
  const etoroPlatforms: Record<string, number> = {};
  const etoroCountries: Record<string, number> = {};
  let etoroTotalUsd = 0;

  store.etoro.forEach(e => {
    const plat = e.deposit_platform || 'Other';
    etoroPlatforms[plat] = (etoroPlatforms[plat] || 0) + 1;
    if (e.country) {
      etoroCountries[e.country] = (etoroCountries[e.country] || 0) + 1;
    }
    etoroTotalUsd += e.deposit_amount;
  });

  const totalAllRecords =
    store.coincustody.length +
    store.sample.length +
    store.shakepay.length +
    store.blockfi.length +
    store.cmsCrypto.length +
    store.cryptoLeads.length +
    store.etoro.length;

  store.stats = {
    counts: {
      coincustody: store.coincustody.length,
      sample: store.sample.length,
      shakepay: store.shakepay.length,
      blockfi: store.blockfi.length,
      cmsCrypto: store.cmsCrypto.length,
      cmsCrypto2026: cms2026Count,
      cmsCrypto2025: cms2025Count,
      cryptoLeads: store.cryptoLeads.length,
      cryptoLeads2026: crypto2026Count,
      cryptoLeads2025: crypto2025Count,
      etoro: store.etoro.length,
      total: totalAllRecords
    },
    coincustody: {
      paymentBreakdown,
      totalOrderVolume,
      binanceCount: paymentBreakdown['Binance'] || 0,
      mercadoPagoCount: paymentBreakdown['Mercado Pago'] || 0,
      transferenciaCount: paymentBreakdown['transferencia'] || 0,
      efectivoCount: paymentBreakdown['efectivo'] || 0
    },
    sample: {
      topStates: Object.entries(sampleStates)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([state, count]) => ({ state, count }))
    },
    shakepay: {
      topReferrers: shakepayTopReferrers,
      withNewsletter: store.shakepay.filter(s => s.newsletter).length
    },
    blockfi: {
      topDomains: store.blockfiDomains.slice(0, 15)
    },
    cmsCrypto: {
      topStates: Object.entries(cmsStates)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([state, count]) => ({ state, count })),
      topSources: Object.entries(cmsSources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count })),
      genderBreakdown: cmsGenders
    },
    cryptoLeads: {
      topStates: Object.entries(cryptoStates)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([state, count]) => ({ state, count })),
      topSources: Object.entries(cryptoSources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count }))
    },
    etoro: {
      totalDepositsUsd: Math.round(etoroTotalUsd),
      avgDepositUsd: store.etoro.length ? Math.round(etoroTotalUsd / store.etoro.length) : 0,
      platformBreakdown: etoroPlatforms,
      topCountries: Object.entries(etoroCountries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([country, count]) => ({ country, count }))
    },
    indexTimeMs: Date.now() - startTime
  };

  store.loaded = true;
  return store;
}

