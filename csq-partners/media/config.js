/* ============================================================
   PARTNER CONFIG: the only file to change for a new media partner.
   Copy the /media folder, edit these values, publish.
   ============================================================ */
window.SITE = {
  template: "media",
  preview: true,                 // false on the real build: hides the package switcher and preview badge
  tier: 3,                       // 1 Kickoff · 2 Prime Time · 3 Championship
  tiers: ["Kickoff", "Prime Time", "Championship"],
  prices: ["JMD 35,000", "JMD 55,000", "JMD 80,000"],

  name: "Touchline Times",       // sample brand
  short: "TT",
  tagline: "Caribbean sport, first and fast.",
  contact: { whatsapp: "+1 876 555 0100", email: "newsroom@example.com", location: "Kingston, Jamaica" },

  colors: {
    bg: "#ffffff", surface: "#f1f1ef", "surface-2": "#e9e9e7", line: "#e9e9e9",
    text: "#131313", muted: "#636363",
    accent: "#e5301b",            // action colour: rules, links, authors, subscribe
    "accent-ink": "#ffffff",
    "accent-2": "#c6ff00"         // highlight colour: markers, rank tiles, social circles
  },
  fonts: {}
};
