/* ==========================================================================
   MARKO BAKU DIGITAL ATELIER — CLIENT LOGIC & STATE ENGINE
   Multi-Currency, Density Switcher, Faceted Sizing, 1:1 Aligned Media,
   PDP Laying-Flat Measurement Matrix & Express Air Checkout
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

let cart = JSON.parse(localStorage.getItem('marko_cart') || '[]');
let productsData = [];
const selectedSizes = {};

// PDP State
let activePdpProduct = null;
let activePdpSize = null;
let activePdpUnit = 'CM'; // 'CM' or 'INCHES'

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  initCurrencySelector();
  initDensityControls();
  await loadProducts();
  renderProducts();
  updateCartUI();
  setupCartDrawer();
});

// Currency Engine
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

// Category & Size Filtering
window.filterCategory = function(btn, category) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentCategoryFilter = category;
  renderProducts();
};

window.filterSize = function(btn, size) {
  document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentSizeFilter = size;
  renderProducts();
};

// Render Product Cards with Strict 1:1 Visual Alignment
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = productsData;

  // Filter Category
  if (currentCategoryFilter !== 'all') {
    filtered = filtered.filter(p => 
      p.category.toLowerCase().includes(currentCategoryFilter.toLowerCase())
    );
  }

  // Filter In-Stock Size
  if (currentSizeFilter !== 'all') {
    filtered = filtered.filter(p => 
      p.sizes && p.sizes.some(s => s.toLowerCase() === currentSizeFilter.toLowerCase())
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <p style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 8px;">No garments matching your selection</p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Please clear the size or category filter to inspect other Baku drops.</p>
        <button class="btn btn-secondary" style="margin-top: 16px;" onclick="resetFilters()">Reset All Filters</button>
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
        <video class="product-video-preview" loop muted playsinline preload="none" src="${p.video_url}"></video>
      `;
      mediaIndicator = `
        <div class="media-type-indicator">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <span>Runway Walk</span>
        </div>
      `;
    } else {
      const secondaryPhoto = p.back_photo || p.detail_photo || p.front_photo;
      mediaContent = `
        <img class="product-img" src="${p.front_photo}" alt="${p.name}" loading="lazy">
        <img class="product-img-secondary" src="${secondaryPhoto}" alt="${p.name} Alternate Angle" loading="lazy">
      `;
      mediaIndicator = `
        <div class="media-type-indicator">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Turn Angle</span>
        </div>
      `;
    }

    const telemetryTag = p.model_telemetry ? `
      <div class="model-telemetry-badge">${p.model_telemetry.split(',')[0]}</div>
    ` : '';

    return `
      <div class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="product-media-wrap" onclick="openProductModal('${p.id}')" style="cursor: pointer;">
          <span class="product-badge-tag">${p.badge || 'Atelier Edition'}</span>
          ${mediaContent}
          ${telemetryTag}
          ${mediaIndicator}
        </div>
        <div class="product-details">
          <span class="product-category-label">${p.category}</span>
          <h3 class="product-name" onclick="openProductModal('${p.id}')" style="cursor: pointer;">${p.name}</h3>
          <p class="product-desc-snippet">${p.fabric_story ? p.fabric_story.slice(0, 95) + '...' : ''}</p>
          
          <div class="product-sizes-list">
            ${sizePills}
          </div>

          <div class="product-price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
            <span style="font-size:0.75rem; color:var(--text-muted)">In Stock • Baku Atelier</span>
          </div>

          <div class="product-actions-row">
            <button class="btn-add-cart" onclick="addToCart('${p.id}')">Add To Atelier Bag</button>
            <button class="btn-quick-view" onclick="openProductModal('${p.id}')" title="Inspect Atelier Piece">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
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
  document.querySelectorAll('.cat-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.size-filter-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  renderProducts();
};

window.selectCardSize = function(event, productId, size) {
  event.stopPropagation();
  selectedSizes[productId] = size;
  const card = event.target.closest('.product-card');
  if (card) {
    card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
    event.target.classList.add('selected');
  }
};

// Video Hover Playback Engine
function setupVideoHover() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const video = card.querySelector('.product-video-preview');
    if (video) {
      card.addEventListener('mouseenter', () => {
        video.classList.add('loaded');
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('loaded');
      });
    }
  });
}

// ==========================================================================
// PDP MODAL ENGINE (Deep Architecture: Gallery, Laying-Flat Dimensions, Bundling)
// ==========================================================================

window.openProductModal = function(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  activePdpProduct = p;
  activePdpSize = selectedSizes[productId] || (p.sizes ? p.sizes[0] : null);

  const modal = document.getElementById('productModal');
  const content = document.getElementById('pdpModalContent');
  if (!modal || !content) return;

  content.innerHTML = renderPdpModalMarkup(p);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Pause any playing modal video
    const video = modal.querySelector('video');
    if (video) video.pause();
  }
};

function renderPdpModalMarkup(p) {
  // Gallery Thumbnails
  const thumbs = [
    { type: 'image', src: p.front_photo, label: 'Front Angle' },
    { type: 'image', src: p.detail_photo, label: 'Fabric Detail' },
    { type: 'image', src: p.back_photo, label: 'Rear Cut' }
  ];

  if (p.video_url) {
    thumbs.push({ type: 'video', src: p.video_url, label: 'Runway Walk' });
  }

  const thumbsHtml = thumbs.map((t, idx) => `
    <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchPdpMedia(this, '${t.type}', '${t.src}')" title="${t.label}">
      ${t.type === 'video' 
        ? `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#111; color:var(--gold-primary); font-size:0.65rem; font-weight:700;">▶ WALK</div>`
        : `<img src="${t.src}" alt="${t.label}">`
      }
    </button>
  `).join('');

  // Size Selector Pills
  const sizePills = (p.sizes || []).map(s => `
    <span class="size-pill ${s === activePdpSize ? 'selected' : ''}" style="padding:6px 14px; font-size:0.8rem;" onclick="setPdpSize('${s}')">${s}</span>
  `).join('');

  // Sizing matrix table rows
  const measurementHtml = renderMeasurementTableHtml(p, activePdpSize, activePdpUnit);

  // "Complete the Look" Bundling
  const styledHtml = renderStyledWithHtml(p);

  return `
    <button class="modal-close-btn" onclick="closeProductModal()">&times;</button>
    
    <!-- Left Column: Multi-Angle Gallery & Runway Motion -->
    <div class="pdp-gallery-column">
      <div class="pdp-main-media-wrap">
        <img id="pdpMainImg" class="pdp-main-img" src="${p.front_photo}" alt="${p.name}">
        <video id="pdpMainVideo" class="pdp-main-video" controls loop playsinline></video>
      </div>
      <div class="pdp-thumbs-row">
        ${thumbsHtml}
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); text-align:center; margin-top:4px;">
        1:1 Verified Drop Assets • Direct Baku Showroom Provenance
      </div>
    </div>

    <!-- Right Column: Specs, Dimensions & Atelier Actions -->
    <div class="pdp-info-column">
      <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold-primary); font-weight:700;">${p.category}</span>
      <h2 style="font-family:var(--font-serif); font-size:1.75rem; line-height:1.25; margin:6px 0 10px;">${p.name}</h2>
      
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:12px;">
        <span id="pdpPrice" style="font-size:1.6rem; font-weight:700; color:var(--gold-light);">${formatPrice(p.price)}</span>
        <span style="font-size:0.75rem; color:#4ADE80; font-weight:600;">✓ In Stock for Air Cargo Dispatch</span>
      </div>

      <div style="font-size:0.84rem; color:var(--text-secondary); line-height:1.55; margin-bottom:16px;">
        <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">Atelier Fabric & Construction:</strong>
        ${p.fabric_story || ''}
      </div>

      <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:14px;">
        <strong>Provenance:</strong> ${p.provenance || 'Baku Atelier Master Tailoring'}
      </div>

      <!-- Model Physical Telemetry -->
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 14px; margin-bottom:16px; font-size:0.8rem; color:var(--text-secondary);">
        🧍 <strong>Model Telemetry:</strong> ${p.model_telemetry || 'Model is 185 cm, 80 kg, wearing Size Large'}
      </div>

      <!-- Visual Fit Scale Slider -->
      <div class="fit-scale-bar">
        <div style="display:flex; justify-content:space-between; font-weight:600; font-size:0.78rem;">
          <span>Fit Profile:</span>
          <span style="color:var(--gold-light);">${p.fit_scale || 'Contemporary Tailored'}</span>
        </div>
        <div class="fit-slider-track">
          <div class="fit-slider-knob" style="left: ${p.fit_rating || 50}%;"></div>
        </div>
        <div class="fit-labels">
          <span>Slim Form</span>
          <span>Sartorial Tailored</span>
          <span>Relaxed Oversized</span>
        </div>
      </div>

      <!-- Size Selection -->
      <div style="margin: 16px 0 10px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted);">Select Atelier Size:</span>
          <span style="font-size:0.75rem; color:var(--gold-primary);">Selected: <strong>${activePdpSize}</strong></span>
        </div>
        <div class="product-sizes-list">
          ${sizePills}
        </div>
      </div>

      <!-- Laying-Flat Measurement Matrix -->
      <div class="measurement-box">
        <div class="measurement-header">
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--gold-light);">
            Laying-Flat Garment Dimensions (Size ${activePdpSize})
          </span>
          <button class="unit-toggle-btn" onclick="toggleMeasurementUnit()">Unit: ${activePdpUnit}</button>
        </div>
        <div id="pdpMeasurementTableWrap">
          ${measurementHtml}
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:8px;">
          💡 Measured flat across the seam on un-stretched garment. Compare with your favorite piece at home.
        </div>
      </div>

      <!-- Add to Bag Primary CTA -->
      <button class="btn btn-primary" style="width:100%; justify-content:center; padding:14px; font-size:0.95rem; margin-top:6px;" onclick="addPdpProductToCart()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <span>Add ${p.name} (Size ${activePdpSize}) to Bag</span>
      </button>

      <!-- DDP Customs & Express Air Cargo Guarantee -->
      <div class="ddp-guarantee-box">
        🛡️ <strong>Delivered Duty Paid (DDP) Guaranteed:</strong> All EU VAT, UK customs, and US import clearance pre-arranged. Zero customs fees upon arrival. Express door-to-door air tracking provided upon dispatch.
      </div>

      <!-- "Complete the Look" Bundling -->
      ${styledHtml}
    </div>
  `;
}

// Media Switcher in PDP Gallery
window.switchPdpMedia = function(btn, type, src) {
  document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const img = document.getElementById('pdpMainImg');
  const video = document.getElementById('pdpMainVideo');
  if (!img || !video) return;

  if (type === 'video') {
    img.style.display = 'none';
    video.style.display = 'block';
    video.src = src;
    video.play().catch(() => {});
  } else {
    video.pause();
    video.style.display = 'none';
    img.style.display = 'block';
    img.src = src;
  }
};

// Size Selection within PDP
window.setPdpSize = function(size) {
  activePdpSize = size;
  if (activePdpProduct) {
    selectedSizes[activePdpProduct.id] = size;
  }
  // Re-render PDP content to update size pills and measurement table
  const content = document.getElementById('pdpModalContent');
  if (content && activePdpProduct) {
    content.innerHTML = renderPdpModalMarkup(activePdpProduct);
  }
};

// Toggle Measurement Unit (CM <-> INCHES)
window.toggleMeasurementUnit = function() {
  activePdpUnit = activePdpUnit === 'CM' ? 'INCHES' : 'CM';
  const tableWrap = document.getElementById('pdpMeasurementTableWrap');
  if (tableWrap && activePdpProduct) {
    tableWrap.innerHTML = renderMeasurementTableHtml(activePdpProduct, activePdpSize, activePdpUnit);
  }
  const btn = document.querySelector('.unit-toggle-btn');
  if (btn) btn.textContent = `Unit: ${activePdpUnit}`;
};

function renderMeasurementTableHtml(product, size, unit) {
  if (!product.measurements || !product.measurements[size]) {
    return `<div style="font-size:0.75rem; color:var(--text-muted); padding:8px 0;">Standard artisanal proportions apply.</div>`;
  }

  const spec = product.measurements[size];
  const keys = Object.keys(spec);

  const formatVal = (val, key) => {
    if (typeof val === 'number') {
      if (unit === 'INCHES') {
        return (val / 2.54).toFixed(1) + '"';
      }
      return `${val} cm`;
    }
    return val;
  };

  const keyLabels = {
    chest_cm: 'Chest (Pit-to-Pit)',
    length_cm: 'Body Length',
    shoulder_cm: 'Shoulder Width',
    sleeve_cm: 'Sleeve Length',
    waist_cm: 'Waist (Flat Width)',
    inseam_cm: 'Inseam Length',
    pant_len_cm: 'Outseam Length',
    thigh_cm: 'Thigh Width',
    rise_cm: 'Front Rise',
    eu_size: 'EU Sizing',
    us_size: 'US Sizing',
    insole_cm: 'Insole Bed Length'
  };

  const rows = keys.map(k => `
    <tr>
      <td>${keyLabels[k] || k.replace(/_/g, ' ')}</td>
      <td style="font-weight:700; color:var(--gold-light); text-align:right;">${formatVal(spec[k], k)}</td>
    </tr>
  `).join('');

  return `
    <table class="measurement-table">
      <thead>
        <tr>
          <th>Garment Metric</th>
          <th style="text-align:right;">Measurement (${unit})</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// "Complete the Look" Bundling Render
function renderStyledWithHtml(product) {
  if (!product.styled_with || product.styled_with.length === 0) return '';

  const companionItems = product.styled_with
    .map(id => productsData.find(item => item.id === id))
    .filter(Boolean);

  if (companionItems.length === 0) return '';

  const itemsHtml = companionItems.map(item => `
    <div class="bundle-item-row">
      <img src="${item.front_photo}" alt="${item.name}" style="width:48px; height:60px; object-fit:cover; border-radius:4px; border:1px solid var(--border-subtle);">
      <div style="flex-grow:1; margin-left:12px;">
        <div style="font-weight:600; font-size:0.82rem; color:var(--text-primary);">${item.name}</div>
        <div style="font-size:0.75rem; color:var(--gold-primary); font-weight:600;">${formatPrice(item.price)}</div>
      </div>
      <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.72rem;" onclick="addToCart('${item.id}')">
        + Add Piece
      </button>
    </div>
  `).join('');

  return `
    <div class="styled-with-box">
      <div class="styled-with-title">Complete The Caspian Look</div>
      <div class="styled-with-items">
        ${itemsHtml}
      </div>
    </div>
  `;
}

window.addPdpProductToCart = function() {
  if (!activePdpProduct) return;
  addToCart(activePdpProduct.id, activePdpSize);
  closeProductModal();
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
