/**
 * Apex Athlete Exchange: demo data.
 *
 * Everything here is fictional: athletes, agents, clubs, schools, brands,
 * competitions, media outlets, licence references and contact details.
 * Phone numbers use the reserved 555-01xx range and emails use example.com.
 */
window.AAX_DATA = {
  // Verification levels, lowest to highest.
  verificationLevels: [
    { id: 'none', label: 'Not verified', short: 'Unverified', means: 'Nothing has been checked yet. Treat every figure as the athlete’s own claim.' },
    { id: 'identity', label: 'ID verified', short: 'ID', means: 'Identity and age are checked. Stats and test results are still self-reported.' },
    { id: 'athletic', label: 'Results verified', short: 'Results', means: 'Results are checked against official meet or match records.' },
    { id: 'pro', label: 'Combine verified', short: 'Combine', means: 'Measured in person at a partner combine: height, reach, speed and other tests.' }
  ],

  athletes: [
    {
      id: 'ath-01',
      photo: { src: 'img/ath-01', w: 720, h: 960, sw: 330, pos: '50% 38%', alt: 'A basketball player dunking on an outdoor court' },
      prevRank: 1,
      gradeHistory: [94.8, 95.6, 96.9, 97.4, 98.9, 98.4],
      name: 'Shavar Montague',
      jersey: '11',
      grade: 98.4,
      sport: 'Basketball',
      position: 'Shooting Guard / Small Forward',
      country: 'Jamaica',
      city: 'Kingston',
      dob: '2006-03-14',
      team: 'Kingston Hawks',
      school: 'Liguanea Prep',
      status: 'Seeking Agent',
      verification: 'pro',
      size: { height_in: 77, weight_lb: 205, wingspan_in: 80, reach_in: 104, hand: 'Right', foot: 'Right' },
      season: [
        { label: 'PPG', value: '18.4' }, { label: 'RPG', value: '6.2' }, { label: 'APG', value: '4.8' },
        { label: 'FG%', value: '51.4%' }, { label: '3PT%', value: '39.2%' }, { label: 'FT%', value: '84.6%' },
        { label: 'SPG', value: '1.7' }, { label: 'BPG', value: '0.9' }
      ],
      tests: [
        { label: 'Vertical jump', value: '34.5″' },
        { label: '¾-court sprint', value: '3.21 s' },
        { label: 'Lane agility', value: '10.82 s' },
        { label: 'Shuttle run', value: '3.12 s' }
      ],
      vertical_in: 34.5,
      permission: 'manager',
      career: [
        { season: '2025–26', team: 'Kingston Hawks', league: 'Island Premier Basketball', note: 'Led the league in field-goal percentage among guards. All-league first team.' },
        { season: '2024–25', team: 'Liguanea Prep', league: 'All-Island Schools Championship', note: 'Tournament MVP; 28 points in the final.' }
      ],
      honours: ['2025 All-Island Schools champion', '2025 Schools Championship MVP', '2024 Caribbean Junior Invitational all-star'],
      academics: { school: 'Liguanea Prep', gpa: '3.62', exams: 'SAT 1280', eligibility: 'US college eligibility review in progress' },
      video: [
        { title: 'Island Premier final: 31 pts, 8 reb, 4 ast', duration: '4:12', tag: 'Game film' },
        { title: 'Shooting and wingspan measurements, Kingston combine', duration: '2:45', tag: 'Combine' },
        { title: 'On-ball defence and transition passing', duration: '3:20', tag: 'Defence' }
      ],
      news: [
        { date: 'Oct 2026', source: 'Island Sports Wire', headline: 'Montague opens talks with agents after breakout season' },
        { date: 'Aug 2026', source: 'Hoops Report Caribbean', headline: 'Why Shavar Montague’s 6′8″ wingspan suits the modern wing' }
      ],
      summary: 'A 6′5″ wing from Kingston with a 6′8″ wingspan and a 34.5″ vertical. Shot 51.4% from the field this season and is talking to agents.'
    },
    {
      id: 'ath-02',
      photo: { src: 'img/ath-02', w: 960, h: 540, sw: 440, pos: '52% 62%', alt: 'A footballer in a red and white kit running onto the ball' },
      prevRank: 3,
      gradeHistory: [93.1, 94.0, 95.2, 96.8, 97.6, 97.2],
      name: 'Tariq Sterling',
      jersey: '7',
      grade: 97.2,
      sport: 'Football',
      position: 'Left Winger',
      country: 'Jamaica',
      city: 'Montego Bay',
      dob: '2007-06-22',
      team: 'Bay City FC',
      school: 'Westmoreland Collegiate',
      status: 'Free Agent',
      verification: 'athletic',
      size: { height_in: 71, weight_lb: 168, wingspan_in: 72, reach_in: 94, hand: 'Right', foot: 'Both (left preferred)' },
      season: [
        { label: 'Goals', value: '14' }, { label: 'Assists', value: '9' }, { label: 'Key passes', value: '42' },
        { label: 'Matches', value: '18' }, { label: 'Dribbles won', value: '68.4%' }, { label: 'Shots on target', value: '58.1%' },
        { label: 'xG', value: '11.8' }, { label: 'Mins per goal', value: '114' }
      ],
      tests: [
        { label: 'Top speed (GPS)', value: '34.8 km/h' },
        { label: '30 m sprint', value: '4.02 s' },
        { label: 'Yo-Yo IR2', value: 'Level 21.6' },
        { label: 'Vertical jump', value: '31.0″' }
      ],
      vertical_in: 31,
      permission: 'manager',
      career: [
        { season: '2025–26', team: 'Bay City FC', league: 'Western Youth Premier', note: 'Golden Boot: 14 goals in 18 matches.' },
        { season: '2024–25', team: 'Westmoreland Collegiate', league: 'Island Schools Cup', note: 'Top scorer with 19 goals.' }
      ],
      honours: ['2026 Western Youth Premier Golden Boot', '2025 Island Schools Cup top scorer'],
      academics: { school: 'Westmoreland Collegiate', gpa: '3.40', exams: '8 secondary-school passes', eligibility: 'Out of contract' },
      video: [
        { title: 'Season highlights: 1v1 take-ons and finishing', duration: '5:18', tag: 'Game film' },
        { title: 'Goals and assists against top-four sides', duration: '3:44', tag: 'Game film' },
        { title: 'GPS sprint data from match play', duration: '2:15', tag: 'Testing' }
      ],
      news: [
        { date: 'Sep 2026', source: 'Island Sports Wire', headline: 'Sterling clocks 34.8 km/h at regional combine' }
      ]
    },
    {
      id: 'ath-03',
      photo: { src: 'img/ath-03', w: 641, h: 960, sw: 294, pos: '50% 30%', alt: 'A sprinter kneeling at the start line of a red running track' },
      prevRank: 2,
      gradeHistory: [96.2, 97.0, 97.8, 98.6, 98.8, 99.5],
      name: 'Aliyah Blake',
      jersey: '—',
      grade: 99.5,
      sport: 'Track & Field',
      position: '100 m / 200 m',
      country: 'Jamaica',
      city: 'Spanish Town',
      dob: '2008-01-19',
      team: 'Sprint Factory TC',
      school: 'St. Catherine Girls’ High',
      status: 'Represented',
      verification: 'pro',
      size: { height_in: 68, weight_lb: 138, wingspan_in: 69, reach_in: 90, hand: 'Right', foot: 'Left (block start)' },
      season: [
        { label: '100 m PB', value: '10.98' }, { label: '200 m PB', value: '22.41' }, { label: 'Reaction', value: '0.134' },
        { label: '60 m PB', value: '7.12' }, { label: 'Wind (100 m PB)', value: '+1.4 m/s' }, { label: 'Races', value: '14' }
      ],
      tests: [
        { label: 'Flying 30 m', value: '2.84 s' },
        { label: 'Block reaction', value: '0.134 s' },
        { label: 'Vertical jump', value: '28.5″' },
        { label: '60 m', value: '7.12 s' }
      ],
      vertical_in: 28.5,
      permission: 'representative',
      career: [
        { season: '2026', team: 'St. Catherine Girls’ High', league: 'Island Schools Championships', note: 'Won the 100 m in 10.98 (+1.4) and the 200 m in 22.60.' },
        { season: '2025', team: 'Jamaica junior team', league: 'Caribbean Junior Games', note: '200 m gold in a games record of 22.41.' }
      ],
      honours: ['2026 Island Schools 100 m and 200 m champion', '2025 Caribbean Junior Games 200 m gold (22.41, games record)'],
      academics: { school: 'St. Catherine Girls’ High', gpa: '3.85', exams: 'Honour roll', eligibility: 'Turning professional' },
      video: [
        { title: '100 m final, Island Schools Championships', duration: '1:45', tag: 'Race' },
        { title: 'Block start and acceleration analysis', duration: '3:10', tag: 'Technique' },
        { title: '200 m bend running', duration: '2:30', tag: 'Race' }
      ],
      news: [
        { date: 'May 2026', source: 'Track Notes Caribbean', headline: 'Blake breaks 11 seconds at the schools championships' }
      ]
    },
    {
      id: 'ath-04',
      photo: { src: 'img/ath-04', w: 960, h: 638, sw: 440, pos: '60% 62%', alt: 'Two footballers contesting the ball on a grass pitch' },
      prevRank: 8,
      gradeHistory: [91.4, 91.9, 92.2, 92.0, 92.5, 92.8],
      name: 'Kofi Mensah',
      jersey: '4',
      grade: 92.8,
      sport: 'Football',
      position: 'Centre-Back',
      country: 'Ghana',
      city: 'Accra',
      dob: '2005-08-11',
      team: 'Accra Meridian SC',
      school: 'Volta Football Academy',
      status: 'Seeking Agent',
      verification: 'identity',
      size: { height_in: 75, weight_lb: 195, wingspan_in: 77, reach_in: 100, hand: 'Right', foot: 'Right' },
      season: [
        { label: 'Aerials won', value: '89.2%' }, { label: 'Pass acc.', value: '91.4%' }, { label: 'Tackles /90', value: '3.8' },
        { label: 'Interceptions /90', value: '4.1' }, { label: 'Clearances /90', value: '6.8' }, { label: 'Clean sheets', value: '11' }
      ],
      tests: [
        { label: 'Pro agility', value: '4.22 s' },
        { label: '30 m sprint', value: '4.21 s' },
        { label: 'Beep test', value: 'Level 14.8' },
        { label: 'Vertical jump', value: '33.0″' }
      ],
      vertical_in: 33,
      permission: 'contributor',
      career: [
        { season: '2025–26', team: 'Accra Meridian SC', league: 'Coastal League', note: 'Voted best young defender of the season.' },
        { season: '2024–25', team: 'Volta Football Academy', league: 'U19 international tournaments', note: 'Captained the academy on its European tour.' }
      ],
      honours: ['2026 Coastal League best young defender'],
      academics: { school: 'Volta Football Academy', gpa: '3.50', exams: 'Secondary certificate', eligibility: 'Seeking European trial' },
      video: [
        { title: 'Aerial duels and 1v1 defending', duration: '4:50', tag: 'Game film' },
        { title: 'Ball-playing: progressive and long passes', duration: '3:15', tag: 'Game film' }
      ],
      news: [
        { date: 'Sep 2026', source: 'Pitchside West Africa', headline: 'Mensah wins nearly nine in ten aerial duels this season' }
      ]
    },
    {
      id: 'ath-05',
      photo: { src: 'img/ath-05', w: 665, h: 960, sw: 305, pos: '45% 78%', alt: 'A basketball player shooting at an outdoor hoop under trees' },
      prevRank: 4,
      gradeHistory: [95.0, 95.8, 96.1, 97.0, 97.3, 96.4],
      name: 'Mateo Rossi',
      jersey: '3',
      grade: 96.4,
      sport: 'Basketball',
      position: 'Point Guard',
      country: 'Puerto Rico',
      city: 'San Juan',
      dob: '2004-11-04',
      team: 'San Juan Pelicans (reserve)',
      school: 'Coral Bay Junior College',
      status: 'Free Agent',
      verification: 'athletic',
      size: { height_in: 74, weight_lb: 188, wingspan_in: 77, reach_in: 98, hand: 'Right', foot: 'Right' },
      season: [
        { label: 'APG', value: '9.2' }, { label: 'PPG', value: '16.1' }, { label: '3PT%', value: '41.8%' },
        { label: 'AST/TO', value: '3.8' }, { label: 'SPG', value: '2.1' }, { label: 'FT%', value: '88.2%' }
      ],
      tests: [
        { label: 'Vertical jump', value: '36.0″' },
        { label: '¾-court sprint', value: '3.12 s' },
        { label: 'Lane agility', value: '10.45 s' },
        { label: 'Shuttle run', value: '2.98 s' }
      ],
      vertical_in: 36,
      permission: 'viewer',
      career: [
        { season: '2025–26', team: 'San Juan Pelicans (reserve)', league: 'Puerto Rico Development League', note: '9.2 assists a game; finals MVP.' },
        { season: '2023–25', team: 'Coral Bay Junior College', league: 'Junior college conference', note: 'First-team all-conference; 18.2 points and 8.4 assists.' }
      ],
      honours: ['2026 Development League finals MVP', '2025 junior college all-conference first team'],
      academics: { school: 'Coral Bay Junior College', gpa: '3.35', exams: 'Associate degree, kinesiology', eligibility: 'Free agent' },
      video: [
        { title: 'Pick-and-roll reads and passing', duration: '6:10', tag: 'Game film' },
        { title: 'Full game: 22 pts, 14 ast in the finals', duration: '8:30', tag: 'Full game' }
      ],
      news: [
        { date: 'Jul 2026', source: 'Isla Deportes', headline: 'Rossi hands out 14 assists in development league final' }
      ]
    },
    {
      id: 'ath-06',
      photo: { src: 'img/ath-06', w: 960, h: 634, sw: 440, pos: '50% 58%', alt: 'A cricket match in progress, batter and wicketkeeper at the crease' },
      prevRank: 7,
      gradeHistory: [92.6, 93.4, 94.1, 94.8, 95.5, 95.9],
      name: 'Rohan Sharma',
      jersey: '18',
      grade: 95.9,
      sport: 'Cricket',
      position: 'Fast Bowler',
      country: 'Trinidad & Tobago',
      city: 'Port of Spain',
      dob: '2006-05-18',
      team: 'Port of Spain Strikers',
      school: 'Maraval Collegiate',
      status: 'Seeking Agent',
      verification: 'athletic',
      size: { height_in: 76, weight_lb: 190, wingspan_in: 78, reach_in: 101, hand: 'Right (bats and bowls)', foot: 'Right' },
      season: [
        { label: 'Wickets', value: '32' }, { label: 'Bowling avg', value: '18.4' }, { label: 'Economy', value: '5.12' },
        { label: 'Strike rate', value: '21.6' }, { label: 'Batting avg', value: '34.5' }, { label: 'Matches', value: '14' }
      ],
      tests: [
        { label: 'Peak ball speed', value: '144.2 km/h' },
        { label: '20 m sprint', value: '2.89 s' },
        { label: 'Beep test', value: 'Level 15.2' },
        { label: 'Vertical jump', value: '32.0″' }
      ],
      vertical_in: 32,
      permission: 'manager',
      career: [
        { season: '2026', team: 'Port of Spain Strikers', league: 'Island T20 Development League', note: '32 wickets; three half-centuries batting at seven.' },
        { season: '2024–25', team: 'Maraval Collegiate', league: 'Schools premiership', note: 'Leading fast bowler in the competition.' }
      ],
      honours: ['2026 Development League bowler of the tournament'],
      academics: { school: 'Maraval Collegiate', gpa: '3.45', exams: 'Advanced certificate', eligibility: 'Available for franchise drafts' },
      video: [
        { title: 'Pace bowling: bouncers and yorkers', duration: '4:15', tag: 'Bowling' },
        { title: '48 off 19 balls in the semi-final', duration: '3:20', tag: 'Batting' }
      ],
      news: [
        { date: 'Sep 2026', source: 'Boundary Line', headline: 'Sharma expected to draw interest at the T20 development draft' }
      ]
    },
    {
      id: 'ath-07',
      photo: { src: 'img/ath-07', w: 960, h: 720, sw: 440, pos: '50% 62%', alt: 'A swimmer seen from underwater, mid-stroke in a pool lane' },
      prevRank: 6,
      gradeHistory: [93.8, 94.2, 95.1, 95.4, 96.0, 96.5],
      name: 'Chloe Henderson',
      jersey: '—',
      grade: 96.5,
      sport: 'Swimming',
      position: 'Sprint Freestyle',
      country: 'Barbados',
      city: 'Bridgetown',
      dob: '2009-03-29',
      team: 'Bridgetown Barracudas SC',
      school: 'Carlisle Bay Academy',
      status: 'Seeking Agent',
      verification: 'identity',
      size: { height_in: 70, weight_lb: 145, wingspan_in: 73, reach_in: 92, hand: 'Right', foot: 'Right' },
      season: [
        { label: '50 free', value: '24.88' }, { label: '100 free', value: '54.92' }, { label: '50 fly', value: '26.42' },
        { label: 'Meets', value: '9' }, { label: 'Finals', value: '9' }
      ],
      tests: [
        { label: 'Start reaction', value: '0.62 s' },
        { label: 'Turn time (50 m)', value: '1.08 s' },
        { label: 'Stroke rate (50 m)', value: '54 per min' },
        { label: 'Vertical jump', value: '26.0″' }
      ],
      vertical_in: 26,
      permission: 'viewer',
      career: [
        { season: '2026', team: 'Bridgetown Barracudas SC', league: 'Caribbean Junior Aquatics Open', note: 'Meet record in the 50 m freestyle (24.88).' },
        { season: '2025', team: 'Bridgetown Barracudas SC', league: 'Island age-group championships', note: 'Won the 50 free, 100 free and 50 fly.' }
      ],
      honours: ['2026 Caribbean Junior Aquatics Open 50 free (meet record)', '2025 age-group triple gold'],
      academics: { school: 'Carlisle Bay Academy', gpa: '3.90', exams: 'SAT 1340', eligibility: 'Under 18: guardian approval needed' },
      video: [
        { title: '50 m freestyle final and splits', duration: '1:30', tag: 'Race' },
        { title: 'Underwater turn and kick', duration: '2:10', tag: 'Technique' }
      ],
      news: [
        { date: 'Apr 2026', source: 'Lane Four Caribbean', headline: 'Henderson, 17, sets meet record in the 50 free' }
      ]
    },
    {
      id: 'ath-08',
      photo: { src: 'img/ath-08', w: 640, h: 960, sw: 293, pos: '50% 36%', alt: 'A boxer in black gloves in a guard stance' },
      prevRank: 5,
      gradeHistory: [94.5, 95.2, 95.9, 96.4, 96.9, 97.8],
      name: 'Malik Thorne',
      jersey: '—',
      grade: 97.8,
      sport: 'Boxing',
      position: 'Light Heavyweight (175 lb)',
      country: 'Jamaica',
      city: 'Kingston',
      dob: '2005-04-12',
      team: 'Rae Town Boxing Club',
      school: 'Harbour Street Technical',
      status: 'Seeking Agent',
      verification: 'pro',
      size: { height_in: 74, weight_lb: 175, wingspan_in: 78, reach_in: 99, hand: 'Orthodox', foot: 'Orthodox' },
      season: [
        { label: 'Record', value: '16–1' }, { label: 'KOs', value: '12' }, { label: 'KO rate', value: '75%' },
        { label: 'Jab acc.', value: '48.2%' }, { label: 'Power acc.', value: '54.6%' }, { label: 'Opp. landed', value: '18.2%' }
      ],
      tests: [
        { label: 'Punch velocity', value: '11.2 m/s' },
        { label: 'VO₂ max', value: '62.4 ml/kg/min' },
        { label: 'Reaction time', value: '0.19 s' },
        { label: 'Vertical jump', value: '33.5″' }
      ],
      vertical_in: 33.5,
      permission: 'manager',
      career: [
        { season: '2026', team: 'Rae Town Boxing Club', league: 'National amateur series', note: 'Golden Gloves champion; four straight stoppages.' },
        { season: '2025', team: 'Jamaica amateur team', league: 'Caribbean amateur championships', note: 'Silver medal.' }
      ],
      honours: ['2026 Golden Gloves champion (175 lb)', '2025 Caribbean amateur championships silver'],
      academics: { school: 'Harbour Street Technical', gpa: '3.10', exams: 'Technical diploma', eligibility: 'Preparing to turn professional' },
      video: [
        { title: 'Knockouts: 12 stoppages in 16 wins', duration: '4:40', tag: 'Fights' },
        { title: 'Jab placement and ring control', duration: '3:15', tag: 'Sparring' }
      ],
      news: [
        { date: 'Aug 2026', source: 'Ringside Caribbean', headline: 'Thorne preparing for professional debut' }
      ]
    }
  ],

  agents: [
    {
      id: 'agt-01',
      name: 'Marcus Vance',
      agency: 'Northgate Sports Management',
      city: 'Kingston & London',
      sports: ['Basketball', 'Football', 'Track & Field'],
      athletes: 42,
      years: 14,
      commission: '8%',
      rating: 4.9,
      reviews: 38,
      bio: 'Places Caribbean athletes with professional clubs, colleges and sponsors in the UK and Europe. Paid on commission only.',
      credentials: ['Licensed football agent', 'Licensed basketball agent', 'Athletics representative'],
      clients: 'Aliyah Blake and 41 others',
      contact: { email: 'marcus.vance@example.com', phone: '+1 876 555 0101' }
    },
    {
      id: 'agt-02',
      name: 'Elena Ribera',
      agency: 'Ribera Athletics Group',
      city: 'Madrid',
      sports: ['Basketball', 'Track & Field'],
      athletes: 28,
      years: 11,
      commission: '8%',
      rating: 4.8,
      reviews: 29,
      bio: 'Small agency focused on European contracts and training bases for Caribbean basketball players and sprinters.',
      credentials: ['Licensed basketball agent', 'Athletics representative'],
      clients: '28 athletes in Spain, Germany and France',
      contact: { email: 'elena.ribera@example.com', phone: '+1 345 555 0102' }
    },
    {
      id: 'agt-03',
      name: 'Andre Campbell',
      agency: 'Blue Mahoe Sports Partners',
      city: 'Kingston & Port of Spain',
      sports: ['Track & Field', 'Cricket', 'Football', 'Boxing'],
      athletes: 36,
      years: 16,
      commission: '7%',
      rating: 4.95,
      reviews: 45,
      bio: 'Sports lawyer and agent. Handles contracts, sponsorship and financial planning for young Caribbean athletes.',
      credentials: ['Attorney (sample credential)', 'Licensed football agent', 'Cricket players’ agent'],
      clients: '36 athletes across four sports',
      contact: { email: 'andre.campbell@example.com', phone: '+1 868 555 0103' }
    },
    {
      id: 'agt-04',
      name: 'Sarah Jenkins',
      agency: 'Coastline Athlete Advisory',
      city: 'Miami',
      sports: ['Swimming', 'Basketball'],
      athletes: 22,
      years: 9,
      commission: '6.5%',
      rating: 4.85,
      reviews: 24,
      bio: 'Helps swimmers and basketball players move to US colleges, then manages sponsorship once they turn professional. No fee on scholarships.',
      credentials: ['College recruiting adviser', 'Swimming athlete manager'],
      clients: '22 athletes, mostly college swimmers',
      contact: { email: 'sarah.jenkins@example.com', phone: '+1 305 555 0104' }
    }
  ],

  scouts: [
    { id: 'sct-01', name: 'Paula Grant', org: 'Independent scout' }
  ],

  organizations: [
    { id: 'org-01', name: 'Harbourside FC Academy' },
    { id: 'org-02', name: 'Atlantic Collegiate Showcase' },
    { id: 'org-03', name: 'Meridian Invitational Tour' },
    { id: 'org-04', name: 'Island T20 League' },
    { id: 'org-05', name: 'Coral Bay Aquatics Academy' }
  ],

  opportunities: [
    {
      id: 'opp-01',
      orgId: 'org-01',
      title: 'Winger and striker trial',
      type: 'Professional club trial',
      sport: 'Football',
      positions: ['Left Winger', 'Right Winger', 'Striker'],
      location: 'Kingston, Jamaica',
      date: '14–16 Nov 2026',
      deadline: '2026-10-30',
      age: [18, 22],
      minVerification: 'athletic',
      standard: 'Top speed of at least 33.5 km/h',
      offer: 'Professional contract for up to three players, with visa support',
      places: 3,
      applicants: 48,
      tags: ['Pro contract', 'Visa support']
    },
    {
      id: 'opp-02',
      orgId: 'org-02',
      title: 'Guard and wing scholarship showcase',
      type: 'College scholarship combine',
      sport: 'Basketball',
      positions: [],
      location: 'Miami, Florida',
      date: '5–7 Dec 2026',
      deadline: '2026-11-20',
      age: [18, 21],
      minVerification: 'identity',
      standard: 'Guards 6′2″ and taller; wings 6′6″ and taller',
      offer: 'Full athletic scholarships (tuition, housing and meals)',
      places: 6,
      applicants: 64,
      tags: ['Scholarship']
    },
    {
      id: 'opp-03',
      orgId: 'org-03',
      title: 'Emerging sprinters invitational',
      type: 'Professional meet invitation',
      sport: 'Track & Field',
      positions: [],
      location: 'Zurich, Switzerland',
      date: '18 Jan 2027',
      deadline: '2026-12-01',
      age: [17, 23],
      minVerification: 'pro',
      standard: '100 m: men 10.30, women 11.20 or faster',
      offer: 'Travel and housing paid, plus an appearance fee',
      places: 8,
      applicants: 32,
      tags: ['Appearance fee', 'Travel paid']
    },
    {
      id: 'opp-04',
      orgId: 'org-04',
      title: 'T20 development draft',
      type: 'Franchise draft',
      sport: 'Cricket',
      positions: ['Fast Bowler', 'All-Rounder'],
      location: 'Bridgetown, Barbados',
      date: '12 Feb 2027',
      deadline: '2027-01-15',
      age: [19, 23],
      minVerification: 'athletic',
      standard: 'Measured ball speed of at least 138 km/h',
      offer: 'Draft contract, $25,000–$75,000 a season',
      places: 5,
      applicants: 29,
      tags: ['Draft contract']
    },
    {
      id: 'opp-05',
      orgId: 'org-05',
      title: 'Junior sprint freestyle squad',
      type: 'Junior development place',
      sport: 'Swimming',
      positions: ['Freestyle'],
      location: 'Bridgetown, Barbados',
      date: '6–8 Dec 2026',
      deadline: '2026-11-20',
      age: [15, 18],
      minVerification: 'identity',
      standard: '50 m freestyle under 26.5 seconds',
      offer: 'Funded training place for the 2027 season, with travel and kit covered',
      places: 6,
      applicants: 14,
      tags: ['Under-18s welcome', 'Guardian approval']
    }
  ],

  watchlists: [
    {
      id: 'list-01',
      title: 'Caribbean guards and wings',
      owner: 'Paula Grant',
      shared: true,
      updated: '2026-10-01',
      description: 'Guards and wings with a 6′5″+ wingspan for the Miami showcase.',
      athleteIds: ['ath-01', 'ath-05'],
      note: 'Montague first for Miami. Rossi’s pick-and-roll passing stands out.'
    },
    {
      id: 'list-02',
      title: 'Unsigned footballers',
      owner: 'Harbourside FC Academy',
      shared: false,
      updated: '2026-09-25',
      description: 'Quick wingers and tall centre-backs for the Kingston trial.',
      athleteIds: ['ath-02', 'ath-04'],
      note: 'Sterling hit 34.8 km/h. Mensah wins 89% of aerial duels.'
    },
    {
      id: 'list-03',
      title: 'Sprint and swim prospects',
      owner: 'Paula Grant',
      shared: false,
      updated: '2026-09-18',
      description: 'Under-20 sprinters and swimmers close to senior international standards.',
      athleteIds: ['ath-03', 'ath-07'],
      note: 'Blake under 11 seconds. Henderson under 25 in the 50 free at 17.'
    },
    {
      id: 'list-04',
      title: 'Possible clients',
      owner: 'Marcus Vance',
      shared: false,
      updated: '2026-10-05',
      description: 'Unsigned athletes in my sports worth a call before the November trials.',
      athleteIds: ['ath-01', 'ath-02'],
      note: 'Montague is talking to agents now. Sterling fits the Harbourside trial.'
    }
  ],

  // Commission-only model: agents are paid a share of money the athlete earns, never an upfront fee.
  transactions: [
    { id: 'tx-1007', date: '2026-10-06', type: 'Travel grant', description: 'Travel to the junior aquatics championships.', release: 'Paid to a parent or guardian once the meet entry is confirmed', payer: 'Harbour Swim Club Boosters', payee: 'Chloe Henderson', amount: 600, status: 'held', athleteId: 'ath-07', agentId: null, orgId: null },
    { id: 'tx-1006', date: '2026-09-30', type: 'Combine testing fee', description: 'Wingspan, vertical and shooting tests at the Kingston combine.', payer: 'Shavar Montague', payee: 'Apex Combine, Kingston', amount: 250, status: 'settled', athleteId: 'ath-01', agentId: null, orgId: null },
    { id: 'tx-1005', date: '2026-10-04', type: 'Endorsement fee', description: 'Stride Athletic (fictional brand) shoe deal, first instalment.', release: 'Paid out when the athlete confirms the shoes were delivered', payer: 'Stride Athletic', payee: 'Aliyah Blake', amount: 12000, status: 'held', athleteId: 'ath-03', agentId: null, orgId: null },
    { id: 'tx-1004', date: '2026-10-02', type: 'Club subscription', description: 'Annual access to scouting profiles and video.', payer: 'Harbourside FC Academy', payee: 'Apex Athlete Exchange', amount: 4800, status: 'settled', athleteId: null, agentId: null, orgId: 'org-01' },
    { id: 'tx-1003', date: '2026-09-28', type: 'Combine testing fee', description: 'Sprint timing, GPS speed test and medical check at the Kingston combine.', payer: 'Tariq Sterling', payee: 'Apex Combine, Kingston', amount: 250, status: 'settled', athleteId: 'ath-02', agentId: null, orgId: null },
    { id: 'tx-1002', date: '2026-09-16', type: 'Agent commission', description: '8% of the Meridian Invitational appearance fee, under the agreement signed 20 Aug 2026.', payer: 'Aliyah Blake', payee: 'Northgate Sports Management', amount: 640, status: 'settled', athleteId: 'ath-03', agentId: 'agt-01', orgId: null },
    { id: 'tx-1001', date: '2026-09-15', type: 'Appearance fee', description: 'Meridian Invitational Tour, Oslo meet.', payer: 'Meridian Invitational Tour', payee: 'Aliyah Blake', amount: 8000, status: 'settled', athleteId: 'ath-03', agentId: null, orgId: 'org-03' }
  ],

  agreements: [
    {
      id: 'agr-0001',
      athleteId: 'ath-03',
      agentId: 'agt-01',
      authority: 'representative',
      commission: '8%',
      athleteSigned: '2026-08-20',
      agentSigned: '2026-08-20',
      guardian: null,
      status: 'active',
      deals: [
        { name: 'Stride Athletic (fictional brand)', detail: 'Shoe endorsement term sheet', status: 'review' },
        { name: 'Meridian Invitational Tour', detail: '2027 appearance agreement', status: 'signed' },
        { name: 'Kingston Speed Combine', detail: 'Technical sponsor, $24,000', status: 'held' }
      ],
      documents: ['Representation agreement (e-signature, demo)', 'Anti-doping whereabouts form', 'Knee assessment report']
    }
  ],

  // status: submitted (by athlete or agent) | invited (by the club) | declined
  applications: [
    { id: 'app-0001', oppId: 'opp-01', athleteId: 'ath-02', date: '2026-10-03', note: 'Available now. GPS data from the Kingston combine is on my profile.', status: 'submitted', via: 'athlete' }
  ],

  // Recent results for athletes on the board (shown in the results ticker). Static demo data, not a live feed.
  results: [
    { athleteId: 'ath-02', date: '2026-10-05', sport: 'Football', event: 'Western Youth Premier', rows: [['Bay City FC', '3'], ['Port Royal Rovers', '1']], status: 'FT · Sterling 2 goals' },
    { athleteId: 'ath-03', date: '2026-10-04', sport: 'Track', event: 'Island Schools Champs · 100 m', rows: [['Aliyah Blake', '10.98']], status: 'Final · 1st' },
    { athleteId: 'ath-07', date: '2026-10-04', sport: 'Swimming', event: 'Caribbean Junior Aquatics · 50 free', rows: [['Chloe Henderson', '24.88']], status: 'Meet record' },
    { athleteId: 'ath-01', date: '2026-10-03', sport: 'Basketball', event: 'Island Premier Basketball', rows: [['Kingston Hawks', '88'], ['St. Andrew Kings', '82']], status: 'Final · Montague 31 pts' },
    { athleteId: 'ath-08', date: '2026-10-03', sport: 'Boxing', event: 'National amateur boxing · 175 lb', rows: [['Malik Thorne', 'W TKO R3']], status: 'Final' },
    { athleteId: 'ath-05', date: '2026-10-02', sport: 'Basketball', event: 'PR Development League final', rows: [['Mateo Rossi', '14 ast']], status: 'Final · MVP' },
    { athleteId: 'ath-06', date: '2026-10-01', sport: 'Cricket', event: 'Kingston speed combine', rows: [['Rohan Sharma', '144.2 km/h']], status: 'Ball speed' }
  ],

  // Month labels for gradeHistory (oldest first).
  gradeMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],

  featuredAthleteId: 'ath-01',

  risers: [
    { athleteId: 'ath-03', delta: '10.98', note: 'Schools 100 m title' },
    { athleteId: 'ath-02', delta: '34.8 km/h', note: 'Fastest at the Kingston combine' },
    { athleteId: 'ath-05', delta: '14 ast', note: 'Development League finals MVP' },
    { athleteId: 'ath-06', delta: '144.2 km/h', note: 'Fastest ball of the U20 series' }
  ]
};
