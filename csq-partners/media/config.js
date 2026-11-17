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
    bg: "#0a0b0d", surface: "#121418", "surface-2": "#191c22", line: "rgba(255,255,255,0.09)",
    text: "#f5f6f7", muted: "rgba(245,246,247,0.6)",
    accent: "#c6ff00", "accent-ink": "#0a0b0d", "accent-2": "#ff4d3d"
  },
  fonts: { display: "'Barlow Condensed', 'Arial Narrow', sans-serif" }
};
