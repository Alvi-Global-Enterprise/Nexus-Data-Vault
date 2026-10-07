// =========================================================
// NEXUS DATA VAULT - CLIENT CONTROLLER & RENDERER
// =========================================================

const state = {
  activeTab: 'overview',
  coincustody: { page: 1, limit: 25, total: 0, totalPages: 1, search: '', payment: 'all', status: 'all' },
  sample: { page: 1, limit: 25, total: 0, totalPages: 1, search: '', state: 'ALL', ageBracket: 'all' },
  shakepay: { page: 1, limit: 25, total: 0, totalPages: 1, search: '', minReferrals: 0, newsletter: 'all' },
  blockfi: { page: 1, limit: 25, total: 0, totalPages: 1, search: '', domain: 'all' },
  currentDrawerRecord: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHeaderSearch();
  initDrawer();
  initFilters();
  loadStats();
});

// --- Tabs Management ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;

  // Update nav tabs UI
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });

  // Update panels
  document.querySelectorAll('.view-panel').forEach(p => {
    p.classList.toggle('active', p.id === `view-${tabId}`);
  });

  // Lazy-load dataset if entering its tab for the first time
  if (tabId === 'coincustody') loadCoincustody();
  if (tabId === 'sample') loadSample();
  if (tabId === 'shakepay') loadShakepay();
  if (tabId === 'blockfi') loadBlockfi();
}

// --- Stats & Overview Loading ---
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    // Header counter
    const totalIndexed = data.counts.total.toLocaleString();
    document.getElementById('headerTotalIndexed').innerText = `${totalIndexed} Indexed Records`;
    document.getElementById('indexingSpeedBadge').innerText = `⚡ ${totalIndexed} records in ${data.indexTimeMs}ms`;

    // Overview Metric Cards
    document.getElementById('statOrdersCount').innerText = data.counts.coincustody.toLocaleString();
    document.getElementById('statLeadsCount').innerText = data.counts.sample.toLocaleString();
    document.getElementById('statShakepayCount').innerText = data.counts.shakepay.toLocaleString();
    document.getElementById('statBlockfiCount').innerText = data.counts.blockfi.toLocaleString();
    document.getElementById('statBinanceOrders').innerText = `${data.coincustody.binanceCount} Binance Checkouts`;

    // Tab badges
    document.getElementById('badgeCoincustody').innerText = data.counts.coincustody.toLocaleString();
    document.getElementById('badgeSample').innerText = data.counts.sample.toLocaleString();
    document.getElementById('badgeShakepay').innerText = `${(data.counts.shakepay / 1000).toFixed(1)}k`;
    document.getElementById('badgeBlockfi').innerText = `${Math.round(data.counts.blockfi / 1000)}k`;
    document.getElementById('blockfiTotalCounter').innerText = `${data.counts.blockfi.toLocaleString()} Indexed`;

    // 1. Payment Methods Bars
    const paymentList = document.getElementById('paymentMethodsList');
    paymentList.innerHTML = '';
    const pb = data.coincustody.paymentBreakdown;
    const maxVal = Math.max(...Object.values(pb), 1);

    Object.entries(pb).forEach(([method, count]) => {
      const pct = Math.round((count / data.counts.coincustody) * 100);
      let barClass = 'bar-subtle';
      if (method.toLowerCase().includes('binance')) barClass = 'bar-amber';
      else if (method.toLowerCase().includes('mercado')) barClass = 'bar-cyan';
      else if (method.toLowerCase().includes('transferencia')) barClass = 'bar-emerald';

      const barEl = document.createElement('div');
      barEl.className = 'bar-item';
      barEl.innerHTML = `
        <div class="bar-header">
          <span class="bar-name">${method}</span>
          <span class="bar-count">${count} orders (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${barClass}" style="width: ${(count / maxVal) * 100}%"></div>
        </div>
      `;
      paymentList.appendChild(barEl);
    });

    // 2. Lead States Cloud & Populate Dropdown
    const statesCloud = document.getElementById('topStatesCloud');
    const stateSelect = document.getElementById('selectSampleState');
    statesCloud.innerHTML = '';
    
    // Clear dropdown except "All"
    stateSelect.innerHTML = '<option value="ALL">All US States</option>';

    data.sample.topStates.forEach(({ state, count }) => {
      // Cloud pill
      const pill = document.createElement('div');
      pill.className = 'state-bubble';
      pill.innerHTML = `<span class="state-code">${state}</span><span class="state-count">${count}</span>`;
      pill.onclick = () => {
        stateSelect.value = state;
        state.sample.state = state;
        switchTab('sample');
        loadSample();
      };
      statesCloud.appendChild(pill);

      // Select option
      const opt = document.createElement('option');
      opt.value = state;
      opt.innerText = `${state} (${count} leads)`;
      stateSelect.appendChild(opt);
    });

    // 3. Domain Distribution
    const domainList = document.getElementById('domainList');
    domainList.innerHTML = '';
    data.blockfi.topDomains.forEach(({ domain, count }) => {
      const row = document.createElement('div');
      row.className = 'domain-row';
      row.innerHTML = `
        <span class="domain-name">${domain}</span>
        <span class="domain-badge">${count.toLocaleString()}</span>
      `;
      row.onclick = () => {
        state.blockfi.domain = domain;
        switchTab('blockfi');
        // Activate pill if present
        document.querySelectorAll('#pillsBlockfiDomain .pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-val') === domain);
        });
        loadBlockfi();
      };
      domainList.appendChild(row);
    });

  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// --- 1. COINCUSTODY ORDERS TABLE & FILTERS ---
async function loadCoincustody() {
  const tbody = document.getElementById('tbodyCoincustody');
  tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Querying Shopify & Binance orders...</td></tr>';

  const params = new URLSearchParams({
    page: state.coincustody.page,
    limit: state.coincustody.limit,
    search: state.coincustody.search,
    payment: state.coincustody.payment,
    status: state.coincustody.status
  });

  try {
    const res = await fetch(`/api/coincustody?${params}`);
    const data = await res.json();

    state.coincustody.total = data.total;
    state.coincustody.totalPages = data.totalPages;

    updateCoincustodyPagination(data);

    if (data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No matching orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.items.forEach(order => {
      const tr = document.createElement('tr');
      tr.className = 'table-row-clickable';

      // Status badge
      let statusBadge = `<span class="status-badge status-pending">${order.financial_status || 'N/A'}</span>`;
      if (order.financial_status_norm === 'paid') {
        statusBadge = `<span class="status-badge status-paid">Paid</span>`;
      } else if (order.financial_status_norm === 'voided') {
        statusBadge = `<span class="status-badge status-voided">Voided</span>`;
      }

      // Payment badge
      let paymentBadge = `<span class="badge-gateway">${order.payment_method_norm}</span>`;
      if (order.payment_method_norm.toLowerCase().includes('binance')) {
        paymentBadge = `<span class="badge-binance">🪙 Binance</span>`;
      } else if (order.payment_method_norm.toLowerCase().includes('mercado')) {
        paymentBadge = `<span class="badge-gateway" style="color:#38bdf8;border-color:rgba(14,165,233,0.3)">💳 Mercado Pago</span>`;
      }

      // Shipment tracking link
      let shipmentHtml = `<span style="color:var(--text-dim)">${order.shipment_type || 'Direct'}</span>`;
      if (order.shipment_tracking_url) {
        shipmentHtml = `<a href="${order.shipment_tracking_url}" target="_blank" onclick="event.stopPropagation()" style="color:var(--cyan-primary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
          <span>Track (${order.shipment_type || 'Zippin'})</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>`;
      }

      const formattedPrice = order.total_price ? `$${Number(order.total_price).toLocaleString()}` : '$0.00';
      const dni = order.numero_identificacion || '<span style="color:var(--text-dim)">None</span>';

      tr.innerHTML = `
        <td class="cell-bold cell-mono">#${order.order_number || order.id}</td>
        <td>${order.email || '<span style="color:var(--text-dim)">Anonymous</span>'}</td>
        <td>${paymentBadge}</td>
        <td>${statusBadge}</td>
        <td class="cell-bold cell-mono">${formattedPrice}</td>
        <td class="cell-mono">${dni}</td>
        <td>${shipmentHtml}</td>
        <td><button class="view-btn-row">Inspect</button></td>
      `;

      tr.addEventListener('click', () => openDetailDrawer('coincustody', order));
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" class="table-loading" style="color:var(--rose-primary)">Error fetching data.</td></tr>';
  }
}

function updateCoincustodyPagination(data) {
  const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const end = Math.min(data.page * data.limit, data.total);
  document.getElementById('coincustodyCountRange').innerText = `${start}-${end}`;
  document.getElementById('coincustodyTotal').innerText = data.total.toLocaleString();
  document.getElementById('coincustodyPageLabel').innerText = `Page ${data.page} of ${Math.max(1, data.totalPages)}`;

  document.getElementById('btnCoincustodyPrev').disabled = data.page <= 1;
  document.getElementById('btnCoincustodyNext').disabled = data.page >= data.totalPages;
}

// --- 2. SAMPLE LEADS TABLE & FILTERS ---
async function loadSample() {
  const tbody = document.getElementById('tbodySample');
  tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Querying enriched identity records...</td></tr>';

  let minAge = null, maxAge = null;
  if (state.sample.ageBracket === '18-30') { minAge = 18; maxAge = 30; }
  else if (state.sample.ageBracket === '31-50') { minAge = 31; maxAge = 50; }
  else if (state.sample.ageBracket === '51-70') { minAge = 51; maxAge = 70; }
  else if (state.sample.ageBracket === '70+') { minAge = 71; }

  const params = new URLSearchParams({
    page: state.sample.page,
    limit: state.sample.limit,
    search: state.sample.search,
    state: state.sample.state
  });
  if (minAge !== null) params.append('min_age', minAge);
  if (maxAge !== null) params.append('max_age', maxAge);

  try {
    const res = await fetch(`/api/sample?${params}`);
    const data = await res.json();

    state.sample.total = data.total;
    state.sample.totalPages = data.totalPages;

    const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
    const end = Math.min(data.page * data.limit, data.total);
    document.getElementById('sampleCountRange').innerText = `${start}-${end}`;
    document.getElementById('sampleTotal').innerText = data.total.toLocaleString();
    document.getElementById('samplePageLabel').innerText = `Page ${data.page} of ${Math.max(1, data.totalPages)}`;
    document.getElementById('btnSamplePrev').disabled = data.page <= 1;
    document.getElementById('btnSampleNext').disabled = data.page >= data.totalPages;

    if (data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No leads matching filters.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.items.forEach(lead => {
      const tr = document.createElement('tr');
      tr.className = 'table-row-clickable';

      const firstPhone = lead.phones && lead.phones.length > 0 ? lead.phones[0] : '<span style="color:var(--text-dim)">None</span>';
      const stateBadge = lead.state ? `<span class="tab-badge pill-violet">${lead.state}</span>` : '<span style="color:var(--text-dim)">-</span>';
      const netWorth = lead.value_raw && lead.value_raw !== 'None' ? `<span class="cell-bold cell-mono" style="color:var(--emerald-primary)">${lead.value_raw}</span>` : '<span style="color:var(--text-dim)">Undisclosed</span>';

      tr.innerHTML = `
        <td class="cell-bold">${lead.name}</td>
        <td class="cell-mono">${lead.age || '-'}</td>
        <td>${lead.email || '<span style="color:var(--text-dim)">None</span>'}</td>
        <td class="cell-mono">${firstPhone}</td>
        <td>${lead.address || '<span style="color:var(--text-dim)">Unlisted</span>'}</td>
        <td>${stateBadge}</td>
        <td>${netWorth}</td>
        <td><button class="view-btn-row">Profile</button></td>
      `;

      tr.addEventListener('click', () => openDetailDrawer('sample', lead));
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" class="table-loading" style="color:var(--rose-primary)">Error loading leads.</td></tr>';
  }
}

// --- 3. SHAKEPAY DIGITAL BANKING TABLE & FILTERS ---
async function loadShakepay() {
  const tbody = document.getElementById('tbodyShakepay');
  tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Querying Shakepay referral network...</td></tr>';

  const params = new URLSearchParams({
    page: state.shakepay.page,
    limit: state.shakepay.limit,
    search: state.shakepay.search,
    min_referrals: state.shakepay.minReferrals,
    newsletter: state.shakepay.newsletter
  });

  try {
    const res = await fetch(`/api/shakepay?${params}`);
    const data = await res.json();

    state.shakepay.total = data.total;
    state.shakepay.totalPages = data.totalPages;

    const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
    const end = Math.min(data.page * data.limit, data.total);
    document.getElementById('shakepayCountRange').innerText = `${start}-${end}`;
    document.getElementById('shakepayTotal').innerText = data.total.toLocaleString();
    document.getElementById('shakepayPageLabel').innerText = `Page ${data.page} of ${Math.max(1, data.totalPages)}`;
    document.getElementById('btnShakepayPrev').disabled = data.page <= 1;
    document.getElementById('btnShakepayNext').disabled = data.page >= data.totalPages;

    if (data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No Shakepay records found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.items.forEach(user => {
      const tr = document.createElement('tr');
      tr.className = 'table-row-clickable';

      const refCountBadge = user.referral_count > 0 
        ? `<span class="tab-badge pill-cyan">${user.referral_count} invites</span>`
        : `<span style="color:var(--text-dim)">0</span>`;

      const hashShort = user.shaking_sats ? user.shaking_sats.slice(0, 10) + '...' : '-';

      let inviteType = 'Organic';
      if (user['Invitation by ShakePay'] === 'true') inviteType = 'ShakePay Direct';
      else if (user['Invitation by Rewards Program'] === 'true') inviteType = 'Rewards Program';
      else if (user['Invitation by third party'] === 'true') inviteType = 'Third Party';

      tr.innerHTML = `
        <td class="cell-bold">${user.email}</td>
        <td class="cell-mono" style="color:var(--cyan-primary)">@${user.shaketag}</td>
        <td class="cell-mono">${user.phone || 'Masked'}</td>
        <td class="cell-mono" style="font-size:0.8rem">${user.referral_date || '-'}</td>
        <td>${refCountBadge}</td>
        <td class="cell-mono" style="font-size:0.75rem;color:var(--text-dim)">${hashShort}</td>
        <td><span class="badge-gateway">${inviteType}</span></td>
        <td><button class="view-btn-row">Inspect</button></td>
      `;

      tr.addEventListener('click', () => openDetailDrawer('shakepay', user));
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" class="table-loading" style="color:var(--rose-primary)">Error fetching Shakepay users.</td></tr>';
  }
}

// --- 4. BLOCKFI CRYPTO EMAILS TABLE & FILTERS ---
async function loadBlockfi() {
  const tbody = document.getElementById('tbodyBlockfi');
  tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Indexing 654k BlockFi email database...</td></tr>';

  const params = new URLSearchParams({
    page: state.blockfi.page,
    limit: state.blockfi.limit,
    search: state.blockfi.search,
    domain: state.blockfi.domain
  });

  try {
    const res = await fetch(`/api/blockfi?${params}`);
    const data = await res.json();

    state.blockfi.total = data.total;
    state.blockfi.totalPages = data.totalPages;

    const start = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
    const end = Math.min(data.page * data.limit, data.total);
    document.getElementById('blockfiCountRange').innerText = `${start}-${end}`;
    document.getElementById('blockfiTotal').innerText = data.total.toLocaleString();
    document.getElementById('blockfiPageLabel').innerText = `Page ${data.page} of ${Math.max(1, data.totalPages)}`;
    document.getElementById('btnBlockfiPrev').disabled = data.page <= 1;
    document.getElementById('btnBlockfiNext').disabled = data.page >= data.totalPages;

    if (data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-loading">No emails matching query.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'table-row-clickable';

      const email = item.email;
      const atIndex = email.lastIndexOf('@');
      const domain = atIndex !== -1 ? email.slice(atIndex + 1) : '-';

      tr.innerHTML = `
        <td class="cell-mono" style="color:var(--text-dim)">#${item.id}</td>
        <td class="cell-bold">${email}</td>
        <td class="cell-mono">${domain}</td>
        <td><span class="tab-badge pill-emerald">BlockFi Verified</span></td>
        <td><button class="view-btn-row">Cross-Match</button></td>
      `;

      tr.addEventListener('click', () => {
        // Trigger cross-match for this email
        runOmniQuery(email);
      });
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" class="table-loading" style="color:var(--rose-primary)">Error fetching emails.</td></tr>';
  }
}

// --- 5. OMNI-SEARCH / CROSS MATCH LOOKUP ---
async function runOmniQuery(query) {
  if (!query) return;

  switchTab('omni');
  document.getElementById('omniHeroInput').value = query;

  const container = document.getElementById('omniResultsContainer');
  container.style.display = 'grid';

  // Clear previous buckets
  ['Coincustody', 'Sample', 'Shakepay', 'Blockfi'].forEach(b => {
    document.getElementById(`countOmni${b}`).innerText = '...';
    document.getElementById(`listOmni${b}`).innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;padding:8px;">Searching...</div>';
  });

  try {
    const res = await fetch(`/api/omnisearch?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const r = data.results;

    // 1. Coincustody Matches
    document.getElementById('countOmniCoincustody').innerText = r.coincustody.length;
    const coincustodyList = document.getElementById('listOmniCoincustody');
    coincustodyList.innerHTML = '';
    if (r.coincustody.length === 0) {
      coincustodyList.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;padding:8px;">No matches</div>';
    } else {
      r.coincustody.forEach(order => {
        const item = document.createElement('div');
        item.className = 'bucket-item-card';
        item.innerHTML = `
          <div class="item-card-title">Order #${order.order_number || order.id} (${order.payment_method_norm})</div>
          <div class="item-card-sub">${order.email} | $${Number(order.total_price).toLocaleString()}</div>
        `;
        item.onclick = () => openDetailDrawer('coincustody', order);
        coincustodyList.appendChild(item);
      });
    }

    // 2. Sample Leads Matches
    document.getElementById('countOmniSample').innerText = r.sample.length;
    const sampleList = document.getElementById('listOmniSample');
    sampleList.innerHTML = '';
    if (r.sample.length === 0) {
      sampleList.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;padding:8px;">No matches</div>';
    } else {
      r.sample.forEach(lead => {
        const item = document.createElement('div');
        item.className = 'bucket-item-card';
        item.innerHTML = `
          <div class="item-card-title">${lead.name} (${lead.state || 'US'})</div>
          <div class="item-card-sub">${lead.email} | ${lead.value_raw}</div>
        `;
        item.onclick = () => openDetailDrawer('sample', lead);
        sampleList.appendChild(item);
      });
    }

    // 3. Shakepay Matches
    document.getElementById('countOmniShakepay').innerText = r.shakepay.length;
    const shakepayList = document.getElementById('listOmniShakepay');
    shakepayList.innerHTML = '';
    if (r.shakepay.length === 0) {
      shakepayList.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;padding:8px;">No matches</div>';
    } else {
      r.shakepay.forEach(user => {
        const item = document.createElement('div');
        item.className = 'bucket-item-card';
        item.innerHTML = `
          <div class="item-card-title">@${user.shaketag} (${user.referral_count} invites)</div>
          <div class="item-card-sub">${user.email} | ${user.phone}</div>
        `;
        item.onclick = () => openDetailDrawer('shakepay', user);
        shakepayList.appendChild(item);
      });
    }

    // 4. BlockFi Matches
    document.getElementById('countOmniBlockfi').innerText = r.blockfi.length;
    const blockfiList = document.getElementById('listOmniBlockfi');
    blockfiList.innerHTML = '';
    if (r.blockfi.length === 0) {
      blockfiList.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;padding:8px;">No matches</div>';
    } else {
      r.blockfi.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'bucket-item-card';
        item.innerHTML = `
          <div class="item-card-title" style="word-break:break-all;">${entry.email}</div>
          <div class="item-card-sub">BlockFi Holder Record #${entry.id}</div>
        `;
        item.onclick = () => showToast(`Selected BlockFi email: ${entry.email}`);
        blockfiList.appendChild(item);
      });
    }

  } catch (err) {
    console.error(err);
  }
}

// --- DEEP DETAIL DRAWER (MODAL) ---
function initDrawer() {
  const overlay = document.getElementById('detailDrawerOverlay');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const copyJsonBtn = document.getElementById('drawerCopyJsonBtn');

  closeBtn.addEventListener('click', closeDetailDrawer);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetailDrawer();
  });

  copyJsonBtn.addEventListener('click', () => {
    if (state.currentDrawerRecord) {
      navigator.clipboard.writeText(JSON.stringify(state.currentDrawerRecord, null, 2));
      showToast('Raw JSON copied to clipboard!');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeDetailDrawer();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('omniSearchInput').focus();
    }
  });
}

function openDetailDrawer(dataset, item) {
  state.currentDrawerRecord = item;
  const overlay = document.getElementById('detailDrawerOverlay');
  const badge = document.getElementById('drawerDatasetBadge');
  const title = document.getElementById('drawerTitle');
  const subtitle = document.getElementById('drawerSubtitle');
  const body = document.getElementById('drawerBody');

  body.innerHTML = '';

  if (dataset === 'coincustody') {
    badge.innerText = 'SHOPIFY & BINANCE ORDER';
    badge.style.color = 'var(--amber-primary)';
    title.innerText = `Order #${item.order_number || item.id}`;
    subtitle.innerText = `Created: ${item.created_at || 'N/A'} | Status: ${item.financial_status || 'unknown'}`;

    // Payment Section
    const paymentSec = document.createElement('div');
    paymentSec.className = 'drawer-section';
    paymentSec.innerHTML = `
      <div class="section-label">🪙 Payment & Checkout Info</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Payment Gateway</span>
          <span class="field-value">${item.payment_method_norm}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Total Amount</span>
          <span class="field-value field-value-mono" style="color:var(--emerald-primary)">$${Number(item.total_price).toLocaleString()} ${item.currency || 'ARS'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Payment Transaction ID</span>
          <span class="field-value field-value-mono">${item.payment_id || '--'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Fiscal Condition</span>
          <span class="field-value">${item.condicion_fiscal || 'Consumidor Final'}</span>
        </div>
      </div>
    `;
    body.appendChild(paymentSec);

    // Customer Identity Section
    const custSec = document.createElement('div');
    custSec.className = 'drawer-section';
    custSec.innerHTML = `
      <div class="section-label">👤 Customer Identification</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Email Address</span>
          <span class="field-value" style="display:flex;align-items:center;gap:6px;">
            <span>${item.email || 'N/A'}</span>
            ${item.email ? `<button onclick="copyText('${item.email}')" class="drawer-btn-icon" style="width:24px;height:24px;" title="Copy Email">📋</button>` : ''}
          </span>
        </div>
        <div class="detail-field">
          <span class="field-label">National ID (DNI)</span>
          <span class="field-value field-value-mono">${item.numero_identificacion || 'N/A'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Contact Phone</span>
          <span class="field-value field-value-mono">${item.phone || item.shipping_phone || 'N/A'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Browser IP Address</span>
          <span class="field-value field-value-mono">${item.browser_ip || 'Masked'}</span>
        </div>
      </div>
    `;
    body.appendChild(custSec);

    // Shipping Section
    const shipSec = document.createElement('div');
    shipSec.className = 'drawer-section';
    shipSec.innerHTML = `
      <div class="section-label">📦 Logistics & Delivery</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Carrier / Shipment Type</span>
          <span class="field-value">${item.shipment_type || 'Standard'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Fulfillment Status</span>
          <span class="field-value">${item.fulfillment_status || 'Unfulfilled'}</span>
        </div>
        <div class="detail-field" style="grid-column: span 2;">
          <span class="field-label">Tracking URL</span>
          <span class="field-value">
            ${item.shipment_tracking_url ? `<a href="${item.shipment_tracking_url}" target="_blank">${item.shipment_tracking_url} ↗</a>` : 'Not assigned'}
          </span>
        </div>
      </div>
    `;
    body.appendChild(shipSec);

    // Parsed Notes / Attributes
    if (item.parsed_notes && item.parsed_notes.length > 0) {
      const notesSec = document.createElement('div');
      notesSec.className = 'drawer-section';
      let notesHtml = '<div class="section-label">📝 Store Note Attributes</div><div class="detail-row-grid">';
      item.parsed_notes.forEach(attr => {
        if (attr.name !== 'Compressed Zippin Data') {
          notesHtml += `
            <div class="detail-field">
              <span class="field-label">${attr.name}</span>
              <span class="field-value field-value-mono">${attr.value}</span>
            </div>
          `;
        }
      });
      notesHtml += '</div>';
      notesSec.innerHTML = notesHtml;
      body.appendChild(notesSec);
    }
  }

  else if (dataset === 'sample') {
    badge.innerText = 'ENRICHED IDENTITY & NET WORTH';
    badge.style.color = 'var(--violet-primary)';
    title.innerText = item.name;
    subtitle.innerText = `Age: ${item.age || 'Unknown'} | State: ${item.state || 'US'}`;

    // Financial Profile
    const finSec = document.createElement('div');
    finSec.className = 'drawer-section';
    finSec.innerHTML = `
      <div class="section-label">💰 Valuation & Property Estimate</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Estimated Property / Net Worth</span>
          <span class="field-value field-value-mono" style="color:var(--emerald-primary);font-size:1.15rem">${item.value_raw || 'Undisclosed'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Age Bracket</span>
          <span class="field-value">${item.age ? `${item.age} Years Old` : 'N/A'}</span>
        </div>
      </div>
    `;
    body.appendChild(finSec);

    // Contact Details
    const contactSec = document.createElement('div');
    contactSec.className = 'drawer-section';
    let phonesHtml = (item.phones || []).map(p => `<div>📞 ${p}</div>`).join('') || 'None listed';
    contactSec.innerHTML = `
      <div class="section-label">📞 Contact Channels</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Email Address</span>
          <span class="field-value">${item.email || 'N/A'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Associated Phone Numbers (${(item.phones || []).length})</span>
          <span class="field-value field-value-mono" style="font-size:0.82rem">${phonesHtml}</span>
        </div>
      </div>
    `;
    body.appendChild(contactSec);

    // Physical Address
    const addrSec = document.createElement('div');
    addrSec.className = 'drawer-section';
    addrSec.innerHTML = `
      <div class="section-label">📍 Physical Residence</div>
      <div class="detail-field">
        <span class="field-label">Full Street Address</span>
        <span class="field-value">${item.address || 'N/A'}</span>
      </div>
      <div style="margin-top:0.75rem">
        <a href="https://maps.google.com/?q=${encodeURIComponent(item.address)}" target="_blank" class="action-btn-secondary" style="display:inline-flex;">
          <span>Open on Google Maps ↗</span>
        </a>
      </div>
    `;
    body.appendChild(addrSec);
  }

  else if (dataset === 'shakepay') {
    badge.innerText = 'DIGITAL BANKING / SHAKEPAY';
    badge.style.color = 'var(--cyan-primary)';
    title.innerText = `@${item.shaketag}`;
    subtitle.innerText = `Email: ${item.email} | Referrals: ${item.referral_count}`;

    const refSec = document.createElement('div');
    refSec.className = 'drawer-section';
    refSec.innerHTML = `
      <div class="section-label">🎁 Referral Program Performance</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Total Referrals Count</span>
          <span class="field-value field-value-mono" style="color:var(--cyan-primary);font-size:1.2rem">${item.referral_count} Invites</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Referral Date</span>
          <span class="field-value field-value-mono">${item.referral_date || 'N/A'}</span>
        </div>
        <div class="detail-field" style="grid-column: span 2;">
          <span class="field-label">Referral URL</span>
          <span class="field-value field-value-mono"><a href="${item.referral_url}" target="_blank">${item.referral_url}</a></span>
        </div>
        <div class="detail-field" style="grid-column: span 2;">
          <span class="field-label">ShakingSats Reward Hash</span>
          <span class="field-value field-value-mono" style="font-size:0.75rem">${item.shaking_sats}</span>
        </div>
      </div>
    `;
    body.appendChild(refSec);

    const userSec = document.createElement('div');
    userSec.className = 'drawer-section';
    userSec.innerHTML = `
      <div class="section-label">👤 User Attributes</div>
      <div class="detail-row-grid">
        <div class="detail-field">
          <span class="field-label">Email Associated</span>
          <span class="field-value">${item.email}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Phone Associated</span>
          <span class="field-value field-value-mono">${item.phone || 'Masked'}</span>
        </div>
        <div class="detail-field">
          <span class="field-label">Newsletter Status</span>
          <span class="field-value">${item.newsletter ? 'Subscribed' : 'Unsubscribed'}</span>
        </div>
      </div>
    `;
    body.appendChild(userSec);
  }

  // Cross-Dataset Check Box
  const targetEmail = item.email;
  if (targetEmail) {
    const crossSec = document.createElement('div');
    crossSec.className = 'drawer-section';
    crossSec.innerHTML = `
      <div class="section-label">⚡ Cross-Dataset Deep Match</div>
      <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem;">Check if <strong>${targetEmail}</strong> exists across BlockFi or other datasets.</p>
      <button class="action-btn-secondary" onclick="runOmniQuery('${targetEmail}'); closeDetailDrawer();">
        <span>Search ${targetEmail} Across All Files ↗</span>
      </button>
    `;
    body.appendChild(crossSec);
  }

  // Raw JSON Inspector
  const jsonSec = document.createElement('div');
  jsonSec.className = 'drawer-section';
  jsonSec.innerHTML = `
    <div class="section-label" style="display:flex;justify-content:space-between;align-items:center;">
      <span>💻 Raw JSON Inspector</span>
      <button onclick="navigator.clipboard.writeText(JSON.stringify(state.currentDrawerRecord, null, 2)); showToast('JSON Copied!');" class="view-btn-row">Copy JSON</button>
    </div>
    <div class="json-viewer-box">${escapeHtml(JSON.stringify(item, null, 2))}</div>
  `;
  body.appendChild(jsonSec);

  overlay.classList.add('open');
}

function closeDetailDrawer() {
  document.getElementById('detailDrawerOverlay').classList.remove('open');
}

// --- FILTERS & EVENT HANDLERS ---
function initFilters() {
  // 1. Coincustody filters
  const searchCoin = document.getElementById('filterCoincustodySearch');
  searchCoin.addEventListener('input', debounce(() => {
    state.coincustody.search = searchCoin.value;
    state.coincustody.page = 1;
    loadCoincustody();
  }, 250));

  document.querySelectorAll('#pillsCoincustodyPayment .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pillsCoincustodyPayment .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.coincustody.payment = btn.getAttribute('data-val');
      state.coincustody.page = 1;
      loadCoincustody();
    });
  });

  document.querySelectorAll('#pillsCoincustodyStatus .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pillsCoincustodyStatus .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.coincustody.status = btn.getAttribute('data-val');
      state.coincustody.page = 1;
      loadCoincustody();
    });
  });

  document.getElementById('btnCoincustodyPrev').addEventListener('click', () => {
    if (state.coincustody.page > 1) {
      state.coincustody.page--;
      loadCoincustody();
    }
  });
  document.getElementById('btnCoincustodyNext').addEventListener('click', () => {
    if (state.coincustody.page < state.coincustody.totalPages) {
      state.coincustody.page++;
      loadCoincustody();
    }
  });

  // 2. Sample leads filters
  const searchSample = document.getElementById('filterSampleSearch');
  searchSample.addEventListener('input', debounce(() => {
    state.sample.search = searchSample.value;
    state.sample.page = 1;
    loadSample();
  }, 250));

  document.getElementById('selectSampleState').addEventListener('change', (e) => {
    state.sample.state = e.target.value;
    state.sample.page = 1;
    loadSample();
  });

  document.getElementById('selectSampleAge').addEventListener('change', (e) => {
    state.sample.ageBracket = e.target.value;
    state.sample.page = 1;
    loadSample();
  });

  document.getElementById('btnSamplePrev').addEventListener('click', () => {
    if (state.sample.page > 1) {
      state.sample.page--;
      loadSample();
    }
  });
  document.getElementById('btnSampleNext').addEventListener('click', () => {
    if (state.sample.page < state.sample.totalPages) {
      state.sample.page++;
      loadSample();
    }
  });

  // 3. Shakepay filters
  const searchShake = document.getElementById('filterShakepaySearch');
  searchShake.addEventListener('input', debounce(() => {
    state.shakepay.search = searchShake.value;
    state.shakepay.page = 1;
    loadShakepay();
  }, 250));

  document.querySelectorAll('#pillsShakepayTier .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pillsShakepayTier .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.shakepay.minReferrals = parseInt(btn.getAttribute('data-val'), 10);
      state.shakepay.page = 1;
      loadShakepay();
    });
  });

  document.getElementById('selectShakepayNews').addEventListener('change', (e) => {
    state.shakepay.newsletter = e.target.value;
    state.shakepay.page = 1;
    loadShakepay();
  });

  document.getElementById('btnShakepayPrev').addEventListener('click', () => {
    if (state.shakepay.page > 1) {
      state.shakepay.page--;
      loadShakepay();
    }
  });
  document.getElementById('btnShakepayNext').addEventListener('click', () => {
    if (state.shakepay.page < state.shakepay.totalPages) {
      state.shakepay.page++;
      loadShakepay();
    }
  });

  // 4. BlockFi filters
  const searchBlockfi = document.getElementById('filterBlockfiSearch');
  searchBlockfi.addEventListener('input', debounce(() => {
    state.blockfi.search = searchBlockfi.value;
    state.blockfi.page = 1;
    loadBlockfi();
  }, 300));

  document.querySelectorAll('#pillsBlockfiDomain .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pillsBlockfiDomain .pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.blockfi.domain = btn.getAttribute('data-val');
      state.blockfi.page = 1;
      loadBlockfi();
    });
  });

  document.getElementById('btnBlockfiPrev').addEventListener('click', () => {
    if (state.blockfi.page > 1) {
      state.blockfi.page--;
      loadBlockfi();
    }
  });
  document.getElementById('btnBlockfiNext').addEventListener('click', () => {
    if (state.blockfi.page < state.blockfi.totalPages) {
      state.blockfi.page++;
      loadBlockfi();
    }
  });

  // Omni Hero Search
  const heroInput = document.getElementById('omniHeroInput');
  const heroBtn = document.getElementById('omniHeroSearchBtn');
  heroBtn.addEventListener('click', () => runOmniQuery(heroInput.value));
  heroInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runOmniQuery(heroInput.value);
  });

  // Header Refresh
  document.getElementById('themeRefreshBtn').addEventListener('click', () => {
    loadStats();
    if (state.activeTab === 'coincustody') loadCoincustody();
    if (state.activeTab === 'sample') loadSample();
    if (state.activeTab === 'shakepay') loadShakepay();
    if (state.activeTab === 'blockfi') loadBlockfi();
    showToast('Datasets re-synchronized!');
  });
}

// --- HEADER GLOBAL SEARCH ---
function initHeaderSearch() {
  const input = document.getElementById('omniSearchInput');
  const clearBtn = document.getElementById('clearOmniSearch');

  input.addEventListener('input', () => {
    clearBtn.style.display = input.value ? 'block' : 'none';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim().length > 1) {
      runOmniQuery(input.value.trim());
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
  });
}

// --- EXPORT TO CSV ---
async function exportCurrentView(dataset) {
  showToast(`Preparing ${dataset} export...`);
  try {
    let url = `/api/${dataset}?limit=250`;
    if (dataset === 'coincustody') {
      url += `&search=${encodeURIComponent(state.coincustody.search)}&payment=${state.coincustody.payment}&status=${state.coincustody.status}`;
    } else if (dataset === 'sample') {
      url += `&search=${encodeURIComponent(state.sample.search)}&state=${state.sample.state}`;
    } else if (dataset === 'shakepay') {
      url += `&search=${encodeURIComponent(state.shakepay.search)}&min_referrals=${state.shakepay.minReferrals}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      showToast('No records to export');
      return;
    }

    // Convert items to CSV
    const items = data.items;
    const keys = Object.keys(items[0]).filter(k => k !== 'parsed_notes');
    let csv = keys.join(',') + '\n';
    items.forEach(row => {
      const line = keys.map(k => {
        let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset}_export_${Date.now()}.csv`;
    link.click();
    showToast(`Downloaded ${items.length} records!`);
  } catch (err) {
    console.error(err);
    showToast('Export failed');
  }
}

// --- UTILS ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function copyText(txt) {
  navigator.clipboard.writeText(txt);
  showToast('Copied to clipboard!');
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
