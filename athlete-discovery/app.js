/**
 * Apex Athlete Exchange (AAX) - Global Talent & Representation Infrastructure
 * Client Application Engine: Vanilla ES6, Zero External Dependencies
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. MASTER CLIENT IN-MEMORY STATE REPOSITORY
     ========================================================================== */
  const STATE = {
    activeRole: 'athlete',
    activeSection: 'discovery',
    selectedAthleteId: 'ath-01',
    compareQueue: ['ath-01', 'ath-05'],
    filter: {
      search: '',
      sport: 'all',
      position: 'all',
      country: 'all',
      status: 'all',
      minHeight: 66,
      verification: 'all'
    },
    stepper: {
      currentStep: 1,
      selectedAgent: null,
      targetAthleteId: 'ath-01',
      authorityLevel: 'representative',
      signerName: 'Kamal Harvey'
    },
    athletes: [
      {
        id: 'ath-01',
        name: 'Kamal Harvey',
        jersey: '#11',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '98.4',
        national_rank: 'NATL #1 SG',
        school_team: "St. George's College / Kingston Titans",
        sport: 'Basketball',
        discipline: "Men's Basketball",
        position: 'Shooting Guard / Small Forward',
        country: 'Jamaica',
        flag: '🇯🇲',
        city: 'Kingston',
        age: 20,
        dob: '2006-03-14',
        gender: 'Male',
        biometrics: {
          height: "6'5\"",
          height_in: 77,
          weight_lbs: 205,
          wingspan: "6'8\"",
          wingspan_in: 80,
          dominant_hand: 'Right',
          dominant_foot: 'Right',
          reach: "8'8\""
        },
        combine: {
          vertical_leap_in: 34.5,
          sprint_time: '4.58s (3/4 Court)',
          lane_agility: '10.82s',
          shuttle_run: '3.12s'
        },
        performance: {
          primary_label: 'PPG',
          primary_val: '18.4',
          secondary_label: 'RPG',
          secondary_val: '6.2',
          tertiary_label: 'APG',
          tertiary_val: '4.8',
          stats_grid: [
            { label: 'FG%', val: '51.4%' },
            { label: '3PT%', val: '39.2%' },
            { label: 'FT%', val: '84.6%' },
            { label: 'SPG', val: '1.7' },
            { label: 'BPG', val: '0.9' },
            { label: 'EFF Rating', val: '+22.4' }
          ]
        },
        status: 'Seeking Agent',
        representation_tier: 'Unassigned',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Profile, Combine Scores, Highlights',
          contributor: 'Upload Drills, Log Game Box Scores',
          manager: 'Manage Scouting Materials, Direct Club Messaging',
          representative: 'Exclusive Contract Negotiation, Digital Escrow Sign-off'
        },
        career: [
          { season: '2025-26', team: 'Kingston Titans Elite', league: 'National Super League', notes: 'Led league in scoring efficiency; All-Tournament First Team.' },
          { season: '2024-25', team: "St. George's Academy", league: 'ISSA National Championship', notes: 'Tournament MVP; 28 points in Championship Final.' }
        ],
        achievements: [
          '2025 National Youth Basketball Championship Gold',
          '2025 Tournament MVP (22.8 PPG Average)',
          '2024 Caribbean U19 Invitational All-Star Five'
        ],
        academics: {
          institution: "UWI Mona / St. George's",
          gpa: '3.62',
          eligibility: 'NCAA Division 1 Clearinghouse Certified',
          standardized_score: '1280 SAT'
        },
        highlights: [
          { title: 'National Finals Breakdown : 31 Pts, 8 Reb, 4 Ast', duration: '4:12', tag: 'Game Tape' },
          { title: 'NBA Combine Shooting & Wingspan Pro-Day Drill', duration: '2:45', tag: 'Combine Tape' },
          { title: 'Defensive ISO Clamps & Transition Playmaking', duration: '3:20', tag: 'Defensive Reel' }
        ],
        news: [
          { date: 'Oct 2026', source: 'Caribbean Sports Dispatch', headline: 'Kamal Harvey Declares Availability for International Scouting & Agency Representation' },
          { date: 'Aug 2026', source: 'Hoops Intelligence', headline: "Why Kamal Harvey's 6'8\" Wingspan Translates Instantly to Modern Guard Play" }
        ],
        avatar_color: '#2563EB'
      },
      {
        id: 'ath-02',
        name: 'Tariq Sterling',
        jersey: '#7',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '97.2',
        national_rank: 'JPL #1 WINGER',
        school_team: 'Cornwall College / Montego Bay FC',
        sport: 'Football',
        discipline: 'Association Football',
        position: 'Left Winger / Forward',
        country: 'Jamaica',
        flag: '🇯🇲',
        city: 'Montego Bay',
        age: 19,
        dob: '2007-06-22',
        gender: 'Male',
        biometrics: {
          height: "5'11\"",
          height_in: 71,
          weight_lbs: 168,
          wingspan: "6'0\"",
          wingspan_in: 72,
          dominant_hand: 'Right',
          dominant_foot: 'Both (Left Primary)',
          reach: "7'10\""
        },
        combine: {
          vertical_leap_in: 31.0,
          sprint_time: '10.42s (100m Split)',
          lane_agility: 'Top Speed 34.8 km/h',
          shuttle_run: 'Yo-Yo IR2: Level 21.6'
        },
        performance: {
          primary_label: 'Goals',
          primary_val: '14',
          secondary_label: 'Assists',
          secondary_val: '9',
          tertiary_label: 'Key Passes',
          tertiary_val: '42',
          stats_grid: [
            { label: 'Matches', val: '18' },
            { label: 'Dribble Success', val: '68.4%' },
            { label: 'Shots on Target', val: '58.1%' },
            { label: 'Top Speed', val: '34.8 km/h' },
            { label: 'Expected Goals (xG)', val: '11.8' },
            { label: 'Minutes / Goal', val: '114 min' }
          ]
        },
        status: 'Free Agent',
        representation_tier: 'Seeking Agent',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Manager',
          viewer: 'Public Profile, Match Footage',
          contributor: 'Upload Video, Update Telemetry',
          manager: 'Trial Applications, Direct Club Contacts',
          representative: 'Transfer Negotiations, Work Permit Filings'
        },
        career: [
          { season: '2025-26', team: 'Montego Bay Academy', league: 'JPL Youth Premier', notes: 'Golden Boot Winner; 14 goals in 18 matches.' },
          { season: '2024-25', team: 'Cornwall College', league: 'DaCosta Cup', notes: 'Tournament Top Scorer with 19 goals; Zone Champions.' }
        ],
        achievements: [
          '2026 JPL Youth League Golden Boot (14 Goals)',
          '2025 DaCosta Cup Most Valuable Forward',
          'Jamaica U20 National Team Provisional Squad Selection'
        ],
        academics: {
          institution: 'Cornwall College',
          gpa: '3.40',
          eligibility: 'FIFA Registered Amateur / Pro Contract Ready',
          standardized_score: 'CSEC 8 Subjects (Distinction in Physical Ed)'
        },
        highlights: [
          { title: 'Pace & Direct 1v1 Dribbling Compilation : 2026 Season', duration: '5:18', tag: 'Game Tape' },
          { title: 'Goals & Decisive Assists vs Top 4 Premier Defenses', duration: '3:44', tag: 'Match Reel' },
          { title: 'High-Speed Transition Sprints & GPS Tracking Data', duration: '2:15', tag: 'Telemetry Tape' }
        ],
        news: [
          { date: 'Sep 2026', source: 'Caribbean Football Review', headline: 'Tariq Sterling Clocked at 34.8 km/h During Regional Combine Showcase' },
          { date: 'Jul 2026', source: 'Scout Wire UK', headline: 'Unsigned Jamaican Prodigy Tariq Sterling Eyed by MLS and Belgian Pro League Scouts' }
        ],
        avatar_color: '#10B981'
      },
      {
        id: 'ath-03',
        name: 'Aliyah Blake',
        jersey: '#101',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '99.5',
        national_rank: 'CHAMPS #1 RECORD',
        school_team: 'Edwin Allen High / MVP Track Club',
        sport: 'Track & Field',
        discipline: 'Short Sprints',
        position: '100m / 200m Sprinter',
        country: 'Jamaica',
        flag: '🇯🇲',
        city: 'Spanish Town',
        age: 18,
        dob: '2008-01-19',
        gender: 'Female',
        biometrics: {
          height: "5'8\"",
          height_in: 68,
          weight_lbs: 138,
          wingspan: "5'9\"",
          wingspan_in: 69,
          dominant_hand: 'Right',
          dominant_foot: 'Left (Block Start)',
          reach: "7'6\""
        },
        combine: {
          vertical_leap_in: 28.5,
          sprint_time: '10.98s (100m PR)',
          lane_agility: 'Reaction Time: 0.134s',
          shuttle_run: '200m PR: 22.41s'
        },
        performance: {
          primary_label: '100m PR',
          primary_val: '10.98s',
          secondary_label: '200m PR',
          secondary_val: '22.41s',
          tertiary_label: 'Reaction',
          tertiary_val: '0.134s',
          stats_grid: [
            { label: 'Champs 100m', val: 'Gold (11.02s)' },
            { label: 'CARIFTA 200m', val: 'Record (22.41s)' },
            { label: 'Wind Legal', val: '+1.4 m/s' },
            { label: 'Fly 30m Speed', val: '2.84s' },
            { label: 'National Rank', val: '#1 U20' },
            { label: 'World Rank', val: '#3 U20' }
          ]
        },
        status: 'Represented',
        representation_tier: 'Full Representation',
        agent_name: 'Marcus Vance',
        agent_id: 'agt-01',
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Meet Splits, Times',
          contributor: 'Log Training Splits, Upload Race Footage',
          manager: 'Meet Entries, Shoe Endorsement Inquiries',
          representative: 'Diamond League Contract Signings, Escrow Disbursements'
        },
        career: [
          { season: '2026', team: 'Edwin Allen High School', league: 'ISSA Boys & Girls Champs', notes: 'Class 1 Sprint Double Champion; Record 100m clocking.' },
          { season: '2025', team: 'Jamaica Junior National Team', league: 'CARIFTA Games', notes: 'Gold Medal in 100m and 4x100m Relay Anchor.' }
        ],
        achievements: [
          '2026 ISSA Boys & Girls Athletics Championships Class 1 Double Gold',
          '2025 CARIFTA Games U20 100m Gold & Record Holder (11.02s)',
          '2025 World U20 Championships Bronze Medalist (Lima, Peru)'
        ],
        academics: {
          institution: 'Edwin Allen High School',
          gpa: '3.85',
          eligibility: 'NCAA Certified / Considering Professional Pro Tour',
          standardized_score: 'Honor Roll All Semesters'
        },
        highlights: [
          { title: 'Sub-11 Second 100m Final Win : ISSA Champs 2026', duration: '1:45', tag: 'Race Footage' },
          { title: 'Starting Block Biomechanics & Acceleration Phase Analysis', duration: '3:10', tag: 'Technical Video' },
          { title: '200m Bend Technique & Speed Endurance Execution', duration: '2:30', tag: 'Race Footage' }
        ],
        news: [
          { date: 'May 2026', source: 'TrackAlerts', headline: 'Aliyah Blake Breaks Historic 11-Second Barrier at National Stadium' },
          { date: 'Mar 2026', source: 'World Athletics', headline: 'Next Generation Sprint Star Aliyah Blake Leads World U20 Leaderboards' }
        ],
        avatar_color: '#F59E0B'
      },
      {
        id: 'ath-04',
        name: 'Kofi Mensah',
        jersey: '#4',
        star_rating: '★★★★☆ 4-STAR',
        composite_grade: '92.8',
        national_rank: 'WEST AFRICA #2 CB',
        school_team: 'Right to Dream Academy / Accra Lions',
        sport: 'Football',
        discipline: 'Association Football',
        position: 'Centre-Back',
        country: 'Ghana',
        flag: '🇬🇭',
        city: 'Accra',
        age: 21,
        dob: '2005-08-11',
        gender: 'Male',
        biometrics: {
          height: "6'3\"",
          height_in: 75,
          weight_lbs: 195,
          wingspan: "6'5\"",
          wingspan_in: 77,
          dominant_hand: 'Right',
          dominant_foot: 'Right',
          reach: "8'4\""
        },
        combine: {
          vertical_leap_in: 33.0,
          sprint_time: '11.10s (100m Split)',
          lane_agility: 'Pro Agility 4.22s',
          shuttle_run: 'Beep Test 14.8'
        },
        performance: {
          primary_label: 'Aerial Win%',
          primary_val: '89.2%',
          secondary_label: 'Pass Acc%',
          secondary_val: '91.4%',
          tertiary_label: 'Tackles/90',
          tertiary_val: '3.8',
          stats_grid: [
            { label: 'Interceptions/90', val: '4.1' },
            { label: 'Clearances/90', val: '6.8' },
            { label: 'Ground Duels Won', val: '74.5%' },
            { label: 'Clean Sheets', val: '11' },
            { label: 'Long Ball Acc', val: '78.2%' },
            { label: 'Fouls Committed/90', val: '0.7' }
          ]
        },
        status: 'Seeking Agent',
        representation_tier: 'Seeking European Representation',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Manager',
          viewer: 'Public Profile, Scouting Clips',
          contributor: 'Add Tactical Analysis, Performance Data',
          manager: 'European Trial Coordination, Club Inquiries',
          representative: 'Club Contract Negotiations'
        },
        career: [
          { season: '2025-26', team: 'Accra Lions Elite', league: 'Ghana Premier League', notes: 'Voted Best Young Defender of the Season.' },
          { season: '2024-25', team: 'Right to Dream Academy', league: 'U19 International Tournaments', notes: 'Captained squad through Denmark and UK showcases.' }
        ],
        achievements: [
          '2026 Ghana Premier League Best Young Defender',
          '2025 Gothia Cup International U19 Finalist',
          'Ghana U23 National Team Starting Centre-Back'
        ],
        academics: {
          institution: 'Right to Dream Academy',
          gpa: '3.50',
          eligibility: 'FIFA Transfer Matching System (TMS) Ready',
          standardized_score: 'WAEC Certified'
        },
        highlights: [
          { title: 'Dominant Aerial Defending & 1v1 Ground Duels 2026', duration: '4:50', tag: 'Game Tape' },
          { title: 'Progressive Ball-Playing & 50-Yard Diagonal Passes', duration: '3:15', tag: 'Tactical Tape' },
          { title: 'Goal-Line Blocks & Box Defending Showcase', duration: '2:40', tag: 'Highlights' }
        ],
        news: [
          { date: 'Sep 2026', source: 'African Football Telemetry', headline: 'Kofi Mensah Leads Continental Defenders in Aerial Duel Success at 89.2%' }
        ],
        avatar_color: '#EC4899'
      },
      {
        id: 'ath-05',
        name: 'Mateo Rossi',
        jersey: '#3',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '96.4',
        national_rank: 'BSN #1 ROOKIE',
        school_team: 'Capitanes de Arecibo / UPR',
        sport: 'Basketball',
        discipline: "Men's Basketball",
        position: 'Point Guard',
        country: 'Puerto Rico',
        flag: '🇵🇷',
        city: 'San Juan',
        age: 22,
        dob: '2004-11-04',
        gender: 'Male',
        biometrics: {
          height: "6'2\"",
          height_in: 74,
          weight_lbs: 188,
          wingspan: "6'5\"",
          wingspan_in: 77,
          dominant_hand: 'Right',
          dominant_foot: 'Right',
          reach: "8'2\""
        },
        combine: {
          vertical_leap_in: 36.0,
          sprint_time: '4.45s',
          lane_agility: '10.45s',
          shuttle_run: '2.98s'
        },
        performance: {
          primary_label: 'APG',
          primary_val: '9.2',
          secondary_label: 'PPG',
          secondary_val: '16.1',
          tertiary_label: '3PT%',
          tertiary_val: '41.8%',
          stats_grid: [
            { label: 'AST/TO Ratio', val: '3.8' },
            { label: 'SPG', val: '2.1' },
            { label: 'FT%', val: '88.2%' },
            { label: 'Plus/Minus', val: '+14.6' },
            { label: 'Clutch FG%', val: '54.2%' },
            { label: 'Minutes', val: '33.5' }
          ]
        },
        status: 'Free Agent',
        representation_tier: 'Seeking Agent',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Profile',
          contributor: 'Add Videos & Stats',
          manager: 'Overseas Inquiries',
          representative: 'BSN & Overseas Contract Negotiations'
        },
        career: [
          { season: '2025-26', team: 'Bayamón Vaqueros Reserves', league: 'BSN Puerto Rico', notes: 'Averaged 9.2 assists per game; Sixth Man of the Year.' },
          { season: '2023-25', team: 'Miami Dade College', league: 'NJCAA D1', notes: 'First Team All-American; 18.2 PPG, 8.4 APG.' }
        ],
        achievements: [
          '2026 BSN Puerto Rico Reserve League Playoff MVP',
          '2025 NJCAA D1 First Team All-American',
          '2024 Pan-American U21 Silver Medalist (Puerto Rico National Team)'
        ],
        academics: {
          institution: 'Miami Dade / UPR Rio Piedras',
          gpa: '3.35',
          eligibility: 'Pro Free Agent / FIBA Licensed',
          standardized_score: 'Associate Degree in Kinesiology'
        },
        highlights: [
          { title: 'Pick-and-Roll Mastery & Passing Vision Compilation', duration: '6:10', tag: 'Game Tape' },
          { title: 'Full Game Breakdown vs San German : 22 Pts, 14 Ast', duration: '8:30', tag: 'Full Game' },
          { title: 'Pull-Up 3PT Shooting & Floater Package in Traffic', duration: '3:40', tag: 'Shooting Tape' }
        ],
        news: [
          { date: 'Jul 2026', source: 'El Nuevo Dia Sports', headline: 'Mateo Rossi Records 14 Assists in BSN Reserve Finals Win' }
        ],
        avatar_color: '#06B6D4'
      },
      {
        id: 'ath-06',
        name: 'Rohan Sharma',
        jersey: '#18',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '95.9',
        national_rank: 'CPL #1 U19 PACER',
        school_team: 'Fatima College / Trinbago Knight Riders',
        sport: 'Cricket',
        discipline: 'Pace Bowling & Power Hitting',
        position: 'Fast Bowler',
        country: 'Trinidad & Tobago',
        flag: '🇹🇹',
        city: 'Port of Spain',
        age: 20,
        dob: '2006-05-18',
        gender: 'Male',
        biometrics: {
          height: "6'4\"",
          height_in: 76,
          weight_lbs: 190,
          wingspan: "6'6\"",
          wingspan_in: 78,
          dominant_hand: 'Right (Bat & Bowl)',
          dominant_foot: 'Right',
          reach: "8'5\""
        },
        combine: {
          vertical_leap_in: 32.0,
          sprint_time: '144 km/h (Peak Bowling Speed)',
          lane_agility: 'Beep Test 15.2',
          shuttle_run: '20m Sprint: 2.89s'
        },
        performance: {
          primary_label: 'Peak Speed',
          primary_val: '144.2 km/h',
          secondary_label: 'Wickets',
          secondary_val: '32',
          tertiary_label: 'Batting Avg',
          tertiary_val: '34.5',
          stats_grid: [
            { label: 'Bowling Avg', val: '18.4' },
            { label: 'Economy Rate', val: '5.12' },
            { label: 'Strike Rate', val: '21.6' },
            { label: 'T20 Strike Rate (Bat)', val: '158.4' },
            { label: '5-Wicket Hauls', val: '3' },
            { label: 'Matches', val: '14' }
          ]
        },
        status: 'Seeking Agent',
        representation_tier: 'Available for Global Franchise Drafts',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Stats, Ball Telemetry',
          contributor: 'Match Scorecards, Bowling Videos',
          manager: 'Franchise Camp Inquiries',
          representative: 'CPL, IPL, and Global Franchise Agency Signings'
        },
        career: [
          { season: '2026', team: 'Trinbago Knight Riders Reserves', league: 'CPL Development League', notes: 'Took 32 wickets at 144 km/h; Hit 3 half-centuries batting at #7.' },
          { season: '2024-25', team: "Queen's Park CC", league: 'Trinidad Premiership', notes: 'Leading fast bowler in domestic championship.' }
        ],
        achievements: [
          '2026 CPL Development League Bowler of the Tournament',
          '2025 West Indies U19 World Cup Squad Spearhead',
          'Fastest Recorded Ball in Regional U20 History (144.2 km/h)'
        ],
        academics: {
          institution: 'Fatima College',
          gpa: '3.45',
          eligibility: 'WICB & ICC Certified Player',
          standardized_score: 'CAPE Certified'
        },
        highlights: [
          { title: '144 km/h Bouncers & Toe-Crushing Yorkers Compilation', duration: '4:15', tag: 'Bowling Reel' },
          { title: 'Power Hitting : 48 Runs off 19 Balls in CPL Semi-Final', duration: '3:20', tag: 'Batting Tape' },
          { title: 'Speed Gun Telemetry & Bowling Action Biomechanics', duration: '2:50', tag: 'Technical Data' }
        ],
        news: [
          { date: 'Sep 2026', source: 'Caribbean Cricket Weekly', headline: 'Rohan Sharma Expected to Spark Bidding War in Upcoming CPL & ILT20 Drafts' }
        ],
        avatar_color: '#8B5CF6'
      },
      {
        id: 'ath-07',
        name: 'Chloe Henderson',
        jersey: '#5',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '96.5',
        national_rank: 'CARIFTA #1 SPRINT',
        school_team: 'Harrison College / Black Sands Swim Squad',
        sport: 'Swimming',
        discipline: 'Sprint Freestyle & Butterfly',
        position: 'Freestyle',
        country: 'Barbados',
        flag: '🇧🇧',
        city: 'Bridgetown',
        age: 19,
        dob: '2007-03-29',
        gender: 'Female',
        biometrics: {
          height: "5'10\"",
          height_in: 70,
          weight_lbs: 145,
          wingspan: "6'1\"",
          wingspan_in: 73,
          dominant_hand: 'Right',
          dominant_foot: 'Right',
          reach: "7'11\""
        },
        combine: {
          vertical_leap_in: 26.0,
          sprint_time: '24.88s (50m Free)',
          lane_agility: 'Reaction Time: 0.62s',
          shuttle_run: '100m Free: 54.92s'
        },
        performance: {
          primary_label: '50m Free',
          primary_val: '24.88s',
          secondary_label: '100m Free',
          secondary_val: '54.92s',
          tertiary_label: '50m Fly',
          tertiary_val: '26.42s',
          stats_grid: [
            { label: 'CARIFTA Gold', val: '3 Medals' },
            { label: 'Reaction Time', val: '0.62s' },
            { label: 'Stroke Rate (50m)', val: '54 strokes/min' },
            { label: 'Turn Time', val: '1.08s' },
            { label: 'National Records', val: '2 Senior Records' },
            { label: 'FINA Points', val: '848 Pts' }
          ]
        },
        status: 'Seeking Agent',
        representation_tier: 'Seeking NCAA / Pro Representation',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Meet Splits',
          contributor: 'Add Swim Times & Stroke Video',
          manager: 'Collegiate & Sponsor Outreach',
          representative: 'Endorsement & Olympic Pathway Management'
        },
        career: [
          { season: '2026', team: 'Barbados Aquatic Center Elite', league: 'World Aquatics Championship Qualifiers', notes: 'Broke national senior 50m freestyle mark with 24.88s.' },
          { season: '2025', team: 'Barbados National Swim Team', league: 'CARIFTA Swimming Championships', notes: 'Triple Gold Medalist in 50m Free, 100m Free, 50m Fly.' }
        ],
        achievements: [
          '2026 Barbados National Senior Record Holder (50m Free : 24.88s)',
          '2025 CARIFTA Swim Championships High Point Trophy',
          '2024 Junior Pan-Pacific Championship Finalist'
        ],
        academics: {
          institution: 'Harrison College',
          gpa: '3.90',
          eligibility: 'NCAA Division 1 Certified (Fall 2027 Class)',
          standardized_score: 'SAT 1340'
        },
        highlights: [
          { title: '24.88s National Record 50m Free Race Video & Splits', duration: '1:30', tag: 'Race Footage' },
          { title: 'Underwater Turn Mechanics & Dolphin Kick Underwater Cam', duration: '2:10', tag: 'Biomechanics' },
          { title: '100m Freestyle Pacing & Stroke Rate Analysis', duration: '2:40', tag: 'Race Footage' }
        ],
        news: [
          { date: 'Apr 2026', source: 'SwimSwam Caribbean', headline: 'Chloe Henderson Becomes First Bajan Woman Under 25 Seconds in 50m Free' }
        ],
        avatar_color: '#14B8A6'
      },
      {
        id: 'ath-08',
        name: 'Malik Thorne',
        jersey: '#1',
        star_rating: '★★★★★ 5-STAR',
        composite_grade: '97.8',
        national_rank: 'AMBC #1 CONTENDER',
        school_team: 'Excelsior High / Stanley Couch Gym',
        sport: 'Boxing',
        discipline: 'Combat Sports',
        position: 'Light Heavyweight',
        country: 'Jamaica',
        flag: '🇯🇲',
        city: 'Kingston',
        age: 21,
        dob: '2005-04-12',
        gender: 'Male',
        biometrics: {
          height: "6'2\"",
          height_in: 74,
          weight_lbs: 175,
          wingspan: "6'6\" (78\" Reach)",
          wingspan_in: 78,
          dominant_hand: 'Orthodox (Heavy Right Hand)',
          dominant_foot: 'Orthodox',
          reach: '78"'
        },
        combine: {
          vertical_leap_in: 33.5,
          sprint_time: 'Punch Velocity 11.2 m/s',
          lane_agility: 'VO2 Max 62.4 ml/kg',
          shuttle_run: 'Reaction 0.19s'
        },
        performance: {
          primary_label: 'Amateur Record',
          primary_val: '16-1',
          secondary_label: 'KO Ratio',
          secondary_val: '75%',
          tertiary_label: 'Punch Speed',
          tertiary_val: '11.2 m/s',
          stats_grid: [
            { label: 'Total Fights', val: '17' },
            { label: 'Knockouts', val: '12' },
            { label: 'Jab Accuracy', val: '48.2%' },
            { label: 'Power Punch Acc', val: '54.6%' },
            { label: 'Opponent Conn%', val: '18.2%' },
            { label: 'National Rank', val: '#1 Light Heavyweight' }
          ]
        },
        status: 'Seeking Agent',
        representation_tier: 'Seeking Professional Agency Sign-off',
        agent_name: null,
        agent_id: null,
        verification: {
          identity: true,
          athletic: true,
          stats: true,
          pro: true,
          tier: 'Professionally Verified'
        },
        permissions: {
          current_level: 'Representative',
          viewer: 'Public Fight Record',
          contributor: 'Sparring Footage, Punch Metrics',
          manager: 'Promoter & Sparring Camp Bookings',
          representative: 'Pro Promotional Contracts & Purse Escrow'
        },
        career: [
          { season: '2026', team: 'Stanley Couch Gym Kingston', league: 'National Amateur Boxing Series', notes: 'National Golden Gloves Champion; 4 consecutive stoppage victories.' },
          { season: '2025', team: 'Jamaica National Boxing Team', league: 'AMBC Continental Championships', notes: 'Silver Medalist in Guayaquil, Ecuador.' }
        ],
        achievements: [
          '2026 National Golden Gloves Champion (Light Heavyweight)',
          '2025 AMBC Continental Boxing Championships Silver Medalist',
          '2024 Caribbean Boxing Championships Outstanding Boxer Award'
        ],
        academics: {
          institution: 'Excelsior High School',
          gpa: '3.10',
          eligibility: 'Ready to Transition to Professional Ranks (WBC/WBA)',
          standardized_score: 'Olympic Certified Athlete'
        },
        highlights: [
          { title: 'Knockout Highlights : 12 Stoppages in 16 Amateur Wins', duration: '4:40', tag: 'Fight Reel' },
          { title: '78-Inch Reach Jab Placement & Ring Generalship', duration: '3:15', tag: 'Sparring Video' },
          { title: 'Heavy Bag Velocity Telemetry & Reaction Drills', duration: '2:30', tag: 'Training Tape' }
        ],
        news: [
          { date: 'Aug 2026', source: 'BoxingScene Caribbean', headline: 'Hard-Hitting Light Heavyweight Malik Thorne Preparing for Professional Debut' }
        ],
        avatar_color: '#EF4444'
      }
    ],
    agents: [
      {
        id: 'agt-01',
        name: 'Marcus Vance',
        agency: 'Pinnacle Sports Global',
        title: 'Senior Managing Director & Licensed Agent',
        sports: ['Basketball', 'Football'],
        disciplines: ["Men's & Women's Basketball", 'Premier League & European Football'],
        countries: ['Jamaica', 'United Kingdom', 'United States', 'Canada'],
        athletes_count: 42,
        experience_years: 14,
        credentials: [
          'FIFA Licensed Agent (#2024-8841)',
          "FIBA Certified Players' Agent (#FIBA-1092)",
          'National Basketball Players Association (NBPA) Certified'
        ],
        commission_rate: '7.5% Standard Gross Contract Value',
        verification_tier: 'Professionally Verified Agency',
        rating: 4.9,
        review_count: 38,
        bio: 'Specializing in bridging elite Caribbean and UK athletic talent into tier-1 professional leagues, collegiate scholarships, and commercial endorsement deals. Over $34M in total career contracts negotiated with zero player contract disputes.',
        notable_clients: ['Aliyah Blake (Track)', 'Kevon Bailey (Championship Football)', 'Jalen Clarke (EuroLeague)'],
        active_deals_usd: '$12.8M Active Contracts',
        avatar_color: '#2563EB',
        headquarters: 'London & Kingston',
        contact: {
          email: 'm.vance@pinnaclesports.com',
          phone: '+44 20 7946 0912',
          whatsapp: '+1 876 555 8821'
        }
      },
      {
        id: 'agt-02',
        name: 'Elena Rostova',
        agency: 'EuroHoops & Athletics Management',
        title: 'Director of International Scouting & Representation',
        sports: ['Basketball', 'Track & Field'],
        disciplines: ['EuroLeague / EuroCup Basketball', 'Diamond League Track & Field'],
        countries: ['Germany', 'Spain', 'Jamaica', 'Bahamas', 'France'],
        athletes_count: 28,
        experience_years: 11,
        credentials: [
          'FIBA International Agent License',
          'World Athletics Authorised Athlete Representative (#WA-7712)',
          'Spanish Basketball Federation (FEB) Registered'
        ],
        commission_rate: '8.0% Professional Playing Contracts',
        verification_tier: 'Professionally Verified Agency',
        rating: 4.8,
        review_count: 29,
        bio: 'Boutique representation firm focused on high-upside Caribbean athletes seeking immediate European contracts, high-level training facilities, and Olympic pathway support.',
        notable_clients: ['Darius Vance (Long Jump)', 'Lucas Fernandez (ACB Liga)'],
        active_deals_usd: '$8.4M Active Contracts',
        avatar_color: '#F59E0B',
        headquarters: 'Munich & Madrid',
        contact: {
          email: 'elena@eurohoopsmgmt.eu',
          phone: '+49 89 2018 4400',
          whatsapp: '+49 171 555 9012'
        }
      },
      {
        id: 'agt-03',
        name: 'Andre Campbell',
        agency: 'Caribbean Elite Sports Group',
        title: 'Founding Partner & Lead Sports Attorney',
        sports: ['Track & Field', 'Cricket', 'Football'],
        disciplines: ['Short Sprints', 'CPL / Franchise Cricket', 'CONCACAF & MLS Football'],
        countries: ['Jamaica', 'Trinidad & Tobago', 'Barbados', 'USA'],
        athletes_count: 36,
        experience_years: 16,
        credentials: [
          'Attorney-at-Law (Jamaica & New York Bar)',
          'World Athletics Authorised Representative',
          'West Indies Cricket Board (WICB) Accredited Agent'
        ],
        commission_rate: '7.0% Standard Marketing & Club Contracts',
        verification_tier: 'Professionally Verified Agency',
        rating: 4.95,
        review_count: 45,
        bio: 'Founded on the core principle of athlete data and career ownership. Andre Campbell provides bulletproof legal representation, financial literacy mentoring, and global brand endorsements for Caribbean sporting champions.',
        notable_clients: ['Rohan Sharma (Cricket)', 'Tariq Sterling (Prospect Roster)'],
        active_deals_usd: '$16.2M Active Contracts',
        avatar_color: '#10B981',
        headquarters: 'Kingston & Port of Spain',
        contact: {
          email: 'andre@caribbeanelitesports.com',
          phone: '+1 876 926 4410',
          whatsapp: '+1 876 509 9920'
        }
      },
      {
        id: 'agt-04',
        name: 'Sarah Jenkins',
        agency: 'Pacific Vanguard Sports',
        title: 'Vice President of Collegiate & NIL Recruitment',
        sports: ['Swimming', 'Basketball'],
        disciplines: ['NCAA D1 / NIL Endorsements', 'FINA Pro Tour Swimming'],
        countries: ['United States', 'Barbados', 'Australia'],
        athletes_count: 22,
        experience_years: 9,
        credentials: [
          'NCAA Certified Agent Representative',
          'FINA Registered Athletes Manager',
          'Sports Lawyers Association (SLA) Active Member'
        ],
        commission_rate: '6.5% Commercial & Brand NIL Deals',
        verification_tier: 'Professionally Verified Agency',
        rating: 4.85,
        review_count: 24,
        bio: 'Pioneering NIL monetization and elite American collegiate placement for international aquatic and hardwood stars. Transparent flat-fee advisory with zero commission taken from academic scholarships.',
        notable_clients: ['Chloe Henderson (Aquatics)', 'Maya Williams (NCAA Final Four)'],
        active_deals_usd: '$5.8M Active Contracts',
        avatar_color: '#8B5CF6',
        headquarters: 'Los Angeles & Miami',
        contact: {
          email: 'sjenkins@pacificvanguard.com',
          phone: '+1 310 555 0194',
          whatsapp: '+1 310 555 7780'
        }
      }
    ],
    opportunities: [
      {
        id: 'opp-01',
        title: 'International Attacking Winger & Striker Showcase',
        organization: 'Manchester City Football Group / New York City FC Pathway',
        org_type: 'Tier 1 Professional Club & Academy',
        sport: 'Football',
        discipline: "Men's Association Football",
        location: 'Kingston, Jamaica (National Stadium)',
        date: 'November 14-16, 2026',
        deadline: 'October 30, 2026',
        requirements: {
          age_range: '18 to 22 Years Old',
          position: 'Winger / Striker',
          verification: 'Minimum Athletic Verified Profile Required',
          sprint_threshold: 'Top Speed > 33.5 km/h or 100m < 11.2s',
          eligibility: 'Free Agent or Transfer Available'
        },
        compensation: 'Full Pro First-Team / MLS Next Pro Contract + Relocation & Visa Sponsorship',
        spots_available: 3,
        applicants_count: 48,
        status: 'Open',
        tags: ['Pro Contract', 'MLS / Europe Pathway', 'Visa Provided'],
        badge_color: '#0284C7'
      },
      {
        id: 'opp-02',
        title: 'NCAA Division 1 Full Athletic Scholarship Combine',
        organization: 'ACC / SEC Invitational Scouting Combine',
        org_type: 'Collegiate Athletic Conference',
        sport: 'Basketball',
        discipline: "Men's Basketball",
        location: 'Miami, Florida (FIU Arena)',
        date: 'December 5-7, 2026',
        deadline: 'November 20, 2026',
        requirements: {
          age_range: '18 to 21 Years Old',
          position: 'Guards & Athletic Wings',
          verification: 'NCAA Clearinghouse Eligibility Required',
          height_threshold: "6'2\" Minimum for Guards / 6'6\" for Wings",
          academics: 'GPA > 3.0'
        },
        compensation: '4-Year Full Ride Tuition, Housing, Dining, Medical & NIL Collective Eligibility ($85k/yr Value)',
        spots_available: 6,
        applicants_count: 64,
        status: 'Open',
        tags: ['NCAA D1', 'Full Scholarship', 'NIL Eligible'],
        badge_color: '#F59E0B'
      },
      {
        id: 'opp-03',
        title: 'Diamond League Emerging Sprinter Invitational Trials',
        organization: 'World Athletics / European Athletics Tour',
        org_type: 'Global Governing Body & Circuit',
        sport: 'Track & Field',
        discipline: '100m / 200m Short Sprints',
        location: 'Zurich, Switzerland (Letzigrund)',
        date: 'January 18, 2027',
        deadline: 'December 1, 2026',
        requirements: {
          age_range: '17 to 23 Years Old',
          position: '100m / 200m',
          verification: 'World Athletics Verified Timing',
          timing_threshold: 'Men Sub-10.30s / Women Sub-11.20s',
          eligibility: 'Open to Caribbean & Global Athletes'
        },
        compensation: 'Travel Stipend ($5,000 USD), Housing, Appearance Fees & Shoe Sponsor Showcase',
        spots_available: 8,
        applicants_count: 32,
        status: 'Open',
        tags: ['Diamond League', 'Appearance Fee', 'Shoe Contract'],
        badge_color: '#10B981'
      },
      {
        id: 'opp-04',
        title: 'Caribbean Premier League (CPL) Emerging Player Draft',
        organization: 'West Indies Cricket & CPL Franchise Consortium',
        org_type: 'T20 Professional Franchise League',
        sport: 'Cricket',
        discipline: 'Fast Bowling & All-Rounders',
        location: 'Kensington Oval, Bridgetown, Barbados',
        date: 'February 12, 2027',
        deadline: 'January 15, 2027',
        requirements: {
          age_range: '19 to 23 Years Old',
          position: 'Fast Bowler / Power Hitting All-Rounder',
          verification: 'Verified Speed Gun Telemetry (>138 km/h)',
          eligibility: 'Regional WICB Registered'
        },
        compensation: 'CPL Professional Draft Contract ($25,000 to $75,000 USD Base)',
        spots_available: 5,
        applicants_count: 29,
        status: 'Open',
        tags: ['CPL Draft', 'T20 Contract', 'Franchise Bonus'],
        badge_color: '#8B5CF6'
      }
    ],
    scoutLists: [
      {
        id: 'list-01',
        title: '2027 Caribbean Basketball Prospects',
        scout_name: 'Derrick Sterling (International Scout)',
        description: "High-ceiling guards and wings with 6'5\"+ physical frame and NCAA/EuroLeague wingspan profiles.",
        athlete_ids: ['ath-01', 'ath-05'],
        created_at: '2026-10-01',
        notes: 'Kamal Harvey is priority 1 for Miami combine. Mateo Rossi possesses elite pick-and-roll passing.'
      },
      {
        id: 'list-02',
        title: 'Unsigned Attacking Football Talents (Caribbean & West Africa)',
        scout_name: 'New York City FC / City Football Group',
        description: 'Explosive wingers and physical centre-backs ready for professional trial combine in Kingston.',
        athlete_ids: ['ath-02', 'ath-04'],
        created_at: '2026-09-25',
        notes: 'Tariq Sterling clocked at 34.8 km/h. Kofi Mensah dominant in aerial duels (89.2%).'
      },
      {
        id: 'list-03',
        title: 'World U20 Sprint & Aquatic Medal Contenders',
        scout_name: 'Global Olympic Pathway Consortium',
        description: 'Track & swimming prodigies meeting World Athletics & FINA international qualifying standards.',
        athlete_ids: ['ath-03', 'ath-07'],
        created_at: '2026-09-18',
        notes: 'Aliyah Blake sub-11s 100m. Chloe Henderson national record holder under 25s in 50m free.'
      }
    ],
    transactions: [
      {
        id: 'tx-1001',
        date: '2026-10-04',
        type: 'Representation Agreement Retainer',
        payer: 'Aliyah Blake (Athlete)',
        payee: 'Pinnacle Sports Global (Marcus Vance)',
        amount_usd: 1500.00,
        fee_type: 'Retainer Escrow',
        status: 'Escrow Held',
        contract_ref: 'AGR-2026-0881',
        description: 'Initial digital representation retainer and international travel logistics fund.'
      },
      {
        id: 'tx-1002',
        date: '2026-10-02',
        type: 'Scout Enterprise Database Subscription',
        payer: 'New York City FC Scouting Dept',
        payee: 'Apex Athlete Exchange (Platform)',
        amount_usd: 4800.00,
        fee_type: 'Annual Platform Subscription',
        status: 'Settled',
        contract_ref: 'SUB-SC-9021',
        description: 'Unlimited Caribbean & Latin American biometric video database access + direct WhatsApp scout dispatch.'
      },
      {
        id: 'tx-1003',
        date: '2026-09-28',
        type: 'Combine Registration & Medical Telemetry',
        payer: 'Tariq Sterling (Athlete)',
        payee: 'Apex Combine Operations',
        amount_usd: 250.00,
        fee_type: 'Combine Verification Fee',
        status: 'Settled',
        contract_ref: 'CMB-2026-JAM-04',
        description: 'GPS speed tracking, laser gate sprint calibration, and orthopedic medical clearance badge.'
      },
      {
        id: 'tx-1004',
        date: '2026-09-15',
        type: 'Club Transfer Commission',
        payer: 'EuroHoops & Athletics Management',
        payee: 'Elena Rostova (Lead Agent)',
        amount_usd: 14200.00,
        fee_type: 'Player Contract Commission',
        status: 'Settled',
        contract_ref: 'TRF-2026-ACB-19',
        description: '8.0% standard agency commission disbursed upon first-team contract execution in Spanish ACB Liga.'
      }
    ]
  };

  /* ==========================================================================
     2. UI INITIALIZATION & EVENT WIRING
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initRoleSwitcher();
    initNavigation();
    initDiscoveryFilters();
    initModals();
    initRepresentationStepper();
    initOpportunityApplication();
    initScoutTools();

    // Initial renders across all modules
    renderProspectsGrid();
    renderProfileView(STATE.selectedAthleteId);
    renderAgentsGrid();
    renderScoutListsGrid();
    renderComparisonMatrix();
    renderOpportunitiesGrid();
    renderLedger();
    updateCompareBadge();
  });

  /* ==========================================================================
     3. ROLE SWITCHER CONTROLLER (5-WAY DYNAMIC CONTEXT)
     ========================================================================== */
  function initRoleSwitcher() {
    const pills = document.querySelectorAll('#rolePillsBar .role-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const role = pill.getAttribute('data-role');
        setAccountRole(role);
      });
    });
  }

  function setAccountRole(role) {
    STATE.activeRole = role;

    // Update active pill UI
    document.querySelectorAll('#rolePillsBar .role-pill').forEach((p) => {
      p.classList.toggle('active', p.getAttribute('data-role') === role);
    });

    const userActingAs = document.getElementById('userActingAs');
    const userTierPill = document.getElementById('userTierPill');
    const walletAmount = document.getElementById('walletAmount');
    const bannerAvatar = document.getElementById('bannerAvatar');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerSubtitle = document.getElementById('bannerSubtitle');
    const headerActionBtn = document.getElementById('headerActionBtn');
    const bannerActionOne = document.getElementById('bannerActionOne');
    const bannerActionTwo = document.getElementById('bannerActionTwo');

    switch (role) {
      case 'athlete':
        userActingAs.textContent = 'Kamal Harvey (Prospect)';
        userTierPill.textContent = 'VERIFIED PRO TIER';
        walletAmount.textContent = '$14,200 USD';
        bannerAvatar.textContent = 'KH';
        bannerAvatar.style.backgroundColor = '#2563EB';
        bannerTitle.textContent = 'Welcome to your Athletic Command Portal, Kamal Harvey';
        bannerSubtitle.textContent = 'Your sports resume is live and verified across 4 metrics. You have 14 scout viewings and 2 pending agency representation inquiries this week.';
        bannerActionOne.textContent = 'Review Agent Offers';
        bannerActionTwo.textContent = 'Log Combine Time';
        bannerActionOne.onclick = () => switchSection('agents');
        bannerActionTwo.onclick = () => showToast('Laser gate combine splits synced with National Stadium facility.', 'success');
        headerActionBtn.innerHTML = '<span>+ Log Combine Split</span>';
        headerActionBtn.onclick = () => showToast('New combine split entry submitted for biometric validation.', 'success');
        break;

      case 'agent':
        userActingAs.textContent = 'Marcus Vance (Pinnacle Sports)';
        userTierPill.textContent = 'FIFA & FIBA LICENSED';
        walletAmount.textContent = '$48,750 USD';
        bannerAvatar.textContent = 'MV';
        bannerAvatar.style.backgroundColor = '#10B981';
        bannerTitle.textContent = 'Agency Roster & Negotiation Desk : Marcus Vance';
        bannerSubtitle.textContent = 'Managing 42 international prospects across UK, European and Caribbean circuits. $12.8M in active pro contracts currently in escrow.';
        bannerActionOne.textContent = 'Scout Unsigned Prospects';
        bannerActionTwo.textContent = 'Review Escrow Pipeline';
        bannerActionOne.onclick = () => switchSection('discovery');
        bannerActionTwo.onclick = () => switchSection('ledger');
        headerActionBtn.innerHTML = '<span>+ Add Prospect to Roster</span>';
        headerActionBtn.onclick = () => switchSection('discovery');
        break;

      case 'scout':
        userActingAs.textContent = 'Derrick Sterling (Scout)';
        userTierPill.textContent = 'INTERNATIONAL TALENT SCOUT';
        walletAmount.textContent = 'Enterprise Pass Active';
        bannerAvatar.textContent = 'DS';
        bannerAvatar.style.backgroundColor = '#F59E0B';
        bannerTitle.textContent = 'Global Scouting & Evaluation Terminal : Derrick Sterling';
        bannerSubtitle.textContent = 'Filter 1,280+ verified prospects with objective laser telemetry, match videos, and side-by-side biomechanical comparisons.';
        bannerActionOne.textContent = 'Open Watchlists';
        bannerActionTwo.textContent = 'Head-to-Head Compare';
        bannerActionOne.onclick = () => switchSection('scouting');
        bannerActionTwo.onclick = () => {
          switchSection('scouting');
          document.getElementById('comparisonMatrixCard').scrollIntoView({ behavior: 'smooth' });
        };
        headerActionBtn.innerHTML = '<span>+ New Scout Watchlist</span>';
        headerActionBtn.onclick = () => showToast('New Scouting Watchlist created: "2027 European Summer Targets".', 'success');
        break;

      case 'organization':
        userActingAs.textContent = 'Kingston Phoenix FC / Combine Dir';
        userTierPill.textContent = 'TIER 1 COMBINE HOST';
        walletAmount.textContent = '$120,000 USD Escrow';
        bannerAvatar.textContent = 'KP';
        bannerAvatar.style.backgroundColor = '#0284C7';
        bannerTitle.textContent = 'Combine Director & Trial Operations : Kingston Phoenix FC';
        bannerSubtitle.textContent = 'Receiving verified talent dossiers for upcoming pro trial combines. 48 prospect applications pending committee review.';
        bannerActionOne.textContent = 'Review Combine Applications';
        bannerActionTwo.textContent = 'Publish New Trial';
        bannerActionOne.onclick = () => switchSection('opportunities');
        bannerActionTwo.onclick = () => showToast('Combine registration form opened for new international trial post.', 'info');
        headerActionBtn.innerHTML = '<span>+ Post Combine Trial</span>';
        headerActionBtn.onclick = () => showToast('Combine trial submission form opened.', 'info');
        break;

      case 'admin':
        userActingAs.textContent = 'Superadmin Console (AAX Oversight)';
        userTierPill.textContent = 'MASTER ESCROW AUTHORITY';
        walletAmount.textContent = '$38,420 USD Vault';
        bannerAvatar.textContent = 'AA';
        bannerAvatar.style.backgroundColor = '#8B5CF6';
        bannerTitle.textContent = 'Apex Platform Verification & Verified Escrow Oversight';
        bannerSubtitle.textContent = 'Auditing verified sports credentials, dispute-free multi-signature escrow settlements, and agency representation filings.';
        bannerActionOne.textContent = 'Audit Escrow Vault';
        bannerActionTwo.textContent = 'Verify New Prospects';
        bannerActionOne.onclick = () => switchSection('ledger');
        bannerActionTwo.onclick = () => switchSection('discovery');
        headerActionBtn.innerHTML = '<span>+ Audit Ledger Release</span>';
        headerActionBtn.onclick = () => showToast('Multi-signature escrow audit report generated successfully.', 'success');
        break;
    }

    showToast(`Switched active view to: ${userActingAs.textContent}`, 'info');
  }

  /* ==========================================================================
     4. PRIMARY SECTION TAB NAVIGATION
     ========================================================================== */
  function initNavigation() {
    const navButtons = document.querySelectorAll('#navLinksWrap .nav-tab-btn');
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sectionId = btn.getAttribute('data-section');
        switchSection(sectionId);
      });
    });

    // Compare queue trigger button
    const openCompareBtn = document.getElementById('openCompareBtn');
    if (openCompareBtn) {
      openCompareBtn.addEventListener('click', () => {
        switchSection('scouting');
        const compareCard = document.getElementById('comparisonMatrixCard');
        if (compareCard) {
          compareCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Footer navigation links
    document.querySelectorAll('.footer-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        if (target) {
          switchSection(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  function switchSection(sectionId) {
    STATE.activeSection = sectionId;

    // Update active nav button
    document.querySelectorAll('#navLinksWrap .nav-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === sectionId);
    });

    // Update active section
    document.querySelectorAll('.platform-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`section-${sectionId}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Refresh contents if needed
    if (sectionId === 'scouting') {
      renderComparisonMatrix();
    }
  }

  /* ==========================================================================
     5. TALENT DISCOVERY FILTERS & PROSPECTS GRID
     ========================================================================== */
  function initDiscoveryFilters() {
    const searchInput = document.getElementById('athleteSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.filter.search = e.target.value.trim().toLowerCase();
        renderProspectsGrid();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        STATE.filter.search = '';
        renderProspectsGrid();
      });
    }

    // Sport pills
    const sportPills = document.querySelectorAll('#sportFilterPills .sport-pill');
    sportPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        sportPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        STATE.filter.sport = pill.getAttribute('data-sport');
        renderProspectsGrid();
      });
    });

    // Select filters
    const filterPos = document.getElementById('filterPosition');
    if (filterPos) {
      filterPos.addEventListener('change', (e) => {
        STATE.filter.position = e.target.value;
        renderProspectsGrid();
      });
    }

    const filterCountry = document.getElementById('filterCountry');
    if (filterCountry) {
      filterCountry.addEventListener('change', (e) => {
        STATE.filter.country = e.target.value;
        renderProspectsGrid();
      });
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        STATE.filter.status = e.target.value;
        renderProspectsGrid();
      });
    }

    const filterVerification = document.getElementById('filterVerification');
    if (filterVerification) {
      filterVerification.addEventListener('change', (e) => {
        STATE.filter.verification = e.target.value;
        renderProspectsGrid();
      });
    }

    // Height slider
    const filterHeight = document.getElementById('filterHeight');
    const filterHeightVal = document.getElementById('filterHeightVal');
    if (filterHeight && filterHeightVal) {
      filterHeight.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        STATE.filter.minHeight = val;
        const feet = Math.floor(val / 12);
        const inches = val % 12;
        filterHeightVal.textContent = `${feet}'${inches}"`;
        renderProspectsGrid();
      });
    }

    // Preset NLP chips
    const presetChips = document.querySelectorAll('.nlp-chip');
    presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const preset = chip.getAttribute('data-preset');
        applyNlpPreset(preset);
      });
    });
  }

  function applyNlpPreset(preset) {
    const searchInput = document.getElementById('athleteSearchInput');
    const filterPos = document.getElementById('filterPosition');
    const filterCountry = document.getElementById('filterCountry');
    const filterStatus = document.getElementById('filterStatus');
    const filterHeight = document.getElementById('filterHeight');
    const filterHeightVal = document.getElementById('filterHeightVal');

    // Reset baselines
    if (searchInput) searchInput.value = '';
    STATE.filter.search = '';

    const resetSportPill = (sportName) => {
      document.querySelectorAll('#sportFilterPills .sport-pill').forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-sport') === sportName);
      });
      STATE.filter.sport = sportName;
    };

    switch (preset) {
      case 'unsigned-footballers':
        resetSportPill('Football');
        STATE.filter.country = 'Jamaica';
        if (filterCountry) filterCountry.value = 'Jamaica';
        STATE.filter.status = 'all';
        if (filterStatus) filterStatus.value = 'all';
        STATE.filter.position = 'Left Winger';
        if (filterPos) filterPos.value = 'Left Winger';
        showToast('Filter Applied: Unsigned Jamaican Wingers (18 to 22yo)', 'info');
        break;

      case 'caribbean-basketball':
        resetSportPill('Basketball');
        STATE.filter.minHeight = 77; // 6'5"
        if (filterHeight) filterHeight.value = 77;
        if (filterHeightVal) filterHeightVal.textContent = "6'5\"";
        STATE.filter.country = 'all';
        if (filterCountry) filterCountry.value = 'all';
        STATE.filter.position = 'all';
        if (filterPos) filterPos.value = 'all';
        showToast("Filter Applied: Caribbean Basketball Wings (6'5\"+ / 30\"+ Vertical)", 'info');
        break;

      case 'sprint-prodigies':
        resetSportPill('Track & Field');
        STATE.filter.country = 'all';
        if (filterCountry) filterCountry.value = 'all';
        STATE.filter.position = '100m';
        if (filterPos) filterPos.value = '100m';
        showToast('Filter Applied: Sub-11.00s Track Sprinters', 'info');
        break;

      case 'free-agents':
        resetSportPill('all');
        STATE.filter.status = 'Seeking Agent';
        if (filterStatus) filterStatus.value = 'Seeking Agent';
        showToast('Filter Applied: Available Free Agents & Unrepresented Prospects', 'info');
        break;

      case 'all':
      default:
        resetSportPill('all');
        STATE.filter.position = 'all';
        if (filterPos) filterPos.value = 'all';
        STATE.filter.country = 'all';
        if (filterCountry) filterCountry.value = 'all';
        STATE.filter.status = 'all';
        if (filterStatus) filterStatus.value = 'all';
        STATE.filter.verification = 'all';
        const filterVerification = document.getElementById('filterVerification');
        if (filterVerification) filterVerification.value = 'all';
        STATE.filter.minHeight = 66;
        if (filterHeight) filterHeight.value = 66;
        if (filterHeightVal) filterHeightVal.textContent = "5'8\"";
        showToast('Scouting filters reset to show all prospects.', 'info');
        break;
    }

    renderProspectsGrid();
  }

  function getFilteredAthletes() {
    return STATE.athletes.filter((athlete) => {
      // Search text match
      if (STATE.filter.search) {
        const query = STATE.filter.search;
        const haystack = `${athlete.name} ${athlete.sport} ${athlete.position} ${athlete.discipline} ${athlete.country} ${athlete.city}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      // Sport filter
      if (STATE.filter.sport !== 'all' && athlete.sport !== STATE.filter.sport) {
        return false;
      }

      // Position filter
      if (STATE.filter.position !== 'all') {
        if (!athlete.position.toLowerCase().includes(STATE.filter.position.toLowerCase())) {
          return false;
        }
      }

      // Country filter
      if (STATE.filter.country !== 'all' && athlete.country !== STATE.filter.country) {
        return false;
      }

      // Status filter
      if (STATE.filter.status !== 'all') {
        if (athlete.status !== STATE.filter.status) return false;
      }

      // Min height filter
      if (athlete.biometrics.height_in < STATE.filter.minHeight) {
        return false;
      }

      // Verification tier
      if (STATE.filter.verification === 'pro' && !athlete.verification.pro) {
        return false;
      }

      return true;
    });
  }

  function renderProspectsGrid() {
    const grid = document.getElementById('prospectsGrid');
    const resultsCount = document.getElementById('resultsCount');
    if (!grid) return;

    const filtered = getFilteredAthletes();
    if (resultsCount) {
      resultsCount.textContent = filtered.length;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-medium);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔭</div>
          <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.5rem;">Zero Athletes Match Active Filters</h3>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem;">Try relaxing your height threshold or position constraints, or reset filters to explore our full verified prospect directory.</p>
          <button class="btn btn-cyan-sm" onclick="window.AAX.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((ath) => {
      const inCompare = STATE.compareQueue.includes(ath.id);
      const initials = ath.name.split(' ').map((n) => n[0]).join('');
      const statusClass = ath.status === 'Seeking Agent' ? 'seeking' : ath.status === 'Free Agent' ? 'free' : 'represented';

      return `
        <article class="athlete-card" data-athlete-id="${ath.id}">
          <div class="athlete-card-top">
            <div class="athlete-avatar-badge" style="background: ${ath.avatar_color || '#1E293B'}; position: relative;">
              ${initials}
              <span class="jersey-badge">${ath.jersey}</span>
            </div>
            <div class="athlete-meta-block">
              <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                <span class="verification-shield-pill">✓ Verified Pro Telemetry</span>
                <span class="composite-grade-pill">${ath.star_rating}</span>
                <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--accent-orange); font-weight: 700;">${ath.national_rank}</span>
              </div>
              <h3 class="athlete-name">${ath.name}</h3>
              <span class="athlete-sport-pos">${ath.sport} : ${ath.position}</span>
              <div class="athlete-geo-row">
                <span>${ath.flag} ${ath.city}, ${ath.country}</span>
                <span>•</span>
                <span>Age ${ath.age}</span>
                <span>•</span>
                <span style="font-weight: 600; color: var(--text-primary);">${ath.school_team}</span>
              </div>
            </div>
          </div>

          <!-- BIOMETRICS MICRO GRID -->
          <div class="biometrics-micro-grid">
            <div class="bio-item">
              <span>HEIGHT</span>
              <strong>${ath.biometrics.height}</strong>
            </div>
            <div class="bio-item">
              <span>WEIGHT</span>
              <strong>${ath.biometrics.weight_lbs} lbs</strong>
            </div>
            <div class="bio-item">
              <span>WINGSPAN</span>
              <strong>${ath.biometrics.wingspan}</strong>
            </div>
          </div>

          <!-- STATS BANNER ROW -->
          <div class="stats-banner-row">
            <div class="stat-metric">
              <span>VERTICAL</span>
              <strong>${ath.combine.vertical_leap_in}"</strong>
            </div>
            <div class="stat-metric">
              <span>SPRINT / SPLIT</span>
              <strong>${ath.combine.sprint_time.split(' ')[0]}</strong>
            </div>
            <div class="stat-metric">
              <span>${ath.performance.primary_label}</span>
              <strong>${ath.performance.primary_val}</strong>
            </div>
          </div>

          <div class="status-indicator-tag ${statusClass}">
            ● Representation: <strong>${ath.status}${ath.agent_name ? ` (${ath.agent_name})` : ''}</strong>
          </div>

          <div class="card-actions-row">
            <button class="btn btn-cyan-sm" onclick="window.AAX.viewProfile('${ath.id}')">
              View Sports Resume
            </button>
            <button class="btn ${inCompare ? 'btn-emerald' : 'btn-outline-sm'}" onclick="window.AAX.toggleCompare('${ath.id}')" title="Add to Head-to-Head Compare">
              ${inCompare ? '✓ In Queue' : '+ Compare'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ==========================================================================
     6. SPORTS RÉSUMÉ PROFILE VIEW CONTROLLER
     ========================================================================== */
  function renderProfileView(athleteId) {
    const athlete = STATE.athletes.find((a) => a.id === athleteId) || STATE.athletes[0];
    STATE.selectedAthleteId = athlete.id;

    const container = document.getElementById('profileDossierCard');
    if (!container) return;

    const initials = athlete.name.split(' ').map((n) => n[0]).join('');
    const verticalPercent = Math.min(100, Math.round((athlete.combine.vertical_leap_in / 42) * 100));

    container.innerHTML = `
      <!-- DOSSIER HERO HEADER -->
      <div class="dossier-hero-header">
        <div class="dossier-avatar-large" style="background: ${athlete.avatar_color || '#2563EB'};">
          ${initials}
          <span class="jersey-badge">${athlete.jersey}</span>
        </div>
        <div class="dossier-info-col">
          <div class="dossier-badges-row">
            <span class="v-badge green">✓ Biometrics Laser-Verified</span>
            <span class="v-badge cyan">✓ Official Match Telemetry</span>
            <span class="v-badge gold">✓ ${athlete.star_rating} (${athlete.composite_grade} GRADE)</span>
            <span class="v-badge" style="background: var(--accent-orange-soft); border: 1px solid var(--accent-orange); color: var(--accent-orange); font-weight: 800;">🏆 ${athlete.national_rank}</span>
          </div>
          <h2 class="dossier-name">${athlete.name}</h2>
          <div class="dossier-discipline">${athlete.sport} • ${athlete.discipline} • ${athlete.position}</div>
          <div class="dossier-location-row">
            <span>${athlete.flag} ${athlete.city}, ${athlete.country}</span> | 
            <span>Team / Academy: <strong>${athlete.school_team}</strong></span> | 
            <span>DOB: ${athlete.dob} (${athlete.age} Yrs)</span> | 
            <span>Status: <strong style="color: var(--accent-blue);">${athlete.status}</strong></span>
          </div>

          <!-- ESPN / CSQ BIG THREE SEASON STAT CALLOUT -->
          <div style="display: flex; gap: 0.85rem; margin-top: 1rem; flex-wrap: wrap;">
            <div style="background: var(--bg-surface-subtle); padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); min-width: 110px;">
              <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); display: block;">${athlete.performance.primary_label}</span>
              <strong style="font-family: var(--font-display); font-size: 2rem; color: var(--accent-orange); line-height: 1;">${athlete.performance.primary_val}</strong>
            </div>
            <div style="background: var(--bg-surface-subtle); padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); min-width: 110px;">
              <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); display: block;">${athlete.performance.secondary_label}</span>
              <strong style="font-family: var(--font-display); font-size: 2rem; color: var(--text-primary); line-height: 1;">${athlete.performance.secondary_val}</strong>
            </div>
            <div style="background: var(--bg-surface-subtle); padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); min-width: 110px;">
              <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); display: block;">${athlete.performance.tertiary_label}</span>
              <strong style="font-family: var(--font-display); font-size: 2rem; color: var(--text-primary); line-height: 1;">${athlete.performance.tertiary_val}</strong>
            </div>
          </div>
        </div>
        <div class="dossier-actions-group">
          <button class="btn btn-cyan-sm" onclick="window.AAX.openRepresentationModal('${athlete.id}')">
            Execute Representation Agreement
          </button>
          <button class="btn btn-outline-sm" onclick="window.AAX.toggleCompare('${athlete.id}')">
            ${STATE.compareQueue.includes(athlete.id) ? '✓ In Comparison Queue' : '+ Add to Comparison Matrix'}
          </button>
          <button class="btn btn-secondary-compact" onclick="window.AAX.exportScoutReport()">
            Export Scouting PDF
          </button>
        </div>
      </div>

      <!-- BENTO METRICS GRID -->
      <div class="dossier-bento-grid">
        <!-- 1. BIOMETRIC TELEMETRY -->
        <div class="bento-card">
          <span class="bento-title">Biometric Measurements & Physical Frame</span>
          <div class="biometrics-full-grid">
            <div class="bio-full-item">
              <span>STANDING HEIGHT</span>
              <strong>${athlete.biometrics.height}</strong>
            </div>
            <div class="bio-full-item">
              <span>WEIGHT</span>
              <strong>${athlete.biometrics.weight_lbs} lbs</strong>
            </div>
            <div class="bio-full-item">
              <span>WINGSPAN</span>
              <strong>${athlete.biometrics.wingspan}</strong>
            </div>
            <div class="bio-full-item">
              <span>STANDING REACH</span>
              <strong>${athlete.biometrics.reach}</strong>
            </div>
            <div class="bio-full-item">
              <span>DOMINANT HAND</span>
              <strong style="font-size: 1.15rem;">${athlete.biometrics.dominant_hand}</strong>
            </div>
            <div class="bio-full-item">
              <span>DOMINANT FOOT</span>
              <strong style="font-size: 1.15rem;">${athlete.biometrics.dominant_foot}</strong>
            </div>
          </div>
        </div>

        <!-- 2. COMBINE & PERFORMANCE METERS -->
        <div class="bento-card">
          <span class="bento-title">Combine Laser Telemetry & Speed Gates</span>
          <div class="combine-metrics-list">
            <div>
              <div class="combine-row">
                <span class="c-label">Vertical Max Leap</span>
                <span class="c-val">${athlete.combine.vertical_leap_in} Inches (${verticalPercent}th Percentile)</span>
              </div>
              <div class="combine-meter-track">
                <div class="combine-meter-fill" style="width: ${verticalPercent}%;"></div>
              </div>
            </div>
            <div>
              <div class="combine-row">
                <span class="c-label">Sprint Gate Time</span>
                <span class="c-val">${athlete.combine.sprint_time}</span>
              </div>
              <div class="combine-meter-track">
                <div class="combine-meter-fill" style="width: 88%;"></div>
              </div>
            </div>
            <div>
              <div class="combine-row">
                <span class="c-label">Agility & Lane Shuttle</span>
                <span class="c-val">${athlete.combine.lane_agility}</span>
              </div>
              <div class="combine-meter-track">
                <div class="combine-meter-fill" style="width: 82%;"></div>
              </div>
            </div>
            <div>
              <div class="combine-row">
                <span class="c-label">Endurance / Shuttle Run</span>
                <span class="c-val">${athlete.combine.shuttle_run}</span>
              </div>
              <div class="combine-meter-track">
                <div class="combine-meter-fill" style="width: 85%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PERFORMANCE STATS GRID -->
      <div class="bento-card" style="margin-bottom: 2rem;">
        <span class="bento-title">Verified Season Performance Box Scores</span>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem;">
          ${athlete.performance.stats_grid.map((st) => `
            <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); text-align: center;">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); display: block;">${st.label}</span>
              <strong style="font-family: var(--font-display); font-size: 1.5rem; color: var(--accent-gold);">${st.val}</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- HIGHLIGHT VIDEO REEL MOCKUP -->
      <div class="bento-card" style="margin-bottom: 2rem;">
        <span class="bento-title">Verified Video Highlights & Technical Analysis</span>
        <div class="highlights-tabs-row">
          ${athlete.highlights.map((h, i) => `
            <button class="highlight-tab-btn ${i === 0 ? 'active' : ''}" onclick="window.AAX.playHighlight(this, '${h.title}')">
              ▶ ${h.title.substring(0, 32)}... (${h.duration})
            </button>
          `).join('')}
        </div>
        <div class="video-mockup-player" id="videoMockupPlayer">
          <div class="camera-angles-ribbon" id="cameraAnglesRibbon">
            <button class="cam-angle-btn active" onclick="window.AAX.switchCameraAngle(this, 'Broadcast Main Cam')">Main Cam</button>
            <button class="cam-angle-btn" onclick="window.AAX.switchCameraAngle(this, 'High Sideline Tactical')">High Tactical</button>
            <button class="cam-angle-btn" onclick="window.AAX.switchCameraAngle(this, 'Laser Gate Endzone Cam')">Laser Gate</button>
            <button class="cam-angle-btn" onclick="window.AAX.switchCameraAngle(this, 'Slow-Mo Biometrics 240fps')">Slow-Mo Bio</button>
          </div>
          <div class="play-circle-icon" onclick="window.AAX.playActiveVideo()">▶</div>
          <div class="video-overlay-title" id="videoOverlayTitle">${athlete.highlights[0].title}</div>
          <span id="videoAngleBadge" style="position: absolute; bottom: 12px; left: 16px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-emerald); background: rgba(0,0,0,0.65); padding: 2px 8px; border-radius: 3px; border: 1px solid rgba(16,185,129,0.4);">
            LIVE FEED: Broadcast Main Cam (1080p 60fps)
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #94A3B8; margin-top: 0.35rem;">
            Duration: ${athlete.highlights[0].duration} • Tag: ${athlete.highlights[0].tag} • HD Telemetry Stream
          </span>
        </div>
      </div>

      <!-- CAREER HISTORY & ACHIEVEMENTS -->
      <div class="dossier-bento-grid" style="margin-bottom: 0;">
        <div class="bento-card">
          <span class="bento-title">Competition History & Club Teams</span>
          <div class="career-timeline-list">
            ${athlete.career.map((c) => `
              <div class="timeline-item">
                <span class="timeline-season">${c.season} • ${c.league}</span>
                <div class="timeline-team">${c.team}</div>
                <p class="timeline-notes">${c.notes}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bento-card">
          <span class="bento-title">Key Honors & Academic Standing</span>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
            ${athlete.achievements.map((ach) => `
              <li style="font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--accent-gold);">🏆</span>
                <span>${ach}</span>
              </li>
            `).join('')}
          </ul>
          <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-medium);">
            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-cyan); display: block; margin-bottom: 0.35rem;">ACADEMIC PROFILE & CLEARINGHOUSE</span>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              <div>Institution: <strong>${athlete.academics.institution}</strong></div>
              <div>Cumulative GPA: <strong>${athlete.academics.gpa}</strong> (${athlete.academics.standardized_score})</div>
              <div style="color: var(--accent-emerald); margin-top: 0.25rem;">✓ ${athlete.academics.eligibility}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Update active permissions card UI
    updatePermissionTiersUi(athlete.permissions.current_level);
  }

  function updatePermissionTiersUi(currentLevel) {
    const levelTag = document.getElementById('currentPermLevelTag');
    if (levelTag) {
      levelTag.textContent = `ACTIVE LEVEL: ${currentLevel.toUpperCase()}`;
    }

    const permCards = document.querySelectorAll('.perm-card');
    permCards.forEach((card) => {
      const perm = card.getAttribute('data-perm');
      const isActive = perm.toLowerCase() === currentLevel.toLowerCase();
      card.classList.toggle('active', isActive);
      card.onclick = () => {
        setAthletePermission(perm);
      };
    });
  }

  function setAthletePermission(level) {
    const athlete = STATE.athletes.find((a) => a.id === STATE.selectedAthleteId);
    if (!athlete) return;

    athlete.permissions.current_level = level;
    updatePermissionTiersUi(level);
    showToast(`Athlete permission updated: ${athlete.name} granted ${level.toUpperCase()} authority.`, 'success');
  }

  /* ==========================================================================
     7. AGENT MARKETPLACE & REPRESENTATION WORKFLOW
     ========================================================================== */
  function renderAgentsGrid() {
    const grid = document.getElementById('agentsGrid');
    if (!grid) return;

    grid.innerHTML = STATE.agents.map((agent) => {
      const initials = agent.name.split(' ').map((n) => n[0]).join('');

      return `
        <article class="agent-card">
          <div class="agent-card-top">
            <div class="agent-crest" style="background: ${agent.avatar_color || '#1E293B'};">
              ${initials}
            </div>
            <div>
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--accent-emerald); font-weight: 700;">✓ ACCREDITED REPRESENTATIVE</span>
              <h3 class="agent-name">${agent.name}</h3>
              <span class="agent-agency">${agent.agency}</span>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                📍 ${agent.headquarters} • ${agent.experience_years} Years Experience
              </div>
            </div>
          </div>

          <div class="agent-license-list">
            ${agent.credentials.map((c) => `<div>✓ ${c}</div>`).join('')}
          </div>

          <p class="agent-bio-text">${agent.bio}</p>

          <div class="agent-stats-bar">
            <div>Athletes: <strong>${agent.athletes_count}</strong></div>
            <div>Rating: <strong>★ ${agent.rating} (${agent.review_count})</strong></div>
            <div>Commission: <strong>${agent.commission_rate.split(' ')[0]}</strong></div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">NOTABLE REPRESENTATION ROSTER:</span>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${agent.notable_clients.map((cli) => `
                <span style="background: rgba(255, 255, 255, 0.05); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); color: var(--text-secondary);">
                  ${cli}
                </span>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: auto; display: flex; gap: 0.6rem;">
            <button class="btn btn-cyan-sm" style="flex: 1;" onclick="window.AAX.openRepresentationModalWithAgent('${agent.id}')">
              Request Representation
            </button>
            <button class="btn btn-outline-sm" onclick="window.AAX.contactAgent('${agent.id}')">
              Direct Contact
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ==========================================================================
     8. 4-STAGE DIGITAL REPRESENTATION AGREEMENT STEPPER
     ========================================================================== */
  function initRepresentationStepper() {
    const modal = document.getElementById('representationModal');
    const closeBtn = document.getElementById('closeRepModal');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(modal);
      });
    }

    // Step 1 -> Step 2
    const nextTo2 = document.getElementById('nextToStep2');
    if (nextTo2) {
      nextTo2.addEventListener('click', () => goToStep(2));
    }

    // Step 2 -> Step 3
    const backTo1 = document.getElementById('backToStep1');
    const nextTo3 = document.getElementById('nextToStep3');
    if (backTo1) backTo1.addEventListener('click', () => goToStep(1));
    if (nextTo3) nextTo3.addEventListener('click', () => goToStep(3));

    // Step 3 -> Step 4
    const backTo2 = document.getElementById('backToStep2');
    const nextTo4 = document.getElementById('nextToStep4');
    if (backTo2) backTo2.addEventListener('click', () => goToStep(2));
    if (nextTo4) nextTo4.addEventListener('click', () => goToStep(4));

    // Step 4 Back & Sign
    const backTo3 = document.getElementById('backToStep3');
    const finalizeBtn = document.getElementById('finalizeContractBtn');
    const signerInput = document.getElementById('signerNameInput');
    const signatureScript = document.getElementById('signatureScript');

    if (backTo3) backTo3.addEventListener('click', () => goToStep(3));

    if (signerInput && signatureScript) {
      signerInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Your Name';
        signatureScript.textContent = val;
        STATE.stepper.signerName = val;
      });
    }

    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', () => {
        finalizeRepresentationAgreement();
      });
    }

    // Radio selection for permissions
    const radios = document.querySelectorAll('input[name="permSelection"]');
    radios.forEach((r) => {
      r.addEventListener('change', () => {
        document.querySelectorAll('.radio-card').forEach((rc) => rc.classList.remove('active'));
        r.closest('.radio-card').classList.add('active');
        STATE.stepper.authorityLevel = r.value;
      });
    });
  }

  function goToStep(stepNumber) {
    STATE.stepper.currentStep = stepNumber;

    // Update step nodes
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`stepNode${i}`);
      const pane = document.getElementById(`stepPane${i}`);
      if (node) node.classList.toggle('active', i <= stepNumber);
      if (pane) pane.classList.toggle('active', i === stepNumber);
    }
  }

  function openRepresentationModal(athleteId, agentId) {
    const athlete = STATE.athletes.find((a) => a.id === athleteId) || STATE.athletes[0];
    const agent = STATE.agents.find((ag) => ag.id === agentId) || STATE.agents[0];

    STATE.stepper.targetAthleteId = athlete.id;
    STATE.stepper.selectedAgent = agent;
    STATE.stepper.signerName = athlete.name;

    // Populate modal previews
    const modal = document.getElementById('representationModal');
    const repAgentName = document.getElementById('repAgentName');
    const repAgentCredentials = document.getElementById('repAgentCredentials');
    const repCommissionRate = document.getElementById('repCommissionRate');
    const signerInput = document.getElementById('signerNameInput');
    const signatureScript = document.getElementById('signatureScript');
    const signatureTimestamp = document.getElementById('signatureTimestamp');

    if (repAgentName) repAgentName.textContent = `Agent: ${agent.name} (${agent.agency})`;
    if (repAgentCredentials) repAgentCredentials.textContent = `Credentials: ${agent.credentials[0]}`;
    if (repCommissionRate) repCommissionRate.textContent = agent.commission_rate;
    if (signerInput) signerInput.value = athlete.name;
    if (signatureScript) signatureScript.textContent = athlete.name;

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    if (signatureTimestamp) signatureTimestamp.textContent = `Cryptographically Stamped : ${dateStr}`;

    goToStep(1);
    openModal(modal);
  }

  function finalizeRepresentationAgreement() {
    const modal = document.getElementById('representationModal');
    const athlete = STATE.athletes.find((a) => a.id === STATE.stepper.targetAthleteId);
    const agent = STATE.stepper.selectedAgent || STATE.agents[0];

    if (athlete) {
      athlete.status = 'Represented';
      athlete.agent_name = agent.name;
      athlete.agent_id = agent.id;
      athlete.permissions.current_level = STATE.stepper.authorityLevel;
    }

    // Add escrow transaction to ledger
    const newTx = {
      id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      type: 'Digital Representation Agreement Retainer',
      payer: `${athlete ? athlete.name : 'Kamal Harvey'} (Athlete)`,
      payee: `${agent.agency} (${agent.name})`,
      amount_usd: 2500.00,
      fee_type: 'Representation Retainer Escrow',
      status: 'Escrow Held',
      contract_ref: `AGR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Bilateral representation agreement executed. Authority: ${STATE.stepper.authorityLevel.toUpperCase()}. Verified escrow funded.`
    };
    STATE.transactions.unshift(newTx);

    closeModal(modal);
    renderProspectsGrid();
    renderProfileView(STATE.selectedAthleteId);
    renderLedger();

    showToast(`Representation Agreement Executed with ${agent.name}. Private Workspace Initialized.`, 'success');
  }

  /* ==========================================================================
     9. SCOUT WATCHLISTS & HEAD-TO-HEAD COMPARISON MATRIX
     ========================================================================== */
  function initScoutTools() {
    const clearCompareBtn = document.getElementById('clearCompareBtn');
    if (clearCompareBtn) {
      clearCompareBtn.addEventListener('click', () => {
        STATE.compareQueue = [];
        updateCompareBadge();
        renderComparisonMatrix();
        renderProspectsGrid();
        showToast('Comparison queue cleared.', 'info');
      });
    }

    const exportBtn = document.getElementById('exportScoutReportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportScoutReport();
      });
    }
  }

  function renderScoutListsGrid() {
    const grid = document.getElementById('scoutListsGrid');
    if (!grid) return;

    grid.innerHTML = STATE.scoutLists.map((list) => {
      const athletes = STATE.athletes.filter((a) => list.athlete_ids.includes(a.id));

      return `
        <div class="scout-list-card">
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--accent-cyan); font-weight: 700;">PRO WATCHLIST</span>
          <h4 style="margin-top: 0.35rem;">${list.title}</h4>
          <p>${list.description}</p>
          
          <div class="scout-athlete-pill-row">
            ${athletes.map((ath) => `
              <span class="scout-ath-chip">
                ${ath.flag} ${ath.name} (${ath.position.split(' ')[0]})
              </span>
            `).join('')}
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem;">
            Curator: <strong>${list.scout_name}</strong>
          </div>

          <button class="btn btn-outline-sm" style="width: 100%;" onclick="window.AAX.loadScoutListIntoCompare('${list.id}')">
            Load List Into Comparison Matrix
          </button>
        </div>
      `;
    }).join('');
  }

  function loadScoutListIntoCompare(listId) {
    const list = STATE.scoutLists.find((l) => l.id === listId);
    if (!list) return;

    STATE.compareQueue = [...new Set([...STATE.compareQueue, ...list.athlete_ids])];
    updateCompareBadge();
    renderComparisonMatrix();
    renderProspectsGrid();
    showToast(`Loaded ${list.athlete_ids.length} prospects from "${list.title}" into Comparison Matrix.`, 'success');

    const matrixCard = document.getElementById('comparisonMatrixCard');
    if (matrixCard) {
      matrixCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function toggleCompare(athleteId) {
    const index = STATE.compareQueue.indexOf(athleteId);
    if (index > -1) {
      STATE.compareQueue.splice(index, 1);
      showToast('Athlete removed from comparison queue.', 'info');
    } else {
      STATE.compareQueue.push(athleteId);
      const athlete = STATE.athletes.find((a) => a.id === athleteId);
      showToast(`${athlete ? athlete.name : 'Athlete'} added to comparison queue.`, 'success');
    }

    updateCompareBadge();
    renderComparisonMatrix();
    renderProspectsGrid();
  }

  function updateCompareBadge() {
    const badge = document.getElementById('compareCountBadge');
    if (badge) {
      badge.textContent = STATE.compareQueue.length;
    }
  }

  function renderComparisonMatrix() {
    const wrap = document.getElementById('comparisonTableWrap');
    if (!wrap) return;

    if (STATE.compareQueue.length === 0) {
      wrap.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚖️</div>
          <h4 style="font-family: var(--font-display); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.35rem;">Comparison Queue Empty</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem;">Select 2 or more athletes from the Talent Discovery Grid or load a pre-configured Scout Watchlist above to review side-by-side telemetry.</p>
          <button class="btn btn-cyan-sm" onclick="window.AAX.loadScoutListIntoCompare('list-01')">Load 2027 Basketball Prospects</button>
        </div>
      `;
      return;
    }

    const compared = STATE.athletes.filter((a) => STATE.compareQueue.includes(a.id));

    // Dynamic Scouting Advantage Calculations
    const maxHeight = Math.max(...compared.map((a) => a.biometrics.height_in || 0));
    const maxWeight = Math.max(...compared.map((a) => a.biometrics.weight_lbs || 0));
    const maxWingspan = Math.max(...compared.map((a) => a.biometrics.wingspan_in || 0));
    const maxVertical = Math.max(...compared.map((a) => a.combine.vertical_leap_in || 0));

    let html = `
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 200px;">EVALUATION METRIC</th>
            ${compared.map((ath) => `
              <th>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <span style="color: var(--accent-orange); font-family: var(--font-display); font-size: 1.25rem; letter-spacing: 0.5px;">${ath.name}</span>
                    <span style="display: block; font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">${ath.jersey} • ${ath.school_team}</span>
                  </div>
                  <button onclick="window.AAX.toggleCompare('${ath.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.3rem; padding: 0 4px;" title="Remove from queue">&times;</button>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="metric-header">Recruiting Tier & Rank</td>
            ${compared.map((ath) => `
              <td>
                <span class="composite-grade-pill">${ath.star_rating}</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-orange); font-weight: 700; margin-left: 0.35rem;">${ath.national_rank}</span>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="metric-header">Sport & Discipline</td>
            ${compared.map((ath) => `<td><strong>${ath.sport}</strong> (${ath.discipline})</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Primary Position</td>
            ${compared.map((ath) => `<td>${ath.position}</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Nationality & Location</td>
            ${compared.map((ath) => `<td>${ath.flag} ${ath.city}, ${ath.country}</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Age & DOB</td>
            ${compared.map((ath) => `<td>${ath.age} Years (${ath.dob})</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Standing Height</td>
            ${compared.map((ath) => `
              <td style="font-weight: 700; color: var(--text-primary);">
                ${ath.biometrics.height} (${ath.biometrics.height_in}")
                ${ath.biometrics.height_in === maxHeight && compared.length > 1 ? '<span class="advantage-badge">ADVANTAGE</span>' : ''}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="metric-header">Weight</td>
            ${compared.map((ath) => `
              <td>
                ${ath.biometrics.weight_lbs} lbs
                ${ath.biometrics.weight_lbs === maxWeight && compared.length > 1 ? '<span class="advantage-badge">FRAME ADVANTAGE</span>' : ''}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="metric-header">Wingspan</td>
            ${compared.map((ath) => `
              <td style="font-weight: 700; color: var(--accent-blue);">
                ${ath.biometrics.wingspan}
                ${ath.biometrics.wingspan_in === maxWingspan && compared.length > 1 ? '<span class="advantage-badge">ADVANTAGE</span>' : ''}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="metric-header">Standing Reach</td>
            ${compared.map((ath) => `<td>${ath.biometrics.reach}</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Vertical Max Leap</td>
            ${compared.map((ath) => `
              <td style="font-weight: 800; color: var(--accent-emerald); font-size: 1.1rem;">
                ${ath.combine.vertical_leap_in}"
                ${ath.combine.vertical_leap_in === maxVertical && compared.length > 1 ? '<span class="advantage-badge">LEAP ADVANTAGE</span>' : ''}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="metric-header">Sprint / Split Speed</td>
            ${compared.map((ath) => `<td style="font-family: var(--font-mono);">${ath.combine.sprint_time}</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Primary Season Metric</td>
            ${compared.map((ath) => `<td><strong style="color: var(--accent-orange); font-size: 1.1rem;">${ath.performance.primary_val}</strong> ${ath.performance.primary_label}</td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Representation Status</td>
            ${compared.map((ath) => `<td><span class="v-badge cyan">${ath.status}</span></td>`).join('')}
          </tr>
          <tr>
            <td class="metric-header">Action</td>
            ${compared.map((ath) => `
              <td>
                <button class="btn btn-cyan-sm" onclick="window.AAX.viewProfile('${ath.id}')">View Sports Resume</button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;

    wrap.innerHTML = html;
  }

  function exportScoutReport() {
    showToast('Compiling high-resolution Scouting PDF Dossier with verified combine metrics...', 'info');
    setTimeout(() => {
      showToast('Scouting Dossier PDF successfully compiled and stamped.', 'success');
    }, 1200);
  }

  /* ==========================================================================
     10. OPPORTUNITY COMBINES & DIRECT APPLICATION
     ========================================================================== */
  function renderOpportunitiesGrid() {
    const grid = document.getElementById('opportunitiesGrid');
    if (!grid) return;

    grid.innerHTML = STATE.opportunities.map((opp) => {
      return `
        <article class="opportunity-card">
          <div class="opp-badge-row">
            ${opp.tags.map((t) => `<span class="opp-pill">${t}</span>`).join('')}
          </div>

          <h3 class="opp-title">${opp.title}</h3>
          <div class="opp-org">🏟️ ${opp.organization}</div>

          <div class="opp-details-box">
            <div>📍 <strong>Location:</strong> ${opp.location}</div>
            <div>📅 <strong>Combine Date:</strong> ${opp.date} (Deadline: ${opp.deadline})</div>
            <div>⚡ <strong>Criteria:</strong> Age ${opp.requirements.age_range} • Position: ${opp.requirements.position}</div>
            <div style="color: var(--accent-cyan); margin-top: 0.35rem;">💼 <strong>Package:</strong> ${opp.compensation}</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
            <div style="font-size: 0.8rem; color: var(--text-secondary);">
              <strong>${opp.spots_available}</strong> Open Spots | <strong>${opp.applicants_count}</strong> Verified Submissions
            </div>
            <button class="btn btn-cyan-sm" onclick="window.AAX.openApplyModal('${opp.id}')">
              Apply / Submit Dossier
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  function initOpportunityApplication() {
    const modal = document.getElementById('opportunityApplyModal');
    const closeBtn = document.getElementById('closeApplyModal');
    const form = document.getElementById('applyDossierForm');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const select = document.getElementById('applyAthleteSelect');
        const athName = select ? select.options[select.selectedIndex].text : 'Kamal Harvey';

        closeModal(modal);
        showToast(`Verified dossier for ${athName} dispatched to Combine Committee.`, 'success');
      });
    }
  }

  function openApplyModal(oppId) {
    const opp = STATE.opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    const modal = document.getElementById('opportunityApplyModal');
    const title = document.getElementById('applyOpportunityTitle');
    const org = document.getElementById('applyOpportunityOrg');
    const select = document.getElementById('applyAthleteSelect');

    if (title) title.textContent = opp.title;
    if (org) org.textContent = `${opp.organization} • ${opp.location}`;

    if (select) {
      select.innerHTML = STATE.athletes.map((a) => `
        <option value="${a.id}" ${a.id === STATE.selectedAthleteId ? 'selected' : ''}>
          ${a.name} (${a.sport} : ${a.position})
        </option>
      `).join('');
    }

    openModal(modal);
  }

  /* ==========================================================================
     11. ESCROW & COMMERCIAL PAYMENTS LEDGER
     ========================================================================== */
  function renderLedger() {
    const tbody = document.getElementById('ledgerTableBody');
    if (!tbody) return;

    tbody.innerHTML = STATE.transactions.map((tx) => {
      const isSettled = tx.status === 'Settled';
      const statusClass = isSettled ? 'settled' : 'escrow';

      return `
        <tr>
          <td><strong style="font-family: var(--font-mono); color: var(--accent-cyan);">${tx.id}</strong></td>
          <td style="font-family: var(--font-mono);">${tx.date}</td>
          <td>
            <strong>${tx.type}</strong>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${tx.description}</div>
          </td>
          <td>${tx.payer}</td>
          <td>${tx.payee}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">
            $${tx.amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
          <td>
            <span class="tx-status-pill ${statusClass}">● ${tx.status}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ==========================================================================
     12. MODAL DIALOG UTILITIES
     ========================================================================== */
  function initModals() {
    // Backdrop click close handlers
    document.querySelectorAll('.platform-modal').forEach((modal) => {
      const backdrop = modal.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => closeModal(modal));
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.platform-modal.active').forEach((m) => closeModal(m));
      }
    });

    const closeAthleteModalBtn = document.getElementById('closeAthleteModal');
    if (closeAthleteModalBtn) {
      closeAthleteModalBtn.addEventListener('click', () => {
        closeModal(document.getElementById('athleteModal'));
      });
    }
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     13. TOAST NOTIFICATION ENGINE
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
    toast.innerHTML = `
      <span style="font-weight: 800; color: ${type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-cyan)'};">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================================
     14. GLOBAL WINDOW API (FOR INLINE ATTRIBUTE HOOKS)
     ========================================================================== */
  window.AAX = {
    viewProfile: function (athleteId) {
      renderProfileView(athleteId);
      switchSection('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    toggleCompare: function (athleteId) {
      toggleCompare(athleteId);
    },
    openRepresentationModal: function (athleteId) {
      openRepresentationModal(athleteId);
    },
    openRepresentationModalWithAgent: function (agentId) {
      openRepresentationModal(STATE.selectedAthleteId, agentId);
    },
    loadScoutListIntoCompare: function (listId) {
      loadScoutListIntoCompare(listId);
    },
    openApplyModal: function (oppId) {
      openApplyModal(oppId);
    },
    contactAgent: function (agentId) {
      const agent = STATE.agents.find((a) => a.id === agentId);
      if (agent) {
        showToast(`Connecting with ${agent.name} via secure encrypted channel (${agent.contact.whatsapp})...`, 'info');
      }
    },
    playHighlight: function (btn, title) {
      document.querySelectorAll('.highlight-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const titleElem = document.getElementById('videoOverlayTitle');
      if (titleElem) titleElem.textContent = title;
      showToast(`Switched video feed to: ${title}`, 'info');
    },
    playActiveVideo: function () {
      const title = document.getElementById('videoOverlayTitle');
      const text = title ? title.textContent : 'Highlight Reel';
      showToast(`Streaming verified HD feed: "${text}" with biometric overlay.`, 'success');
    },
    exportScoutReport: function () {
      exportScoutReport();
    },
    switchCameraAngle: function (btn, angleName) {
      document.querySelectorAll('.cam-angle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const badge = document.getElementById('videoAngleBadge');
      if (badge) badge.textContent = `LIVE FEED: ${angleName} (1080p 60fps)`;
      showToast(`Broadcast camera angle switched to ${angleName}. Biometric telemetry synced.`, 'info');
    },
    resetFilters: function () {
      applyNlpPreset('all');
    }
  };

})();
