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
    bg: "#04161c", surface: "#08222a", "surface-2": "#0c2c35", line: "rgba(255,255,255,0.1)",
    text: "#f2f7f6", muted: "rgba(242,247,246,0.64)",
    accent: "#2dd4bf", "accent-ink": "#032024", "accent-2": "#fb7185", globe: "#0a3a46"
  },
  fonts: { display: "'Fraunces', Georgia, serif" }
};
