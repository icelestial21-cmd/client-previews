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
    bg: "#0c0d0f", surface: "#16181c", "surface-2": "#1f2227", line: "#272a30",
    text: "#f3f3f1", muted: "#8e9198",
    accent: "#ff4a32",            // action colour: rules, links, authors, subscribe
    "accent-ink": "#ffffff",
    "accent-2": "#c6ff00"         // highlight colour: markers, rank tiles, social circles
  },
  fonts: {}
};
