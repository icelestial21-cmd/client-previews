/**
 * MMS CONSTRUCTION SERVICES : JAVASCRIPT CONTROLLER
 * Client: Marcus Saunders (Kingston & St. Catherine, Jamaica)
 * Functionality: Jamaican Building Cost Estimator V2, Dual Currency Engine,
 * Portfolio Filter, Lightbox Modal, Mobile Navigation, and WhatsApp Dispatch
 * Note: Strictly non-midnight engineer, no em dashes anywhere.
 */

// Exchange rate approximate: 1 USD = 155 JMD
const USD_JMD_RATE = 155;

// Base rates per square foot in JMD
const SCOPE_RATES = {
  belting_decking: {
    rateJmd: 5800,
    name: 'House Belting & Suspended Decking Slab',
    timePer1000SqFt: 3, // weeks
    cementBagsPerSqFt: 0.45,
    steelTonsPer1000SqFt: 1.8
  },
  structural: {
    rateJmd: 9800,
    name: 'Foundation to Belt Beam (Walls & Rebar)',
    timePer1000SqFt: 6,
    cementBagsPerSqFt: 0.85,
    steelTonsPer1000SqFt: 2.6
  },
  turnkey: {
    rateJmd: 18500,
    name: 'Complete Turnkey Construction (Foundation to Finish)',
    timePer1000SqFt: 12,
    cementBagsPerSqFt: 1.4,
    steelTonsPer1000SqFt: 3.5
  },
  renovation: {
    rateJmd: 7200,
    name: 'Interior Renovation, Tiling & Structural Remodel',
    timePer1000SqFt: 4,
    cementBagsPerSqFt: 0.35,
    steelTonsPer1000SqFt: 0.8
  },
  roofing: {
    rateJmd: 3900,
    name: 'Roof Slab Screeding, Waterproofing & Resurfacing',
    timePer1000SqFt: 2.5,
    cementBagsPerSqFt: 0.3,
    steelTonsPer1000SqFt: 0.2
  }
};

const FINISH_MULTIPLIERS = {
  standard: 1.0,
  luxury: 1.35
};

// Estimator State
let currentCurrency = 'JMD';
let currentScope = 'belting_decking';
let currentSqFt = 1500;
let currentParish = 'St. Catherine';
let currentFinish = 'luxury';

document.addEventListener('DOMContentLoaded', () => {
  initEstimator();
  initPortfolioFilter();
  initMobileMenu();
  calculateEstimate();
});

// -------------------------------------------------------------
// ESTIMATOR MODULE V2
// -------------------------------------------------------------
function initEstimator() {
  const sqftSlider = document.getElementById('sqftRange');
  const sqftInput = document.getElementById('sqftInput');
  const parishSelect = document.getElementById('parishSelect');
  const finishSelect = document.getElementById('finishSelect');
  const scopeCards = document.querySelectorAll('.scope-card');
  const currencyBtns = document.querySelectorAll('.currency-btn');

  // Currency Toggle
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCurrency = btn.dataset.currency;
      calculateEstimate();
    });
  });

  // Slider & Number Input Sync
  if (sqftSlider && sqftInput) {
    sqftSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      sqftInput.value = val;
      currentSqFt = val;
      const sqftBadge = document.getElementById('sqftBadge');
      if (sqftBadge) sqftBadge.textContent = `${currentSqFt.toLocaleString()} sq ft`;
      calculateEstimate();
    });

    sqftInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 300;
      if (val > 25000) val = 25000;
      if (val <= 10000) {
        sqftSlider.value = val;
      }
      currentSqFt = val;
      const sqftBadge = document.getElementById('sqftBadge');
      if (sqftBadge) sqftBadge.textContent = `${currentSqFt.toLocaleString()} sq ft`;
      calculateEstimate();
    });
  }

  // Parish Dropdown
  if (parishSelect) {
    parishSelect.addEventListener('change', (e) => {
      currentParish = e.target.value;
      calculateEstimate();
    });
  }

  // Finish Tier
  if (finishSelect) {
    finishSelect.addEventListener('change', (e) => {
      currentFinish = e.target.value;
      calculateEstimate();
    });
  }

  // Scope Selection Radio Cards
  scopeCards.forEach(card => {
    card.addEventListener('click', () => {
      scopeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentScope = card.dataset.scope;
      calculateEstimate();
    });
  });
}

function calculateEstimate() {
  const scopeData = SCOPE_RATES[currentScope] || SCOPE_RATES.belting_decking;
  const finishMult = FINISH_MULTIPLIERS[currentFinish] || 1.0;

  const baseJmd = currentSqFt * scopeData.rateJmd * finishMult;
  const baseUsd = baseJmd / USD_JMD_RATE;

  // Format JMD
  let jmdFormatted = '';
  if (baseJmd >= 1000000) {
    jmdFormatted = `$${(baseJmd / 1000000).toFixed(2)}M JMD`;
  } else {
    jmdFormatted = `$${Math.round(baseJmd).toLocaleString()} JMD`;
  }

  // Format USD
  const usdFormatted = `$${Math.round(baseUsd).toLocaleString()} USD`;

  // Material & Time Estimates
  const estimatedWeeks = Math.max(2, Math.round((currentSqFt / 1000) * scopeData.timePer1000SqFt));
  const maxWeeks = Math.round(estimatedWeeks * 1.25);
  const cementBags = Math.round(currentSqFt * scopeData.cementBagsPerSqFt);
  const steelTons = ((currentSqFt / 1000) * scopeData.steelTonsPer1000SqFt).toFixed(1);

  // Update DOM Elements
  const jmdEl = document.getElementById('displayJmdPrice');
  const usdEl = document.getElementById('displayUsdPrice');
  const scopeEl = document.getElementById('displayScopeText');
  const sqftEl = document.getElementById('displaySqftText');
  const parishEl = document.getElementById('displayParishText');
  const timeEl = document.getElementById('displayDurationText');
  const cementEl = document.getElementById('displayCementText');
  const steelEl = document.getElementById('displaySteelText');

  if (currentCurrency === 'JMD') {
    if (jmdEl) jmdEl.textContent = jmdFormatted;
    if (usdEl) usdEl.textContent = `≈ ${usdFormatted}`;
  } else {
    if (jmdEl) jmdEl.textContent = usdFormatted;
    if (usdEl) usdEl.textContent = `≈ ${jmdFormatted}`;
  }

  if (scopeEl) scopeEl.textContent = scopeData.name;
  if (sqftEl) sqftEl.textContent = `${currentSqFt.toLocaleString()} sq. ft.`;
  if (parishEl) parishEl.textContent = currentParish;
  if (timeEl) timeEl.textContent = `${estimatedWeeks} to ${maxWeeks} Weeks`;
  if (cementEl) cementEl.textContent = `≈ ${cementBags.toLocaleString()} Bags (Carib/Argos)`;
  if (steelEl) steelEl.textContent = `≈ ${steelTons} Tons High-Tensile Steel`;

  // Pre-fill WhatsApp Dispatch Link
  const waBtn = document.getElementById('dispatchWhatsAppBtn');
  if (waBtn) {
    const tierName = currentFinish === 'luxury' ? 'Luxury Architectural' : 'Standard Residential';
    const message = `Hello Marcus (MMS Construction Services),\n\nI generated an estimate on your website for a project in ${currentParish}:\n* Scope: ${scopeData.name}\n* Floor Area: ${currentSqFt.toLocaleString()} sq ft\n* Specification Tier: ${tierName}\n* Estimated Budget: ${jmdFormatted} (${usdFormatted})\n* Estimated Timeline: ${estimatedWeeks} to ${maxWeeks} Weeks\n* Estimated Materials: ≈ ${cementBags.toLocaleString()} Cement Bags / ≈ ${steelTons} Tons Rebar\n\nPlease let me know when we can arrange a site inspection and bill of quantities.`;
    waBtn.href = `https://wa.me/18765097471?text=${encodeURIComponent(message)}`;
  }
}

// -------------------------------------------------------------
// PORTFOLIO FILTER MODULE
// -------------------------------------------------------------
function initPortfolioFilter() {
  const filterPills = document.querySelectorAll('.portfolio-filter-bar .filter-pill');
  const cards = document.querySelectorAll('.portfolio-item-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// -------------------------------------------------------------
// LIGHTBOX MODAL
// -------------------------------------------------------------
window.openLightbox = function(title, category, location, imageSrc, description) {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  const titleEl = document.getElementById('lightboxTitle');
  const categoryEl = document.getElementById('lightboxCategory');
  const imageEl = document.getElementById('lightboxImage');
  const descEl = document.getElementById('lightboxDesc');

  if (titleEl) titleEl.textContent = title;
  if (categoryEl) categoryEl.textContent = `${category} : ${location}`;
  if (imageEl) {
    imageEl.src = imageSrc;
    imageEl.alt = title;
  }
  if (descEl) descEl.textContent = description;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeLightbox();
  }
});

// -------------------------------------------------------------
// MOBILE NAVIGATION MENU
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

// -------------------------------------------------------------
// FAST INQUIRY DISPATCH HANDLER
// -------------------------------------------------------------
window.handleQuickInquiry = function() {
  const nameInput = document.getElementById('inquiryName');
  const phoneInput = document.getElementById('inquiryPhone');
  const scopeInput = document.getElementById('inquiryScope');
  const detailsInput = document.getElementById('inquiryDetails');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const scope = scopeInput ? scopeInput.value : '';
  const details = detailsInput ? detailsInput.value.trim() : '';

  if (!name || !phone) {
    alert('Please provide your name and contact phone number.');
    return;
  }

  const message = `Hello Marcus (MMS Construction Services),\n\nMy name is ${name} (${phone}).\n* Project Scope: ${scope}\n* Details & Location: ${details || 'Not specified'}\n\nPlease contact me to schedule a site consultation.`;
  window.open(`https://wa.me/18765097471?text=${encodeURIComponent(message)}`, '_blank');
};
