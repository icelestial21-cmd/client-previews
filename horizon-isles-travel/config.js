/* PARTNER CONFIG: copy the /travel folder, edit these values, publish. */
window.SITE = {
  template: "travel",
  preview: true,
  tier: 3,                       // 1 Boarding Pass · 2 Business Class · 3 First Class
  tiers: ["Boarding Pass", "Business Class", "First Class"],
  prices: ["JMD 35,000", "JMD 55,000", "JMD 80,000"],

  name: "Horizon Isles Travel",  // sample brand
  short: "HI",
  tagline: "Flights, trips and travel services across the Caribbean.",
  contact: { whatsapp: "+1 876 555 0101", email: "bookings@example.com", location: "Montego Bay, Jamaica" },

  colors: {
    bg: "#000000", surface: "#141414", "surface-2": "#1e1e1e", line: "#272727",
    text: "#f8f8f8", muted: "#808080",
    accent: "#8fd3e8",            // used only inside scenes: globe atmosphere and flight routes
    "accent-ink": "#0f0f0f",
    "accent-2": "#ffb37a",        // city markers and sunset light
    globe: "#0b1626"
  },
  fonts: {}
};
