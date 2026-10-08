// Atelier Veylora Interactive Client Engine
const CURRENCY_RATES = {
  USD: { rate: 1.0, sym: '$', suffix: 'USD' },
  EUR: { rate: 0.92, sym: '€', suffix: 'EUR' },
  GBP: { rate: 0.79, sym: '£', suffix: 'GBP' },
  CAD: { rate: 1.36, sym: '$', suffix: 'CAD' },
  JMD: { rate: 158.0, sym: '$', suffix: 'JMD' }
};

let currentCurrency = 'USD';
let bagCount = 0;

function updatePrices() {
  const elements = document.querySelectorAll('.product-price');
  const conf = CURRENCY_RATES[currentCurrency] || CURRENCY_RATES.USD;
  
  elements.forEach(el => {
    const baseUsd = parseFloat(el.getAttribute('data-usd')) || 0;
    const converted = Math.round(baseUsd * conf.rate);
    el.textContent = `${conf.sym}${converted.toLocaleString()} ${conf.suffix}`;
  });
}

function addToBag(title, price) {
  bagCount++;
  document.getElementById('bagCount').textContent = bagCount;
  alert(`Added to Private Bag: ${title} (${CURRENCY_RATES[currentCurrency].sym}${Math.round(price * CURRENCY_RATES[currentCurrency].rate)} ${currentCurrency})\n\nProceeding via Whop Merchant of Record Escrow.`);
}

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('currencySelect');
  if (select) {
    select.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updatePrices();
    });
  }

  const bagBtn = document.getElementById('bagBtn');
  if (bagBtn) {
    bagBtn.addEventListener('click', () => {
      if (bagCount === 0) {
        alert('Your Private Atelier Bag is currently empty. Please select a couture piece.');
      } else {
        alert(`Your Private Bag contains ${bagCount} bespoke piece(s). Initializing Whop secure checkout.`);
      }
    });
  }
});
