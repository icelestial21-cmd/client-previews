/**
 * CHIBEST HAUTE COUTURE — Global Navigation & State Manager
 * Handles multi-currency persistence, mobile drawer, and cross-page synchronization.
 */

const CHIBEST_CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1.0, suffix: 'USD' },
  GBP: { symbol: '£', rate: 0.79, suffix: 'GBP' },
  EUR: { symbol: '€', rate: 0.92, suffix: 'EUR' },
  GHS: { symbol: 'GH₵', rate: 15.0, suffix: 'GHS' }
};

class ChibestAppManager {
  constructor() {
    this.currency = localStorage.getItem('chibest_currency') || 'USD';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupCurrencySelect();
      this.applyCurrency(this.currency);
      this.setupMobileMenu();
      this.highlightActiveNav();
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }

  setupCurrencySelect() {
    const select = document.getElementById('currency-select');
    if (!select) return;

    select.value = this.currency;
    select.addEventListener('change', (e) => {
      this.currency = e.target.value;
      localStorage.setItem('chibest_currency', this.currency);
      this.applyCurrency(this.currency);
    });
  }

  applyCurrency(curr) {
    const config = CHIBEST_CURRENCY_RATES[curr] || CHIBEST_CURRENCY_RATES.USD;
    document.querySelectorAll('.price-tag').forEach(tag => {
      const val = tag.getAttribute(`data-${curr.toLowerCase()}`);
      if (val) {
        tag.textContent = `${config.symbol}${val} ${config.suffix}`;
      } else {
        const usdVal = parseFloat(tag.getAttribute('data-usd') || '0');
        if (usdVal > 0) {
          const converted = Math.round(usdVal * config.rate);
          tag.textContent = `${config.symbol}${converted.toLocaleString()} ${config.suffix}`;
        }
      }
    });

    const select = document.getElementById('currency-select');
    if (select) select.value = curr;
  }

  setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
      });
    }
  }

  highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a, #mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('text-gold-400', 'font-bold');
        link.classList.remove('text-gray-300');
      }
    });
  }
}

window.chibestManager = new ChibestAppManager();
