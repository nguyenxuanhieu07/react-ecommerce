/* ==========================================================================
   LINADESIGN - WORDPRESS THEMES MARKETPLACE CLIENT APP
   ========================================================================== */

// Global Copy Helper
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Đã sao chép: ${text}`, 'success');
  }).catch(() => {
    showToast('Không thể sao chép văn bản', 'error');
  });
};

// Global Toast System
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Format Currency
window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    currentUser: JSON.parse(localStorage.getItem('linadesign_user') || 'null'),
    themes: [],
    categories: [],
    memberships: [],
    selectedCompareIds: [],
    currentCategory: 'Tất cả',
    currentBuilder: 'Tất cả',
    currentSort: 'popular',
    searchQuery: '',
    cart: JSON.parse(localStorage.getItem('linadesign_cart') || '[]'),
    appliedPromo: null,
    activeDevice: 'desktop',
    currentPendingOrder: null,
    timerInterval: null,
    isSpinning: false
  };

  // DOM Elements
  const userAuthContainer = document.getElementById('userAuthContainer');
  const themesGrid = document.getElementById('themesGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const categoryTabs = document.getElementById('categoryTabs');
  const sortSelect = document.getElementById('sortSelect');
  const themeCountEl = document.getElementById('themeCount');
  
  // Cart DOM Elements
  const cartTriggerBtn = document.getElementById('cartTriggerBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoInput = document.getElementById('promoInput');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Preview Modal DOM Elements
  const previewModal = document.getElementById('previewModal');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  const previewIframe = document.getElementById('previewIframe');
  const previewTitle = document.getElementById('previewTitle');
  const previewVersion = document.getElementById('previewVersion');
  const previewFrameContainer = document.getElementById('previewFrameContainer');
  const previewBuyBtn = document.getElementById('previewBuyBtn');

  // Order & Payment Modals
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const orderForm = document.getElementById('orderForm');
  const qrPaymentModal = document.getElementById('qrPaymentModal');
  const closeQrModalBtn = document.getElementById('closeQrModalBtn');
  const confirmPaymentPaidBtn = document.getElementById('confirmPaymentPaidBtn');

  // Auth Modals & User Orders
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  const userOrdersModal = document.getElementById('userOrdersModal');
  const closeUserOrdersBtn = document.getElementById('closeUserOrdersBtn');
  const userOrdersContainer = document.getElementById('userOrdersContainer');

  // License Result Modal & License Lookup
  const licenseResultModal = document.getElementById('licenseResultModal');
  const licenseResultContent = document.getElementById('licenseResultContent');
  const openLicenseLookupBtn = document.getElementById('openLicenseLookupBtn');
  const footerLicenseLookupBtn = document.getElementById('footerLicenseLookupBtn');
  const licenseLookupModal = document.getElementById('licenseLookupModal');
  const closeLicenseLookupBtn = document.getElementById('closeLicenseLookupBtn');
  const licenseVerifyForm = document.getElementById('licenseVerifyForm');
  const licenseVerifyResult = document.getElementById('licenseVerifyResult');

  // Admin Dashboard Elements
  const adminModal = document.getElementById('adminModal');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const adminTabContent = document.getElementById('adminTabContent');
  
  // Add / Edit Theme Modal
  const themeFormModal = document.getElementById('themeFormModal');
  const closeThemeFormBtn = document.getElementById('closeThemeFormBtn');
  const themeForm = document.getElementById('themeForm');

  // Compare & Spin Wheel & AI Chat Elements
  const compareDock = document.getElementById('compareDock');
  const compareCountText = document.getElementById('compareCountText');
  const openCompareModalBtn = document.getElementById('openCompareModalBtn');
  const clearCompareBtn = document.getElementById('clearCompareBtn');
  const compareModal = document.getElementById('compareModal');
  const closeCompareModalBtn = document.getElementById('closeCompareModalBtn');
  const compareMatrixContainer = document.getElementById('compareMatrixContainer');

  const openSpinWheelBtn = document.getElementById('openSpinWheelBtn');
  const spinWheelModal = document.getElementById('spinWheelModal');
  const closeSpinWheelBtn = document.getElementById('closeSpinWheelBtn');
  const spinWheelStartBtn = document.getElementById('spinWheelStartBtn');
  const wheelCanvas = document.getElementById('wheelCanvas');

  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatWindow = document.getElementById('chatWindow');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  // Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Initialize App
  initThemeMode();
  renderUserHeaderUI();
  loadCategories();
  loadThemes();
  loadMemberships();
  updateCartUI();
  setupEventListeners();

  // ==========================================
  // USER AUTHENTICATION & HEADER UI RENDERING
  // ==========================================
  function renderUserHeaderUI() {
    if (!userAuthContainer) return;

    if (!state.currentUser) {
      // Logged Out State (Icon-only user button)
      userAuthContainer.innerHTML = `
        <button class="auth-icon-btn" id="btnHeaderLogin" title="Tài Khoản - Đăng Nhập / Đăng Ký" aria-label="Đăng Nhập / Đăng Ký">
          <i class="fa-solid fa-circle-user"></i>
        </button>
      `;

      const loginBtn = document.getElementById('btnHeaderLogin');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          showAuthModal('login');
        });
      }
    } else {
      // Logged In State (Check Role)
      const u = state.currentUser;
      const isAdmin = u.role === 'admin';

      userAuthContainer.innerHTML = `
        ${isAdmin ? `
          <button class="btn-outline btn-sm" id="openAdminBtn" style="padding: 6px 12px; font-size: 0.82rem; border-color: rgba(99,102,241,0.5); color: var(--accent-indigo);">
            <i class="fa-solid fa-gauge-high"></i> Admin Panel
          </button>
        ` : ''}

        <div class="user-profile-wrapper" style="position: relative;">
          <div class="user-profile-pill">
            <img src="${u.avatar}" class="user-avatar" alt="${u.fullName}" />
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); white-space: nowrap;">${u.fullName}</span>
            <span class="badge badge-${isAdmin ? 'violet' : 'cyan'}" style="font-size: 0.65rem; padding: 2px 6px;">${u.role.toUpperCase()}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
          </div>

          <div class="user-dropdown-menu">
            <button class="user-dropdown-item" id="btnMyOrders">
              <i class="fa-solid fa-receipt" style="color: var(--accent-cyan);"></i> Đơn Hàng Của Tôi
            </button>
            ${isAdmin ? `
              <button class="user-dropdown-item" id="btnAdminDashDropdown">
                <i class="fa-solid fa-shield-halved" style="color: var(--accent-indigo);"></i> Admin Dashboard
              </button>
            ` : ''}
            <button class="user-dropdown-item" id="btnLogoutUser" style="color: var(--accent-rose);">
              <i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất
            </button>
          </div>
        </div>
      `;

      // Admin button click handler
      const adminBtn = document.getElementById('openAdminBtn');
      if (adminBtn && adminModal) {
        adminBtn.addEventListener('click', () => {
          if (state.currentUser && state.currentUser.role === 'admin') {
            adminModal.classList.add('active');
            loadAdminTab('overview');
          } else {
            showToast('Chỉ có tài khoản Admin mới được phép truy cập.', 'error');
          }
        });
      }

      const adminDashDrop = document.getElementById('btnAdminDashDropdown');
      if (adminDashDrop && adminModal) {
        adminDashDrop.addEventListener('click', () => {
          adminModal.classList.add('active');
          loadAdminTab('overview');
        });
      }

      // My Orders click handler
      const myOrdersBtn = document.getElementById('btnMyOrders');
      if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', () => {
          loadUserOrders(u.email);
        });
      }

      // Logout handler
      const logoutBtn = document.getElementById('btnLogoutUser');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('linadesign_user');
          state.currentUser = null;
          renderUserHeaderUI();
          showToast('Đã đăng xuất tài khoản.', 'info');
        });
      }
    }
  }

  // Show Auth Modal (Login / Register Tabs)
  function showAuthModal(defaultTab = 'login') {
    if (defaultTab === 'login') {
      if (tabLoginBtn) tabLoginBtn.classList.add('active');
      if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    } else {
      if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
      if (tabLoginBtn) tabLoginBtn.classList.remove('active');
      if (registerForm) registerForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    }

    if (authModal) authModal.classList.add('active');
  }

  // Expose globally for inline onclick handlers & backup triggers
  window.showAuthModal = showAuthModal;

  // Delegated listener for any login trigger button
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#btnHeaderLogin, [data-auth-trigger="login"]');
    if (trigger) {
      e.preventDefault();
      showAuthModal('login');
    }
  });

  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener('click', () => showAuthModal('login'));
    tabRegisterBtn.addEventListener('click', () => showAuthModal('register'));
  }

  if (closeAuthModalBtn && authModal) {
    closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('active'));
  }

  // Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
          state.currentUser = data.user;
          localStorage.setItem('linadesign_user', JSON.stringify(data.user));
          renderUserHeaderUI();
          if (authModal) authModal.classList.remove('active');
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Đăng nhập thất bại.', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối máy chủ đăng nhập.', 'error');
      }
    });
  }

  // Register Form Submit
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password })
        });

        const data = await res.json();
        if (data.success) {
          state.currentUser = data.user;
          localStorage.setItem('linadesign_user', JSON.stringify(data.user));
          renderUserHeaderUI();
          if (authModal) authModal.classList.remove('active');
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Đăng ký thất bại.', 'error');
        }
      } catch (err) {
        showToast('Lỗi khi đăng ký tài khoản.', 'error');
      }
    });
  }

  // Load Logged-in User Purchased Orders
  async function loadUserOrders(email) {
    if (!userOrdersContainer) return;

    userOrdersContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-cyan);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted);">Đang tải danh sách đơn hàng...</p>
      </div>
    `;

    if (userOrdersModal) userOrdersModal.classList.add('active');

    try {
      const res = await fetch(`/api/auth/my-orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        if (data.orders.length === 0) {
          userOrdersContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <i class="fa-solid fa-receipt" style="font-size: 2.5rem; color: var(--text-dim);"></i>
              <p style="margin-top: 1rem;">Bạn chưa mua giao diện nào. Hãy khám phá kho themes LinaDesign!</p>
            </div>
          `;
          return;
        }

        userOrdersContainer.innerHTML = data.orders.map(o => `
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <div>
                <strong style="color: var(--accent-cyan);">${o.orderId}</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 8px;">${new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <span class="badge badge-emerald">${o.paymentStatus}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
              ${o.items.map(i => `
                <div style="background: var(--bg-card); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; font-size: 0.9rem;">${i.name}</div>
                    <div style="font-family: monospace; font-size: 0.85rem; color: var(--accent-emerald); font-weight: 800;">${i.licenseKey}</div>
                  </div>
                  <button class="btn-outline btn-sm" onclick="copyText('${i.licenseKey}')">
                    <i class="fa-solid fa-copy"></i> Copy Key
                  </button>
                </div>
              `).join('')}
            </div>

            <div style="text-align: right; font-size: 0.9rem; color: var(--text-muted);">
              Tổng thanh toán: <strong style="color: var(--accent-cyan); font-size: 1.05rem;">${formatCurrency(o.finalAmount)}</strong>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      showToast('Lỗi khi tải lịch sử đơn hàng.', 'error');
    }
  }

  if (closeUserOrdersBtn && userOrdersModal) {
    closeUserOrdersBtn.addEventListener('click', () => userOrdersModal.classList.remove('active'));
  }

  // 1. Fetch Themes from Express API
  async function loadThemes() {
    try {
      if (themesGrid) {
        themesGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--accent-cyan);"></i>
            <p style="margin-top: 1rem; color: var(--text-muted);">Đang tải danh sách giao diện WordPress LinaDesign...</p>
          </div>
        `;
      }

      const params = new URLSearchParams({
        search: state.searchQuery,
        category: state.currentCategory,
        builder: state.currentBuilder,
        sort: state.currentSort
      });

      const response = await fetch(`/api/themes?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        state.themes = data.themes;
        renderThemes(state.themes);
        if (themeCountEl) themeCountEl.textContent = `${data.total} Giao diện`;
      }
    } catch (error) {
      console.error('Lỗi kết nối API themes:', error);
      showToast('Khởi chạy hệ thống gặp lỗi kết nối API.', 'error');
    }
  }

  // 2. Load Categories
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        state.categories = data.categories;
        renderCategoryTabs(data.categories);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Render Category Tabs
  function renderCategoryTabs(categories) {
    if (!categoryTabs) return;
    let html = `<button class="cat-tab ${state.currentCategory === 'Tất cả' ? 'active' : ''}" data-cat="Tất cả">Tất cả</button>`;
    
    categories.forEach(cat => {
      html += `<button class="cat-tab ${state.currentCategory === cat.name ? 'active' : ''}" data-cat="${cat.name}">${cat.name} (${cat.count})</button>`;
    });

    categoryTabs.innerHTML = html;

    categoryTabs.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentCategory = tab.getAttribute('data-cat');
        loadThemes();
      });
    });
  }

  // Render Themes Grid
  function renderThemes(themes) {
    if (!themesGrid) return;
    if (themes.length === 0) {
      themesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-dim);"></i>
          <h3 style="margin-top: 1rem;">Không tìm thấy giao diện phù hợp</h3>
          <p style="color: var(--text-muted);">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
        </div>
      `;
      return;
    }

    themesGrid.innerHTML = themes.map(theme => {
      const isChecked = state.selectedCompareIds.includes(theme.id);
      return `
        <div class="theme-card" data-id="${theme.id}">
          <div class="card-media">
            <img src="${theme.image}" alt="${theme.name}" loading="lazy" onError="this.src='/images/hero-banner.jpg'" />
            <span class="card-badge badge-${theme.badgeColor || 'cyan'}">${theme.badge || 'Nổi bật'}</span>
            <span class="speed-badge">
              <i class="fa-solid fa-bolt"></i> ${theme.pageSpeed || 99}/100
            </span>
          </div>
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="card-category">${theme.category} • ${theme.builder}</span>
              <label style="font-size: 0.78rem; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <input type="checkbox" class="cb-compare" data-id="${theme.id}" ${isChecked ? 'checked' : ''} />
                <span>So sánh</span>
              </label>
            </div>
            <h3 class="card-title">${theme.name}</h3>
            <p class="card-subtitle">${theme.subtitle}</p>

            <div class="card-meta">
              <div class="card-rating">
                <i class="fa-solid fa-star"></i>
                <span>${theme.rating}</span>
                <span style="color: var(--text-dim);">(${theme.ratingCount})</span>
              </div>
              <span class="card-sales"><i class="fa-solid fa-download"></i> ${theme.salesCount} lượt tải</span>
            </div>

            <div class="card-footer">
              <div class="price-box">
                <span class="current-price">${formatCurrency(theme.price)}</span>
                <span class="original-price">${formatCurrency(theme.originalPrice)}</span>
              </div>
              <div class="card-actions">
                <button class="btn-outline btn-sm btn-preview" data-id="${theme.id}">
                  <i class="fa-solid fa-eye"></i> Demo
                </button>
                <button class="btn-primary btn-sm btn-add-cart" data-id="${theme.id}">
                  <i class="fa-solid fa-cart-shopping"></i> Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPreviewModal(id);
      });
    });

    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        addToCart(id);
      });
    });

    document.querySelectorAll('.cb-compare').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) {
          if (state.selectedCompareIds.length >= 3) {
            e.target.checked = false;
            showToast('Chỉ có thể so sánh tối đa 3 themes cùng lúc.', 'error');
            return;
          }
          if (!state.selectedCompareIds.includes(id)) state.selectedCompareIds.push(id);
        } else {
          state.selectedCompareIds = state.selectedCompareIds.filter(i => i !== id);
        }
        updateCompareDockUI();
      });
    });
  }

  // 3. Load VIP Memberships
  async function loadMemberships() {
    try {
      const res = await fetch('/api/memberships');
      const data = await res.json();
      if (data.success && document.getElementById('membershipGrid')) {
        state.memberships = data.memberships;
        renderMemberships(data.memberships);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderMemberships(memberships) {
    const grid = document.getElementById('membershipGrid');
    if (!grid) return;

    grid.innerHTML = memberships.map(m => `
      <div class="membership-card ${m.id === 'membership-developer' ? 'featured' : ''}">
        <span class="badge badge-${m.badgeColor}" style="align-self: flex-start; margin-bottom: 1rem;">${m.badge}</span>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 4px;">${m.name}</h3>
        <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.2rem;">Thời hạn: ${m.period}</div>

        <div style="margin-bottom: 1.5rem;">
          <span style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 900; color: var(--accent-cyan);">${formatCurrency(m.price)}</span>
          <span style="font-size: 0.9rem; color: var(--text-dim); text-decoration: line-through; margin-left: 6px;">${formatCurrency(m.originalPrice)}</span>
        </div>

        <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: var(--text-main); margin-bottom: 2rem; flex-grow: 1;">
          ${m.features.map(f => `<li><i class="fa-solid fa-circle-check" style="color: var(--accent-emerald); margin-right: 8px;"></i> ${f}</li>`).join('')}
        </ul>

        <button class="btn-primary btn-add-membership" data-id="${m.id}" style="width: 100%;">
          <i class="fa-solid fa-crown"></i> Đăng Ký ${m.name}
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-add-membership').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const m = state.memberships.find(item => item.id === id);
        if (m) {
          state.cart.push({
            id: m.id,
            name: m.name,
            price: m.price,
            image: '/images/hero-banner.jpg',
            quantity: 1
          });
          saveCart();
          updateCartUI();
          showToast(`Đã thêm "${m.name}" vào giỏ hàng!`, 'success');
          if (cartDrawer) cartDrawer.classList.add('active');
        }
      });
    });
  }

  // 4. THEME COMPARISON DOCK & MATRIX MODAL
  function updateCompareDockUI() {
    if (!compareDock) return;
    const count = state.selectedCompareIds.length;

    if (count > 0) {
      if (compareCountText) compareCountText.textContent = `Đã chọn ${count}/3 themes`;
      compareDock.classList.add('active');
    } else {
      compareDock.classList.remove('active');
    }
  }

  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      state.selectedCompareIds = [];
      updateCompareDockUI();
      renderThemes(state.themes);
    });
  }

  if (openCompareModalBtn && compareModal) {
    openCompareModalBtn.addEventListener('click', () => {
      renderCompareMatrix();
      compareModal.classList.add('active');
    });
  }

  if (closeCompareModalBtn && compareModal) {
    closeCompareModalBtn.addEventListener('click', () => compareModal.classList.remove('active'));
  }

  function renderCompareMatrix() {
    if (!compareMatrixContainer) return;

    const selectedThemes = state.themes.filter(t => state.selectedCompareIds.includes(t.id));
    if (selectedThemes.length === 0) {
      compareMatrixContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Chưa có theme nào được chọn để so sánh.</p>';
      return;
    }

    compareMatrixContainer.innerHTML = `
      <table class="admin-table" style="min-width: 700px;">
        <thead>
          <tr>
            <th style="width: 200px;">Tiêu chí so sánh</th>
            ${selectedThemes.map(t => `<th style="text-align: center;"><strong>${t.name}</strong></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Hình ảnh mẫu</strong></td>
            ${selectedThemes.map(t => `
              <td style="text-align: center;">
                <img src="${t.image}" style="width: 140px; height: 90px; object-fit: cover; border-radius: 8px; margin: 0 auto;" />
              </td>
            `).join('')}
          </tr>
          <tr>
            <td><strong>Giá bán Khuyến Mãi</strong></td>
            ${selectedThemes.map(t => `<td style="text-align: center; color: var(--accent-cyan); font-weight: 800; font-size: 1.1rem;">${formatCurrency(t.price)}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Danh mục / Ngành</strong></td>
            ${selectedThemes.map(t => `<td style="text-align: center;">${t.category}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Page Builder</strong></td>
            ${selectedThemes.map(t => `<td style="text-align: center;">${t.builder}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Google PageSpeed Score</strong></td>
            ${selectedThemes.map(t => `<td style="text-align: center; color: var(--accent-emerald); font-weight: 800;"><i class="fa-solid fa-bolt"></i> ${t.pageSpeed}/100</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Đánh giá & Lượt mua</strong></td>
            ${selectedThemes.map(t => `<td style="text-align: center;">⭐ ${t.rating} (${t.salesCount} lượt tải)</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Hành động</strong></td>
            ${selectedThemes.map(t => `
              <td style="text-align: center;">
                <button class="btn-primary btn-sm" onclick="window.addToCartFromCompare('${t.id}')"><i class="fa-solid fa-cart-shopping"></i> Mua Ngay</button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
  }

  window.addToCartFromCompare = function(id) {
    addToCart(id);
    if (compareModal) compareModal.classList.remove('active');
  };

  // 5. SPIN WHEEL GAME LOGIC
  const prizes = [
    { label: 'Giảm 20%', code: 'LINADESIGN2026', color: '#06b6d4' },
    { label: 'Giảm 30%', code: 'LINA30', color: '#6366f1' },
    { label: 'Chúc May Mắn', code: null, color: '#475569' },
    { label: 'Giảm 50%', code: 'LINA50', color: '#a855f7' },
    { label: 'Tặng 100K', code: 'LINADESIGN2026', color: '#10b981' },
    { label: 'Giảm 20%', code: 'LINADESIGN2026', color: '#06b6d4' },
    { label: 'Giảm 30%', code: 'LINA30', color: '#f43f5e' },
    { label: 'Mã VIP FREE', code: 'LINA50', color: '#f59e0b' }
  ];

  if (openSpinWheelBtn && spinWheelModal) {
    openSpinWheelBtn.addEventListener('click', () => {
      drawWheel();
      spinWheelModal.classList.add('active');
    });
  }

  if (closeSpinWheelBtn && spinWheelModal) {
    closeSpinWheelBtn.addEventListener('click', () => spinWheelModal.classList.remove('active'));
  }

  function drawWheel(angle = 0) {
    if (!wheelCanvas) return;
    const ctx = wheelCanvas.getContext('2d');
    const numPrizes = prizes.length;
    const arcSize = (2 * Math.PI) / numPrizes;

    ctx.clearRect(0, 0, 280, 280);
    ctx.save();
    ctx.translate(140, 140);
    ctx.rotate(angle);

    for (let i = 0; i < numPrizes; i++) {
      ctx.beginPath();
      ctx.fillStyle = prizes[i].color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 130, i * arcSize, (i + 1) * arcSize);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(i * arcSize + arcSize / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(prizes[i].label, 110, 4);
      ctx.restore();
    }
    ctx.restore();
  }

  if (spinWheelStartBtn) {
    spinWheelStartBtn.addEventListener('click', () => {
      if (state.isSpinning) return;
      state.isSpinning = true;
      spinWheelStartBtn.disabled = true;

      const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
      const prize = prizes[randomPrizeIndex];
      const targetRotation = (360 * 5) + (360 - (randomPrizeIndex * (360 / prizes.length))) - 20;

      let currentRotation = 0;
      const startTime = performance.now();
      const duration = 4000;

      function animateSpin(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        currentRotation = targetRotation * easeOut;
        drawWheel((currentRotation * Math.PI) / 180);

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          state.isSpinning = false;
          spinWheelStartBtn.disabled = false;

          if (prize.code) {
            state.appliedPromo = prize.code;
            updateCartUI();
            showToast(`🎉 Chúc mừng! Bạn trúng phần quà: ${prize.label}. Đã tự động áp dụng mã ${prize.code}!`, 'success');
          } else {
            showToast('Chúc bạn may mắn lần sau!', 'info');
          }
        }
      }

      requestAnimationFrame(animateSpin);
    });
  }

  // 6. AI LIVE CHAT ASSISTANT LOGIC
  if (chatToggleBtn && chatWindow) {
    chatToggleBtn.addEventListener('click', () => chatWindow.classList.toggle('active'));
  }

  if (closeChatBtn && chatWindow) {
    closeChatBtn.addEventListener('click', () => chatWindow.classList.remove('active'));
  }

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendChatMessage(text, 'user');
      chatInput.value = '';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        if (data.success) {
          appendChatMessage(data.reply, 'bot');
        }
      } catch (err) {
        appendChatMessage('Hệ thống hỗ trợ đang bận. Vui lòng kết nối Zalo hotline: 0900.000.000.', 'bot');
      }
    });
  }

  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (chatInput) {
        chatInput.value = q;
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  function appendChatMessage(text, sender) {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 7. LICENSE LOOKUP & DOMAIN BINDING MODAL
  if (openLicenseLookupBtn && licenseLookupModal) {
    openLicenseLookupBtn.addEventListener('click', () => licenseLookupModal.classList.add('active'));
  }
  if (footerLicenseLookupBtn && licenseLookupModal) {
    footerLicenseLookupBtn.addEventListener('click', () => licenseLookupModal.classList.add('active'));
  }

  if (closeLicenseLookupBtn && licenseLookupModal) {
    closeLicenseLookupBtn.addEventListener('click', () => licenseLookupModal.classList.remove('active'));
  }

  if (licenseVerifyForm) {
    licenseVerifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const licenseKey = document.getElementById('verifyKeyInput').value.trim();
      const domain = document.getElementById('verifyDomainInput').value.trim();

      if (!licenseKey) return;

      try {
        const res = await fetch('/api/license/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey, domain })
        });

        const data = await res.json();
        if (data.success && licenseVerifyResult) {
          const l = data.license;
          licenseVerifyResult.innerHTML = `
            <div style="background: var(--bg-primary); border: 1px solid var(--accent-emerald); border-radius: 12px; padding: 1.2rem; font-size: 0.88rem;">
              <div style="color: var(--accent-emerald); font-weight: 800; font-size: 1rem; margin-bottom: 8px;">
                <i class="fa-solid fa-circle-check"></i> ${data.message}
              </div>
              <div style="margin-bottom: 4px;">Theme: <strong>${l.themeName}</strong></div>
              <div style="margin-bottom: 4px;">Tên miền đã kích hoạt: <strong style="color: var(--accent-cyan);">${l.boundDomain}</strong></div>
              <div style="margin-bottom: 4px;">Trạng thái: <span class="badge badge-emerald">${l.status}</span></div>
            </div>
          `;
          showToast('Đã tra cứu & liên kết tên miền thành công!', 'success');
        } else {
          licenseVerifyResult.innerHTML = `<div style="color: var(--accent-rose); font-weight: 700; margin-top: 10px;">${data.message || 'Mã Key không hợp lệ.'}</div>`;
        }
      } catch (err) {
        showToast('Lỗi khi tra cứu License Key.', 'error');
      }
    });
  }

  // 8. Demo Preview Modal
  function openPreviewModal(themeId) {
    const theme = state.themes.find(t => t.id === themeId);
    if (!theme) return;

    if (previewTitle) previewTitle.textContent = `${theme.name} - Demo Live`;
    if (previewVersion) previewVersion.textContent = theme.version;
    if (previewIframe) previewIframe.src = `/demo-page.html?theme=${theme.id}`;
    if (previewBuyBtn) previewBuyBtn.setAttribute('data-id', theme.id);

    if (previewModal) previewModal.classList.add('active');
  }

  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
      if (previewModal) previewModal.classList.remove('active');
      if (previewIframe) previewIframe.src = 'about:blank';
    });
  }

  if (previewBuyBtn) {
    previewBuyBtn.addEventListener('click', () => {
      const id = previewBuyBtn.getAttribute('data-id');
      if (id) addToCart(id);
      if (previewModal) previewModal.classList.remove('active');
    });
  }

  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const device = btn.getAttribute('data-device');
      if (previewFrameContainer) {
        previewFrameContainer.className = `preview-frame-container ${device}`;
      }
    });
  });

  // 9. Shopping Cart Management
  function addToCart(themeId) {
    const theme = state.themes.find(t => t.id === themeId);
    if (!theme) return;

    const existing = state.cart.find(item => item.id === themeId);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      state.cart.push({
        id: theme.id,
        name: theme.name,
        price: theme.price,
        image: theme.image,
        quantity: 1
      });
    }

    saveCart();
    updateCartUI();
    showToast(`Đã thêm "${theme.name}" vào giỏ hàng!`, 'success');
    if (cartDrawer) cartDrawer.classList.add('active');
  }

  function removeFromCart(themeId) {
    state.cart = state.cart.filter(item => item.id !== themeId);
    saveCart();
    updateCartUI();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
  }

  function saveCart() {
    localStorage.setItem('linadesign_cart', JSON.stringify(state.cart));
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    if (cartBadge) cartBadge.textContent = totalItems;

    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; color: var(--text-dim);"></i>
          <p style="margin-top: 1rem;">Giỏ hàng của bạn đang trống.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = '0 ₫';
      if (cartDiscountEl) cartDiscountEl.textContent = '- 0 ₫';
      if (cartTotalEl) cartTotalEl.textContent = '0 ₫';
      return;
    }

    cartItemsContainer.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" class="cart-item-img" alt="${item.name}" onError="this.src='/images/hero-banner.jpg'" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)} x ${item.quantity || 1}</div>
        </div>
        <button class="cart-remove-btn" onclick="window.removeCartItem('${item.id}')">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    let discount = 0;

    if (state.appliedPromo === 'LINADESIGN2026') discount = Math.round(subtotal * 0.2);
    if (state.appliedPromo === 'LINA30') discount = Math.round(subtotal * 0.3);
    if (state.appliedPromo === 'LINA50') discount = Math.round(subtotal * 0.5);

    const total = Math.max(0, subtotal - discount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);
    if (cartDiscountEl) cartDiscountEl.textContent = `- ${formatCurrency(discount)}`;
    if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);
  }

  window.removeCartItem = function(id) {
    removeFromCart(id);
  };

  if (cartTriggerBtn && cartDrawer) {
    cartTriggerBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
  }
  if (closeCartBtn && cartDrawer) {
    closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));
  }

  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'LINADESIGN2026' || code === 'LINA30' || code === 'LINA50') {
        state.appliedPromo = code;
        updateCartUI();
        showToast(`Áp dụng mã giảm giá ${code} thành công!`, 'success');
      } else {
        showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn.', 'error');
      }
    });
  }

  if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Giỏ hàng trống! Vui lòng chọn theme trước khi thanh toán.', 'error');
        return;
      }

      // Auto-fill logged in user info if available
      if (state.currentUser) {
        const nameInput = document.getElementById('custName');
        const emailInput = document.getElementById('custEmail');
        if (nameInput) nameInput.value = state.currentUser.fullName;
        if (emailInput) emailInput.value = state.currentUser.email;
      }

      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      let discount = 0;
      if (state.appliedPromo === 'LINADESIGN2026') discount = Math.round(subtotal * 0.2);
      if (state.appliedPromo === 'LINA30') discount = Math.round(subtotal * 0.3);
      if (state.appliedPromo === 'LINA50') discount = Math.round(subtotal * 0.5);

      const total = Math.max(0, subtotal - discount);

      const summaryEl = document.getElementById('checkoutSummaryText');
      if (summaryEl) {
        summaryEl.textContent = `Thanh toán ${state.cart.length} sản phẩm. Tổng tiền: ${formatCurrency(total)}`;
      }

      if (cartDrawer) cartDrawer.classList.remove('active');
      checkoutModal.classList.add('active');
    });
  }

  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerName = document.getElementById('custName').value.trim();
      const email = document.getElementById('custEmail').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'vietqr';

      if (!customerName || !email) {
        showToast('Vui lòng điền họ tên và email nhận License Key.', 'error');
        return;
      }

      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      let discount = 0;
      if (state.appliedPromo === 'LINADESIGN2026') discount = Math.round(subtotal * 0.2);
      if (state.appliedPromo === 'LINA30') discount = Math.round(subtotal * 0.3);
      if (state.appliedPromo === 'LINA50') discount = Math.round(subtotal * 0.5);

      const finalAmount = Math.max(0, subtotal - discount);

      state.currentPendingOrder = {
        customerName,
        email,
        phone,
        items: [...state.cart],
        paymentMethod,
        promoCode: state.appliedPromo,
        finalAmount
      };

      if (checkoutModal) checkoutModal.classList.remove('active');
      openQrPaymentModal(state.currentPendingOrder);
    });
  }

  function openQrPaymentModal(order) {
    const tempOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const memo = `LINADESIGN_${tempOrderId}`;

    const qrImg = document.getElementById('qrCodeImg');
    if (qrImg) {
      qrImg.src = `https://img.vietqr.io/image/MB-0345678999-compact2.png?amount=${order.finalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=LINA%20DESIGN%20VIETNAM`;
    }

    const qrTotal = document.getElementById('qrTotalAmount');
    if (qrTotal) qrTotal.textContent = formatCurrency(order.finalAmount);

    const qrMemoEl = document.getElementById('qrMemo');
    if (qrMemoEl) qrMemoEl.textContent = memo;

    const copyMemoBtn = document.getElementById('copyMemoBtn');
    if (copyMemoBtn) {
      copyMemoBtn.onclick = () => copyText(memo);
    }

    startQrCountdown(300);

    if (qrPaymentModal) qrPaymentModal.classList.add('active');
  }

  function startQrCountdown(durationSeconds) {
    clearInterval(state.timerInterval);
    let timeRemaining = durationSeconds;
    const timerEl = document.getElementById('qrTimer');

    state.timerInterval = setInterval(() => {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      if (timerEl) {
        timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      if (--timeRemaining < 0) {
        clearInterval(state.timerInterval);
        if (timerEl) timerEl.textContent = 'HẾT HẠN';
        showToast('Mã QR đã hết hạn. Vui lòng thử lại.', 'error');
      }
    }, 1000);
  }

  if (closeQrModalBtn && qrPaymentModal) {
    closeQrModalBtn.addEventListener('click', () => {
      clearInterval(state.timerInterval);
      qrPaymentModal.classList.remove('active');
    });
  }

  if (confirmPaymentPaidBtn) {
    confirmPaymentPaidBtn.addEventListener('click', async () => {
      if (!state.currentPendingOrder) return;

      confirmPaymentPaidBtn.disabled = true;
      confirmPaymentPaidBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang xác nhận thanh toán...`;

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.currentPendingOrder)
        });

        const data = await res.json();

        if (data.success) {
          clearInterval(state.timerInterval);
          if (qrPaymentModal) qrPaymentModal.classList.remove('active');

          state.cart = [];
          state.appliedPromo = null;
          saveCart();
          updateCartUI();

          renderLicenseResultModal(data.order);
        } else {
          showToast(data.message || 'Thanh toán thất bại.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi kết nối máy chủ thanh toán.', 'error');
      } finally {
        confirmPaymentPaidBtn.disabled = false;
        confirmPaymentPaidBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã Chuyển Khoản - Kích Hoạt Mã License Key`;
      }
    });
  }

  function renderLicenseResultModal(order) {
    if (!licenseResultContent) return;

    licenseResultContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--gradient-brand); display: inline-flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #fff; margin-bottom: 1rem;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem;">Thanh Toán & Kích Hoạt Thành Công!</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Mã đơn hàng: <strong style="color: var(--accent-cyan);">${order.orderId}</strong> • Email: <strong>${order.email}</strong></p>
      </div>

      <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--accent-cyan);"><i class="fa-solid fa-key"></i> DANH SÁCH MÃ BẢN QUYỀN (LICENSE KEYS):</h4>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${order.items.map(item => `
            <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; font-size: 0.92rem;">${item.name} (${item.version})</div>
                <div style="font-family: monospace; font-weight: 800; font-size: 1rem; color: var(--accent-emerald); margin-top: 4px;">${item.licenseKey}</div>
              </div>
              <button class="btn-outline btn-sm" onclick="copyText('${item.licenseKey}')">
                <i class="fa-solid fa-copy"></i> Copy Key
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn-primary" style="flex: 1;" onclick="document.getElementById('licenseResultModal').classList.remove('active')">
          <i class="fa-solid fa-download"></i> Tải File Giao Diện (.ZIP)
        </button>
      </div>
    `;

    if (licenseResultModal) licenseResultModal.classList.add('active');
  }

  // 10. ADMIN DASHBOARD MODAL LOGIC (RBAC PROTECTED)
  if (closeAdminBtn && adminModal) {
    closeAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));
  }

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      loadAdminTab(tabName);
    });
  });

  async function loadAdminTab(tabName) {
    if (!adminTabContent) return;

    if (!state.currentUser || state.currentUser.role !== 'admin') {
      adminTabContent.innerHTML = '<p style="text-align: center; color: var(--accent-rose); padding: 3rem;">⚠️ Bạn không có quyền Admin để xem dữ liệu này.</p>';
      return;
    }

    adminTabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-cyan);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted);">Đang tải dữ liệu Admin...</p>
      </div>
    `;

    if (tabName === 'overview') {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          const stats = data.stats;
          adminTabContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
              <div class="admin-stat-card">
                <div class="admin-stat-icon" style="background: rgba(6,182,212,0.15); color: var(--accent-cyan);">
                  <i class="fa-solid fa-money-bill-wave"></i>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Doanh Thu Tổng</div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${formatCurrency(stats.totalRevenue)}</div>
                </div>
              </div>

              <div class="admin-stat-card">
                <div class="admin-stat-icon" style="background: rgba(99,102,241,0.15); color: var(--accent-indigo);">
                  <i class="fa-solid fa-receipt"></i>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Tổng Đơn Hàng</div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${stats.totalOrders} đơn</div>
                </div>
              </div>

              <div class="admin-stat-card">
                <div class="admin-stat-icon" style="background: rgba(168,85,247,0.15); color: var(--accent-violet);">
                  <i class="fa-solid fa-boxes-stacked"></i>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Tổng Mẫu Themes</div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${stats.totalThemes} mẫu</div>
                </div>
              </div>

              <div class="admin-stat-card">
                <div class="admin-stat-icon" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);">
                  <i class="fa-solid fa-key"></i>
                </div>
                <div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">License Đã Cấp</div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${stats.totalLicenses} keys</div>
                </div>
              </div>
            </div>
          `;
        }
      } catch (e) {
        console.error(e);
      }
    } else if (tabName === 'themes') {
      await renderAdminThemesTab();
    } else if (tabName === 'orders') {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (data.success) {
          adminTabContent.innerHTML = `
            <h4 style="font-family: var(--font-heading); margin-bottom: 1rem;"><i class="fa-solid fa-receipt" style="color: var(--accent-cyan);"></i> Danh Sách Đơn Hàng Khách Hàng (${data.orders.length})</h4>
            <div style="overflow-x: auto; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Số Tiền</th>
                    <th>License Keys</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.orders.map(o => `
                    <tr>
                      <td><strong style="color: var(--accent-cyan);">${o.orderId}</strong></td>
                      <td><strong>${o.customerName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${o.email}</span></td>
                      <td><strong style="color: var(--accent-emerald);">${formatCurrency(o.finalAmount)}</strong></td>
                      <td>${o.items.map(i => `<div><code style="color: var(--accent-cyan);">${i.licenseKey}</code></div>`).join('')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // ==========================================
  // ADMIN THEMES CRUD - FULL IMPLEMENTATION
  // ==========================================

  async function renderAdminThemesTab() {
    if (!adminTabContent) return;
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      if (!data.success) return;

      adminTabContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; flex-wrap:wrap; gap:10px;">
          <h4 style="font-family:var(--font-heading); margin:0;">
            <i class="fa-solid fa-boxes-stacked" style="color:var(--accent-cyan);"></i>
            Quản Lý Theme WordPress
            <span class="badge badge-cyan" style="margin-left:8px; font-size:0.75rem;">${data.themes.length} mẫu</span>
          </h4>
          <button class="btn-primary btn-sm" id="btnOpenAddThemeModal" style="padding:8px 16px;">
            <i class="fa-solid fa-plus-circle"></i> Thêm Theme Mới
          </button>
        </div>

        <div style="overflow-x:auto; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md);">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="min-width:200px;">Tên Theme</th>
                <th>Danh Mục</th>
                <th>Builder</th>
                <th>Giá Bán</th>
                <th>Lượt Bán</th>
                <th>Đánh Giá</th>
                <th style="text-align:center;">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              ${data.themes.map(t => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <img src="${t.image}" style="width:44px;height:32px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color);" onerror="this.src='/images/hero-banner.jpg'" />
                      <div>
                        <div style="font-weight:700; font-size:0.9rem;">${t.name}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">${t.version || 'v1.0.0'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-cyan" style="font-size:0.72rem;">${t.category}</span></td>
                  <td style="font-size:0.82rem; color:var(--text-muted);">${t.builder}</td>
                  <td>
                    <div style="font-weight:800; color:var(--accent-cyan); font-size:0.9rem;">${formatCurrency(t.price)}</div>
                    <div style="font-size:0.72rem; color:var(--text-dim); text-decoration:line-through;">${formatCurrency(t.originalPrice)}</div>
                  </td>
                  <td style="font-size:0.85rem;">${(t.salesCount || 0).toLocaleString('vi-VN')}</td>
                  <td>
                    <span style="color:var(--accent-amber); font-weight:700;">⭐ ${t.rating}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);"> (${t.ratingCount})</span>
                  </td>
                  <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-outline btn-sm" onclick="window.editThemeAdmin('${t.id}')" style="margin-right:6px; padding:5px 10px;">
                      <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                    <button class="btn-outline btn-sm" onclick="window.deleteThemeAdmin('${t.id}', '${t.name.replace(/'/g, "\\'")}')"
                      style="border-color:var(--accent-rose); color:var(--accent-rose); padding:5px 10px;">
                      <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      const addBtn = document.getElementById('btnOpenAddThemeModal');
      if (addBtn) addBtn.addEventListener('click', () => openThemeFormModal(null));

    } catch (e) {
      console.error('Lỗi tải themes admin:', e);
      showToast('Không thể tải danh sách themes.', 'error');
    }
  }

  function openThemeFormModal(theme) {
    if (!themeFormModal) return;
    const formTitle = document.getElementById('themeFormTitle');
    const editIdInput = document.getElementById('editThemeId');
    const nameInput = document.getElementById('inputThemeName');
    const subtitleInput = document.getElementById('inputThemeSubtitle');
    const categoryInput = document.getElementById('inputThemeCategory');
    const builderInput = document.getElementById('inputThemeBuilder');
    const priceInput = document.getElementById('inputThemePrice');
    const origPriceInput = document.getElementById('inputThemeOriginalPrice');
    const descInput = document.getElementById('inputThemeDesc');

    if (theme) {
      if (formTitle) formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--accent-violet);"></i> Chỉnh Sửa: <span style="color:var(--accent-cyan)">${theme.name}</span>`;
      if (editIdInput) editIdInput.value = theme.id;
      if (nameInput) nameInput.value = theme.name || '';
      if (subtitleInput) subtitleInput.value = theme.subtitle || '';
      if (categoryInput) categoryInput.value = theme.category || '';
      if (builderInput) builderInput.value = theme.builder || 'Elementor Pro';
      if (priceInput) priceInput.value = theme.price || '';
      if (origPriceInput) origPriceInput.value = theme.originalPrice || '';
      if (descInput) descInput.value = theme.description || '';
    } else {
      if (formTitle) formTitle.innerHTML = `<i class="fa-solid fa-plus-circle" style="color:var(--accent-cyan);"></i> Thêm Theme WordPress Mới`;
      if (editIdInput) editIdInput.value = '';
      if (themeForm) themeForm.reset();
      if (builderInput) builderInput.value = 'Elementor Pro';
    }

    themeFormModal.classList.add('active');
  }

  if (closeThemeFormBtn && themeFormModal) {
    closeThemeFormBtn.addEventListener('click', () => themeFormModal.classList.remove('active'));
  }

  if (themeForm) {
    themeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('editThemeId')?.value?.trim();
      const submitBtn = themeForm.querySelector('button[type="submit"]');

      const payload = {
        name: document.getElementById('inputThemeName')?.value?.trim(),
        subtitle: document.getElementById('inputThemeSubtitle')?.value?.trim(),
        category: document.getElementById('inputThemeCategory')?.value?.trim(),
        builder: document.getElementById('inputThemeBuilder')?.value?.trim() || 'Elementor Pro',
        price: Number(document.getElementById('inputThemePrice')?.value || 0),
        originalPrice: Number(document.getElementById('inputThemeOriginalPrice')?.value || 0),
        description: document.getElementById('inputThemeDesc')?.value?.trim()
      };

      if (!payload.name || !payload.category || !payload.price) {
        showToast('Vui lòng điền đủ Tên Theme, Danh mục và Giá.', 'error');
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...'; }

      try {
        const url = editId ? `/api/admin/themes/${editId}` : '/api/admin/themes';
        const method = editId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();

        if (data.success) {
          showToast(data.message, 'success');
          if (themeFormModal) themeFormModal.classList.remove('active');
          loadThemes();
          loadCategories();
          await renderAdminThemesTab();
        } else {
          showToast(data.message || 'Lưu theme thất bại.', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi lưu theme.', 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu Theme'; }
      }
    });
  }

  window.editThemeAdmin = async function(themeId) {
    try {
      const res = await fetch(`/api/themes/${themeId}`);
      const data = await res.json();
      if (data.success) { openThemeFormModal(data.theme); }
      else { showToast('Không tìm thấy dữ liệu theme.', 'error'); }
    } catch (err) { showToast('Lỗi khi tải dữ liệu theme.', 'error'); }
  };

  window.deleteThemeAdmin = async function(themeId, themeName) {
    if (!confirm(`⚠️ Xác nhận xóa theme:\n"${themeName}"\n\nHành động này không thể hoàn tác!`)) return;
    try {
      const res = await fetch(`/api/admin/themes/${themeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        loadThemes();
        loadCategories();
        await renderAdminThemesTab();
      } else {
        showToast(data.message || 'Xóa theme thất bại.', 'error');
      }
    } catch (err) { showToast('Lỗi kết nối khi xóa theme.', 'error'); }
  };

  // Mega Dropdown Category Links Filter
  document.querySelectorAll('.mega-item').forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.getAttribute('data-cat-filter');
      if (cat) {
        state.currentCategory = cat;
        if (categoryTabs) {
          categoryTabs.querySelectorAll('.cat-tab').forEach(tab => {
            if (tab.getAttribute('data-cat') === cat) {
              tab.classList.add('active');
            } else {
              tab.classList.remove('active');
            }
          });
        }
        loadThemes();
      }
    });
  });

  // Mobile Navigation Drawer Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => mobileNavDrawer.classList.add('active'));
  }
  if (closeMobileNavBtn && mobileNavDrawer) {
    closeMobileNavBtn.addEventListener('click', () => mobileNavDrawer.classList.remove('active'));
  }

  // Dark / Light Theme Toggle
  function initThemeMode() {
    const savedTheme = localStorage.getItem('linadesign_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('linadesign_theme', next);
      updateThemeToggleIcon(next);
      showToast(`Đã chuyển sang ${next === 'dark' ? 'Giao diện Tối (Dark)' : 'Giao diện Sáng (Light)'}`, 'info');
    });
  }

  function updateThemeToggleIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>' : '<i class="fa-solid fa-moon" style="color: #6366f1;"></i>';
  }

  function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (previewModal) previewModal.classList.remove('active');
        if (checkoutModal) checkoutModal.classList.remove('active');
        if (qrPaymentModal) qrPaymentModal.classList.remove('active');
        if (licenseResultModal) licenseResultModal.classList.remove('active');
        if (adminModal) adminModal.classList.remove('active');
        if (themeFormModal) themeFormModal.classList.remove('active');
        if (cartDrawer) cartDrawer.classList.remove('active');
        if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
        if (compareModal) compareModal.classList.remove('active');
        if (spinWheelModal) spinWheelModal.classList.remove('active');
        if (licenseLookupModal) licenseLookupModal.classList.remove('active');
        if (authModal) authModal.classList.remove('active');
        if (userOrdersModal) userOrdersModal.classList.remove('active');
      }
    });
  }
});
