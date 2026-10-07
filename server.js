const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = __dirname;
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- Helper Functions ---
function parseCSVLine(text) {
  const result = [];
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

// In-Memory Datasets
const store = {
  coincustody: [],
  sample: [],
  shakepay: [],
  blockfi: [],
  blockfiDomains: {},
  stats: {}
};

console.log('[+] Starting Data Indexing...');
const startTime = Date.now();

// 1. Load Coincustody (Shopify orders)
try {
  const filePath = path.join(DATA_DIR, 'coincustody.io.csv');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 2) continue;
        const obj = { id: i };
        headers.forEach((h, idx) => {
          obj[h] = row[idx] !== undefined ? row[idx].trim() : '';
        });

        // Normalize fields
        obj.order_number = obj.order_number || ('ORD-' + i);
        obj.total_price_num = parseFloat(obj.total_price) || 0;
        obj.payment_method_norm = (obj.payment_method || '').trim() || 'Unspecified';
        obj.financial_status_norm = (obj.financial_status || 'unknown').toLowerCase();
        
        // Parse note_attributes_json if available
        obj.parsed_notes = [];
        if (obj.note_attributes_json) {
          try {
            obj.parsed_notes = JSON.parse(obj.note_attributes_json);
          } catch (e) {
            obj.parsed_notes = [];
          }
        }

        store.coincustody.push(obj);
      }
    }
  }
} catch (err) {
  console.error('[-] Error loading coincustody.io.csv:', err.message);
}

// 2. Load sample.csv (Identity Leads)
try {
  const filePath = path.join(DATA_DIR, 'sample.csv');
  if (fs.existsSync(filePath)) {
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
        
        // Extract State from address if possible (e.g., "Austin, TX")
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
} catch (err) {
  console.error('[-] Error loading sample.csv:', err.message);
}

// 3. Load shakepay_full.txt (Shakepay referral users)
try {
  const filePath = path.join(DATA_DIR, 'shakepay_full.txt');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 2) continue;
        const obj = { id: i };
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

        store.shakepay.push(obj);
      }
    }
  }
} catch (err) {
  console.error('[-] Error loading shakepay_full.txt:', err.message);
}

// 4. Load blockfi_full.txt (BlockFi Crypto emails)
try {
  const filePath = path.join(DATA_DIR, 'blockfi_full.txt');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const domainCounts = {};
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
    // Top domains sorted
    store.blockfiDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([domain, count]) => ({ domain, count }));
  }
} catch (err) {
  console.error('[-] Error loading blockfi_full.txt:', err.message);
}

// Compute General Stats
const paymentBreakdown = {};
let totalOrderVolume = 0;
store.coincustody.forEach(o => {
  const pm = o.payment_method_norm || 'Unspecified';
  paymentBreakdown[pm] = (paymentBreakdown[pm] || 0) + 1;
  if (o.financial_status_norm === 'paid') {
    totalOrderVolume += o.total_price_num;
  }
});

const sampleStates = {};
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

console.log(`[✓] Indexed ${store.stats.counts.total.toLocaleString()} records in ${store.stats.indexTimeMs}ms!`);

// --- HTTP Server ---
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API Endpoints ---
  if (pathname === '/api/stats') {
    return sendJSON(res, store.stats);
  }

  // 1. Coincustody API
  if (pathname === '/api/coincustody') {
    let items = store.coincustody;
    const search = (query.search || '').trim().toLowerCase();
    const payment = (query.payment || '').trim().toLowerCase();
    const status = (query.status || '').trim().toLowerCase();

    if (payment && payment !== 'all') {
      items = items.filter(i => (i.payment_method_norm || '').toLowerCase().includes(payment));
    }
    if (status && status !== 'all') {
      items = items.filter(i => (i.financial_status_norm || '').toLowerCase() === status);
    }
    if (search) {
      items = items.filter(i =>
        (i.email || '').toLowerCase().includes(search) ||
        (i.order_number || '').toLowerCase().includes(search) ||
        (i.numero_identificacion || '').toLowerCase().includes(search) ||
        (i.payment_method || '').toLowerCase().includes(search) ||
        (i.payment_id || '').toLowerCase().includes(search) ||
        (i.shipment_tracking_url || '').toLowerCase().includes(search)
      );
    }

    const total = items.length;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(query.limit, 10) || 25));
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return sendJSON(res, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    });
  }

  // 2. Sample (Leads) API
  if (pathname === '/api/sample') {
    let items = store.sample;
    const search = (query.search || '').trim().toLowerCase();
    const state = (query.state || '').trim().toUpperCase();
    const minAge = parseInt(query.min_age, 10) || null;
    const maxAge = parseInt(query.max_age, 10) || null;

    if (state && state !== 'ALL') {
      items = items.filter(i => i.state === state);
    }
    if (minAge !== null && !isNaN(minAge)) {
      items = items.filter(i => i.age && i.age >= minAge);
    }
    if (maxAge !== null && !isNaN(maxAge)) {
      items = items.filter(i => i.age && i.age <= maxAge);
    }
    if (search) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(search) ||
        i.email.toLowerCase().includes(search) ||
        i.address.toLowerCase().includes(search) ||
        i.phones.some(p => p.toLowerCase().includes(search))
      );
    }

    const total = items.length;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(query.limit, 10) || 25));
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return sendJSON(res, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    });
  }

  // 3. Shakepay API
  if (pathname === '/api/shakepay') {
    let items = store.shakepay;
    const search = (query.search || '').trim().toLowerCase();
    const minReferrals = parseInt(query.min_referrals, 10) || 0;
    const newsletter = query.newsletter;

    if (minReferrals > 0) {
      items = items.filter(i => i.referral_count >= minReferrals);
    }
    if (newsletter === 'true') {
      items = items.filter(i => i.newsletter === true);
    } else if (newsletter === 'false') {
      items = items.filter(i => i.newsletter === false);
    }
    if (search) {
      items = items.filter(i =>
        i.email.toLowerCase().includes(search) ||
        i.shaketag.toLowerCase().includes(search) ||
        i.referral_url.toLowerCase().includes(search) ||
        i.phone.toLowerCase().includes(search)
      );
    }

    const total = items.length;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(query.limit, 10) || 25));
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return sendJSON(res, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    });
  }

  // 4. BlockFi Emails API
  if (pathname === '/api/blockfi') {
    const search = (query.search || '').trim().toLowerCase();
    const domain = (query.domain || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(query.limit, 10) || 25));

    let filtered = [];
    if (!search && (!domain || domain === 'all')) {
      const total = store.blockfi.length;
      const start = (page - 1) * limit;
      filtered = store.blockfi.slice(start, start + limit).map((email, idx) => ({ id: start + idx + 1, email }));
      return sendJSON(res, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        items: filtered
      });
    }

    // Fast search with cap
    let matches = [];
    const maxMatches = 10000;
    for (let i = 0; i < store.blockfi.length; i++) {
      const email = store.blockfi[i];
      const lower = email.toLowerCase();
      if (domain && domain !== 'all' && !lower.endsWith('@' + domain)) {
        continue;
      }
      if (search && !lower.includes(search)) {
        continue;
      }
      matches.push({ id: i + 1, email });
      if (matches.length >= maxMatches) break;
    }

    const total = matches.length;
    const start = (page - 1) * limit;
    const paginated = matches.slice(start, start + limit);

    return sendJSON(res, {
      total,
      capped: total >= maxMatches,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    });
  }

  // 5. OmniSearch across all datasets
  if (pathname === '/api/omnisearch') {
    const q = (query.q || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      return sendJSON(res, { query: q, results: { coincustody: [], sample: [], shakepay: [], blockfi: [] }, count: 0 });
    }

    const results = {
      coincustody: store.coincustody.filter(i =>
        (i.email || '').toLowerCase().includes(q) ||
        (i.order_number || '').toLowerCase().includes(q) ||
        (i.numero_identificacion || '').toLowerCase().includes(q) ||
        (i.payment_method || '').toLowerCase().includes(q)
      ).slice(0, 15),

      sample: store.sample.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q) ||
        i.phones.some(p => p.toLowerCase().includes(q))
      ).slice(0, 15),

      shakepay: store.shakepay.filter(i =>
        i.email.toLowerCase().includes(q) ||
        i.shaketag.toLowerCase().includes(q) ||
        i.referral_url.toLowerCase().includes(q)
      ).slice(0, 15),

      blockfi: []
    };

    // Blockfi fast 15 matches
    let bfCount = 0;
    for (let i = 0; i < store.blockfi.length; i++) {
      if (store.blockfi[i].toLowerCase().includes(q)) {
        results.blockfi.push({ id: i + 1, email: store.blockfi[i] });
        bfCount++;
        if (bfCount >= 15) break;
      }
    }

    const count = results.coincustody.length + results.sample.length + results.shakepay.length + results.blockfi.length;
    return sendJSON(res, { query: q, results, count });
  }

  // --- Static Files Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('<h1>404 Not Found</h1>');
      }
      res.writeHead(500);
      return res.end(`Server Error: ${err.code}`);
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`[🚀] Crypto Data Vault Server is running at: http://localhost:${PORT}`);
});
