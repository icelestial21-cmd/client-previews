"use strict";

// Currency engine
const RATES = { EUR: 1, USD: 1.09, GBP: 0.85 };
const SYMBOLS = { EUR: "€", USD: "$", GBP: "£" };
let activeCurrency = "EUR";

function formatPrice(eurValue) {
  const converted = eurValue * RATES[activeCurrency];
  return SYMBOLS[activeCurrency] + converted.toFixed(2);
}

function refreshPrices() {
  document.querySelectorAll("[data-currency-price]").forEach((el) => {
    const eur = parseFloat(el.dataset.priceEur || "0");
    el.textContent = el.classList.contains("price")
      ? (el.textContent.startsWith("From") ? "From " : "") + formatPrice(eur)
      : formatPrice(eur);
  });
}

const currencySelect = document.getElementById("currencySelect");
currencySelect.addEventListener("change", (event) => {
  activeCurrency = event.target.value;
  refreshPrices();
});

// Hero thumbnail switching
const heroImage = document.getElementById("heroImage");
document.querySelectorAll(".thumb").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".thumb").forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");
    heroImage.src = button.dataset.src;
    heroImage.alt = button.dataset.alt;
  });
});

// Countdown timer
const target = Date.now() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000;

function tickCountdown() {
  const remaining = Math.max(0, target - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.getElementById("cdDays").textContent = String(days).padStart(2, "0");
  document.getElementById("cdHours").textContent = String(hours).padStart(2, "0");
  document.getElementById("cdMinutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("cdSeconds").textContent = String(seconds).padStart(2, "0");
}

tickCountdown();
setInterval(tickCountdown, 1000);

// Cart drawer
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
let cart = [];

function openDrawer() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function renderCart() {
  cartItems.innerHTML = "";
  let totalEur = 0;
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.name + " : " + formatPrice(item.priceEur);
    cartItems.appendChild(li);
    totalEur += item.priceEur;
  });
  cartCount.textContent = String(cart.length);
  cartTotal.textContent = formatPrice(totalEur);
}

function addToCart(name, priceEur) {
  cart.push({ name: name, priceEur: priceEur });
  renderCart();
  openDrawer();
}

document.getElementById("cartToggle").addEventListener("click", openDrawer);
document.getElementById("cartClose").addEventListener("click", closeDrawer);

document.querySelectorAll(".card .add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.name, parseFloat(button.dataset.priceEur));
  });
});

// Customizer commission
document.getElementById("customForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const fabric = document.getElementById("fabricSelect");
  const size = document.getElementById("sizeSelect").value;
  const fabricName = fabric.value;
  const fabricExtra = parseFloat(fabric.selectedOptions[0].dataset.eur || "0");
  const baseEur = 2450 + fabricExtra;
  addToCart("Commission: " + fabricName + ", size " + size, baseEur);
});

refreshPrices();
