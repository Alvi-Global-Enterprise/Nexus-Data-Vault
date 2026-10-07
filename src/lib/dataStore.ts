import fs from 'fs';
import path from 'path';
import { CoincustodyOrder, SampleLead, ShakepayUser, OverviewStats } from '@/types';

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

  // Stats calculation
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

  store.stats = {
    counts: {
      coincustody: store.coincustody.length,
      sample: store.sample.length,
      shakepay: store.shakepay.length,
      blockfi: store.blockfi.length,
      total: store.coincustody.length + store.sample.length + store.shakepay.length + store.blockfi.length
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
    indexTimeMs: Date.now() - startTime
  };

  store.loaded = true;
  return store;
}
