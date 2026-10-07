/**
 * STREAMPASS - MERCHANT ADMIN CONSOLE & VOUCHER LIQUIDATION ENGINE
 */

const STORAGE_KEY = 'streamPass_all_client_orders';

// Initial Sample Orders for Demonstration
const SAMPLE_ORDERS = [
  {
    orderId: 'STV-48912',
    fullName: 'Rahul Sharma',
    whatsapp: '+91 9876543210',
    rawWhatsapp: '9876543210',
    email: 'rahul.sharma@example.com',
    platformName: 'All-in-One OTT Bundle',
    planName: 'ALL OTT — 1 YEAR PREMIUM',
    duration: '1 Year',
    quantity: 1,
    totalAmount: 1499,
    notes: 'Samsung Smart TV & iPhone 15',
    status: 'Pending',
    orderDate: '10/06/2026, 05:30:12 AM',
    paymentDetails: {
      method: 'Myntra E-Gift Card',
      cardNo: '6001234567891024',
      pin: '482910',
      redemptionType: 'Online',
      expiry: '12/26',
      balance: 1499,
      sellingPrice: 1379
    }
  },
  {
    orderId: 'STV-39201',
    fullName: 'Priya Verma',
    whatsapp: '+91 9812345678',
    rawWhatsapp: '9812345678',
    email: 'priya.v@gmail.com',
    platformName: 'Netflix',
    planName: 'NETFLIX 4K ULTRA HD — 6 MONTHS',
    duration: '6 Months',
    quantity: 1,
    totalAmount: 499,
    notes: 'Firestick 4K',
    status: 'Fulfilled',
    orderDate: '10/06/2026, 04:15:45 AM',
    paymentDetails: {
      method: 'Amazon Pay E-Gift Card',
      claimCode: 'EGC-9482-1048-5920'
    }
  },
  {
    orderId: 'STV-28190',
    fullName: 'Amit Patel',
    whatsapp: '+91 9765432109',
    rawWhatsapp: '9765432109',
    email: 'patel.amit@yahoo.com',
    platformName: 'Prime Video',
    planName: 'PRIME VIDEO 4K — 1 YEAR',
    duration: '1 Year',
    quantity: 1,
    totalAmount: 299,
    notes: 'LG WebOS TV',
    status: 'Fulfilled',
    orderDate: '10/05/2026, 09:20:00 PM',
    paymentDetails: {
      method: 'Myntra E-Gift Card',
      cardNo: '6001987654321098',
      pin: '109284',
      redemptionType: 'Online',
      expiry: '09/27',
      balance: 299,
      sellingPrice: 275
    }
  },
  {
    orderId: 'STV-19402',
    fullName: 'Vikram Singh',
    whatsapp: '+91 9988776655',
    rawWhatsapp: '9988776655',
    email: 'vikram.singh@outlook.com',
    platformName: 'Disney+ Hotstar',
    planName: 'HOTSTAR SUPER 4K — 1 YEAR',
    duration: '1 Year',
    quantity: 2,
    totalAmount: 398,
    notes: 'Android Mobile & Laptop',
    status: 'Pending',
    orderDate: '10/05/2026, 06:45:10 PM',
    paymentDetails: {
      method: 'Amazon Pay E-Gift Card',
      claimCode: 'AMZ-8201-9482-1049'
    }
  },
  {
    orderId: 'STV-10923',
    fullName: 'Neha Gupta',
    whatsapp: '+91 9123456789',
    rawWhatsapp: '9123456789',
    email: 'neha.gupta@gmail.com',
    platformName: 'SonyLIV',
    planName: 'SONYLIV PREMIUM — 1 YEAR',
    duration: '1 Year',
    quantity: 1,
    totalAmount: 199,
    notes: 'Sony Bravia TV',
    status: 'Fulfilled',
    orderDate: '10/05/2026, 02:10:30 PM',
    paymentDetails: {
      method: 'Myntra E-Gift Card',
      cardNo: '6001554433221100',
      pin: '776655',
      redemptionType: 'Both',
      expiry: '11/26',
      balance: 199,
      sellingPrice: 183
    }
  }
];

// State
let allOrders = [];
let activeFilter = 'all';
let searchQuery = '';

export function initAdminPanel() {
  loadOrders();
  renderAdminConsole();
  setupEventListeners();
  setupHashRouting();
}

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      allOrders = JSON.parse(saved);
    } catch (e) {
      allOrders = SAMPLE_ORDERS;
      saveOrders();
    }
  } else {
    allOrders = SAMPLE_ORDERS;
    saveOrders();
  }
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
}

export function saveNewClientOrder(order) {
  if (!order.status) order.status = 'Pending';
  loadOrders();
  allOrders.unshift(order);
  saveOrders();
  renderAdminConsole();
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const adminTrigger = e.target.closest('[href="#admin"], .nav-admin-link, #nav-admin-btn');
    if (adminTrigger) {
      e.preventDefault();
      openAdminModal();
    }
  });
  const adminBtn = document.getElementById('nav-admin-btn');
  const closeBtn = document.getElementById('admin-close-btn');
  const exportBtn = document.getElementById('admin-export-csv-btn');
  const searchInput = document.getElementById('admin-search-input');
  const filterTabs = document.querySelectorAll('.admin-tab');

  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAdminModal);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportOrdersToCSV);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderTable();
    });
  });

  // Table event delegation for Status change & Actions
  const tbody = document.getElementById('admin-orders-tbody');
  if (tbody) {
    tbody.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select-pill')) {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        updateOrderStatus(orderId, newStatus);
      }
    });

    tbody.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-mini-btn');
      if (copyBtn) {
        const textToCopy = copyBtn.dataset.copy;
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy);
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = originalText; }, 1200);
        }
      }

      const delBtn = e.target.closest('.btn-action-del');
      if (delBtn) {
        const orderId = delBtn.dataset.orderId;
        if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
          deleteOrder(orderId);
        }
      }
    });
  }
}

function setupHashRouting() {
  if (window.location.hash === '#admin') {
    openAdminModal();
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      openAdminModal();
    }
  });
}

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    loadOrders();
    renderAdminConsole();
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }
}

function renderAdminConsole() {
  renderMetrics();
  renderTable();
}

function renderMetrics() {
  const totalOrdersEl = document.getElementById('stat-total-orders');
  const totalSalesEl = document.getElementById('stat-total-sales');
  const myntraCountEl = document.getElementById('stat-myntra-count');
  const myntraValEl = document.getElementById('stat-myntra-val');
  const amazonCountEl = document.getElementById('stat-amazon-count');
  const amazonValEl = document.getElementById('stat-amazon-val');
  const pendingCountEl = document.getElementById('stat-pending-count');

  const totalOrders = allOrders.length;
  const totalSales = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const myntraOrders = allOrders.filter(o => o.paymentDetails?.method?.includes('Myntra'));
  const myntraVal = myntraOrders.reduce((sum, o) => sum + (o.paymentDetails?.balance || o.totalAmount || 0), 0);

  const amazonOrders = allOrders.filter(o => o.paymentDetails?.method?.includes('Amazon'));
  const amazonVal = amazonOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingCount = allOrders.filter(o => o.status === 'Pending').length;

  if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
  if (totalSalesEl) totalSalesEl.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
  if (myntraCountEl) myntraCountEl.textContent = myntraOrders.length;
  if (myntraValEl) myntraValEl.textContent = `₹${myntraVal.toLocaleString('en-IN')} Face Value`;
  if (amazonCountEl) amazonCountEl.textContent = amazonOrders.length;
  if (amazonValEl) amazonValEl.textContent = `₹${amazonVal.toLocaleString('en-IN')} Claim Value`;
  if (pendingCountEl) pendingCountEl.textContent = pendingCount;
}

function getFilteredOrders() {
  return allOrders.filter(order => {
    // Category Filter
    if (activeFilter === 'pending' && order.status !== 'Pending') return false;
    if (activeFilter === 'approved' && (order.status !== 'Approved' && order.status !== 'Fulfilled')) return false;
    if (activeFilter === 'rejected' && order.status !== 'Rejected') return false;
    if (activeFilter === 'fulfilled' && order.status !== 'Fulfilled') return false;
    if (activeFilter === 'myntra' && !order.paymentDetails?.method?.includes('Myntra')) return false;
    if (activeFilter === 'amazon' && !order.paymentDetails?.method?.includes('Amazon')) return false;

    // Search Query Filter
    if (searchQuery) {
      const cardNo = order.paymentDetails?.cardNo || '';
      const pin = order.paymentDetails?.pin || '';
      const claimCode = order.paymentDetails?.claimCode || '';
      const matchable = `${order.orderId} ${order.fullName} ${order.whatsapp} ${order.email} ${order.platformName} ${order.planName} ${cardNo} ${pin} ${claimCode}`.toLowerCase();
      if (!matchable.includes(searchQuery)) return false;
    }

    return true;
  });
}

function renderTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const filtered = getFilteredOrders();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
          No matching client orders found in the database.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const isBinance = order.paymentDetails?.method?.includes('Binance') || order.paymentDetails?.txid;
    const isUpi = order.paymentDetails?.method?.includes('UPI') || order.paymentDetails?.utr;
    const isMyntra = order.paymentDetails?.method?.includes('Myntra');
    const p = order.paymentDetails || {};
    
    // Voucher HTML
    let voucherHTML = '';
    if (isBinance) {
      voucherHTML = `
        <div class="voucher-details-box" style="border-left: 3px solid #eab308;">
          <span class="v-method-tag" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3);">💎 Binance / USDT Crypto</span>
          <div class="v-field-row" style="margin-top: 6px;">
            <span class="v-field-label">TxID / Hash:</span>
            <span class="v-field-val" style="color: #facc15; font-weight: 800; font-size: 0.85rem; word-break: break-all;">${p.txid || 'N/A'}</span>
            <button class="copy-mini-btn" data-copy="${p.txid}">Copy</button>
          </div>
          <div class="v-field-row">
            <span class="v-field-label">USDT Value:</span>
            <span class="v-field-val" style="color: #4ade80; font-weight: 800;">${p.usdtAmount || '$0.00 USDT'}</span>
          </div>
        </div>
      `;
    } else if (isUpi) {
      voucherHTML = `
        <div class="voucher-details-box" style="border-left: 3px solid #3b82f6;">
          <span class="v-method-tag" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">⚡ Direct Instant UPI QR</span>
          <div class="v-field-row" style="margin-top: 6px;">
            <span class="v-field-label">UTR / Ref No:</span>
            <span class="v-field-val" style="color: #60a5fa; font-weight: 800; font-size: 0.95rem;">${p.utr || 'N/A'}</span>
            <button class="copy-mini-btn" data-copy="${p.utr}">Copy UTR</button>
          </div>
          <div class="v-field-row">
            <span class="v-field-label">UPI ID:</span>
            <span class="v-field-val" style="font-size: 0.74rem; color: #94a3b8;">${p.upiId || 'streampass@upi'}</span>
          </div>
        </div>
      `;
    } else if (isMyntra) {
      voucherHTML = `
        <div class="voucher-details-box">
          <span class="v-method-tag v-method-myntra">🛍️ Myntra E-Gift Card</span>
          <div class="v-field-row">
            <span class="v-field-label">Card No:</span>
            <span class="v-field-val">${p.cardNo || 'N/A'}</span>
            <button class="copy-mini-btn" data-copy="${p.cardNo}">Copy</button>
          </div>
          <div class="v-field-row">
            <span class="v-field-label">PIN:</span>
            <span class="v-field-val">${p.pin || 'N/A'}</span>
            <button class="copy-mini-btn" data-copy="${p.pin}">Copy</button>
          </div>
          <div class="v-field-row">
            <span class="v-field-label">Expiry / Type:</span>
            <span class="v-field-val" style="font-size: 0.74rem;">${p.expiry || 'MM/YY'} (${p.redemptionType || 'Online'})</span>
          </div>
          <div class="v-field-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            <span class="v-field-label">Balance / Sell:</span>
            <span class="v-field-val" style="color: #4ade80;">₹${p.balance || order.totalAmount} / ₹${p.sellingPrice || Math.round(order.totalAmount*0.92)}</span>
          </div>
        </div>
      `;
    } else {
      voucherHTML = `
        <div class="voucher-details-box">
          <span class="v-method-tag v-method-amazon">📦 Amazon Pay Code</span>
          <div class="v-field-row" style="margin-top: 4px;">
            <span class="v-field-label">Claim Code:</span>
            <span class="v-field-val" style="color: #fbbf24;">${p.claimCode || 'N/A'}</span>
            <button class="copy-mini-btn" data-copy="${p.claimCode}">Copy</button>
          </div>
        </div>
      `;
    }

    // Custom WhatsApp message payload based on status
    let msgText = "";
    if (order.status === "Approved" || order.status === "Fulfilled") {
      msgText = `Hello ${order.fullName}! 🎉\n\nYour StreamPass order *#${order.orderId}* for *${order.platformName}* (${order.planName}) has been APPROVED!\n\n🔑 *Login Credentials / Access:* Active\n- Validity: ${order.duration}\n- Support: 365 Days Replacement Warranty\n\nThank you for choosing StreamPass!`;
    } else if (order.status === "Rejected") {
      msgText = `Hello ${order.fullName}! ❌\n\nYour StreamPass order *#${order.orderId}* for *${order.platformName}* was REJECTED during verification.\n\nReason: ${order.rejectionReason || "Voucher verification failed. Card/PIN invalid or already redeemed."}\n\nIf you need assistance or wish to submit correct voucher details, please reply to this message.`;
    } else {
      msgText = `Hello ${order.fullName}! ⏳\n\nYour StreamPass order *#${order.orderId}* for *${order.platformName}* is currently under review. Credentials will be dispatched shortly in 15–30 minutes!`;
    }

    const waText = encodeURIComponent(msgText);
    const waLink = `https://wa.me/${(order.rawWhatsapp || order.whatsapp).replace(/\D/g, '')}?text=${waText}`;

    const statusClass = (order.status === 'Approved' || order.status === 'Fulfilled') ? 'status-approved' : order.status === 'Rejected' ? 'status-rejected' : order.status === 'Refunded' ? 'status-refunded' : 'status-pending';

    return `
      <tr>
        <td>
          <div class="order-id-code">#${order.orderId}</div>
          <div class="order-date-sub">${order.orderDate}</div>
        </td>
        <td>
          <div class="client-name-title">${order.fullName}</div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">${order.email}</div>
          <a href="${waLink}" target="_blank" rel="noopener" class="client-wa-btn">
            💬 ${order.whatsapp}
          </a>
        </td>
        <td>
          <span class="plan-tag-badge">${order.platformName}</span>
          <div style="font-weight: 700; color: #ffffff; margin-top: 4px; font-size: 0.82rem;">${order.planName}</div>
          <div style="font-size: 0.76rem; color: #64748b; margin-top: 2px;">Qty: ${order.quantity} • Total: ₹${order.totalAmount}</div>
          ${order.notes ? `<div style="font-size: 0.72rem; color: #38bdf8; margin-top: 3px;">📺 ${order.notes}</div>` : ''}
        </td>
        <td>
          ${voucherHTML}
        </td>
        <td>
          <select class="status-select-pill ${statusClass}" data-order-id="${order.orderId}">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending Review</option>
            <option value="Approved" ${(order.status === 'Approved' || order.status === 'Fulfilled') ? 'selected' : ''}>✅ Approved</option>
            <option value="Rejected" ${order.status === 'Rejected' ? 'selected' : ''}>❌ Rejected</option>
            <option value="Refunded" ${order.status === 'Refunded' ? 'selected' : ''}>🛑 Refunded</option>
          </select>
        </td>
        <td>
          <div class="action-btns-wrap">
            <a href="${waLink}" target="_blank" rel="noopener" class="btn-action-wa" title="Send WhatsApp Message">
              <span>Send WA</span>
            </a>
            <button type="button" class="btn-action-del" data-order-id="${order.orderId}" title="Delete Order">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const order = allOrders.find(o => o.orderId === orderId || o.orderId === `STV-${orderId}`);
  if (order) {
    if (newStatus === "Rejected") {
      const defaultReason = order.rejectionReason || "Voucher verification failed. Card/PIN invalid or already redeemed.";
      let reason = defaultReason;
      try {
        const inputReason = prompt("Enter Rejection Reason for Client (e.g. Invalid PIN, Card already used):", defaultReason);
        if (inputReason !== null && inputReason.trim() !== "") {
          reason = inputReason.trim();
        }
      } catch (e) {
        reason = defaultReason;
      }
      order.rejectionReason = reason;
    }
    order.status = newStatus;
    saveOrders();
    try { window.dispatchEvent(new Event("storage")); } catch(e){}
    renderMetrics();
    renderTable();
  }
}

function deleteOrder(orderId) {
  allOrders = allOrders.filter(o => o.orderId !== orderId);
  saveOrders();
  renderAdminConsole();
}

function exportOrdersToCSV() {
  if (allOrders.length === 0) {
    alert("No orders available to export.");
    return;
  }

  const headers = ['Order ID', 'Date', 'Client Name', 'WhatsApp', 'Email', 'Platform', 'Plan', 'Quantity', 'Total Amount', 'Status', 'Payment Method', 'Card No / Claim Code', 'PIN', 'Expiry', 'Selling Price'];
  const rows = allOrders.map(o => {
    const p = o.paymentDetails || {};
    return [
      o.orderId,
      `"${o.orderDate}"`,
      `"${o.fullName}"`,
      `"${o.whatsapp}"`,
      `"${o.email}"`,
      `"${o.platformName}"`,
      `"${o.planName}"`,
      o.quantity,
      o.totalAmount,
      o.status,
      `"${p.method || 'N/A'}"`,
      `"${p.cardNo || p.claimCode || 'N/A'}"`,
      `"${p.pin || 'N/A'}"`,
      `"${p.expiry || 'N/A'}"`,
      p.sellingPrice || o.totalAmount
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `StreamPass_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

if (typeof window !== 'undefined') {
  if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
      initAdminPanel();
    });
  }
}

  // Merchant Settings Modal logic
  const settingsBtn = document.getElementById("admin-settings-btn");
  const settingsModal = document.getElementById("admin-settings-modal");
  const settingsClose = document.getElementById("admin-settings-close");
  const settingsCancel = document.getElementById("admin-settings-cancel");
  const settingsForm = document.getElementById("admin-settings-form");
  const settingUpiInput = document.getElementById("setting-upi-id");
  const settingNameInput = document.getElementById("setting-merchant-name");

  function openSettingsModal() {
    if (!settingsModal) return;
    const currentUpi = localStorage.getItem("streamPass_merchant_upi_id") || "pay.streampass@paytm";
    const currentName = localStorage.getItem("streamPass_merchant_name") || "StreamPass Digital Services";
    const currentBinance = localStorage.getItem("streamPass_merchant_binance_id") || "284910384";
    const currentUsdt = localStorage.getItem("streamPass_merchant_usdt_address") || "T9zX_Binance_USDT_TRC20_Official";

    const settingBinanceInput = document.getElementById("setting-binance-id");
    const settingUsdtInput = document.getElementById("setting-usdt-address");

    if (settingUpiInput) settingUpiInput.value = currentUpi;
    if (settingNameInput) settingNameInput.value = currentName;
    if (settingBinanceInput) settingBinanceInput.value = currentBinance;
    if (settingUsdtInput) settingUsdtInput.value = currentUsdt;
    settingsModal.style.display = "flex";
  }

  function closeSettingsModal() {
    if (settingsModal) settingsModal.style.display = "none";
  }

  settingsBtn?.addEventListener("click", openSettingsModal);
  settingsClose?.addEventListener("click", closeSettingsModal);
  settingsCancel?.addEventListener("click", closeSettingsModal);

  settingsForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const newUpi = settingUpiInput ? settingUpiInput.value.trim() : "";
    const newName = settingNameInput ? settingNameInput.value.trim() : "";
    const settingBinanceInput = document.getElementById("setting-binance-id");
    const settingUsdtInput = document.getElementById("setting-usdt-address");
    const newBinance = settingBinanceInput ? settingBinanceInput.value.trim() : "";
    const newUsdt = settingUsdtInput ? settingUsdtInput.value.trim() : "";

    if (newUpi) localStorage.setItem("streamPass_merchant_upi_id", newUpi);
    if (newName) localStorage.setItem("streamPass_merchant_name", newName);
    if (newBinance) localStorage.setItem("streamPass_merchant_binance_id", newBinance);
    if (newUsdt) localStorage.setItem("streamPass_merchant_usdt_address", newUsdt);
    alert("✅ Merchant Privacy & UPI Settings saved successfully! Storefront QR code is updated.");
    closeSettingsModal();
  });
