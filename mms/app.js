/**
 * MMS CONSTRUCTION SERVICES : MASTER JAVASCRIPT CONTROLLER
 * Client: Marcus Saunders (Kingston and St. Catherine, Jamaica)
 * Architecture: Hybrid Master Builder Estimator (Spatial Room Modeling + Structural QS Specification)
 *
 * Operational Modules:
 * 1. Dual Mode Estimator (Room-by-Room Spatial Planner and Macro Structural QS Engine)
 * 2. 2026 Jamaican Market Parity Rates (Burrowes & Wallace and Master Builders benchmarks)
 * 3. Real-Time Dual Currency Engine (JMD/USD at 155.0 exchange parity)
 * 4. Elemental Budget Breakdown and Dynamic Progress Visualizer
 * 5. Materials Takeoff Engine (Carib Cement bags, Grade 60 Rebar tonnage, Timelines)
 * 6. Direct WhatsApp Quote Serializer (Marcus Saunders +1 876-509-7471)
 * 7. Portfolio Category Filter (18 Verified Job Site Records)
 * 8. High-Resolution Lightbox Modal with Full-Screen Viewer
 * 9. Mobile Navigation Drawer Controller
 * 10. Direct Project Inquiry Handler
 */

(function () {
  'use strict';

  // Currency Exchange Parity (1 USD = 155.0 JMD)
  const JMD_PER_USD = 155.0;

  // Spatial Mode Base Rates (JMD per sq ft)
  const SPATIAL_RATES = {
    standard: 15000,
    executive: 18500,
    luxury: 22500
  };

  // Structural Mode Base Rates (JMD per sq ft)
  const SCOPE_BASE_RATES = {
    turnkey: {
      rateJmd: 18500,
      label: 'Turnkey Luxury Build',
      cementPerSqFt: 0.45,
      steelPerSqFt: 0.0018,
      ratios: { sub: 0.22, sup: 0.38, fin: 0.24, mep: 0.16 }
    },
    structural_shell: {
      rateJmd: 11800,
      label: 'Structural Grey Shell',
      cementPerSqFt: 0.55,
      steelPerSqFt: 0.0022,
      ratios: { sub: 0.35, sup: 0.55, fin: 0.00, mep: 0.10 }
    },
    belting_decking: {
      rateJmd: 5800,
      label: 'House Belting & Decking Pour',
      cementPerSqFt: 0.30,
      steelPerSqFt: 0.0015,
      ratios: { sub: 0.15, sup: 0.70, fin: 0.00, mep: 0.15 }
    },
    tiling_renovation: {
      rateJmd: 7200,
      label: 'Interior Tiling & Remodel',
      cementPerSqFt: 0.18,
      steelPerSqFt: 0.0003,
      ratios: { sub: 0.00, sup: 0.10, fin: 0.75, mep: 0.15 }
    }
  };

  // Primary Material Benchmark Unit Prices (JMD)
  const MATERIAL_UNIT_RATES = {
    cementBag: 1450,
    steelTon: 185000
  };

  // Load custom rates if saved in Contractor Admin Portal
  try {
    const savedRates = localStorage.getItem('mms_custom_rates');
    if (savedRates) {
      const parsed = JSON.parse(savedRates);
      if (parsed.cementBagRate) MATERIAL_UNIT_RATES.cementBag = Number(parsed.cementBagRate);
      if (parsed.steelTonRate) MATERIAL_UNIT_RATES.steelTon = Number(parsed.steelTonRate);
      if (parsed.spatial) Object.assign(SPATIAL_RATES, parsed.spatial);
      if (parsed.turnkeyRate && SCOPE_BASE_RATES.turnkey) SCOPE_BASE_RATES.turnkey.rateJmd = Number(parsed.turnkeyRate);
      if (parsed.shellRate && SCOPE_BASE_RATES.structural_shell) SCOPE_BASE_RATES.structural_shell.rateJmd = Number(parsed.shellRate);
      if (parsed.deckingRate && SCOPE_BASE_RATES.belting_decking) SCOPE_BASE_RATES.belting_decking.rateJmd = Number(parsed.deckingRate);
      if (parsed.tilingRate && SCOPE_BASE_RATES.tiling_renovation) SCOPE_BASE_RATES.tiling_renovation.rateJmd = Number(parsed.tilingRate);
    }
  } catch (err) {
    console.warn('Could not load custom contractor rates:', err);
  }

  // Structural Multipliers (Geotechnical and Engineering Specification Schema)
  const ROOF_MULTIPLIERS = {
    concrete_slab: 1.00,
    alusteel: 1.02,
    decra: 1.05
  };

  const FLOOR_MULTIPLIERS = {
    '1': 1.00,
    '2': 1.18,
    'split': 1.12
  };

  const SOIL_MULTIPLIERS = {
    loam: 1.00,
    marl_rock: 1.08,
    soft_clay: 1.05
  };

  const PARISH_MULTIPLIERS = {
    'St. Catherine': 1.00,
    'Kingston & St. Andrew': 1.02,
    'Clarendon': 1.03,
    'Manchester': 1.05,
    'St. Ann': 1.05,
    'St. Elizabeth': 1.06,
    'St. Mary': 1.06,
    'Trelawny': 1.07,
    'St. James': 1.08,
    'Westmoreland': 1.10,
    'Hanover': 1.10,
    'St. Thomas': 1.10,
    'Portland': 1.12
  };

  // Logistics Flat Adders (JMD)
  const LOGISTICS_FEES = {
    bushing: 65000,
    treeRemoval: 95000,
    waterTank: 115000
  };

  // Central Application State
  const state = {
    activeMode: 'spatial', // 'spatial' or 'structural'
    activeCurrency: 'JMD', // 'JMD' or 'USD'

    // Spatial Mode Inputs
    spatial: {
      masterBed: { len: 18, wid: 14 },
      masterBath: { len: 10, wid: 8 },
      otherBed: { count: 2, len: 14, wid: 12 },
      otherBath: { count: 1, len: 8, wid: 6 },
      kitchen: { len: 14, wid: 12 },
      living: { len: 20, wid: 16 },
      veranda: { len: 14, wid: 10 },
      tier: 'executive'
    },

    // Structural Mode Inputs
    structural: {
      scope: 'turnkey',
      sqft: 1800,
      roof: 'concrete_slab',
      floors: '1',
      soil: 'loam',
      parish: 'St. Catherine',
      bushing: false,
      treeRemoval: false,
      waterTank: false
    },

    // Calculated Telemetry
    telemetry: {
      totalAreaSqFt: 1800,
      unitRateJmd: 18500,
      totalCostJmd: 33300000,
      totalCostUsd: 214838,
      subCostJmd: 7326000,
      supCostJmd: 12654000,
      finCostJmd: 7992000,
      mepCostJmd: 5328000,
      cementBags: 810,
      rebarTons: 3.24,
      timelineStr: '4 to 6 Mos'
    }
  };

  // Helper: Sanitize Strings for HTML Injection Prevention
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Synchronize Live Prices on Scope and Finish Cards
  function syncCardPriceLabels() {
    const elTurnkey = document.getElementById('scopePriceTurnkey');
    const elShell = document.getElementById('scopePriceShell');
    const elDecking = document.getElementById('scopePriceDecking');
    const elTiling = document.getElementById('scopePriceTiling');

    if (elTurnkey && SCOPE_BASE_RATES.turnkey) {
      elTurnkey.textContent = `$${SCOPE_BASE_RATES.turnkey.rateJmd.toLocaleString()} JMD / sq ft`;
    }
    if (elShell && SCOPE_BASE_RATES.structural_shell) {
      elShell.textContent = `$${SCOPE_BASE_RATES.structural_shell.rateJmd.toLocaleString()} JMD / sq ft`;
    }
    if (elDecking && SCOPE_BASE_RATES.belting_decking) {
      elDecking.textContent = `$${SCOPE_BASE_RATES.belting_decking.rateJmd.toLocaleString()} JMD / sq ft`;
    }
    if (elTiling && SCOPE_BASE_RATES.tiling_renovation) {
      elTiling.textContent = `$${SCOPE_BASE_RATES.tiling_renovation.rateJmd.toLocaleString()} JMD / sq ft`;
    }

    const elStd = document.getElementById('tierRateStandard');
    const elExec = document.getElementById('tierRateExecutive');
    const elLux = document.getElementById('tierRateLuxury');

    if (elStd && SPATIAL_RATES.standard) {
      elStd.textContent = `$${SPATIAL_RATES.standard.toLocaleString()} JMD / sq ft`;
    }
    if (elExec && SPATIAL_RATES.executive) {
      elExec.textContent = `$${SPATIAL_RATES.executive.toLocaleString()} JMD / sq ft`;
    }
    if (elLux && SPATIAL_RATES.luxury) {
      elLux.textContent = `$${SPATIAL_RATES.luxury.toLocaleString()} JMD / sq ft`;
    }
  }

  // Lifecycle Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initModeSwitcher();
    initSpatialControls();
    initStructuralControls();
    initCurrencyToggle();
    initWhatsAppDispatch();
    initPortfolioFilter();
    initMobileMenu();
    initQuickInquiryForm();

    // Sync card price tags and run initial calculation
    syncCardPriceLabels();
    updateEstimator();
  });

  // =========================================================================
  // 1. ESTIMATOR MODE SWITCHER
  // =========================================================================
  function initModeSwitcher() {
    const btnSpatial = document.getElementById('modeSpatialBtn');
    const btnStructural = document.getElementById('modeStructuralBtn');
    const panelSpatial = document.getElementById('spatialModePanel');
    const panelStructural = document.getElementById('structuralModePanel');

    if (!btnSpatial || !btnStructural || !panelSpatial || !panelStructural) return;

    btnSpatial.addEventListener('click', () => {
      btnSpatial.classList.add('active');
      btnSpatial.setAttribute('aria-selected', 'true');
      btnStructural.classList.remove('active');
      btnStructural.setAttribute('aria-selected', 'false');

      panelSpatial.classList.add('active');
      panelStructural.classList.remove('active');

      state.activeMode = 'spatial';
      updateEstimator();
    });

    btnStructural.addEventListener('click', () => {
      btnStructural.classList.add('active');
      btnStructural.setAttribute('aria-selected', 'true');
      btnSpatial.classList.remove('active');
      btnSpatial.setAttribute('aria-selected', 'false');

      panelStructural.classList.add('active');
      panelSpatial.classList.remove('active');

      state.activeMode = 'structural';
      updateEstimator();
    });
  }

  // =========================================================================
  // 2. SPATIAL ROOM BUILDER CONTROLS
  // =========================================================================
  function initSpatialControls() {
    function bindSlider(lenId, lenValId, widId, widValId, badgeId, stateObj) {
      const lenEl = document.getElementById(lenId);
      const lenValEl = document.getElementById(lenValId);
      const widEl = document.getElementById(widId);
      const widValEl = document.getElementById(widValId);
      const badgeEl = document.getElementById(badgeId);

      function refresh() {
        const len = parseInt(lenEl.value, 10);
        const wid = parseInt(widEl.value, 10);
        stateObj.len = len;
        stateObj.wid = wid;
        if (lenValEl) lenValEl.textContent = len;
        if (widValEl) widValEl.textContent = wid;

        const count = stateObj.count !== undefined ? stateObj.count : 1;
        const totalRoomArea = len * wid * count;
        if (badgeEl) badgeEl.textContent = `${totalRoomArea.toLocaleString()} sq ft`;

        updateEstimator();
      }

      if (lenEl) lenEl.addEventListener('input', refresh);
      if (widEl) widEl.addEventListener('input', refresh);
    }

    bindSlider('masterBedLen', 'masterBedLenVal', 'masterBedWid', 'masterBedWidVal', 'masterBedAreaBadge', state.spatial.masterBed);
    bindSlider('masterBathLen', 'masterBathLenVal', 'masterBathWid', 'masterBathWidVal', 'masterBathAreaBadge', state.spatial.masterBath);
    bindSlider('otherBedLen', 'otherBedLenVal', 'otherBedWid', 'otherBedWidVal', 'otherBedAreaBadge', state.spatial.otherBed);
    bindSlider('otherBathLen', 'otherBathLenVal', 'otherBathWid', 'otherBathWidVal', 'otherBathAreaBadge', state.spatial.otherBath);
    bindSlider('kitchenLen', 'kitchenLenVal', 'kitchenWid', 'kitchenWidVal', 'kitchenAreaBadge', state.spatial.kitchen);
    bindSlider('livingLen', 'livingLenVal', 'livingWid', 'livingWidVal', 'livingAreaBadge', state.spatial.living);
    bindSlider('verandaLen', 'verandaLenVal', 'verandaWid', 'verandaWidVal', 'verandaAreaBadge', state.spatial.veranda);

    const counterBtns = document.querySelectorAll('.counter-btn');
    counterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const delta = parseInt(btn.dataset.delta, 10);
        const targetSpan = document.getElementById(targetId);

        if (!targetSpan) return;

        let currentVal = parseInt(targetSpan.textContent, 10);
        currentVal = Math.max(1, Math.min(8, currentVal + delta));
        targetSpan.textContent = currentVal;

        if (targetId === 'otherBedCount') {
          state.spatial.otherBed.count = currentVal;
          const badge = document.getElementById('otherBedAreaBadge');
          if (badge) {
            const area = state.spatial.otherBed.len * state.spatial.otherBed.wid * currentVal;
            badge.textContent = `${area.toLocaleString()} sq ft`;
          }
        } else if (targetId === 'otherBathCount') {
          state.spatial.otherBath.count = currentVal;
          const badge = document.getElementById('otherBathAreaBadge');
          if (badge) {
            const area = state.spatial.otherBath.len * state.spatial.otherBath.wid * currentVal;
            badge.textContent = `${area.toLocaleString()} sq ft`;
          }
        }

        updateEstimator();
      });
    });

    const tierRadios = document.querySelectorAll('input[name="spatialTier"]');
    tierRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          state.spatial.tier = radio.value;
          document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('active'));
          const parentLabel = radio.closest('.tier-card');
          if (parentLabel) parentLabel.classList.add('active');
          updateEstimator();
        }
      });
    });
  }

  // =========================================================================
  // 3. STRUCTURAL & ELEMENTAL QS CONTROLS
  // =========================================================================
  function initStructuralControls() {
    const scopeCards = document.querySelectorAll('.scope-card');
    scopeCards.forEach(card => {
      card.addEventListener('click', () => {
        scopeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.structural.scope = card.dataset.scope;
        updateEstimator();
      });
    });

    const sqftRange = document.getElementById('structuralSqft');
    const sqftInput = document.getElementById('structuralSqftInput');

    if (sqftRange && sqftInput) {
      sqftRange.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        sqftInput.value = val;
        state.structural.sqft = val;
        updateEstimator();
      });

      sqftInput.addEventListener('input', (e) => {
        const raw = e.target.value.trim();
        if (raw === '') return;
        const val = parseInt(raw, 10);
        if (isNaN(val)) return;
        const clamped = Math.min(Math.max(val, 400), 10000);
        sqftRange.value = clamped;
        state.structural.sqft = clamped;
        updateEstimator();
      });

      sqftInput.addEventListener('blur', () => {
        let val = parseInt(sqftInput.value, 10);
        if (isNaN(val) || val < 400) val = 400;
        if (val > 10000) val = 10000;
        sqftInput.value = val;
        sqftRange.value = val;
        state.structural.sqft = val;
        updateEstimator();
      });
    }

    const roofSelect = document.getElementById('roofType');
    const floorsSelect = document.getElementById('buildingFloors');
    const soilSelect = document.getElementById('soilType');
    const parishSelect = document.getElementById('parishSelect');

    if (roofSelect) {
      roofSelect.addEventListener('change', (e) => {
        state.structural.roof = e.target.value;
        updateEstimator();
      });
    }

    if (floorsSelect) {
      floorsSelect.addEventListener('change', (e) => {
        state.structural.floors = e.target.value;
        updateEstimator();
      });
    }

    if (soilSelect) {
      soilSelect.addEventListener('change', (e) => {
        state.structural.soil = e.target.value;
        updateEstimator();
      });
    }

    if (parishSelect) {
      parishSelect.addEventListener('change', (e) => {
        state.structural.parish = e.target.value;
        updateEstimator();
      });
    }

    const checkBushing = document.getElementById('checkBushing');
    const checkTreeRemoval = document.getElementById('checkTreeRemoval');
    const checkWaterTank = document.getElementById('checkWaterTank');

    if (checkBushing) {
      checkBushing.addEventListener('change', (e) => {
        state.structural.bushing = e.target.checked;
        updateEstimator();
      });
    }

    if (checkTreeRemoval) {
      checkTreeRemoval.addEventListener('change', (e) => {
        state.structural.treeRemoval = e.target.checked;
        updateEstimator();
      });
    }

    if (checkWaterTank) {
      checkWaterTank.addEventListener('change', (e) => {
        state.structural.waterTank = e.target.checked;
        updateEstimator();
      });
    }
  }

  // =========================================================================
  // 4. DUAL CURRENCY TOGGLE (JMD / USD @ 155.0)
  // =========================================================================
  function initCurrencyToggle() {
    const currencyBtns = document.querySelectorAll('.currency-btn');
    currencyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currencyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCurrency = btn.dataset.curr || btn.dataset.currency || 'JMD';
        renderDisplayTelemetry();
      });
    });
  }

  // =========================================================================
  // 5. HYBRID ESTIMATION ENGINE
  // =========================================================================
  function updateEstimator() {
    let measuredArea = 0;
    let totalCostJmd = 0;
    let effectiveUnitRateJmd = 0;
    let elementalRatios = { sub: 0.22, sup: 0.38, fin: 0.24, mep: 0.16 };
    let cementFactor = 0.45;
    let steelFactor = 0.0018;

    const parishSelect = document.getElementById('parishSelect');
    const activeParish = parishSelect ? parishSelect.value : 'St. Catherine';
    const parishMult = PARISH_MULTIPLIERS[activeParish] || 1.00;

    if (state.activeMode === 'spatial') {
      const sp = state.spatial;
      const masterBedArea = sp.masterBed.len * sp.masterBed.wid;
      const masterBathArea = sp.masterBath.len * sp.masterBath.wid;
      const otherBedArea = sp.otherBed.len * sp.otherBed.wid * sp.otherBed.count;
      const otherBathArea = sp.otherBath.len * sp.otherBath.wid * sp.otherBath.count;
      const kitchenArea = sp.kitchen.len * sp.kitchen.wid;
      const livingArea = sp.living.len * sp.living.wid;
      const verandaArea = sp.veranda.len * sp.veranda.wid;

      // Interior living spaces
      const interiorRoomsSubtotal = masterBedArea + masterBathArea + otherBedArea + otherBathArea + kitchenArea + livingArea;
      const circulationAllowance = Math.round(interiorRoomsSubtotal * 0.05);
      const grossInteriorArea = interiorRoomsSubtotal + circulationAllowance;

      // Measured gross area includes full covered veranda footprint
      measuredArea = grossInteriorArea + verandaArea;

      // Effective cost area applies 50% finish/fitout weighting to outdoor covered veranda
      const effectiveCostArea = grossInteriorArea + Math.round(verandaArea * 0.50);

      const baseRate = SPATIAL_RATES[sp.tier] || SPATIAL_RATES.executive;
      effectiveUnitRateJmd = Math.round(baseRate * parishMult);
      totalCostJmd = Math.round(effectiveCostArea * effectiveUnitRateJmd);

      elementalRatios = { sub: 0.22, sup: 0.38, fin: 0.24, mep: 0.16 };
      cementFactor = 0.45;
      steelFactor = 0.0018;

    } else {
      const st = state.structural;
      measuredArea = st.sqft;

      const scopeData = SCOPE_BASE_RATES[st.scope] || SCOPE_BASE_RATES.turnkey;
      const roofMult = ROOF_MULTIPLIERS[st.roof] || 1.00;
      const floorMult = FLOOR_MULTIPLIERS[st.floors] || 1.00;
      const soilMult = SOIL_MULTIPLIERS[st.soil] || 1.00;

      const combinedMult = roofMult * floorMult * soilMult * parishMult;
      const baseAreaCost = measuredArea * scopeData.rateJmd * combinedMult;

      let logisticsTotal = 0;
      if (st.bushing) logisticsTotal += LOGISTICS_FEES.bushing;
      if (st.treeRemoval) logisticsTotal += LOGISTICS_FEES.treeRemoval;
      if (st.waterTank) logisticsTotal += LOGISTICS_FEES.waterTank;

      totalCostJmd = Math.round(baseAreaCost + logisticsTotal);
      effectiveUnitRateJmd = Math.round(totalCostJmd / measuredArea);

      elementalRatios = scopeData.ratios;
      cementFactor = scopeData.cementPerSqFt;
      steelFactor = scopeData.steelPerSqFt;
    }

    const cementBags = Math.round(measuredArea * cementFactor);
    const rebarTons = parseFloat((measuredArea * steelFactor).toFixed(2));
    const timelineStr = calculateDuration(measuredArea, state.activeMode, state.structural.scope);

    const cementCostJmd = Math.round(cementBags * MATERIAL_UNIT_RATES.cementBag);
    const rebarCostJmd = Math.round(rebarTons * MATERIAL_UNIT_RATES.steelTon);

    const subCost = Math.round(totalCostJmd * elementalRatios.sub);
    const supCost = Math.round(totalCostJmd * elementalRatios.sup);
    const finCost = Math.round(totalCostJmd * elementalRatios.fin);
    const mepCost = Math.round(totalCostJmd * elementalRatios.mep);

    state.telemetry = {
      totalAreaSqFt: measuredArea,
      unitRateJmd: effectiveUnitRateJmd,
      totalCostJmd: totalCostJmd,
      totalCostUsd: Math.round(totalCostJmd / JMD_PER_USD),
      subCostJmd: subCost,
      supCostJmd: supCost,
      finCostJmd: finCost,
      mepCostJmd: mepCost,
      cementBags: cementBags,
      cementCostJmd: cementCostJmd,
      cementBagRate: MATERIAL_UNIT_RATES.cementBag,
      rebarTons: rebarTons,
      rebarCostJmd: rebarCostJmd,
      steelTonRate: MATERIAL_UNIT_RATES.steelTon,
      timelineStr: timelineStr,
      ratios: elementalRatios
    };

    renderDisplayTelemetry();
  }

  function calculateDuration(area, mode, scope) {
    if (mode === 'structural') {
      if (scope === 'belting_decking') {
        if (area <= 1500) return '3 to 4 Weeks';
        if (area <= 3000) return '4 to 6 Weeks';
        return '6 to 8 Weeks';
      }
      if (scope === 'tiling_renovation') {
        if (area <= 1200) return '3 to 5 Weeks';
        if (area <= 2500) return '5 to 8 Weeks';
        return '8 to 12 Weeks';
      }
      if (scope === 'structural_shell') {
        if (area <= 1500) return '2 to 3 Mos';
        if (area <= 3000) return '3 to 5 Mos';
        return '5 to 7 Mos';
      }
    }

    if (area <= 1000) return '3 to 4 Mos';
    if (area <= 2200) return '4 to 6 Mos';
    if (area <= 3800) return '6 to 9 Mos';
    return '9 to 14 Mos';
  }

  function formatCompact(val, curr) {
    if (curr === 'JMD') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      }
      return `$${Math.round(val / 1000)}k`;
    } else {
      if (val >= 1000000) {
        return `US$${(val / 1000000).toFixed(2)}M`;
      }
      if (val >= 1000) {
        return `US$${(val / 1000).toFixed(1)}k`;
      }
      return `US$${Math.round(val)}`;
    }
  }

  // =========================================================================
  // 6. RENDER TELEMETRY
  // =========================================================================
  function renderDisplayTelemetry() {
    const t = state.telemetry;
    const isUsd = state.activeCurrency === 'USD';

    const elCost = document.getElementById('displayTotalCost');
    const elCode = document.getElementById('displayCurrencyCode');
    const elSymbol = document.getElementById('displayCurrencySymbol');
    const elUnitRate = document.getElementById('displayUnitRate');
    const elUnitSuffix = document.getElementById('displayUnitSuffix');
    const elTotalArea = document.getElementById('displayTotalArea');

    if (elCost) {
      const displayAmount = isUsd ? t.totalCostUsd : t.totalCostJmd;
      elCost.textContent = displayAmount.toLocaleString();
    }
    if (elSymbol) elSymbol.textContent = isUsd ? 'US$' : '$';
    if (elCode) elCode.textContent = isUsd ? 'USD' : 'JMD';
    if (elTotalArea) elTotalArea.textContent = `${t.totalAreaSqFt.toLocaleString()} sq ft`;

    if (elUnitRate) {
      const unitVal = isUsd ? Math.round(t.unitRateJmd / JMD_PER_USD) : t.unitRateJmd;
      elUnitRate.textContent = `${isUsd ? 'US$' : '$'}${unitVal.toLocaleString()}`;
    }
    if (elUnitSuffix) {
      elUnitSuffix.textContent = isUsd ? 'USD / sq ft' : 'JMD / sq ft';
    }

    const ratios = t.ratios || { sub: 0.22, sup: 0.38, fin: 0.24, mep: 0.16 };
    const barSub = document.getElementById('barSub');
    const barSup = document.getElementById('barSup');
    const barFin = document.getElementById('barFin');
    const barMep = document.getElementById('barMep');

    const subPct = Math.round(ratios.sub * 100);
    const supPct = Math.round(ratios.sup * 100);
    const finPct = Math.round(ratios.fin * 100);
    const mepPct = Math.round(ratios.mep * 100);

    if (barSub) {
      barSub.style.width = `${subPct}%`;
      barSub.title = `Substructure (${subPct}%)`;
    }
    if (barSup) {
      barSup.style.width = `${supPct}%`;
      barSup.title = `Superstructure (${supPct}%)`;
    }
    if (barFin) {
      barFin.style.width = `${finPct}%`;
      barFin.title = `Finishes & Tile (${finPct}%)`;
    }
    if (barMep) {
      barMep.style.width = `${mepPct}%`;
      barMep.title = `MEP Services (${mepPct}%)`;
    }

    const legSub = document.getElementById('legSub');
    const legSup = document.getElementById('legSup');
    const legFin = document.getElementById('legFin');
    const legMep = document.getElementById('legMep');

    const subVal = isUsd ? Math.round(t.subCostJmd / JMD_PER_USD) : t.subCostJmd;
    const supVal = isUsd ? Math.round(t.supCostJmd / JMD_PER_USD) : t.supCostJmd;
    const finVal = isUsd ? Math.round(t.finCostJmd / JMD_PER_USD) : t.finCostJmd;
    const mepVal = isUsd ? Math.round(t.mepCostJmd / JMD_PER_USD) : t.mepCostJmd;

    if (legSub) legSub.textContent = formatCompact(subVal, state.activeCurrency);
    if (legSup) legSup.textContent = formatCompact(supVal, state.activeCurrency);
    if (legFin) legFin.textContent = formatCompact(finVal, state.activeCurrency);
    if (legMep) legMep.textContent = formatCompact(mepVal, state.activeCurrency);

    const elCement = document.getElementById('takeoffCement');
    const elSteel = document.getElementById('takeoffSteel');
    const elTimeline = document.getElementById('takeoffTimeline');
    const elCementSub = document.getElementById('takeoffCementSub');
    const elSteelSub = document.getElementById('takeoffSteelSub');

    if (elCement) elCement.textContent = `${t.cementBags.toLocaleString()} Bags`;
    if (elSteel) elSteel.textContent = `${t.rebarTons} Tons`;
    if (elTimeline) elTimeline.textContent = t.timelineStr;

    if (elCementSub) {
      const cementCostDisplay = isUsd ? Math.round(t.cementCostJmd / JMD_PER_USD) : t.cementCostJmd;
      const bagRateDisplay = isUsd ? `US$${(MATERIAL_UNIT_RATES.cementBag / JMD_PER_USD).toFixed(2)}` : `$${MATERIAL_UNIT_RATES.cementBag.toLocaleString()} JMD`;
      elCementSub.textContent = `Carib Cement @ ${bagRateDisplay}/bag (~${formatCompact(cementCostDisplay, state.activeCurrency)})`;
    }
    if (elSteelSub) {
      const steelCostDisplay = isUsd ? Math.round(t.rebarCostJmd / JMD_PER_USD) : t.rebarCostJmd;
      const steelRateDisplay = isUsd ? `US$${Math.round(MATERIAL_UNIT_RATES.steelTon / JMD_PER_USD).toLocaleString()}` : `$${Math.round(MATERIAL_UNIT_RATES.steelTon / 1000)}k JMD`;
      elSteelSub.textContent = `Grade 60 @ ${steelRateDisplay}/ton (~${formatCompact(steelCostDisplay, state.activeCurrency)})`;
    }
  }

  // =========================================================================
  // 7. DIRECT WHATSAPP ESTIMATE DISPATCH
  // =========================================================================
  function initWhatsAppDispatch() {
    const btnDispatch = document.getElementById('dispatchWhatsAppBtn');
    if (!btnDispatch) return;

    btnDispatch.addEventListener('click', (e) => {
      e.preventDefault();
      const t = state.telemetry;
      const isSpatial = state.activeMode === 'spatial';

      const parishSelect = document.getElementById('parishSelect');
      const parishName = parishSelect ? parishSelect.value : 'St. Catherine';
      const districtInput = document.getElementById('districtInput');
      const districtName = districtInput && districtInput.value.trim() ? districtInput.value.trim() : '';
      const readinessSelect = document.getElementById('readinessSelect');
      const readinessStage = readinessSelect && readinessSelect.value ? readinessSelect.value : '';

      if (!districtName) {
        alert('Please specify your town or community location so Marcus can calculate exact quarry and haulage logistics.');
        if (districtInput) districtInput.focus();
        return;
      }

      if (!readinessStage) {
        alert('Please select your project build readiness stage so Marcus can prioritize your site review.');
        if (readinessSelect) readinessSelect.focus();
        return;
      }

      let specSummary = '';
      if (isSpatial) {
        const tierName = state.spatial.tier.charAt(0).toUpperCase() + state.spatial.tier.slice(1);
        specSummary = `Spatial Room Builder (${tierName} Grade Spec)`;
      } else {
        const scopeObj = SCOPE_BASE_RATES[state.structural.scope] || SCOPE_BASE_RATES.turnkey;
        specSummary = `Structural QS Package (${scopeObj.label})`;
      }

      const costJmdFormatted = `$${t.totalCostJmd.toLocaleString()} JMD`;
      const costUsdFormatted = `US$${t.totalCostUsd.toLocaleString()} USD`;

      const lines = [
        `Hello Marcus (MMS Construction Services),`,
        ``,
        `I generated a detailed building cost estimate on your official website:`,
        `* Specification: ${specSummary}`,
        `* Measured Floor Area: ${t.totalAreaSqFt.toLocaleString()} sq ft`,
        `* Site Location: ${districtName}, ${parishName}`,
        `* Build Readiness Stage: ${readinessStage}`,
        `* Projected Budget: ${costJmdFormatted} (approx. ${costUsdFormatted})`,
        `* Unit Rate Benchmark: $${t.unitRateJmd.toLocaleString()} JMD / sq ft`,
        ``,
        `Estimated Elemental Breakdown:`,
        `* Substructure: $${t.subCostJmd.toLocaleString()} JMD`,
        `* Superstructure & Frame: $${t.supCostJmd.toLocaleString()} JMD`,
        `* Finishes & Tiling: $${t.finCostJmd.toLocaleString()} JMD`,
        `* MEP Services: $${t.mepCostJmd.toLocaleString()} JMD`,
        ``,
        `Estimated Primary Materials:`,
        `* Carib Cement: approx. ${t.cementBags.toLocaleString()} Bags (~$${t.cementCostJmd.toLocaleString()} JMD @ $${t.cementBagRate.toLocaleString()}/bag)`,
        `* Grade 60 Rebar: approx. ${t.rebarTons} Tons (~$${t.rebarCostJmd.toLocaleString()} JMD @ $${t.steelTonRate.toLocaleString()}/ton)`,
        `* Projected Duration: ${t.timelineStr}`,
        ``,
        `*Note: Baseline model for level terrain. Please let me know your availability for an on-site survey and formal bill of quantities review.*`
      ];

      const fullMessage = lines.join('\n');
      const waUrl = `https://wa.me/18765097471?text=${encodeURIComponent(fullMessage)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // =========================================================================
  // 8. PORTFOLIO FILTER MODULE (18 JOB SITES)
  // =========================================================================
  function initPortfolioFilter() {
    // Render custom portfolio items from Contractor Admin Portal
    try {
      const savedPortfolio = localStorage.getItem('mms_custom_portfolio');
      if (savedPortfolio) {
        const items = JSON.parse(savedPortfolio);
        const grid = document.querySelector('.portfolio-grid');
        if (grid && Array.isArray(items)) {
          items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'portfolio-item-card';
            card.dataset.category = item.category || 'residential';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for project ${escapeHtml(item.title)}`);

            const safeTitle = escapeHtml(item.title);
            const safeCategory = escapeHtml(item.categoryLabel || item.category);
            const safeLocation = escapeHtml(item.location);
            const safeTimeline = escapeHtml(item.timeline || 'Verified Completion');
            const safeDesc = escapeHtml(item.description);
            const safeImg = item.imageSrc || 'assets/project_deck_screed.jpg';

            card.onclick = () => window.openLightbox(item.title, item.categoryLabel || item.category, item.location, item.imageSrc, item.description);
            card.onkeydown = (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
              }
            };

            card.innerHTML = `
              <div class="portfolio-thumb-wrap">
                <img src="${safeImg}" alt="${safeTitle}" loading="lazy" style="width: 100%; height: 240px; object-fit: cover;">
                <span class="portfolio-badge">${safeCategory}</span>
              </div>
              <div class="portfolio-info">
                <h4>${safeTitle}</h4>
                <p>${safeDesc}</p>
                <div class="portfolio-meta">
                  <span>📍 ${safeLocation}</span>
                  <span>${safeTimeline}</span>
                </div>
              </div>
            `;
            grid.insertBefore(card, grid.firstChild);
          });
        }
      }
    } catch (e) {
      console.warn('Could not load custom portfolio items:', e);
    }

    const filterPills = document.querySelectorAll('.portfolio-filter-bar .filter-pill');
    const cards = document.querySelectorAll('.portfolio-item-card');

    cards.forEach(card => {
      if (!card.hasAttribute('tabindex')) {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      }
    });

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

  // =========================================================================
  // 9. LIGHTBOX MODAL CONTROLLER
  // =========================================================================
  let lastFocusedElement = null;

  window.openLightbox = function(title, category, location, imageSrc, description) {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;

    lastFocusedElement = document.activeElement;

    const titleEl = document.getElementById('lightboxTitle');
    const categoryEl = document.getElementById('lightboxCategory');
    const imageEl = document.getElementById('lightboxImage');
    const descEl = document.getElementById('lightboxDesc');

    if (titleEl) titleEl.textContent = title;
    if (categoryEl) categoryEl.textContent = `${category} : ${location}`;
    if (imageEl) {
      imageEl.src = imageSrc || 'assets/project_deck_screed.jpg';
      imageEl.alt = title;
    }
    if (descEl) descEl.textContent = description;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.lightbox-close-btn');
    if (closeBtn) closeBtn.focus();
  };

  window.closeLightbox = function() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeLightbox();
    }
  });

  // =========================================================================
  // 10. MOBILE NAVIGATION DRAWER
  // =========================================================================
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      const navLinks = navMenu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // =========================================================================
  // 11. QUICK INQUIRY DISPATCH
  // =========================================================================
  function initQuickInquiryForm() {
    const form = document.getElementById('contactQuickForm') || document.querySelector('.contact-form-card form');
    if (!form) return;

    window.handleQuickInquiry = function(e) {
      if (e && e.preventDefault) e.preventDefault();

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
        if (!name && nameInput) nameInput.focus();
        else if (!phone && phoneInput) phoneInput.focus();
        return;
      }

      const message = `Hello Marcus (MMS Construction Services),\n\nMy name is ${name} (${phone}).\n* Project Scope: ${scope}\n* Details & Location: ${details || 'Not specified'}\n\nPlease contact me to schedule a site consultation.`;
      window.open(`https://wa.me/18765097471?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    };

    form.addEventListener('submit', window.handleQuickInquiry);
  }

})();
