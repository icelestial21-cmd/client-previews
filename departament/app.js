/**
 * DEPARTAMENT BAKU — LUXURY DIGITAL FLAGSHIP CONTROLLER
 * Multi-Currency Engine, Filter Architecture, Cart System, PDP Renderer & WhatsApp Dispatch
 */

const EXCHANGE_RATES = {
  AZN: { rate: 1.0, symbol: '₼', prefix: false, suffix: ' ₼' },
  USD: { rate: 0.588, symbol: '$', prefix: true, suffix: '' },
  EUR: { rate: 0.543, symbol: '€', prefix: true, suffix: '' },
  GBP: { rate: 0.465, symbol: '£', prefix: true, suffix: '' },
  RUB: { rate: 54.20, symbol: '₽', prefix: false, suffix: ' ₽' }
};

const WA_NUMBER = '994518642663';

let currentCurrency = localStorage.getItem('dep_currency') || 'USD';
let activeCategory = 'all';
let activeSizeFilter = 'all';
let activeSortOrder = 'featured';
let productsData = [];
let cart = JSON.parse(localStorage.getItem('dep_cart') || '[]');

let currentPdpProduct = null;
let currentPdpSize = null;
let currentPdpUnit = 'CM';

const CATEGORIES = [
  { id: 'all', label: 'All Collections' },
  { id: 'leather', label: 'Leather & Outerwear' },
  { id: 'overcoats', label: 'Cashmere Overcoats' },
  { id: 'suits', label: 'Bespoke Suiting' },
  { id: 'footwear', label: 'Artisan Footwear' }
];

document.addEventListener('DOMContentLoaded', async () => {
  initCurrencySelector();
  initMobileMenu();
  await loadProducts();
  initCategoryFromUrl();
  detectPageAndRender();
  updateCartBadge();
  renderCartDrawer();
});

async function loadProducts() {
  try {
    const res = await fetch('products.json');
    productsData = await res.json();
  } catch (err) {
    console.error('Error loading products.json:', err);
  }
}

function initCurrencySelector() {
  const selectors = document.querySelectorAll('.currency-selector, #currencySelector, .currency-select');
  selectors.forEach(selector => {
    selector.value = currentCurrency;
    selector.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      localStorage.setItem('dep_currency', currentCurrency);
      updateAllPrices();
    });
  });
}

function updateAllPrices() {
  detectPageAndRender();
  renderCartDrawer();
}

function initCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    activeCategory = catParam;
  }
}

function detectPageAndRender() {
  const grid = document.querySelector('.product-grid') || document.getElementById('productGrid');
  if (grid) {
    renderFilterTabs();
    renderProducts(grid);
  }

  const pdpContainer = document.querySelector('.pdp-page-container');
  if (pdpContainer) {
    renderPdpPage();
  }
}

function renderFilterTabs() {
  const tabsContainer = document.querySelector('.filter-tabs-container') || document.getElementById('filterTabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = CATEGORIES.map(cat => {
    let count = 0;
    if (cat.id === 'all') {
      count = productsData.length;
    } else {
      count = productsData.filter(p => p.category === cat.id).length;
    }
    
    const isActive = activeCategory === cat.id;
    return `
      <button class="filter-tab ${isActive ? 'active' : ''}" data-category="${cat.id}" onclick="filterCategory('${cat.id}')">
        ${cat.label} (${count})
      </button>
    `;
  }).join('');
}

window.filterCategory = function(categoryId) {
  activeCategory = categoryId;
  const grid = document.querySelector('.product-grid') || document.getElementById('productGrid');
  if (grid) {
    renderFilterTabs();
    renderProducts(grid);
  }
};

window.filterSize = function(btn, size) {
  document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  activeSizeFilter = size;
  const grid = document.querySelector('.product-grid') || document.getElementById('productGrid');
  if (grid) {
    renderProducts(grid);
  }
};

window.handleSortChange = function(val) {
  activeSortOrder = val;
  const grid = document.querySelector('.product-grid') || document.getElementById('productGrid');
  if (grid) {
    renderProducts(grid);
  }
};

function formatPrice(baseAzn, currencyKey = currentCurrency) {
  const config = EXCHANGE_RATES[currencyKey] || EXCHANGE_RATES.USD;
  const converted = baseAzn * config.rate;
  const rounded = Math.round(converted);
  
  if (config.prefix) {
    return `${config.symbol}${rounded.toLocaleString()}`;
  }
  return `${rounded.toLocaleString()}${config.suffix}`;
}

function renderProducts(gridElement) {
  if (!gridElement || productsData.length === 0) return;

  let filtered = [...productsData];

  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (activeSizeFilter !== 'all') {
    filtered = filtered.filter(p => {
      if (!p.layingFlat) return true;
      const sizes = Object.keys(p.layingFlat);
      return sizes.some(s => s.toLowerCase() === activeSizeFilter.toLowerCase());
    });
  }

  if (activeSortOrder === 'price-asc') {
    filtered.sort((a, b) => a.baseAzn - b.baseAzn);
  } else if (activeSortOrder === 'price-desc') {
    filtered.sort((a, b) => b.baseAzn - a.baseAzn);
  }

  // Update count label if present
  const countLabel = document.getElementById('utilityCountLabel');
  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} Atelier Masterpiece${filtered.length === 1 ? '' : 's'}`;
  }

  gridElement.innerHTML = filtered.map(p => {
    const mainPrice = formatPrice(p.baseAzn, currentCurrency);
    const aznRef = `${p.baseAzn} ₼ AZN`;
    const categoryLabel = p.categoryLabel || CATEGORIES.find(c => c.id === p.category)?.label || p.category;
    
    const defaultSize = p.layingFlat ? Object.keys(p.layingFlat)[0] : 'Standard';
    const waMessage = `Hello Muhammad (DEPARTAMENT Baku),\n\nI am inquiring about the *${p.name}* from your digital flagship.\n- Listed Price: ${mainPrice} (${aznRef})\n- Specification: ${p.specs}\n\nPlease confirm availability and 7–10 day worldwide delivery options.`;
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    return `
      <div class="product-card" data-category="${p.category}" data-product-id="${p.id}">
        <div class="product-image-wrap">
          <a href="product.html?id=${p.id}" style="display:block; width:100%; height:100%;">
            <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
          </a>
          <span class="product-badge">${p.tag || 'Baku Atelier'}</span>
          <span class="product-origin-badge">Baku Flagship</span>
        </div>
        <div class="product-info">
          <div class="product-category-row">
            <span>${categoryLabel}</span>
            <span style="color:var(--gold-light);">7-10 Days Global</span>
          </div>
          <h3 class="product-name">
            <a href="product.html?id=${p.id}">${p.name}</a>
          </h3>
          <p class="product-specs">${p.specs}</p>
          <div class="product-meta-row">
            <div class="product-price-block">
              <span class="price-main">${mainPrice}</span>
              ${currentCurrency !== 'AZN' ? `<span class="price-sub">≈ ${aznRef}</span>` : ''}
            </div>
          </div>
          <div class="product-actions">
            <button type="button" class="product-cta-btn btn-primary" onclick="addToCart('${p.id}', '${defaultSize}')">
              <span>+ Add to Bag</span>
            </button>
            <a href="${waLink}" target="_blank" rel="noopener" class="product-cta-btn btn-secondary">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
              <span>Consult</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// PRODUCT DETAIL PAGE (PDP) RENDERER
function renderPdpPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'dep-01';
  const product = productsData.find(p => p.id === id) || productsData[0];
  if (!product) return;

  currentPdpProduct = product;

  // Breadcrumbs
  const breadcrumbName = document.getElementById('pdpBreadcrumbName');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Hero Media
  const mainImg = document.getElementById('pdpMainImg');
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  // Thumbnails
  const thumbStrip = document.getElementById('pdpThumbStrip');
  if (thumbStrip && product.images) {
    const imgs = Object.values(product.images);
    thumbStrip.innerHTML = imgs.map((imgSrc, idx) => `
      <div class="pdp-thumb ${idx === 0 ? 'active' : ''}" onclick="switchPdpThumb(this, '${imgSrc}')">
        <img src="${imgSrc}" alt="${product.name} view ${idx + 1}">
      </div>
    `).join('');
  }

  // Info details
  const title = document.getElementById('pdpTitle');
  if (title) title.textContent = product.name;

  const tag = document.getElementById('pdpTag');
  if (tag) tag.textContent = product.tag || 'Atelier Flagship';

  const category = document.getElementById('pdpCategory');
  if (category) category.textContent = product.categoryLabel || product.category;

  const desc = document.getElementById('pdpDesc');
  if (desc) desc.textContent = product.specs;

  const telemetry = document.getElementById('pdpTelemetry');
  if (telemetry) {
    telemetry.textContent = product.modelTelemetry || 'Tailored calibrated pattern • European drop';
  }

  // Prices
  const priceElem = document.getElementById('pdpPrice');
  if (priceElem) priceElem.textContent = formatPrice(product.baseAzn, currentCurrency);

  const priceRefElem = document.getElementById('pdpPriceRef');
  if (priceRefElem) {
    priceRefElem.textContent = currentCurrency !== 'AZN' ? `≈ ${product.baseAzn} ₼ AZN` : '';
  }

  // Sizing buttons
  const sizeOptions = document.getElementById('pdpSizeOptions');
  if (sizeOptions && product.layingFlat) {
    const sizes = Object.keys(product.layingFlat);
    if (!currentPdpSize || !sizes.includes(currentPdpSize)) {
      currentPdpSize = sizes[0];
    }
    sizeOptions.innerHTML = sizes.map(s => `
      <button class="pdp-size-btn ${s === currentPdpSize ? 'active' : ''}" onclick="selectPdpSize('${s}')">
        ${s}
      </button>
    `).join('');
  }

  // Fit scale knob (1-5 scale)
  const fitKnob = document.getElementById('fitScaleKnob');
  if (fitKnob) {
    const rating = product.fitRating || 4;
    const percentage = ((rating - 1) / 4) * 100;
    fitKnob.style.left = `calc(${percentage}% - 7px)`;
  }

  // Dimensions table
  renderPdpDimensionsTable();

  // WhatsApp Action
  const waBtn = document.getElementById('pdpWaBtn');
  if (waBtn) {
    const mainPrice = formatPrice(product.baseAzn, currentCurrency);
    const waText = `Hello Muhammad (DEPARTAMENT Baku),\n\nI am inquiring about the *${product.name}* (Size: ${currentPdpSize || 'Standard'}).\n- Price: ${mainPrice} (${product.baseAzn} ₼ AZN)\n\nPlease advise on bespoke tailoring adjustments and 7–10 day global dispatch.`;
    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;
  }

  // Companions / Styled With
  renderPdpCompanions(product);
}

window.switchPdpThumb = function(elem, imgSrc) {
  document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
  elem.classList.add('active');
  const mainImg = document.getElementById('pdpMainImg');
  if (mainImg) mainImg.src = imgSrc;
};

window.selectPdpSize = function(size) {
  currentPdpSize = size;
  document.querySelectorAll('.pdp-size-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === size);
  });
  renderPdpDimensionsTable();
};

window.setPdpUnit = function(unit) {
  currentPdpUnit = unit;
  document.querySelectorAll('.pdp-unit-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === unit);
  });
  renderPdpDimensionsTable();
};

function renderPdpDimensionsTable() {
  const tbody = document.getElementById('pdpDimensionsBody');
  if (!tbody || !currentPdpProduct || !currentPdpProduct.layingFlat) return;

  const dims = currentPdpProduct.layingFlat[currentPdpSize] || Object.values(currentPdpProduct.layingFlat)[0];
  if (!dims) return;

  const keyLabels = {
    chest_cm: 'Chest Circumference (Pit-to-Pit x2)',
    shoulder_cm: 'Shoulder Point-to-Point Width',
    length_cm: 'Total Garment Back Length',
    sleeve_cm: 'Sleeve Length from Shoulder Seam'
  };

  tbody.innerHTML = Object.entries(dims).map(([k, cmVal]) => {
    let displayVal = `${cmVal} cm`;
    if (currentPdpUnit === 'INCHES') {
      displayVal = `${(cmVal / 2.54).toFixed(1)} in`;
    }
    return `
      <tr>
        <td>${keyLabels[k] || k}</td>
        <td style="font-family:var(--font-mono); color:var(--gold-light); font-weight:700;">${displayVal}</td>
      </tr>
    `;
  }).join('');
}

window.handlePdpAddToCart = function() {
  if (!currentPdpProduct) return;
  addToCart(currentPdpProduct.id, currentPdpSize || 'Standard');
};

function renderPdpCompanions(product) {
  const container = document.getElementById('pdpCompanionsGrid');
  if (!container) return;

  const companionIds = product.companions || [];
  const companions = companionIds.map(id => productsData.find(p => p.id === id)).filter(Boolean);

  if (companions.length === 0) {
    container.parentElement.style.display = 'none';
    return;
  }

  container.parentElement.style.display = 'block';
  container.innerHTML = companions.map(comp => `
    <div class="styled-item-card">
      <img src="${comp.image}" alt="${comp.name}" class="styled-item-thumb">
      <div style="flex:1;">
        <a href="product.html?id=${comp.id}" style="color:#FFF; font-weight:600; font-size:0.88rem; display:block;">
          ${comp.name}
        </a>
        <div style="font-size:0.8rem; color:var(--gold-light); font-family:var(--font-mono); margin-top:2px;">
          ${formatPrice(comp.baseAzn, currentCurrency)}
        </div>
      </div>
      <a href="product.html?id=${comp.id}" class="product-cta-btn btn-secondary" style="padding:6px 12px; font-size:0.75rem;">
        View Piece
      </a>
    </div>
  `).join('');
}

// SHOPPING CART DRAWER SYSTEM
window.addToCart = function(productId, size = 'Standard') {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      baseAzn: product.baseAzn,
      size: size,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
  openCartDrawer();
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

function saveCart() {
  localStorage.setItem('dep_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge, #cartBadge');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach(b => {
    b.textContent = total;
  });
}

window.openCartDrawer = function() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer) drawer.classList.add('active', 'open');
  if (overlay) overlay.classList.add('active', 'open');
};

window.closeCartDrawer = function() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer) drawer.classList.remove('active', 'open');
  if (overlay) overlay.classList.remove('active', 'open');
};

function renderCartDrawer() {
  const list = document.getElementById('cartItemsList');
  const subtotalElem = document.getElementById('cartSubtotal');
  const meter = document.getElementById('shippingMeterFill');
  const meterText = document.getElementById('shippingMeterText');
  const checkoutBtn = document.getElementById('waCheckoutBtn');
  
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty-state">
        <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:8px;">Your Shopping Bag is empty.</p>
        <p style="font-size:0.8rem; color:var(--text-muted);">Explore our tailoring collection to add handcrafted Caspian pieces.</p>
      </div>
    `;
    if (subtotalElem) subtotalElem.textContent = formatPrice(0);
    if (meter) meter.style.width = '0%';
    if (meterText) meterText.textContent = 'Add items to unlock complimentary worldwide air cargo.';
    if (checkoutBtn) {
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.style.opacity = '0.5';
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';
  }

  let totalAzn = 0;
  list.innerHTML = cart.map((item, idx) => {
    totalAzn += item.baseAzn * item.quantity;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-meta">Size: ${item.size} • Qty: ${item.quantity}</div>
          <div class="cart-item-price">${formatPrice(item.baseAzn * item.quantity)}</div>
        </div>
        <button onclick="removeFromCart(${idx})" class="cart-item-remove-btn" title="Remove Item">&times;</button>
      </div>
    `;
  }).join('');

  if (subtotalElem) {
    subtotalElem.textContent = formatPrice(totalAzn);
  }

  // Shipping threshold: $150 USD equivalent
  const usdRate = EXCHANGE_RATES.USD.rate;
  const thresholdAzn = 150 / usdRate;
  
  if (meter && meterText) {
    const progress = Math.min(100, (totalAzn / thresholdAzn) * 100);
    meter.style.width = `${progress}%`;
    if (totalAzn >= thresholdAzn) {
      meterText.innerHTML = `✈️ <strong>Complimentary Tracked Air Cargo Unlocked!</strong>`;
    } else {
      const remainingAzn = thresholdAzn - totalAzn;
      meterText.innerHTML = `Add <strong>${formatPrice(remainingAzn)}</strong> more for Complimentary Express Air Shipping.`;
    }
  }
  
  // Format WhatsApp Checkout Payload
  if (checkoutBtn) {
    let orderText = `Hello Muhammad (DEPARTAMENT Baku),\n\nI would like to place an order from my digital shopping bag:\n\n`;
    cart.forEach((item, idx) => {
      orderText += `${idx + 1}. *${item.name}*\n   Size: ${item.size} | Qty: ${item.quantity}\n   Price: ${formatPrice(item.baseAzn * item.quantity)} (${item.baseAzn * item.quantity} ₼ AZN)\n\n`;
    });
    orderText += `*Total Order Value:* ${formatPrice(totalAzn)} (${totalAzn} ₼ AZN)\n\nPlease confirm availability and provide secure international checkout and tracking dispatch.`;
    
    checkoutBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderText)}`;
  }
}

// BESPOKE MODAL
window.openBespokeModal = function() {
  const modal = document.getElementById('bespokeModal');
  if (modal) modal.classList.add('active', 'open');
};

window.closeBespokeModal = function() {
  const modal = document.getElementById('bespokeModal');
  if (modal) modal.classList.remove('active', 'open');
};

window.handleModalSubmit = function(e) {
  e.preventDefault();
  const garment = document.getElementById('modalGarment')?.value || '';
  const height = document.getElementById('modalHeight')?.value || '';
  const weight = document.getElementById('modalWeight')?.value || '';
  const location = document.getElementById('modalLocation')?.value || '';

  const text = `Hello Muhammad (DEPARTAMENT Baku),\n\nI am requesting custom sizing verification for a bespoke order:\n- Garment: ${garment}\n- Height: ${height}\n- Weight: ${weight}\n- Destination: ${location}\n\nPlease confirm available fabrics, timeline, and 7–10 day global postal delivery options.`;

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  closeBespokeModal();
};

// MOBILE MENU
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', openMobileMenu);
  }
  const closeBtn = document.getElementById('mobileMenuCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }
}

window.openMobileMenu = function() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.add('active', 'open');
};

window.closeMobileMenu = function() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('active', 'open');
};
