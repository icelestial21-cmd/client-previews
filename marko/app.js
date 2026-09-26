/* ==========================================================================
   MARKO BAKU DIGITAL ATELIER — CLIENT LOGIC & STATE ENGINE
   Multi-Currency, Cart Drawer, Video Previews & Express Checkout
   ========================================================================== */

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
  AZN: { symbol: '₼', rate: 1.70, label: 'AZN (₼)' }
};

let currentCurrency = localStorage.getItem('marko_currency') || 'USD';
let cart = JSON.parse(localStorage.getItem('marko_cart') || '[]');
let productsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  initCurrencySelector();
  await loadProducts();
  renderProducts('all');
  updateCartUI();
  setupCartDrawer();
  setupVideoHover();
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
  // Re-render product cards
  renderProducts(currentFilter);
  // Re-render cart
  renderCartItems();
}

// Load Products Catalog
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    productsData = await res.json();
  } catch (err) {
    console.error('Error loading products.json:', err);
  }
}

let currentFilter = 'all';

// Render Product Cards
function renderProducts(category = 'all') {
  currentFilter = category;
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filtered = category === 'all' 
    ? productsData 
    : productsData.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));

  grid.innerHTML = filtered.map(p => {
    const sizePills = p.sizes.map((s, idx) => 
      `<span class="size-pill ${idx === 0 ? 'selected' : ''}" onclick="selectSize(this, '${p.id}', '${s}')">${s}</span>`
    ).join('');

    const videoIndicator = p.video_url ? `
      <div class="video-play-indicator">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Runway Walk
      </div>
    ` : '';

    const videoElement = p.video_url ? `
      <video class="product-video-preview" loop muted playsinline preload="metadata" src="${p.video_url}"></video>
    ` : '';

    return `
      <div class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="product-media-wrap">
          <span class="product-badge-tag">${p.badge}</span>
          <img class="product-img" src="${p.main_image}" alt="${p.name}" loading="lazy">
          ${videoElement}
          ${videoIndicator}
        </div>
        <div class="product-details">
          <span class="product-category-label">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc-snippet">${p.description}</p>
          
          <div class="product-sizes-list">
            ${sizePills}
          </div>

          <div class="product-price-row">
            <span class="product-price">${formatPrice(p.price)}</span>
            <span style="font-size:0.75rem; color:var(--text-muted)">In Stock • Baku Atelier</span>
          </div>

          <div class="product-actions-row">
            <button class="btn-add-cart" onclick="addToCart('${p.id}')">Add To Atelier Cart</button>
            <button class="btn-quick-view" onclick="openProductModal('${p.id}')" title="Quick View">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupVideoHover();
}

// Category Tab Switching
window.filterCategory = function(btn, category) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(category);
};

// Size Selection State
const selectedSizes = {};
window.selectSize = function(el, productId, size) {
  const parent = el.parentElement;
  parent.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  selectedSizes[productId] = size;
};

// Video Hover Playback
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

// Cart Management
window.addToCart = function(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const size = selectedSizes[productId] || product.sizes[0];
  const existing = cart.find(item => item.id === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      image: product.main_image,
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
      <div style="text-align:center; padding: 40px 10px; color:var(--text-secondary);">
        <p style="margin-bottom:12px; font-size:1.1rem;">Your Atelier Bag is empty.</p>
        <p style="font-size:0.85rem; color:var(--text-muted)">Explore our 2025–2026 Collection for exclusive drops.</p>
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
        <div>
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-meta">Size: ${item.size} • Qty: ${item.quantity}</div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
        <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.2rem;" onclick="removeFromCart(${idx})" title="Remove">&times;</button>
      </div>
    `;
  }).join('');

  if (subtotalElem) {
    subtotalElem.textContent = formatPrice(totalUsd);
  }

  // Update free air shipping progress
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

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartDrawerOverlay')?.classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartDrawerOverlay')?.classList.remove('open');
}

// Lightbox for Global Delivery Proofs
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

// Quick View / Product Modal
window.openProductModal = function(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById('productModal');
  if (!modal) return;

  document.getElementById('modalProdTitle').textContent = p.name;
  document.getElementById('modalProdCategory').textContent = p.category;
  document.getElementById('modalProdPrice').textContent = formatPrice(p.price);
  document.getElementById('modalProdDesc').textContent = p.description;
  document.getElementById('modalProdFabric').textContent = p.fabric;
  document.getElementById('modalProdOrigin').textContent = p.origin;
  document.getElementById('modalProdImg').src = p.main_image;

  const addBtn = document.getElementById('modalAddBtn');
  if (addBtn) {
    addBtn.onclick = () => {
      addToCart(p.id);
      closeProductModal();
    };
  }

  modal.classList.add('open');
};

window.closeProductModal = function() {
  document.getElementById('productModal')?.classList.remove('open');
};

// Express Checkout Simulation
window.triggerCheckout = function() {
  if (cart.length === 0) {
    alert("Please select items to checkout.");
    return;
  }

  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    const trackingCode = `AZ-CARGO-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('checkoutTrackingCode').textContent = trackingCode;
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
