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
    bg: "#040406", surface: "#121317", "surface-2": "#0b0c0e", line: "#1c1d22",
    text: "#ffffff", muted: "#acafb9",
    accent: "#ae9357",            // brushed gold: material highlights, numbers, the 3D passes
    "accent-ink": "#040406",
    "accent-2": "#fff0cc"         // champagne highlight
  },
  fonts: {}
};
