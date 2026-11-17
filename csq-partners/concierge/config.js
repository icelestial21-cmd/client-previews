/* PARTNER CONFIG: copy the /concierge folder, edit these values, publish. */
window.SITE = {
  template: "concierge",
  preview: true,
  tier: 3,                       // 1 Welcome · 2 Signature · 3 VIP Concierge
  tiers: ["Welcome", "Signature", "VIP Concierge"],
  prices: ["JMD 35,000", "JMD 55,000", "JMD 80,000"],

  name: "Arrivée Concierge",     // sample brand
  short: "A",
  tagline: "Arrival, VIP and event-day concierge across the Caribbean.",
  contact: { whatsapp: "+1 876 555 0102", email: "host@example.com", location: "Kingston · Montego Bay · Bridgetown" },

  colors: {
    bg: "#0b0a09", surface: "#131210", "surface-2": "#1b1916", line: "rgba(233,216,180,0.14)",
    text: "#f3ece0", muted: "rgba(243,236,224,0.6)",
    accent: "#c9a96e", "accent-ink": "#141008", "accent-2": "#e9d8b4"
  },
  fonts: { display: "'Cormorant Garamond', Georgia, serif" }
};
