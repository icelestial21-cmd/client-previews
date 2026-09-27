/**
 * MMS CONSTRUCTION SERVICES — JAVASCRIPT CONTROLLER
 * Jamaican Building Estimator, Portfolio Filtering, and WhatsApp Dispatch
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

// State
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
// ESTIMATOR MODULE
// -------------------------------------------------------------
function initEstimator() {
  const sqftSlider = document.getElementById('sqftRange');
  const sqftInput = document.getElementById('sqftInput');
  const parishSelect = document.getElementById('parishSelect');
  const finishSelect = document.getElementById('finishSelect');
  const scopeCards = document.querySelectorAll('.scope-radio-card');

  if (sqftSlider && sqftInput) {
    sqftSlider.addEventListener('input', (e) => {
      sqftInput.value = e.target.value;
      currentSqFt = parseInt(e.target.value, 10);
      const sqftBadge = document.getElementById('sqftBadge');
      if (sqftBadge) sqftBadge.textContent = `${currentSqFt.toLocaleString()} sq ft`;
      calculateEstimate();
    });

    sqftInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val)) val = 500;
      if (val > 10000) val = 10000;
      sqftSlider.value = val;
      currentSqFt = val;
      const sqftBadge = document.getElementById('sqftBadge');
      if (sqftBadge) sqftBadge.textContent = `${currentSqFt.toLocaleString()} sq ft`;
      calculateEstimate();
    });
  }

  if (parishSelect) {
    parishSelect.addEventListener('change', (e) => {
      currentParish = e.target.value;
      calculateEstimate();
    });
  }

  if (finishSelect) {
    finishSelect.addEventListener('change', (e) => {
      currentFinish = e.target.value;
      calculateEstimate();
    });
  }

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
  let jmdDisplay = '';
  if (baseJmd >= 1000000) {
    jmdDisplay = `$${(baseJmd / 1000000).toFixed(2)}M JMD`;
  } else {
    jmdDisplay = `$${Math.round(baseJmd).toLocaleString()} JMD`;
  }

  // Format USD
  const usdDisplay = `≈ $${Math.round(baseUsd).toLocaleString()} USD`;

  // Duration
  const estimatedWeeks = Math.max(2, Math.round((currentSqFt / 1000) * scopeData.timePer1000SqFt));
  const cementBags = Math.round(currentSqFt * scopeData.cementBagsPerSqFt);
  const steelTons = ((currentSqFt / 1000) * scopeData.steelTonsPer1000SqFt).toFixed(1);

  // Update DOM
  const jmdEl = document.getElementById('displayJmdPrice');
  const usdEl = document.getElementById('displayUsdPrice');
  const scopeEl = document.getElementById('displayScopeText');
  const sqftEl = document.getElementById('displaySqftText');
  const parishEl = document.getElementById('displayParishText');
  const timeEl = document.getElementById('displayDurationText');
  const cementEl = document.getElementById('displayCementText');
  const steelEl = document.getElementById('displaySteelText');

  if (jmdEl) jmdEl.textContent = jmdDisplay;
  if (usdEl) usdEl.textContent = usdDisplay;
  if (scopeEl) scopeEl.textContent = scopeData.name;
  if (sqftEl) sqftEl.textContent = `${currentSqFt.toLocaleString()} sq. ft.`;
  if (parishEl) parishEl.textContent = currentParish;
  if (timeEl) timeEl.textContent = `${estimatedWeeks} – ${Math.round(estimatedWeeks * 1.25)} Weeks`;
  if (cementEl) cementEl.textContent = `≈ ${cementBags.toLocaleString()} Bags (Carib/Argos)`;
  if (steelEl) steelEl.textContent = `≈ ${steelTons} Tons High-Tensile Steel`;

  // Update WhatsApp Button Link
  const waBtn = document.getElementById('dispatchWhatsAppBtn');
  if (waBtn) {
    const message = `Hello Marcus (MMS Construction Services),%0A%0AI used your website estimator for a project in *${encodeURIComponent(currentParish)}*:%0A- *Scope:* ${encodeURIComponent(scopeData.name)}%0A- *Size:* ${currentSqFt.toLocaleString()} sq ft%0A- *Finish Tier:* ${currentFinish === 'luxury' ? 'Luxury Architectural' : 'Standard Quality'}%0A- *Estimated Budget:* ${encodeURIComponent(jmdDisplay)} (${encodeURIComponent(usdDisplay)})%0A- *Estimated Timeline:* ${estimatedWeeks} Weeks%0A%0AI would like to schedule a site inspection and detailed bill of quantities.`;
    waBtn.href = `https://wa.me/18765097471?text=${message}`;
  }
}

// -------------------------------------------------------------
// PORTFOLIO FILTER & LIGHTBOX MODULE
// -------------------------------------------------------------
function initPortfolioFilter() {
  const filterPills = document.querySelectorAll('.portfolio-filter-row .filter-pill');
  const cards = document.querySelectorAll('.portfolio-card');

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

// Lightbox Modal
window.openProjectModal = function(title, category, location, imageSrc, description) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  document.getElementById('modalProjectTitle').textContent = title;
  document.getElementById('modalProjectCategory').textContent = `${category} • ${location}`;
  document.getElementById('modalProjectImage').src = imageSrc;
  document.getElementById('modalProjectDesc').textContent = description;

  modal.classList.add('open');
};

window.closeProjectModal = function() {
  const modal = document.getElementById('projectModal');
  if (modal) modal.classList.remove('open');
};

// -------------------------------------------------------------
// MOBILE NAVIGATION MENU
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = '#080C14';
      navLinks.style.padding = '20px 24px';
      navLinks.style.borderBottom = '1px solid var(--border-blue)';
      navLinks.style.gap = '16px';
    });
  }
}
