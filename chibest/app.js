/**
 * CHIBEST ATELIER — Master Application Logic
 * Computer Vision Anthropometric Engine & Luxury Commerce Controller
 */

// State Management
const state = {
  currency: 'USD',
  unit: 'cm', // 'cm' or 'in'
  view: 'front', // 'front' or 'side'
  heightCm: 185,
  build: 'athletic', // 'athletic', 'broad', 'slender'
  garment: 'senator',
  scaleFactor: 0.74, // mm per pixel
  customImage: null
};

// Currency Conversion Rates (Base USD)
const currencyRates = {
  USD: { symbol: '$', rate: 1.0, suffix: 'USD' },
  GBP: { symbol: '£', rate: 0.79, suffix: 'GBP' },
  EUR: { symbol: '€', rate: 0.92, suffix: 'EUR' },
  GHS: { symbol: 'GH₵', rate: 15.0, suffix: 'GHS' }
};

// Base Anatomical Ratios relative to Stature Height (in cm)
const buildModifiers = {
  athletic: {
    neckRatio: 0.222,
    shoulderRatio: 0.268,
    chestRatio: 0.566,
    waistRatio: 0.467,
    hipRatio: 0.552,
    sleeveRatio: 0.358,
    bicepRatio: 0.198,
    wristRatio: 0.098,
    tunicRatio: 0.508,
    wingspanRatio: 0.800,
    agbadaDropRatio: 0.716,
    outseamRatio: 0.584,
    inseamRatio: 0.440,
    thighRatio: 0.314
  },
  broad: {
    neckRatio: 0.235,
    shoulderRatio: 0.285,
    chestRatio: 0.620,
    waistRatio: 0.540,
    hipRatio: 0.595,
    sleeveRatio: 0.358,
    bicepRatio: 0.220,
    wristRatio: 0.105,
    tunicRatio: 0.520,
    wingspanRatio: 0.810,
    agbadaDropRatio: 0.720,
    outseamRatio: 0.580,
    inseamRatio: 0.435,
    thighRatio: 0.345
  },
  slender: {
    neckRatio: 0.210,
    shoulderRatio: 0.252,
    chestRatio: 0.520,
    waistRatio: 0.425,
    hipRatio: 0.515,
    sleeveRatio: 0.355,
    bicepRatio: 0.180,
    wristRatio: 0.092,
    tunicRatio: 0.498,
    wingspanRatio: 0.790,
    agbadaDropRatio: 0.710,
    outseamRatio: 0.588,
    inseamRatio: 0.445,
    thighRatio: 0.285
  }
};

const garmentEaseAllowances = {
  agbada: { label: 'Agbada (+75mm Drape Ease)', easeCm: 7.5 },
  senator: { label: 'The Senator Suit (+28mm Tailored Ease)', easeCm: 2.8 },
  kaftan: { label: 'Grand Kaftan (+40mm Comfort Ease)', easeCm: 4.0 },
  safari: { label: 'Safari Executive (+20mm Military Ease)', easeCm: 2.0 }
};

// DOM References
const canvas = document.getElementById('vision-canvas');
const ctx = canvas.getContext('2d');
const heightSlider = document.getElementById('height-slider');
const heightDisplay = document.getElementById('height-val-display');
const scaleFactorDisplay = document.getElementById('scale-factor-display');
const measurementsGrid = document.getElementById('measurements-grid');
const docketTableBody = document.getElementById('docket-table-body');
const docketSilhouette = document.getElementById('docket-silhouette');
const currencySelect = document.getElementById('currency-select');
const scanLaser = document.getElementById('scan-laser');
const viewFrontBtn = document.getElementById('view-front-btn');
const viewSideBtn = document.getElementById('view-side-btn');
const unitCmBtn = document.getElementById('unit-cm-btn');
const unitInBtn = document.getElementById('unit-in-btn');
const garmentSelect = document.getElementById('garment-type-select');
const generateDocketBtn = document.getElementById('generate-docket-btn');
const dispatchWhatsAppBtn = document.getElementById('dispatch-whatsapp-btn');
const docketWALink = document.getElementById('docket-wa-link');
const printDocketBtn = document.getElementById('print-docket-btn');
const userPhotoInput = document.getElementById('user-photo-input');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

// Initialize Laser Animation
scanLaser.classList.add('scanning');

// Format unit value
function formatUnit(cmVal) {
  if (state.unit === 'in') {
    return (cmVal / 2.54).toFixed(1) + ' in';
  }
  return cmVal.toFixed(1) + ' cm';
}

// Compute All 14 Tailoring Dimensions
function computeMeasurements() {
  const H = state.heightCm;
  const ratios = buildModifiers[state.build];
  const ease = garmentEaseAllowances[state.garment].easeCm;

  return [
    { id: 'M01', name: 'Neck Circumference', cm: H * ratios.neckRatio, ease: '+1.5 cm' },
    { id: 'M02', name: 'Shoulder Width (Acromion)', cm: H * ratios.shoulderRatio, ease: 'Exact Pattern' },
    { id: 'M03', name: 'Chest Circumference', cm: (H * ratios.chestRatio) + ease, ease: `+${ease} cm Ease` },
    { id: 'M04', name: 'Natural Waist', cm: (H * ratios.waistRatio) + (ease * 0.5), ease: `+${(ease * 0.5).toFixed(1)} cm Ease` },
    { id: 'M05', name: 'Hip / Seat Circumference', cm: (H * ratios.hipRatio) + (ease * 0.6), ease: `+${(ease * 0.6).toFixed(1)} cm Ease` },
    { id: 'M06', name: 'Full Sleeve Length', cm: H * ratios.sleeveRatio, ease: 'Exact Pattern' },
    { id: 'M07', name: 'Bicep Circumference', cm: H * ratios.bicepRatio, ease: '+2.0 cm Drape' },
    { id: 'M08', name: 'Wrist Circumference', cm: H * ratios.wristRatio, ease: '+1.5 cm Cuff' },
    { id: 'M09', name: 'Senator Tunic Length', cm: H * ratios.tunicRatio, ease: 'Mid-Thigh Drop' },
    { id: 'M10', name: 'Agbada Wingspan', cm: H * ratios.wingspanRatio, ease: 'Grand Robe Span' },
    { id: 'M11', name: 'Agbada Hem Drop', cm: H * ratios.agbadaDropRatio, ease: 'Ankle Drape' },
    { id: 'M12', name: 'Trouser Outseam', cm: H * ratios.outseamRatio, ease: 'Floor Drop' },
    { id: 'M13', name: 'Trouser Inseam', cm: H * ratios.inseamRatio, ease: 'Crotch Base' },
    { id: 'M14', name: 'Thigh Circumference', cm: H * ratios.thighRatio, ease: '+4.0 cm Ease' }
  ];
}

// Render Measurements Grid in Studio
function renderMeasurementsGrid() {
  const measurements = computeMeasurements();
  measurementsGrid.innerHTML = '';
  docketTableBody.innerHTML = '';

  measurements.forEach(m => {
    // 1. Studio Grid Card
    const card = document.createElement('div');
    card.className = 'measurement-card p-2.5 rounded-lg border border-borderSubtle bg-surfaceLight/60 text-xs flex flex-col justify-between';
    card.innerHTML = `
      <div class="flex items-center justify-between text-gray-400 font-mono text-[10px]">
        <span>${m.id}</span>
        <span class="text-gold-500/80">${m.ease}</span>
      </div>
      <div class="font-medium text-white truncate mt-1 text-[11px]">${m.name}</div>
      <div class="font-mono text-gold-400 font-bold text-sm mt-1.5">${formatUnit(m.cm)}</div>
    `;
    measurementsGrid.appendChild(card);

    // 2. Docket Table Row
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-3 text-white font-medium">${m.name} (${m.id})</td>
      <td class="p-3 text-gold-400 font-bold">${m.cm.toFixed(1)} cm</td>
      <td class="p-3 text-gray-400">${(m.cm / 2.54).toFixed(1)} in</td>
      <td class="p-3 text-emerald-400">${m.ease}</td>
    `;
    docketTableBody.appendChild(row);
  });

  // Update Docket Silhouette Label
  const garmentNames = {
    agbada: 'The Royal Imperial Agbada (3-Piece)',
    senator: 'The Diplomat Senator Suit (2-Piece)',
    kaftan: 'The Sovereign Kaftan Ensemble',
    safari: 'The Executive Safari Ensemble'
  };
  docketSilhouette.textContent = garmentNames[state.garment] || 'The Senator Suit';

  updateWhatsAppLinks(measurements);
}

// Update WhatsApp URLs with Prefilled Docket
function updateWhatsAppLinks(measurements) {
  const orderId = '#CB-2026-9481';
  const garmentNames = {
    agbada: 'The Royal Imperial Agbada',
    senator: 'The Diplomat Senator Suit',
    kaftan: 'The Sovereign Kaftan',
    safari: 'The Executive Safari Ensemble'
  };
  const gName = garmentNames[state.garment];

  let summary = `Hello Chibest Tailor, I have generated my bespoke Tailor Docket (${orderId}) for ${gName}.\n\n`;
  summary += `• Stature Height: ${state.heightCm} cm (${(state.heightCm / 30.48).toFixed(1)} ft)\n`;
  summary += `• Build Archetype: ${state.build.toUpperCase()}\n`;
  summary += `• Chest: ${measurements[2].cm.toFixed(1)} cm\n`;
  summary += `• Shoulder Width: ${measurements[1].cm.toFixed(1)} cm\n`;
  summary += `• Sleeve Length: ${measurements[5].cm.toFixed(1)} cm\n`;
  summary += `• Trouser Outseam: ${measurements[11].cm.toFixed(1)} cm\n`;
  summary += `• Trouser Inseam: ${measurements[12].cm.toFixed(1)} cm\n\n`;
  summary += `Please confirm my production slot in Accra and send the fabric approval swatch video.`;

  const waUrl = `https://wa.me/233554916910?text=${encodeURIComponent(summary)}`;
  dispatchWhatsAppBtn.href = waUrl;
  docketWALink.href = waUrl;
}

// Draw Skeleton Landmarks & Silhouette on HTML5 Canvas
function drawCanvas() {
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // If custom user image is loaded, draw it as background
  if (state.customImage) {
    ctx.drawImage(state.customImage, 0, 0, W, H);
  }

  // Calculate dynamic vertical scaling based on height slider
  const baselineHeight = 185;
  const scale = state.heightCm / baselineHeight;

  // Center coordinates
  const cx = W / 2;
  const cy = H / 2;

  // Key Anatomical Nodes (normalized scaled positions)
  const headY = 90 - (scale - 1) * 35;
  const neckY = 160;
  const shoulderY = 185;
  const chestY = 250;
  const waistY = 320;
  const hipY = 390;
  const crotchY = 430;
  const kneeY = 560 + (scale - 1) * 30;
  const ankleY = 680 + (scale - 1) * 45;
  const heelY = 705 + (scale - 1) * 50;

  // Width modifiers based on build
  let widthMultiplier = 1.0;
  if (state.build === 'broad') widthMultiplier = 1.14;
  if (state.slender === 'slender') widthMultiplier = 0.90;

  if (state.view === 'front') {
    // Coronal Front A-Pose
    const shoulderSpan = 140 * widthMultiplier;
    const elbowSpan = 180 * widthMultiplier;
    const wristSpan = 210 * widthMultiplier;
    const hipSpan = 90 * widthMultiplier;
    const kneeSpan = 60;
    const footSpan = 70;

    // 1. Draw Stylized Aesthetic Silhouette
    ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    // Head oval
    ctx.ellipse(cx, headY, 32, 42, 0, 0, Math.PI * 2);
    // Neck & Torso
    ctx.moveTo(cx - 20, neckY);
    ctx.lineTo(cx - shoulderSpan, shoulderY);
    ctx.lineTo(cx - elbowSpan, 310);
    ctx.lineTo(cx - wristSpan, 420);
    // Return torso
    ctx.moveTo(cx - shoulderSpan + 30, shoulderY + 30);
    ctx.lineTo(cx - hipSpan * 0.9, waistY);
    ctx.lineTo(cx - hipSpan, hipY);
    ctx.lineTo(cx - kneeSpan, kneeY);
    ctx.lineTo(cx - footSpan, ankleY);
    ctx.lineTo(cx, crotchY);
    ctx.lineTo(cx + footSpan, ankleY);
    ctx.lineTo(cx + kneeSpan, kneeY);
    ctx.lineTo(cx + hipSpan, hipY);
    ctx.lineTo(cx + hipSpan * 0.9, waistY);
    ctx.lineTo(cx + shoulderSpan - 30, shoulderY + 30);
    // Right arm
    ctx.moveTo(cx + shoulderSpan, shoulderY);
    ctx.lineTo(cx + elbowSpan, 310);
    ctx.lineTo(cx + wristSpan, 420);
    ctx.stroke();

    // 2. Skeletal Landmark Graph (MediaPipe Topology)
    const landmarks = [
      { name: 'Crown', x: cx, y: headY - 42 },
      { name: 'Nose', x: cx, y: headY },
      { name: 'C7 Neck', x: cx, y: neckY },
      { name: 'L Shoulder', x: cx - shoulderSpan, y: shoulderY },
      { name: 'R Shoulder', x: cx + shoulderSpan, y: shoulderY },
      { name: 'L Elbow', x: cx - elbowSpan, y: 310 },
      { name: 'R Elbow', x: cx + elbowSpan, y: 310 },
      { name: 'L Wrist', x: cx - wristSpan, y: 420 },
      { name: 'R Wrist', x: cx + wristSpan, y: 420 },
      { name: 'Chest Center', x: cx, y: chestY },
      { name: 'Navel', x: cx, y: waistY },
      { name: 'L Hip', x: cx - hipSpan, y: hipY },
      { name: 'R Hip', x: cx + hipSpan, y: hipY },
      { name: 'Perineum', x: cx, y: crotchY },
      { name: 'L Knee', x: cx - kneeSpan, y: kneeY },
      { name: 'R Knee', x: cx + kneeSpan, y: kneeY },
      { name: 'L Ankle', x: cx - footSpan, y: ankleY },
      { name: 'R Ankle', x: cx + footSpan, y: ankleY },
      { name: 'Heel Line', x: cx, y: heelY }
    ];

    // Draw Skeleton Bones
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    const connections = [
      [2, 3], [2, 4], [3, 5], [5, 7], [4, 6], [6, 8], // Arms
      [2, 9], [9, 10], [10, 13], // Spine
      [11, 12], [11, 14], [12, 15], [14, 16], [15, 17] // Legs
    ];
    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x, landmarks[i].y);
      ctx.lineTo(landmarks[j].x, landmarks[j].y);
      ctx.stroke();
    });

    // Draw Caliper Lines
    ctx.strokeStyle = '#D4AF37';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;

    // Shoulder Caliper
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpan, shoulderY - 15);
    ctx.lineTo(cx + shoulderSpan, shoulderY - 15);
    ctx.stroke();

    // Chest Caliper
    ctx.beginPath();
    ctx.moveTo(cx - shoulderSpan * 0.85, chestY);
    ctx.lineTo(cx + shoulderSpan * 0.85, chestY);
    ctx.stroke();

    // Agbada Wingspan Caliper
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx - wristSpan - 20, 200);
    ctx.lineTo(cx + wristSpan + 20, 200);
    ctx.stroke();

    // Outseam Caliper
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
    ctx.beginPath();
    ctx.moveTo(cx + hipSpan + 20, hipY);
    ctx.lineTo(cx + footSpan + 20, ankleY);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // Draw Landmark Nodes
    landmarks.forEach(pt => {
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.stroke();
    });

  } else {
    // Sagittal 90° Profile View
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';

    ctx.beginPath();
    // Head Profile
    ctx.ellipse(cx, headY, 26, 40, 0, 0, Math.PI * 2);
    // Torso Profile (Chest arc, lumbar curve)
    ctx.moveTo(cx, neckY);
    ctx.quadraticCurveTo(cx + 45 * widthMultiplier, chestY, cx + 25, waistY);
    ctx.quadraticCurveTo(cx + 35, hipY, cx + 15, kneeY);
    ctx.lineTo(cx + 10, ankleY);
    ctx.lineTo(cx - 30, ankleY);
    ctx.quadraticCurveTo(cx - 35, kneeY, cx - 45 * widthMultiplier, hipY);
    ctx.quadraticCurveTo(cx - 20, waistY, cx - 25, shoulderY);
    ctx.lineTo(cx, neckY);
    ctx.stroke();

    // Profile Landmarks
    const profileLandmarks = [
      { name: 'Vertex', x: cx, y: headY - 40 },
      { name: 'Nasion', x: cx + 26, y: headY - 5 },
      { name: 'C7 Spine', x: cx - 25, y: neckY },
      { name: 'Sternal Notch', x: cx + 25, y: neckY + 15 },
      { name: 'Chest Prominence', x: cx + 45 * widthMultiplier, y: chestY },
      { name: 'Lumbar Lordosis', x: cx - 20, y: waistY },
      { name: 'Gluteal Apex', x: cx - 45 * widthMultiplier, y: hipY },
      { name: 'Patella (Knee)', x: cx + 15, y: kneeY },
      { name: 'Lateral Malleolus', x: cx, y: ankleY }
    ];

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    profileLandmarks.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    profileLandmarks.forEach(pt => {
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Event Listeners
heightSlider.addEventListener('input', (e) => {
  state.heightCm = parseInt(e.target.value);
  const feet = Math.floor(state.heightCm / 30.48);
  const inches = Math.round((state.heightCm % 30.48) / 2.54);
  heightDisplay.innerHTML = `${state.heightCm} cm <span class="text-gray-500 font-normal">(${feet}' ${inches}")</span>`;

  // Scale factor calculation: 185cm / ~250px torso span
  state.scaleFactor = (state.heightCm / 250).toFixed(2);
  scaleFactorDisplay.textContent = `${state.scaleFactor} mm/px`;

  drawCanvas();
  renderMeasurementsGrid();
});

// Build Archetype Switcher
document.querySelectorAll('.build-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.build-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.build = btn.dataset.build;
    drawCanvas();
    renderMeasurementsGrid();
  });
});

// View Toggle (Front / Profile)
viewFrontBtn.addEventListener('click', () => {
  state.view = 'front';
  viewFrontBtn.className = 'px-3 py-1 rounded bg-gold-500 text-obsidian font-bold transition-all';
  viewSideBtn.className = 'px-3 py-1 rounded text-gray-400 hover:text-white transition-all';
  drawCanvas();
});

viewSideBtn.addEventListener('click', () => {
  state.view = 'side';
  viewSideBtn.className = 'px-3 py-1 rounded bg-gold-500 text-obsidian font-bold transition-all';
  viewFrontBtn.className = 'px-3 py-1 rounded text-gray-400 hover:text-white transition-all';
  drawCanvas();
});

// Unit Toggle
unitCmBtn.addEventListener('click', () => {
  state.unit = 'cm';
  unitCmBtn.className = 'px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 font-bold';
  unitInBtn.className = 'px-2 py-0.5 rounded text-gray-400 hover:text-white';
  renderMeasurementsGrid();
});

unitInBtn.addEventListener('click', () => {
  state.unit = 'in';
  unitInBtn.className = 'px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 font-bold';
  unitCmBtn.className = 'px-2 py-0.5 rounded text-gray-400 hover:text-white';
  renderMeasurementsGrid();
});

// Garment Type Select
garmentSelect.addEventListener('change', (e) => {
  state.garment = e.target.value;
  renderMeasurementsGrid();
});

// Currency Selector
currencySelect.addEventListener('change', (e) => {
  state.currency = e.target.value;
  const config = currencyRates[state.currency];

  document.querySelectorAll('.price-tag').forEach(tag => {
    const rawVal = tag.dataset[state.currency.toLowerCase()];
    if (rawVal) {
      tag.textContent = `${config.symbol}${rawVal} ${config.suffix}`;
    }
  });
});

// Configure Look Buttons in Lookbook
document.querySelectorAll('.configure-look-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const look = btn.dataset.look;
    garmentSelect.value = look;
    state.garment = look;
    renderMeasurementsGrid();
    document.getElementById('vision-studio').scrollIntoView({ behavior: 'smooth' });
  });
});

// User Photo Upload
userPhotoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        state.customImage = img;
        drawCanvas();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Print Docket
printDocketBtn.addEventListener('click', () => {
  window.print();
});

// Generate Docket Button Scroll
generateDocketBtn.addEventListener('click', () => {
  document.getElementById('docket-section').scrollIntoView({ behavior: 'smooth' });
});

// Mobile Menu Toggle
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Initial Boot
drawCanvas();
renderMeasurementsGrid();
