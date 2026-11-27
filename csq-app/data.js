/* Caribbean Sports Quest app demo: sample data only.
   Dates are set relative to the day the demo is opened (d = days from today). */
window.CSQ = {
  rate: 157, // JMD per USD, set by CSQ admin in the real platform
  ranks: [
    { name: "Explorer", min: 0 },
    { name: "Challenger", min: 100 },
    { name: "Champion", min: 500 },
    { name: "Legend", min: 1500 },
    { name: "Hall of Fame", min: 5000 }
  ],
  earn: { checkin: 50, ticket: 25, quiz: 5, pulse: 2, post: 3, going: 1 },

  sports: ["All", "Football", "Cricket", "Netball", "Rugby", "Athletics", "Basketball", "Volleyball", "Domino", "Golf"],

  events: [
    { id: "night-netball", title: "Kingston Night Netball Classic", sport: "Netball", img: "img/sport-volleyball.jpg", island: "Jamaica", parish: "Kingston", venue: "National Indoor Sports Centre", d: 0, time: "6:00 PM", end: "10:00 PM", going: 412, organizer: "Corporate Area Netball", live: { home: "Liguanea Blaze", away: "Portmore Pace", hs: 31, as: 27, clock: "Q3 · 08:12" },
      tiers: [{ name: "General", jmd: 1500 }, { name: "Courtside", jmd: 3500 }], watch: "CVM",
      desc: "Eight club sides, one night. The Corporate Area's best netball under the lights, with a DJ between quarters and food stalls outside the arena." },
    { id: "domino-md6", title: "JDCA Christmas Domino League · Matchday 6", sport: "Domino", img: "img/christmas-domino-league-2026.jpg", island: "Jamaica", parish: "St. Andrew", venue: "Half Way Tree Community Centre", d: 1, time: "7:00 PM", end: "11:00 PM", going: 186, organizer: "JDCA", league: "jdca-domino", free: true,
      desc: "Matchday 6 of the Christmas Domino League. Twelve teams, partner play, six-love counts double. Free entry for spectators; check in for Quest Points." },
    { id: "rugby-7s-final", title: "Jamaica Rugby Sevens Series · Finals Day", sport: "Rugby", img: "img/sport-rugby.jpg", island: "Jamaica", parish: "St. Andrew", venue: "UWI Mona Bowl", d: 2, time: "11:00 AM", end: "6:00 PM", going: 538, organizer: "Rugby Sevens Series", league: "rugby-7s",
      tiers: [{ name: "Day pass", jmd: 2000 }, { name: "Family (4)", jmd: 6000 }, { name: "VIP tent", jmd: 8500 }], watch: "R1 Spot Media",
      desc: "The 2026 season ends here: cup, plate and bowl finals, plus the women's showcase. Bring sunscreen; gates open at 10." },
    { id: "t20-bash", title: "Corporate Area T20 Bash", sport: "Cricket", img: "img/sport-cricket.jpg", island: "Jamaica", parish: "Kingston", venue: "Sabina Park", d: 3, time: "1:00 PM", end: "9:00 PM", going: 1204, organizer: "Corporate Area Cricket", league: "corp-t20",
      tiers: [{ name: "Mound", jmd: 1000 }, { name: "Grandstand", jmd: 2500 }, { name: "Hospitality box", jmd: 12000 }], watch: "TVJ",
      desc: "Double-header T20 under lights. Semi-finals of the Corporate Area T20 Bash with music in the George Headley stand." },
    { id: "mobay-volley", title: "Montego Bay Beach Volleyball Open", sport: "Volleyball", img: "img/dest-jamaica.jpg", island: "Jamaica", parish: "St. James", venue: "Dead End Beach", d: 5, time: "9:00 AM", end: "5:00 PM", going: 297, organizer: "Western Volleyball", free: true,
      desc: "Pairs tournament on the sand with open divisions for men, women and mixed. Spectators free; stays nearby from the Travel tab." },
    { id: "blue-mtn-run", title: "Blue Mountain Sunrise Trail Run", sport: "Athletics", img: "img/sport-track.jpg", island: "Jamaica", parish: "St. Andrew", venue: "Hollywell National Park", d: 6, time: "5:30 AM", end: "11:00 AM", going: 164, organizer: "Island Trail Runners",
      tiers: [{ name: "10K entry", jmd: 4500 }, { name: "21K entry", jmd: 6500 }],
      desc: "10K and half-marathon routes through the pines at sunrise. Medal, shirt and Blue Mountain coffee at the finish." },
    { id: "schools-hoops", title: "Schools Basketball Showcase", sport: "Basketball", img: "img/sport-basketball.jpg", island: "Jamaica", parish: "Kingston", venue: "National Arena", d: 8, time: "4:00 PM", end: "9:00 PM", going: 655, organizer: "Schools Basketball",
      tiers: [{ name: "General", jmd: 800 }, { name: "Reserved", jmd: 1500 }],
      desc: "The top eight high-school programmes, boys and girls, plus a dunk contest at half-time of the final game." },
    { id: "bds-xmas-cup", title: "Barbados Christmas Football Cup", sport: "Football", img: "img/dest-barbados.jpg", island: "Barbados", parish: "St. Michael", venue: "Kensington Oval grounds", d: 10, time: "3:00 PM", end: "8:00 PM", going: 389, organizer: "Bajan Football Events",
      tiers: [{ name: "General", jmd: 2400 }, { name: "Stand", jmd: 4000 }],
      desc: "Sixteen community sides chase the Christmas Cup. Fly in for the weekend: packages from our travel partners in the Travel tab." },
    { id: "tt-golf", title: "Trinidad Charity Golf Pro-Am", sport: "Golf", img: "img/sport-golf.jpg", island: "Trinidad & Tobago", parish: "Port of Spain", venue: "St. Andrew's Golf Club", d: 13, time: "7:30 AM", end: "3:00 PM", going: 96, organizer: "T&T Golf Charity",
      tiers: [{ name: "Spectator", jmd: 1600 }, { name: "Playing four", jmd: 78000 }],
      desc: "Pros and amateurs play for youth sport charities. Spectator pass includes the 19th-hole lunch." },
    { id: "boxing-day", title: "Boxing Day Football Clash", sport: "Football", img: "img/sport-football.jpg", island: "Jamaica", parish: "St. Catherine", venue: "Spanish Town Prison Oval", d: 29, time: "5:00 PM", end: "9:00 PM", going: 1830, organizer: "St. Catherine FA", league: "corp-football",
      tiers: [{ name: "General", jmd: 1000 }, { name: "Stand", jmd: 2000 }],
      desc: "The traditional holiday derby. Pre-match sound system from 3 PM; get there early." }
  ],

  leagues: [
    { id: "jdca-domino", name: "JDCA Christmas Domino League", sport: "Domino", season: "Christmas 2026", img: "img/christmas-domino-league-2026.jpg", format: "Editorial", organizer: "JDCA",
      cols: ["P", "W", "L", "Pts"],
      table: [["Grants Pen Kings", 5, 5, 0, 15], ["Six-Love Crew", 5, 4, 1, 12], ["Barbican Bones", 5, 3, 2, 9], ["Papine Partners", 5, 3, 2, 9], ["Mona Masters", 5, 2, 3, 6], ["Constant Spring Cardinals", 5, 1, 4, 3], ["August Town Aces", 5, 0, 5, 0]],
      fixtures: [{ d: 1, h: "Grants Pen Kings", a: "Six-Love Crew", t: "7:00 PM" }, { d: 1, h: "Barbican Bones", a: "Papine Partners", t: "8:30 PM" }, { d: 8, h: "Mona Masters", a: "August Town Aces", t: "7:00 PM" }],
      results: [{ d: -6, h: "Grants Pen Kings", a: "Mona Masters", hs: 6, as: 2 }, { d: -6, h: "Six-Love Crew", a: "Barbican Bones", hs: 6, as: 4 }] },
    { id: "rugby-7s", name: "Jamaica Rugby Sevens Series", sport: "Rugby", season: "2026", img: "img/sport-rugby.jpg", organizer: "Rugby Sevens Series",
      cols: ["P", "W", "L", "Pts"],
      table: [["Kingston Barbarians", 9, 8, 1, 33], ["Mona Warriors", 9, 7, 2, 29], ["Blue Mountain RFC", 9, 5, 4, 21], ["Portmore Pirates", 9, 4, 5, 17], ["Caymanas Chargers", 9, 2, 7, 9], ["Dragon Bay 7s", 9, 1, 8, 5]],
      fixtures: [{ d: 2, h: "Kingston Barbarians", a: "Blue Mountain RFC", t: "2:00 PM" }, { d: 2, h: "Mona Warriors", a: "Portmore Pirates", t: "2:40 PM" }],
      results: [{ d: -7, h: "Kingston Barbarians", a: "Caymanas Chargers", hs: 36, as: 7 }, { d: -7, h: "Mona Warriors", a: "Dragon Bay 7s", hs: 29, as: 12 }] },
    { id: "corp-t20", name: "Corporate Area T20 Bash", sport: "Cricket", season: "2026", img: "img/sport-cricket.jpg", organizer: "Corporate Area Cricket",
      cols: ["P", "W", "L", "NRR"],
      table: [["Harbour Hawks", 6, 5, 1, "+1.42"], ["Uptown Strikers", 6, 4, 2, "+0.88"], ["Waterfront XI", 6, 3, 3, "-0.10"], ["Liguanea Lions", 6, 3, 3, "-0.21"], ["Downtown Dons", 6, 1, 5, "-1.65"]],
      fixtures: [{ d: 3, h: "Harbour Hawks", a: "Liguanea Lions", t: "1:00 PM" }, { d: 3, h: "Uptown Strikers", a: "Waterfront XI", t: "5:30 PM" }],
      results: [{ d: -4, h: "Harbour Hawks", a: "Downtown Dons", hs: "182/4", as: "141/9" }] },
    { id: "corp-football", name: "Corporate Football League", sport: "Football", season: "2026/27", img: "img/sport-football.jpg", organizer: "St. Catherine FA",
      cols: ["P", "W", "D", "Pts"],
      table: [["Spanish Town United", 11, 8, 2, 26], ["Portmore Strikers", 11, 7, 3, 24], ["Old Harbour FC", 11, 6, 2, 20], ["Linstead Lions", 11, 4, 4, 16], ["Bog Walk Rovers", 11, 3, 2, 11], ["Ewarton Eagles", 11, 1, 3, 6]],
      fixtures: [{ d: 4, h: "Old Harbour FC", a: "Linstead Lions", t: "7:00 PM" }, { d: 29, h: "Spanish Town United", a: "Portmore Strikers", t: "5:00 PM" }],
      results: [{ d: -3, h: "Spanish Town United", a: "Ewarton Eagles", hs: 3, as: 0 }, { d: -3, h: "Portmore Strikers", a: "Bog Walk Rovers", hs: 2, as: 2 }] }
  ],

  vault: [
    { id: "store10", name: "10% off the CSQ Store", qp: 300, img: "img/hero-merch.jpg", note: "One-time code" },
    { id: "ticket", name: "Free general admission ticket", qp: 800, img: "img/hero-fans.jpg", note: "Any partner event" },
    { id: "cap", name: "CSQ Quest Cap", qp: 1200, img: "img/merch-hero-football.jpg", note: "Pick up or ship" },
    { id: "vip", name: "VIP upgrade at Finals Day", qp: 2500, img: "img/sport-rugby.jpg", note: "Limited: 20 left" },
    { id: "season", name: "Season pass: Corporate T20 Bash", qp: 5000, img: "img/sport-cricket.jpg", note: "Every home match" }
  ],

  merch: [
    { id: "tee", name: "CSQ Island Pride Tee", usd: 28, img: "img/merch-hero-football.jpg", sizes: ["S", "M", "L", "XL"] },
    { id: "polo", name: "Cricket Classic Polo", usd: 35, img: "img/merch-hero-cricket.jpg", sizes: ["S", "M", "L", "XL"] },
    { id: "singlet", name: "Track Club Singlet", usd: 26, img: "img/merch-hero-track.jpg", sizes: ["XS", "S", "M", "L"] },
    { id: "hoodie", name: "Matchday Hoodie", usd: 55, img: "img/hero-merch.jpg", sizes: ["M", "L", "XL"] }
  ],

  partners: [
    { id: "harbour", name: "Harbour Sports Supply", addr: "14 Port Royal Street, Kingston", phone: "876-555-0142", hold: 5 },
    { id: "westside", name: "Westside Kit Room", addr: "Fairview Plaza, Montego Bay", phone: "876-555-0177", hold: 3 }
  ],
  partnerItems: [
    { id: "boots", name: "Firm-ground football boots", jmd: 14500, partner: "harbour", img: "img/sport-football.jpg" },
    { id: "bat", name: "English willow cricket bat", jmd: 32000, partner: "harbour", img: "img/sport-cricket.jpg" },
    { id: "vball", name: "Beach volleyball, match grade", jmd: 7800, partner: "westside", img: "img/sport-volleyball.jpg" }
  ],

  stays: [
    { id: "kws", name: "Kingston Waterfront Suites", near: "1.2 km from Sabina Park", jmd: 18500, img: "img/hero-travel.jpg", tag: "Sports rate" },
    { id: "mbl", name: "Mobay Beach Lodge", near: "Walk to Dead End Beach", jmd: 14200, img: "img/dest-jamaica.jpg", tag: "Beach" },
    { id: "bgh", name: "Bridgetown Guest House", near: "10 min to Kensington Oval", jmd: 16900, img: "img/dest-barbados.jpg", tag: "Package" },
    { id: "pos", name: "Port of Spain Garden Inn", near: "Near Queen's Park Savannah", jmd: 15400, img: "img/dest-trinidad.jpg", tag: "Breakfast" }
  ],
  trails: [
    { name: "Blue Mountain Peak Trail", parish: "St. Thomas", km: 14, level: "Hard", type: "Hike" },
    { name: "Holywell Loop Trails", parish: "St. Andrew", km: 5, level: "Easy", type: "Run" },
    { name: "Dolphin Head Trail", parish: "Hanover", km: 6, level: "Moderate", type: "Hike" },
    { name: "Palisadoes Road Ride", parish: "Kingston", km: 22, level: "Easy", type: "Cycle" }
  ],

  opps: [
    { id: "steward", title: "Event-day stewards (20 roles)", org: "Rugby Sevens Series", type: "Event-day work", where: "UWI Mona", pay: "JMD 6,000 / day" },
    { id: "media", title: "Sports media intern", org: "CSQ Media", type: "Internship", where: "Remote / Kingston", pay: "Stipend" },
    { id: "trials", title: "U17 football trials", org: "Portmore Strikers Academy", type: "Trials", where: "Portmore", pay: "Free" },
    { id: "umpire", title: "Netball umpire course (Level 1)", org: "Corporate Area Netball", type: "Officiating", where: "NISC", pay: "Certified" },
    { id: "scholar", title: "US college athletics scholarship info night", org: "Track Futures", type: "Scholarship", where: "Online", pay: "Free" }
  ],

  posts: [
    { id: 1, user: "DeeJayBounce", sport: "Cricket", text: "If the Hawks bat first at Sabina on Wednesday, 180 won't be enough. That outfield is lightning right now.", likes: 48, replies: 17, ago: "2h" },
    { id: 2, user: "NetballQueenJA", sport: "Netball", text: "Liguanea Blaze shooting at 89% tonight. Who's in the building? Courtside is LIVE 🔥", likes: 102, replies: 31, ago: "35m" },
    { id: 3, user: "SixLoveSteve", sport: "Domino", text: "Grants Pen Kings undefeated but Six-Love Crew have been counting tight. Matchday 6 decides the table.", likes: 27, replies: 9, ago: "5h" },
    { id: 4, user: "RuckAndRoll", sport: "Rugby", text: "Finals Day tips: get there for the women's showcase at 11, park on the Ring Road side, bring cash for the jerk stand.", likes: 64, replies: 12, ago: "1d" }
  ],

  pulse: [
    { id: "wk48", title: "Week in Sports: Barbarians roll into Finals Day unbeaten at home", sport: "Rugby", img: "img/sport-rugby.jpg", mins: 3,
      body: ["Kingston Barbarians closed the regular season with a 36-7 win over Caymanas Chargers and go into Saturday's Finals Day as top seed.", "Mona Warriors, second in the table, have won five straight and meet Portmore Pirates in the other semi-final.", "Tickets for Finals Day are on CSQ, with a family pack for four and a VIP tent next to the touchline."] },
    { id: "netball", title: "Night Netball returns with eight clubs and a bigger stage", sport: "Netball", img: "img/sport-volleyball.jpg", mins: 2,
      body: ["The Kingston Night Netball Classic moves to the National Indoor Sports Centre this year, doubling its seating.", "Organisers say walk-up sales have already passed last year's total, so buy ahead on CSQ to skip the gate queue."] },
    { id: "domino", title: "Domino league hits the halfway mark: who can catch Grants Pen?", sport: "Domino", img: "img/christmas-domino-league-2026.jpg", mins: 2,
      body: ["Five games, five wins and fifteen points: Grants Pen Kings are the team to beat in the JDCA Christmas Domino League.", "Six-Love Crew sit three points back and play the leaders on Matchday 6, free to watch at Half Way Tree."] }
  ],

  quiz: [
    { q: "How many players does each team have on the field in rugby sevens?", a: ["5", "7", "11", "15"], c: 1 },
    { q: "Sabina Park is in which Jamaican city?", a: ["Montego Bay", "Spanish Town", "Kingston", "Ocho Rios"], c: 2 },
    { q: "In netball, which position can shoot apart from Goal Shooter?", a: ["Wing Attack", "Goal Attack", "Centre", "Goal Defence"], c: 1 },
    { q: "How many overs does each side bowl in a T20 innings?", a: ["10", "20", "40", "50"], c: 1 }
  ],

  leaderboard: [
    { name: "IslandRunnerJA", qp: 214 }, { name: "NetballQueenJA", qp: 198 }, { name: "DeeJayBounce", qp: 176 },
    { name: "YOU", qp: 0 }, { name: "RuckAndRoll", qp: 131 }, { name: "SixLoveSteve", qp: 118 }, { name: "BajanBallerz", qp: 97 }
  ]
};
