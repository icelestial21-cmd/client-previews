/**
 * DEPARTAMENT BAKU — LUXURY DIGITAL FLAGSHIP CONTROLLER
 * Multi-Currency Engine, Filter Architecture & WhatsApp Dispatch
 */

// Exchange rates relative to AZN (1 AZN base)
const EXCHANGE_RATES = {
  AZN: { rate: 1.0, symbol: '₼', prefix: false, suffix: ' ₼' },
  USD: { rate: 0.588, symbol: '$', prefix: true, suffix: '' },
  EUR: { rate: 0.543, symbol: '€', prefix: true, suffix: '' },
  GBP: { rate: 0.465, symbol: '£', prefix: true, suffix: '' },
  RUB: { rate: 54.20, symbol: '₽', prefix: false, suffix: ' ₽' }
};

let currentCurrency = 'USD';
let activeCategory = 'all';

// Catalog of authentic DEPARTAMENT creations
const PRODUCTS = [
  {
    id: 'dep-01',
    name: 'Baku Aviator Shearling Flight Jacket',
    category: 'leather',
    categoryLabel: 'Leather & Outerwear',
    baseAzn: 680,
    image: 'assets/product_02.jpg',
    specs: 'Heavyweight grain nappa leather, natural merino shearling collar, solid brass hardware.',
    tag: 'Autumn/Winter Drop'
  },
  {
    id: 'dep-02',
    name: 'Caspian Double-Breasted Cashmere Overcoat',
    category: 'overcoats',
    categoryLabel: 'Cashmere Overcoats',
    baseAzn: 520,
    image: 'assets/product_06.jpg',
    specs: '100% Mongolian Cashmere, Italian horn buttons, tailored peak lapel, full cupro lining.',
    tag: 'Flagship Edition'
  },
  {
    id: 'dep-03',
    name: 'Sartorial Italian-Cut Charcoal 3-Piece Suit',
    category: 'suits',
    categoryLabel: 'Bespoke Suiting',
    baseAzn: 590,
    image: 'assets/product_03.jpg',
    specs: 'Super 150s Merino Wool, half-canvas body construction, pick-stitched edges.',
    tag: 'Celebrity Choice'
  },
  {
    id: 'dep-04',
    name: 'Hand-Burnished Oxford Dress Shoes',
    category: 'footwear',
    categoryLabel: 'Artisan Footwear',
    baseAzn: 260,
    image: 'assets/product_04.jpg',
    specs: 'Full-grain Italian calfskin, Goodyear welted leather sole, hand-waxed chiseled toe.',
    tag: 'Made in Baku'
  },
  {
    id: 'dep-05',
    name: 'Executive Slate Flannel Wool Suit',
    category: 'suits',
    categoryLabel: 'Bespoke Suiting',
    baseAzn: 490,
    image: 'assets/product_05.jpg',
    specs: 'Vitale Barberis wool flannel, soft unpadded shoulders, pleated high-rise trousers.',
    tag: 'New Season'
  },
  {
    id: 'dep-06',
    name: 'Espresso Distressed Moto Leather Jacket',
    category: 'leather',
    categoryLabel: 'Leather & Outerwear',
    baseAzn: 580,
    image: 'assets/product_07.jpg',
    specs: 'Hand-waxed oiled lambskin, asymmetric YKK zipper, quilted shoulder reinforcement.',
    tag: 'Limited Run'
  },
  {
    id: 'dep-07',
    name: 'Midnight Navy Velvet Shawl Dinner Jacket',
    category: 'suits',
    categoryLabel: 'Bespoke Suiting',
    baseAzn: 420,
    image: 'assets/product_08.jpg',
    specs: 'Deep royal cotton velvet, black duchess silk-satin shawl lapel, double vented.',
    tag: 'Gala & Evening'
  },
  {
    id: 'dep-08',
    name: 'Cognac Trench Overcoat with Storm Flap',
    category: 'overcoats',
    categoryLabel: 'Cashmere Overcoats',
    baseAzn: 470,
    image: 'assets/product_12.jpg',
    specs: 'Water-resistant gabardine-wool blend, belted waist with horn buckle, gun patch detail.',
    tag: 'Classic Sartorial'
  },
  {
    id: 'dep-09',
    name: 'Handcrafted Chelsea Boots in Cigar Suede',
    category: 'footwear',
    categoryLabel: 'Artisan Footwear',
    baseAzn: 240,
    image: 'assets/product_10.jpg',
    specs: 'Repello water-treated suede, rubber studded all-weather sole, reinforced pull tabs.',
    tag: 'Artisan Craft'
  },
  {
    id: 'dep-10',
    name: 'Double-Breasted Houndstooth Tailored Blazer',
    category: 'suits',
    categoryLabel: 'Bespoke Suiting',
    baseAzn: 390,
    image: 'assets/product_11.jpg',
    specs: 'British houndstooth tweed wool, patch pockets, unstructured European silhouette.',
    tag: 'Autumn/Winter Drop'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initCurrencySelector();
  initFilterTabs();
  renderProducts();
});

function initCurrencySelector() {
  const selector = document.getElementById('currencySelector');
  if (!selector) return;

  selector.value = currentCurrency;
  selector.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    renderProducts();
  });
}

function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category || 'all';
      renderProducts();
    });
  });
}

function formatPrice(baseAzn, currencyKey) {
  const config = EXCHANGE_RATES[currencyKey] || EXCHANGE_RATES.USD;
  const converted = baseAzn * config.rate;
  const rounded = currencyKey === 'RUB' ? Math.round(converted) : Math.round(converted);
  
  if (config.prefix) {
    return `${config.symbol}${rounded.toLocaleString()}`;
  }
  return `${rounded.toLocaleString()}${config.suffix}`;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const filtered = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  grid.innerHTML = filtered.map(p => {
    const mainPrice = formatPrice(p.baseAzn, currentCurrency);
    const aznRef = `${p.baseAzn} ₼ AZN`;
    
    // WhatsApp dispatch payload
    const waText = encodeURIComponent(
      `Hello Muhammad (DEPARTAMENT Baku),%0A%0AI am inquiring about the *${p.name}* (${p.categoryLabel}) from your digital flagship.%0A- Listed Price: ${mainPrice} (${aznRef})%0A- Specification: ${p.specs}%0A%0APlease provide available sizes and 7–10 day worldwide shipping details.`
    );
    const waLink = `https://wa.me/994518642663?text=${waText}`;

    return `
      <div class="product-card" data-category="${p.category}">
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
          <span class="product-badge">${p.tag}</span>
          <span class="product-origin-badge">Baku Atelier</span>
        </div>
        <div class="product-info">
          <div class="product-category-row">
            <span>${p.categoryLabel}</span>
            <span style="color:var(--gold-light);">7-10 Days Global</span>
          </div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-specs">${p.specs}</p>
          <div class="product-meta-row">
            <div class="product-price-block">
              <span class="price-main">${mainPrice}</span>
              ${currentCurrency !== 'AZN' ? `<span class="price-sub">≈ ${aznRef}</span>` : ''}
            </div>
          </div>
          <a href="${waLink}" target="_blank" rel="noopener" class="product-cta-btn">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// Bespoke inquiry modal trigger
function openBespokeModal() {
  const modal = document.getElementById('bespokeModal');
  if (modal) modal.classList.add('active');
}

function closeBespokeModal() {
  const modal = document.getElementById('bespokeModal');
  if (modal) modal.classList.remove('active');
}
