/**
 * J.MOSSIS PARIS — DIGITAL CAPSULE DROP ENGINE
 * Core JavaScript Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    catalog: null,
    currentCurrency: localStorage.getItem('jm_currency') || 'EUR',
    cart: JSON.parse(localStorage.getItem('jm_cart') || '[]'),
    capsuleSelection: {
      collar: 'tulipe',
      colorway: 'blanc',
      size: '39',
      fit: 'slim',
      cuff: 'button',
      qty: 1
    }
  };

  // Currency Exchange Definitions
  const currencyRates = {
    EUR: { symbol: '€', rate: 1.0, pos: 'after' },
    USD: { symbol: '$', rate: 1.10, pos: 'before' },
    GBP: { symbol: '£', rate: 0.85, pos: 'before' },
    XOF: { symbol: 'CFA', rate: 655.957, pos: 'after' }
  };

  // DOM Elements
  const currencySelect = document.getElementById('currencySelect');
  const cartDrawer = document.getElementById('cartDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const btnOpenCart = document.getElementById('btnOpenCart');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartBadgeEl = document.getElementById('cartBadge');
  const checkoutModal = document.getElementById('checkoutModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const checkoutForm = document.getElementById('checkoutForm');

  // Format Price according to active currency
  function formatPrice(eurAmount) {
    const curr = currencyRates[state.currentCurrency] || currencyRates.EUR;
    const converted = Math.round(eurAmount * curr.rate);
    const formatted = converted.toLocaleString('fr-FR');
    if (curr.pos === 'before') {
      return `${curr.symbol}${formatted}`;
    }
    return `${formatted} ${curr.symbol}`;
  }

  // Load Catalog Data
  async function initCatalog() {
    try {
      const resp = await fetch('products.json');
      state.catalog = await resp.json();
      renderAll();
    } catch (err) {
      console.error('Failed to load products.json:', err);
    }
  }

  // Master Render Cycle
  function renderAll() {
    if (!state.catalog) return;
    renderCapsuleCustomizer();
    renderCompanionSuiting();
    renderReviews();
    updateCartDisplay();
  }

  // Render Capsule Customizer Section
  function renderCapsuleCustomizer() {
    const capsule = state.catalog.capsule;
    if (!capsule) return;

    // Price updates
    const priceMain = document.getElementById('capsuleMainPrice');
    if (priceMain) {
      priceMain.textContent = formatPrice(capsule.baseEur);
    }

    // Selected labels
    const selectedCollarLabel = document.getElementById('selectedCollarLabel');
    const selectedColorLabel = document.getElementById('selectedColorLabel');
    const selectedSizeLabel = document.getElementById('selectedSizeLabel');
    const selectedFitLabel = document.getElementById('selectedFitLabel');

    const activeCollarObj = capsule.variants.find(v => v.id === state.capsuleSelection.collar);
    const activeColorObj = capsule.colorways.find(c => c.id === state.capsuleSelection.colorway);

    if (selectedCollarLabel && activeCollarObj) selectedCollarLabel.textContent = activeCollarObj.name;
    if (selectedColorLabel && activeColorObj) selectedColorLabel.textContent = `${activeColorObj.name} (${activeColorObj.fabric})`;
    if (selectedSizeLabel) selectedSizeLabel.textContent = `Taille ${state.capsuleSelection.size} EU`;
    if (selectedFitLabel) selectedFitLabel.textContent = state.capsuleSelection.fit === 'slim' ? 'Coupe Ajustée' : 'Coupe Confort';

    // Collar Buttons State
    document.querySelectorAll('.collar-card-btn').forEach(btn => {
      const id = btn.getAttribute('data-collar-id');
      btn.classList.toggle('active', id === state.capsuleSelection.collar);
    });

    // Colorway Buttons State
    document.querySelectorAll('.colorway-btn').forEach(btn => {
      const id = btn.getAttribute('data-color-id');
      btn.classList.toggle('active', id === state.capsuleSelection.colorway);
    });

    // Size Buttons State
    document.querySelectorAll('.size-btn').forEach(btn => {
      const sizeVal = btn.getAttribute('data-size');
      btn.classList.toggle('active', sizeVal === state.capsuleSelection.size);
    });

    // Fit Pills State
    document.querySelectorAll('.pill-fit-btn').forEach(btn => {
      const fitVal = btn.getAttribute('data-fit');
      btn.classList.toggle('active', fitVal === state.capsuleSelection.fit);
    });

    // Cuff Pills State
    document.querySelectorAll('.pill-cuff-btn').forEach(btn => {
      const cuffVal = btn.getAttribute('data-cuff');
      btn.classList.toggle('active', cuffVal === state.capsuleSelection.cuff);
    });
  }

  // Render Companion Suiting Grid
  function renderCompanionSuiting() {
    const suitingGrid = document.getElementById('suitingGrid');
    if (!suitingGrid || !state.catalog.suiting) return;

    suitingGrid.innerHTML = state.catalog.suiting.map(suit => `
      <div class="suit-card" data-suit-id="${suit.id}">
        <div class="suit-image-wrap">
          <img src="${suit.image}" alt="${suit.name}" loading="lazy">
          <div class="suit-tag-badge">${suit.tag}</div>
        </div>
        <div class="suit-body">
          <div class="suit-brand">${suit.brand}</div>
          <h3 class="suit-title">${suit.name}</h3>
          <p class="suit-specs">${suit.specs}</p>
          <div class="suit-footer-row">
            <div class="suit-price">${formatPrice(suit.baseEur)}</div>
            <button class="btn-add-companion" data-suit-id="${suit.id}">Commander</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Click Events to Companion Buttons
    document.querySelectorAll('.btn-add-companion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const suitId = e.currentTarget.getAttribute('data-suit-id');
        const suit = state.catalog.suiting.find(s => s.id === suitId);
        if (suit) {
          addSuitToCart(suit);
        }
      });
    });
  }

  // Render Testimonials & Reviews
  function renderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid || !state.catalog.reviews) return;

    reviewsGrid.innerHTML = state.catalog.reviews.map(r => `
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-author-meta">
          <div class="review-author-name">${r.author}</div>
          <div class="review-author-sub">${r.location} • Avis Vérifié</div>
        </div>
      </div>
    `).join('');
  }

  // Add Capsule Shirt to Bag
  function addCapsuleToCart() {
    const capsule = state.catalog.capsule;
    const collarObj = capsule.variants.find(v => v.id === state.capsuleSelection.collar);
    const colorObj = capsule.colorways.find(c => c.id === state.capsuleSelection.colorway);

    const cartItem = {
      id: `capsule-${Date.now()}`,
      title: `${capsule.name} (${collarObj ? collarObj.name : 'Col Tulipe'})`,
      subtitle: `${colorObj ? colorObj.name : 'Blanc'} • Taille ${state.capsuleSelection.size} • ${state.capsuleSelection.fit === 'slim' ? 'Coupe Ajustée' : 'Coupe Confort'}`,
      priceEur: capsule.baseEur,
      image: capsule.image,
      type: 'capsule'
    };

    state.cart.push(cartItem);
    saveCart();
    updateCartDisplay();
    openCartDrawer();
  }

  // Add Companion Suit to Bag
  function addSuitToCart(suit) {
    const cartItem = {
      id: `suit-${Date.now()}`,
      title: suit.name,
      subtitle: `${suit.brand} • Taille 50 EU (Ajustement en Atelier Inclus)`,
      priceEur: suit.baseEur,
      image: suit.image,
      type: 'suit'
    };

    state.cart.push(cartItem);
    saveCart();
    updateCartDisplay();
    openCartDrawer();
  }

  // Remove Item from Bag
  function removeCartItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
  }

  // Save Cart to LocalStorage
  function saveCart() {
    localStorage.setItem('jm_cart', JSON.stringify(state.cart));
  }

  // Update Cart Display & Calculations
  function updateCartDisplay() {
    if (cartBadgeEl) {
      cartBadgeEl.textContent = state.cart.length;
    }

    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); margin: 60px 0;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">Votre panier est actuellement vide.</p>
          <p style="font-size: 0.85rem;">Sélectionnez votre col et vos finitions pour réserver votre pièce de la capsule.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(0);
      return;
    }

    cartItemsContainer.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item-card">
        <img class="cart-item-img" src="${item.image}" alt="${item.title}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-subtitle">${item.subtitle}</div>
          <div class="cart-item-price">${formatPrice(item.priceEur)}</div>
        </div>
        <button class="btn-remove-item" data-index="${idx}" title="Supprimer">✕</button>
      </div>
    `).join('');

    // Attach Remove Events
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        removeCartItem(idx);
      });
    });

    // Subtotal
    const totalEur = state.cart.reduce((sum, item) => sum + item.priceEur, 0);
    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = formatPrice(totalEur);
    }
  }

  // Cart Drawer Controls
  function openCartDrawer() {
    if (cartDrawer && drawerBackdrop) {
      cartDrawer.classList.add('active');
      drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && drawerBackdrop) {
      cartDrawer.classList.remove('active');
      drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Checkout Modal Controls
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      alert("Veuillez d'abord sélectionner une chemise ou une pièce du vestiaire.");
      return;
    }
    closeCartDrawer();
    if (checkoutModal && modalBackdrop) {
      checkoutModal.classList.add('active');
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      const orderSummaryEl = document.getElementById('checkoutOrderSummary');
      if (orderSummaryEl) {
        const totalEur = state.cart.reduce((sum, item) => sum + item.priceEur, 0);
        orderSummaryEl.textContent = `Total de votre commande : ${formatPrice(totalEur)} (Expédition Express DHL Offerte)`;
      }
    }
  }

  function closeCheckoutModal() {
    if (checkoutModal && modalBackdrop) {
      checkoutModal.classList.remove('active');
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // WhatsApp Order Dispatch Formatter
  function dispatchWhatsAppOrder() {
    const capsule = state.catalog.capsule;
    let message = `Bonjour l'Atelier J.MOSSIS Paris (54 Avenue de Clichy),\n\nJe souhaite passer commande d'une pièce de la Capsule Sartoriale :\n`;

    if (state.cart.length > 0) {
      state.cart.forEach((item, i) => {
        message += `\n${i + 1}. ${item.title}\n   ${item.subtitle}\n   Prix : ${formatPrice(item.priceEur)}\n`;
      });
      const totalEur = state.cart.reduce((sum, item) => sum + item.priceEur, 0);
      message += `\nTotal Estimé : ${formatPrice(totalEur)}\n`;
    } else {
      const collarObj = capsule.variants.find(v => v.id === state.capsuleSelection.collar);
      const colorObj = capsule.colorways.find(c => c.id === state.capsuleSelection.colorway);
      message += `\n- Modèle : Chemise Sartoriale Signature (${collarObj ? collarObj.name : 'Col Tulipe'})\n`;
      message += `- Couleur : ${colorObj ? colorObj.name : 'Blanc Céleste'}\n`;
      message += `- Taille de Col : ${state.capsuleSelection.size} EU\n`;
      message += `- Coupe : ${state.capsuleSelection.fit === 'slim' ? 'Coupe Ajustée' : 'Coupe Confort'}\n`;
      message += `- Finition : ${state.capsuleSelection.cuff === 'button' ? 'Poignets Boutonnés' : 'Poignets Mousquetaires'}\n`;
      message += `- Prix : ${formatPrice(capsule.baseEur)}\n`;
    }

    message += `\nMerci de me confirmer la disponibilité et les modalités de livraison express internationale.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/33143878165?text=${encoded}`, '_blank');
  }

  // Event Listeners Setup
  if (currencySelect) {
    currencySelect.value = state.currentCurrency;
    currencySelect.addEventListener('change', (e) => {
      state.currentCurrency = e.target.value;
      localStorage.setItem('jm_currency', state.currentCurrency);
      renderAll();
    });
  }

  if (btnOpenCart) btnOpenCart.addEventListener('click', openCartDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeCartDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeCartDrawer);

  const btnOrderNow = document.getElementById('btnOrderCapsuleNow');
  if (btnOrderNow) {
    btnOrderNow.addEventListener('click', addCapsuleToCart);
  }

  const btnDirectWhatsApp = document.getElementById('btnDirectWhatsApp');
  if (btnDirectWhatsApp) {
    btnDirectWhatsApp.addEventListener('click', dispatchWhatsAppOrder);
  }

  const btnCheckoutDrawer = document.getElementById('btnCheckoutDrawer');
  if (btnCheckoutDrawer) {
    btnCheckoutDrawer.addEventListener('click', openCheckoutModal);
  }

  const btnWhatsAppCheckout = document.getElementById('btnWhatsAppCheckout');
  if (btnWhatsAppCheckout) {
    btnWhatsAppCheckout.addEventListener('click', dispatchWhatsAppOrder);
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeCheckoutModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCheckoutModal);

  // Customizer Collar Buttons
  document.querySelectorAll('.collar-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-collar-id');
      state.capsuleSelection.collar = id;
      renderCapsuleCustomizer();
    });
  });

  // Customizer Colorway Buttons
  document.querySelectorAll('.colorway-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-color-id');
      state.capsuleSelection.colorway = id;
      renderCapsuleCustomizer();
    });
  });

  // Customizer Size Buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sizeVal = e.currentTarget.getAttribute('data-size');
      state.capsuleSelection.size = sizeVal;
      renderCapsuleCustomizer();
    });
  });

  // Customizer Fit Buttons
  document.querySelectorAll('.pill-fit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const fitVal = e.currentTarget.getAttribute('data-fit');
      state.capsuleSelection.fit = fitVal;
      renderCapsuleCustomizer();
    });
  });

  // Customizer Cuff Buttons
  document.querySelectorAll('.pill-cuff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cuffVal = e.currentTarget.getAttribute('data-cuff');
      state.capsuleSelection.cuff = cuffVal;
      renderCapsuleCustomizer();
    });
  });

  // Checkout Form Submission (Simulated Instant Confirmation)
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName').value;
      const email = document.getElementById('clientEmail').value;
      const address = document.getElementById('clientAddress').value;

      alert(`Merci Monsieur ${name}. Votre commande Capsule J.MOSSIS est confirmée. Un récapitulatif détaillé et votre numéro de suivi DHL Express viennent d'être adressés à ${email}.`);
      state.cart = [];
      saveCart();
      updateCartDisplay();
      closeCheckoutModal();
    });
  }

  // Initialize
  initCatalog();
});
