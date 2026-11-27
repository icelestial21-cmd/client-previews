/* Kings of the Cage app demo: SAMPLE DATA.
   Teams, players, scores, stats, stories and products are illustrative for the demo.
   Facts about Kings of the Cage itself (Maloney Gardens 2020, Jamaica 2027, Hennessy All Star Night,
   Gatorade, Championship Rings, Queens of the Cage) come from the KOC website copy. */
(function (root) {
  'use strict';

  const TEAMS = [
    { id: 'MAL', name: 'Maloney Ballers', short: 'Ballers', c: '#e3b23c', ink: '#120d00', area: 'Maloney Gardens, Trinidad', since: 2020, rec: [6, 1, 1], form: ['W', 'W', 'D', 'W', 'W'], gf: 41, ga: 22, titles: ['KOC champions 2024'], blurb: 'The home side. Born on the outdoor court in Maloney Gardens and never far from Finals Night since.' },
    { id: 'ARS', name: 'Arima Strikers', short: 'Strikers', c: '#f5f1e8', ink: '#0a0a0a', area: 'Arima, Trinidad', since: 2021, rec: [5, 1, 2], form: ['W', 'L', 'W', 'W', 'D'], gf: 36, ga: 25, titles: [], blurb: 'Quick, direct and dangerous on the break. The Strikers live for the counter.' },
    { id: 'KGN', name: 'Kingston Kings', short: 'Kings', c: '#1f8a5a', ink: '#ffffff', area: 'Kingston, Jamaica', since: 2026, rec: [4, 2, 2], form: ['D', 'W', 'W', 'L', 'W'], gf: 30, ga: 24, titles: [], blurb: 'Jamaica’s first entry. Built for the 2027 Jamaica edition and already turning heads.' },
    { id: 'TOB', name: 'Tobago Tide', short: 'Tide', c: '#2f6fd6', ink: '#ffffff', area: 'Scarborough, Tobago', since: 2023, rec: [3, 1, 4], form: ['L', 'W', 'L', 'D', 'W'], gf: 27, ga: 31, titles: ['Tobago edition winners 2025'], blurb: 'Island pride and patient build-up play. Winners when KOC went to Tobago.' },
    { id: 'BKN', name: 'Brooklyn Cage', short: 'Brooklyn', c: '#9a9a9a', ink: '#0a0a0a', area: 'Brooklyn, New York', since: 2025, rec: [3, 0, 5], form: ['W', 'L', 'L', 'W', 'L'], gf: 25, ga: 33, titles: [], blurb: 'The diaspora side that brought the cage to New York.' },
    { id: 'LAV', name: 'Laventille FC', short: 'Laventille', c: '#b0312a', ink: '#ffffff', area: 'Laventille, Trinidad', since: 2020, rec: [1, 1, 6], form: ['L', 'L', 'D', 'L', 'L'], gf: 18, ga: 42, titles: [], blurb: 'Original 2020 entrants with a fierce local following.' }
  ];

  const FIRST = ['Kevon', 'Jamal', 'Daniel', 'Ricardo', 'Tyrell', 'Shane', 'Marcus', 'Andre', 'Keston', 'Jerome', 'Akeem', 'Dwayne', 'Romario', 'Jaden', 'Kareem', 'Nathan', 'Omari', 'Brandon', 'Leon', 'Javon', 'Kirk', 'Dante', 'Shamar', 'Trevon', 'Elijah', 'Rashad', 'Isaiah', 'Kemar', 'Josiah', 'Malik'];
  const LAST = ['Charles', 'Mohammed', 'Joseph', 'Phillip', 'Baptiste', 'Ali', 'Pierre', 'Gomez', 'Williams', 'Campbell', 'Thomas', 'Ramdass', 'Clarke', 'Brown', 'Mitchell', 'Henry', 'Grant', 'Alexis', 'Lewis', 'Francis', 'Richards', 'Daniel', 'Scott', 'Walker', 'James', 'Edwards', 'Morris', 'George', 'Hinds', 'Noel'];
  const POS = ['Defender', 'Midfield', 'Midfield', 'Forward', 'Utility'];
  const FEET = ['Right', 'Left', 'Right', 'Both', 'Right'];
  const SKIN = ['#7a4a2a', '#5c3a21', '#8d5b3a', '#a26c46', '#6b4226', '#c08a5e', '#4a2e1b'];
  const HAIR = ['Afro', 'Cornrows', 'DreadsOne', 'FlatTop', 'ShortOne', 'Twists', 'Bald', 'Mohawk', 'ShortThree', 'DreadsTwo', 'Shaved', 'ShortFour'];
  const FACE = ['Smile', 'Calm', 'Driven', 'Serious', 'Cheeky', 'SmileTeeth', 'Solemn', 'Explaining'];
  const BEARD = [null, 'Goatee', null, 'Chin', null, 'MustacheThin', null, 'Full'];

  // Small seeded random so the demo data is the same on every load.
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const PLAYERS = [];
  let n = 0;
  TEAMS.forEach((t, ti) => {
    const nums = [4, 7, 10, 9, 11];
    for (let i = 0; i < 5; i++) {
      const id = (t.id + '-' + nums[i]).toLowerCase();
      const pos = POS[i];
      const strength = (6 - ti) / 6; // stronger teams score more in the sample
      const apps = 6 + Math.floor(rnd() * 3);
      const goals = Math.round((pos === 'Forward' ? 9 : pos === 'Midfield' ? 5 : pos === 'Utility' ? 3 : 1) * (0.6 + strength * 0.8) * (0.7 + rnd() * 0.6));
      const assists = Math.round((pos === 'Midfield' ? 6 : 3) * (0.6 + rnd() * 0.8));
      const form = Array.from({ length: 6 }, () => +(5.8 + rnd() * 3.6).toFixed(1));
      PLAYERS.push({
        id, team: t.id, num: nums[i], name: FIRST[n] + ' ' + LAST[n], pos,
        captain: i === 2, age: 19 + Math.floor(rnd() * 13), foot: FEET[i],
        from: t.area.split(',')[0], since: Math.min(2026, t.since + Math.floor(rnd() * 2)),
        apps, goals, assists, mvp: Math.floor(rnd() * 3), clean: pos === 'Defender' ? 1 + Math.floor(rnd() * 3) : 0,
        form, rating: +(form.reduce((a, b) => a + b, 0) / form.length).toFixed(1),
        look: { skin: pick(SKIN), hair: HAIR[n % HAIR.length], face: FACE[n % FACE.length], beard: BEARD[n % BEARD.length] }
      });
      n++;
    }
  });

  const NEWS = [
    { id: 'jamaica-2027', kicker: 'Jamaica 2027', date: 'Nov 24', mins: 3, tint: '#1f8a5a', head: 'Kings of the Cage is coming to Jamaica', dek: 'One day in March or April 2027, with the same format and production that fill the Maloney arena.', body: ['Kings of the Cage will play its first Jamaica edition in spring 2027: one day, one crown, with group games, knockouts under the lights and the full Finals Night walkout.', 'The date and venue will be announced together. Teams can already register their interest on the Jamaica page, and no payment is taken until everything is confirmed.', 'The winners’ purse is expected to be US$1,500 to 2,500, set with the title sponsor.'], team: 'KGN', feature: true },
    { id: 'group-a-recap', kicker: 'Match report · sample', date: 'Nov 22', mins: 2, tint: '#e3b23c', head: 'Ballers stay perfect at the top of Group A', dek: 'Maloney edge Arima in a five-goal thriller on Court 1.', body: ['Maloney Ballers kept their unbeaten run going with a 3–2 win over Arima Strikers, settled by a low finish into the small goal late in the second half.', 'Arima twice came back from a goal down, but the home side’s pressing in the final minutes decided it. The Ballers now need one point from their last group game to top the table.'], team: 'MAL', player: 'mal-10' },
    { id: 'rings', kicker: 'Inside KOC', date: 'Nov 18', mins: 4, tint: '#a8781c', head: 'The rings that made the cage famous', dek: 'Why Kings of the Cage hands out Championship Rings, a first for a small-goal tournament.', body: ['When Kings of the Cage introduced Championship Rings, it changed what winning meant on a 4v4 court. The rings sit alongside the trophy and the cash prize on Finals Night.', 'The tradition travels with every edition, including Jamaica in 2027.'] },
    { id: 'all-star-night', kicker: 'Partners', date: 'Nov 12', mins: 2, tint: '#7a5a2a', head: 'All Star Night, presented by Hennessy', dek: 'How a naming partner turned one night into the season’s headline event.', body: ['Hennessy held naming rights to All Star Night in 2026, with Gatorade as official hydration for the players.', 'Partners can own a night, an edition or one part of the day. See the Sponsors page on the website for the options.'] },
    { id: 'kingston-kings', kicker: 'Team profile · sample', date: 'Nov 8', mins: 3, tint: '#1f8a5a', head: 'Meet the Kingston Kings', dek: 'Jamaica’s first entry arrives with a point to prove.', body: ['Built for the 2027 Jamaica edition, the Kingston Kings blend club players and school alumni from across the corporate area.', 'Captain ' + PLAYERS.find((p) => p.id === 'kgn-10').name + ' says the plan is simple: “Fast feet, quick heads, no fear of the big nights.”'], team: 'KGN', player: 'kgn-10' },
    { id: 'queens', kicker: 'Community', date: 'Nov 2', mins: 2, tint: '#b0312a', head: 'Queens of the Cage: the netball sister event', dek: 'One day of netball with the same KOC energy.', body: ['Queens of the Cage is the one-day netball sister event, part of a calendar of community events Kings of the Cage runs for Maloney Gardens and beyond.', 'Kings of the Cage started as a way to bring people together and keep young people busy and out of trouble. That is still the point.'] }
  ];

  root.KOC_DATA = { TEAMS, PLAYERS, NEWS };
  if (typeof module !== 'undefined') module.exports = root.KOC_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
