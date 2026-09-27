/* ==========================================================================
   MARKO BAKU DIGITAL ATELIER — CLIENT LOGIC & STATE ENGINE
   Multi-Currency, Density Switcher, Faceted Sizing, 1:1 Aligned Media,
   Dedicated PDP Architecture, Garment Dimension Matrix & Express Air Checkout
   ========================================================================== */

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
  AZN: { symbol: '₼', rate: 1.70, label: 'AZN (₼)' }
};

let currentCurrency = localStorage.getItem('marko_currency') || 'USD';
let currentDensity = localStorage.getItem('marko_density') || 'compact';
let currentCategoryFilter = 'all';
let currentSizeFilter = 'all';
let currentSortOrder = 'featured';

let cart = JSON.parse(localStorage.getItem('marko_cart') || '[]');
let productsData = [];
const selectedSizes = {};

// PDP Modal State (if quick-view opened)
let activePdpProduct = null;
let activePdpSize = null;
let activePdpUnit = 'CM'; // 'CM' or 'INCHES'

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  initCurrencySelector();
  initDensityControls();
  await loadProducts();
  initCategoryFromUrl();
  renderCategoryNav();
  renderProducts();
  updateCartUI();
  setupCartDrawer();
});

// Currency Switcher
function initCurrencySelector() {
  const select = document.getElementById('currencySelector');
  if (select) {
    select.value = currentCurrency;
    select.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      localStorage.setItem('marko_currency', currentCurrency);
      updateAllPrices();
    });
  }
}

function formatPrice(priceUsd) {
  const c = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const converted = Math.round(priceUsd * c.rate);
  return `${c.symbol}${converted}`;
}

function updateAllPrices() {
  renderProducts();
  renderCartItems();
  if (activePdpProduct) {
    const priceElem = document.getElementById('pdpPrice');
    if (priceElem) priceElem.textContent = formatPrice(activePdpProduct.price);
  }
  // Update any static or lookbook price badges
  document.querySelectorAll('.price-val[data-price]').forEach(el => {
    const p = parseFloat(el.getAttribute('data-price'));
    if (!isNaN(p)) {
      el.textContent = formatPrice(p);
    }
  });
}

// View Density Switcher (2-Col Editorial vs 4-Col Grid)
function initDensityControls() {
  applyViewDensity(currentDensity);
}

window.setViewDensity = function(mode) {
  currentDensity = mode;
  localStorage.setItem('marko_density', mode);
  applyViewDensity(mode);
};

function applyViewDensity(mode) {
  const grid = document.getElementById('productsGrid');
  const compactBtn = document.getElementById('densityCompactBtn');
  const editorialBtn = document.getElementById('densityEditorialBtn');

  if (grid) {
    if (mode === 'editorial') {
      grid.classList.add('editorial-view');
    } else {
      grid.classList.remove('editorial-view');
    }
  }

  if (compactBtn && editorialBtn) {
    if (mode === 'editorial') {
      editorialBtn.classList.add('active');
      compactBtn.classList.remove('active');
    } else {
      compactBtn.classList.add('active');
      editorialBtn.classList.remove('active');
    }
  }
}

// Load Products Catalog
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    productsData = await res.json();
    // Pre-populate default selected sizes
    productsData.forEach(p => {
      if (p.sizes && p.sizes.length > 0) {
        selectedSizes[p.id] = p.sizes[0];
      }
    });
  } catch (err) {
    console.error('Error loading products.json:', err);
  }
}

// Master Atelier Categories Architecture & Multi-Tag Taxonomy
const ATELIER_CATEGORIES = [
  {
    id: 'all',
    label: 'All Editions',
    aliases: ['all', 'everything', 'catalog'],
    matches: () => true
  },
  {
    id: 'knits',
    label: 'Knits & Polos',
    aliases: ['knits', 'knit', 'polos', 'polo'],
    matches: (p) => p.category === 'Knits & Polos' || p.category.toLowerCase().includes('knit')
  },
  {
    id: 'tailoring',
    label: 'Tailoring & Outerwear',
    aliases: ['tailoring', 'suits', 'outerwear', 'tracksuits', 'tracksuit', 'autumn', 'winter', 'autumn/winter edit'],
    matches: (p) => p.category === 'Autumn/Winter Edit' || p.category.toLowerCase().includes('outerwear') || p.category.toLowerCase().includes('tailoring')
  },
  {
    id: 'denim',
    label: 'Denim & Trousers',
    aliases: ['denim', 'trousers', 'jeans', 'pants'],
    matches: (p) => p.category === 'Denim & Trousers' || p.category.toLowerCase().includes('denim')
  },
  {
    id: 'footwear',
    label: 'Luxury Footwear',
    aliases: ['footwear', 'shoes', 'loafers', 'shoe'],
    matches: (p) => p.category === 'Luxury Footwear' || p.category.toLowerCase().includes('footwear')
  },
  {
    id: 'accessories',
    label: 'Accessories & Headwear',
    aliases: ['accessories', 'headwear', 'caps', 'hats', 'cap', 'accessory'],
    matches: (p) => p.category === 'Accessories & Headwear' || p.category.toLowerCase().includes('accessories') || p.category.toLowerCase().includes('headwear')
  }
];

// Initialize Category Filter from URL Query Parameters (?cat=... or ?category=...)
function initCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat') || params.get('category');
  if (catParam) {
    const q = catParam.toLowerCase().trim();
    const matched = ATELIER_CATEGORIES.find(c => 
      c.id.toLowerCase() === q || 
      c.aliases.some(a => q === a || q.includes(a) || a.includes(q))
    );
    if (matched) {
      currentCategoryFilter = matched.id;
    }
  }
}

// Category Navigation Rendering with Live Counts
function renderCategoryNav() {
  const nav = document.getElementById('atelierCategoryNav');
  if (!nav || productsData.length === 0) return;

  nav.innerHTML = ATELIER_CATEGORIES.map(cat => {
    const count = productsData.filter(p => cat.matches(p)).length;
    const isActive = currentCategoryFilter === cat.id;

    return `
      <button class="atelier-cat-link ${isActive ? 'active' : ''}" onclick="filterCategory(this, '${cat.id}')">
        <span>${cat.label}</span>
        <span class="atelier-cat-count">(${count})</span>
      </button>
    `;
  }).join('');
}

// Category & Size Filtering & Sorting
window.filterCategory = function(btn, categoryId) {
  document.querySelectorAll('.atelier-cat-link').forEach(l => l.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.atelier-cat-link[onclick*="'${categoryId}'"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }
  currentCategoryFilter = categoryId;
  renderProducts();
};

window.filterSize = function(btn, size) {
  document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentSizeFilter = size;
  renderProducts();
};

window.handleSortChange = function(val) {
  currentSortOrder = val;
  renderProducts();
};

// Render Product Cards with Strict 1:1 Visual Alignment & Direct PDP Navigation
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = [...productsData];

  // Filter Category
  if (currentCategoryFilter !== 'all') {
    const catObj = ATELIER_CATEGORIES.find(c => c.id === currentCategoryFilter);
    if (catObj) {
      filtered = filtered.filter(p => catObj.matches(p));
    }
  }

  // Filter In-Stock Size
  if (currentSizeFilter !== 'all') {
    filtered = filtered.filter(p => 
      p.sizes && p.sizes.some(s => s.toLowerCase() === currentSizeFilter.toLowerCase())
    );
  }

  // Sorting
  if (currentSortOrder === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSortOrder === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Update Item Count Label
  const countLabel = document.getElementById('utilityCountLabel');
  if (countLabel) {
    const catObj = ATELIER_CATEGORIES.find(c => c.id === currentCategoryFilter);
    const catName = (!catObj || catObj.id === 'all') ? 'Atelier Pieces' : `in ${catObj.label}`;
    countLabel.textContent = `Showing ${filtered.length} ${catName}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; color: var(--text-secondary);">
        <p style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 8px;">No garments found matching criteria</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Please select a different size or category to view available Baku drops.</p>
        <button class="btn btn-secondary" style="margin-top: 18px;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const currentSize = selectedSizes[p.id] || (p.sizes ? p.sizes[0] : 'One Size');
    const sizePills = (p.sizes || []).map(s => 
      `<span class="size-pill ${s === currentSize ? 'selected' : ''}" onclick="selectCardSize(event, '${p.id}', '${s}')">${s}</span>`
    ).join('');

    // Authentic media elements: Video hover or Rear photo cross-fade
    let mediaContent = '';
    let mediaIndicator = '';

    if (p.video_url) {
      mediaContent = `
        <img class="product-img" src="${p.front_photo}" alt="${p.name}" loading="lazy">
        <video class="product-video-preview" loop muted playsinline preload="metadata" src="${p.video_url}"></video>
      `;
      mediaIndicator = `
        <div class="media-type-indicator">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <span>Runway Video</span>
        </div>
      `;
    } else {
      const secondaryPhoto = p.back_photo || p.detail_photo || p.front_photo;
      mediaContent = `
        <img class="product-img" src="${p.front_photo}" alt="${p.name}" loading="lazy">
        <img class="product-img-secondary" src="${secondaryPhoto}" alt="${p.name} Alternate View" loading="lazy">
      `;
      mediaIndicator = `
        <div class="media-type-indicator">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Dual Angle</span>
        </div>
      `;
    }

    const telemetryTag = p.model_telemetry ? `
      <div class="model-telemetry-badge">${p.model_telemetry.split(',')[0]}</div>
    ` : '';

    return `
      <div class="product-card" data-id="${p.id}" data-category="${p.category}">
        <a href="product.html?id=${p.id}" class="product-media-wrap" title="Inspect ${p.name}">
          <span class="product-badge-tag">${p.badge || 'Atelier Edition'}</span>
          ${mediaContent}
          ${telemetryTag}
          ${mediaIndicator}
        </a>
        <div class="product-details">
          <span class="product-category-label">${p.category}</span>
          <h3 class="product-name">
            <a href="product.html?id=${p.id}" style="color:inherit; text-decoration:none;">${p.name}</a>
          </h3>
          <p class="product-desc-snippet">${p.fabric_story ? p.fabric_story.slice(0, 95) + '...' : ''}</p>
          
          <div class="product-sizes-list">
            ${sizePills}
          </div>

          <div class="product-price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
            <span style="font-size:0.75rem; color:var(--text-muted)">In Stock • Baku Atelier</span>
          </div>

          <div class="product-actions-row">
            <a href="product.html?id=${p.id}" class="btn-view-pdp" title="View Full Laying-Flat Dimensions & Specs">
              <span>View Garment & Specs</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button class="btn-quick-view" onclick="addToCart('${p.id}')" title="Quick Add to Bag">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupVideoHover();
}

window.resetFilters = function() {
  currentCategoryFilter = 'all';
  currentSizeFilter = 'all';
  currentSortOrder = 'featured';
  document.querySelectorAll('.atelier-cat-link').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.size-filter-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) sortSelect.value = 'featured';
  renderProducts();
};

window.selectCardSize = function(event, productId, size) {
  event.stopPropagation();
  event.preventDefault();
  selectedSizes[productId] = size;
  const card = event.target.closest('.product-card');
  if (card) {
    card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
    event.target.classList.add('selected');
  }
};

// Video Hover Playback Engine (Instant & Responsive)
function setupVideoHover() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const video = card.querySelector('.product-video-preview');
    if (video) {
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }
  });
}

// Quick View / PDP Modal Support (Retained for quick inspection if needed)
window.openProductModal = function(productId) {
  // If user clicks, navigate directly to dedicated product page
  window.location.href = `product.html?id=${productId}`;
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// ==========================================================================
// CART DRAWER & CHECKOUT ENGINE
// ==========================================================================

window.addToCart = function(productId, customSize = null) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const size = customSize || selectedSizes[productId] || (product.sizes ? product.sizes[0] : 'One Size');
  const existing = cart.find(item => item.id === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      image: product.front_photo,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
};

window.removeFromCart = function(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartUI();
};

window.updateCartQty = function(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  }
  saveCart();
  updateCartUI();
};

function saveCart() {
  localStorage.setItem('marko_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const countBadge = document.getElementById('cartCount');
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) {
    countBadge.textContent = totalCount;
  }
  renderCartItems();
}

function renderCartItems() {
  const list = document.getElementById('cartItemsList');
  const subtotalElem = document.getElementById('cartSubtotal');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding: 50px 10px; color:var(--text-secondary);">
        <p style="font-family:var(--font-serif); font-size:1.25rem; margin-bottom:8px;">Your Atelier Bag is empty</p>
        <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">Explore our Autumn/Winter 2025–2026 Collection for exclusive Caspian tailoring and knitwear drops.</p>
      </div>
    `;
    if (subtotalElem) subtotalElem.textContent = formatPrice(0);
    return;
  }

  let totalUsd = 0;
  list.innerHTML = cart.map((item, idx) => {
    totalUsd += item.price * item.quantity;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div style="flex-grow:1;">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-meta">Size: <strong style="color:var(--gold-light)">${item.size}</strong></div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
            <button style="background:var(--bg-secondary); border:1px solid var(--border-subtle); color:var(--text-primary); width:22px; height:22px; border-radius:3px; cursor:pointer;" onclick="updateCartQty(${idx}, -1)">-</button>
            <span style="font-size:0.8rem; font-weight:600;">${item.quantity}</span>
            <button style="background:var(--bg-secondary); border:1px solid var(--border-subtle); color:var(--text-primary); width:22px; height:22px; border-radius:3px; cursor:pointer;" onclick="updateCartQty(${idx}, 1)">+</button>
            <span class="cart-item-price" style="margin-left:auto;">${formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
        <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.3rem; padding:4px;" onclick="removeFromCart(${idx})" title="Remove">&times;</button>
      </div>
    `;
  }).join('');

  if (subtotalElem) {
    subtotalElem.textContent = formatPrice(totalUsd);
  }

  // Free Air Shipping Progress Meter ($150 USD Threshold)
  const meter = document.getElementById('shippingMeterFill');
  const meterText = document.getElementById('shippingMeterText');
  if (meter && meterText) {
    const threshold = 150;
    const progress = Math.min(100, Math.round((totalUsd / threshold) * 100));
    meter.style.width = `${progress}%`;
    if (totalUsd >= threshold) {
      meterText.innerHTML = `🎉 <strong>Complimentary Worldwide Air Cargo Unlocked!</strong>`;
    } else {
      const remaining = threshold - totalUsd;
      meterText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more for Complimentary Express Air Shipping.`;
    }
  }
}

// Cart Drawer Handlers
function setupCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  const trigger = document.getElementById('cartBtn');
  const closeBtn = document.getElementById('cartCloseBtn');

  if (trigger) trigger.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);
}

window.openCartDrawer = function() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartDrawerOverlay')?.classList.add('open');
};

window.closeCartDrawer = function() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartDrawerOverlay')?.classList.remove('open');
};

// Global Delivery Proof Lightbox
window.openProofModal = function(title, location, imageSrc, review) {
  const modal = document.getElementById('proofModal');
  if (!modal) return;

  document.getElementById('proofModalTitle').textContent = title;
  document.getElementById('proofModalLocation').textContent = location;
  document.getElementById('proofModalImage').src = imageSrc;
  document.getElementById('proofModalReview').textContent = review;

  modal.classList.add('open');
};

window.closeProofModal = function() {
  document.getElementById('proofModal')?.classList.remove('open');
};

// Express Checkout Simulation
window.triggerCheckout = function() {
  if (cart.length === 0) {
    alert("Your Atelier Bag is currently empty. Please select garments to checkout.");
    return;
  }

  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    const trackingCode = `AZ-CARGO-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingElem = document.getElementById('checkoutTrackingCode');
    if (trackingElem) trackingElem.textContent = trackingCode;
    checkoutModal.classList.add('open');
    closeCartDrawer();
  }
};

window.closeCheckoutModal = function() {
  document.getElementById('checkoutModal')?.classList.remove('open');
  cart = [];
  saveCart();
  updateCartUI();
};
