/**
 * Apex Athlete Exchange — client prototype.
 * Vanilla JS, no dependencies. All data below is sample data.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. MASTER CLIENT IN-MEMORY STATE REPOSITORY
     ========================================================================== */
  const STATE = {
    activeRole: 'athlete',
    activeSection: 'discovery',
    viewMode: 'grid',
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
          { title: 'National Finals Breakdown: 31 Pts, 8 Reb, 4 Ast', duration: '4:12', tag: 'Game Tape' },
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
          { title: 'Pace & Direct 1v1 Dribbling Compilation, 2026 Season', duration: '5:18', tag: 'Game Tape' },
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
          { title: 'Sub-11 Second 100m Final Win, ISSA Champs 2026', duration: '1:45', tag: 'Race Footage' },
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
          { title: 'Full Game Breakdown vs San German: 22 Pts, 14 Ast', duration: '8:30', tag: 'Full Game' },
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
          { title: 'Power Hitting: 48 Runs off 19 Balls in CPL Semi-Final', duration: '3:20', tag: 'Batting Tape' },
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
          '2026 Barbados National Senior Record Holder (50m free, 24.88s)',
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
          { title: 'Knockout Highlights: 12 Stoppages in 16 Amateur Wins', duration: '4:40', tag: 'Fight Reel' },
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
     2. REFERENCE DATA FOR THE CHROME (results strip, risers, roles)
     ========================================================================== */
  const COUNTRY_CODES = {
    'Jamaica': 'JAM',
    'Trinidad & Tobago': 'TTO',
    'Barbados': 'BAR',
    'Puerto Rico': 'PUR',
    'Ghana': 'GHA'
  };

  const LATEST_RESULTS = [
    { event: 'ISSA Champs 100m', text: 'Aliyah Blake', score: '10.98' },
    { event: 'JPL Youth final', text: 'Montego Bay 3–1 Harbour View', score: 'Sterling 2 goals' },
    { event: 'Caribbean Hoops', text: 'Kingston Titans 88–82 St. George Elite', score: 'Harvey 31 pts' },
    { event: 'Speed combine', text: 'Rohan Sharma', score: '144.2 km/h' },
    { event: 'CARIFTA 50m free', text: 'Chloe Henderson', score: '24.88' },
    { event: 'AMBC boxing', text: 'Malik Thorne', score: 'TKO R3' },
    { event: 'BSN reserves', text: 'Mateo Rossi', score: '14 ast' }
  ];

  const FEATURED = {
    athleteId: 'ath-01',
    summary: 'A 6′5″ wing from Kingston with a 6′8″ wingspan and a 34.5″ vertical. Shot 51.4% from the field this season. Several European clubs and NCAA Division I programmes have asked for film, and he is looking for an agent.'
  };

  const RISERS = [
    { athleteId: 'ath-03', delta: '#1 U20', note: '10.98 in the 100m at Champs — sprint double', time: '10 min' },
    { athleteId: 'ath-02', delta: '34.8 km/h', note: '14 goals, 9 assists; out of contract', time: '28 min' },
    { athleteId: 'ath-05', delta: '14 ast', note: 'Finals MVP in the BSN reserve league', time: '1 hr' },
    { athleteId: 'ath-06', delta: '144.2 km/h', note: 'Fastest ball recorded in the U20 regional series', time: '2 hr' }
  ];

  const ROLES = {
    athlete: {
      name: 'Kamal Harvey',
      summary: '14 scout views and 2 agent inquiries this week.',
      balanceLabel: 'Balance',
      balance: '$14,200',
      one: ['Review agent inquiries', () => switchSection('agents')],
      two: ['Edit your profile', () => viewProfile('ath-01')],
      header: ['Log a result', () => showToast('Result logged. It will appear on your profile once the meet organiser confirms it.')]
    },
    agent: {
      name: 'Marcus Vance, Pinnacle Sports Global',
      summary: '42 athletes on your roster, $12.8M in active contracts.',
      balanceLabel: 'Commission due',
      balance: '$48,750',
      one: ['Find unsigned athletes', () => { switchSection('discovery'); applyPreset('unrepresented'); }],
      two: ['Escrow', () => switchSection('ledger')],
      header: ['Add to roster', () => switchSection('discovery')]
    },
    scout: {
      name: 'Derrick Sterling, international scout',
      summary: '3 watchlists, 6 athletes tracked.',
      balanceLabel: 'Plan',
      balance: 'Club seat',
      one: ['Watchlists', () => switchSection('scouting')],
      two: ['Compare athletes', () => openCompare()],
      header: ['New watchlist', () => showToast('Watchlist “2027 European summer targets” created.')]
    },
    organization: {
      name: 'Kingston Phoenix FC',
      summary: '48 applications waiting for your selection panel.',
      balanceLabel: 'Escrow',
      balance: '$120,000',
      one: ['Review applications', () => switchSection('opportunities')],
      two: ['Post a trial', () => showToast('Trial posting form isn’t part of this prototype.')],
      header: ['Post a trial', () => showToast('Trial posting form isn’t part of this prototype.')]
    },
    admin: {
      name: 'Platform admin',
      summary: '2 escrow payments waiting for release, 3 agent licences to check.',
      balanceLabel: 'Held in escrow',
      balance: '',
      one: ['Escrow', () => switchSection('ledger')],
      two: ['Agent licences', () => switchSection('agents')],
      header: ['Export ledger', () => showToast('Ledger exported as CSV.')]
    }
  };

  const SECTIONS = ['discovery', 'profile', 'agents', 'scouting', 'opportunities', 'ledger'];
  const DEFAULT_FILTER = { search: '', sport: 'all', position: 'all', country: 'all', status: 'all', minHeight: 66 };
  let txCounter = 1005;

  /* ==========================================================================
     3. HELPERS
     ========================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Data stores heights as 6'5" — render with proper prime marks.
  const primes = (s) => esc(s).replace(/&#39;/g, '′').replace(/&quot;/g, '″');

  function feetInches(totalInches) {
    return `${Math.floor(totalInches / 12)}′${totalInches % 12}″`;
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const athleteById = (id) => STATE.athletes.find((a) => a.id === id);
  const code = (a) => COUNTRY_CODES[a.country] || a.country;
  const firstName = (a) => a.name.split(' ')[0];

  function statusMarkup(a) {
    if (a.status === 'Represented') {
      return `<span class="status status-neutral">Represented${a.agent_name ? ` by ${esc(a.agent_name)}` : ''}</span>`;
    }
    if (a.status === 'Free Agent') return '<span class="status status-ok">Free agent</span>';
    return '<span class="status status-wait">Seeking an agent</span>';
  }

  function compareButton(id, size = '') {
    const on = STATE.compareQueue.includes(id);
    return `<button type="button" class="btn btn-quiet ${size}" data-action="toggle-compare" data-id="${id}" aria-pressed="${on}">${on ? 'Comparing' : 'Compare'}</button>`;
  }

  // Board-relative standing: where this athlete sits among everyone on the board.
  function boardStanding(getter, athlete) {
    const values = STATE.athletes.map(getter).filter((v) => typeof v === 'number');
    const value = getter(athlete);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const rank = values.filter((v) => v > value).length + 1;
    const pct = max === min ? 100 : Math.round(((value - min) / (max - min)) * 100);
    return { rank, of: values.length, pct };
  }

  const byGrade = (list) => [...list].sort((a, b) => parseFloat(b.composite_grade) - parseFloat(a.composite_grade));

  // Ranked by scout grade within three pools, like recruiting sites' national / position / state ranks.
  function ranks(a) {
    const place = (pool) => ({ rank: byGrade(pool).findIndex((x) => x.id === a.id) + 1, of: pool.length });
    return {
      board: place(STATE.athletes),
      sport: place(STATE.athletes.filter((x) => x.sport === a.sport)),
      country: place(STATE.athletes.filter((x) => x.country === a.country))
    };
  }

  function rankRow(a) {
    const r = ranks(a);
    const cell = (label, p, title) => `<div title="${esc(title)}"><dt>${label}</dt><dd class="num">${p.rank}<span>/${p.of}</span></dd></div>`;
    return `<dl class="rank-row">
      ${cell('Board', r.board, 'Rank among all athletes on the board')}
      ${cell(esc(a.sport === 'Track & Field' ? 'Track' : a.sport), r.sport, `Rank among ${a.sport} athletes`)}
      ${cell(code(a), r.country, `Rank among athletes from ${a.country}`)}
    </dl>`;
  }

  // "Kamal Harvey" -> light first name, heavy surname (player-header convention).
  function splitName(name) {
    const parts = name.split(' ');
    const last = parts.pop();
    return `<span class="name-first">${esc(parts.join(' '))}</span> <span class="name-last">${esc(last)}</span>`;
  }

  // 6'5" -> 6-5, the recruiting-board shorthand.
  const shortHeight = (a) => `${Math.floor(a.biometrics.height_in / 12)}-${a.biometrics.height_in % 12}`;

  /* ==========================================================================
     4. INIT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    STATE.filter = { ...DEFAULT_FILTER };

    renderResultsStrip();
    renderFeature();
    renderRisers();
    renderProspects();
    renderProfile(STATE.selectedAthleteId);
    renderAgents();
    renderWatchlists();
    renderCompare();
    renderOpportunities();
    renderLedger();
    updateCompareCount();
    setRole('athlete');

    wireFilters();
    wireGlobalActions();
    wireModals();
    trackHeaderHeight();

    const initial = location.hash.slice(1);
    switchSection(SECTIONS.includes(initial) ? initial : 'discovery', { push: false, focus: false });
    window.addEventListener('popstate', () => {
      const s = location.hash.slice(1);
      switchSection(SECTIONS.includes(s) ? s : 'discovery', { push: false });
    });
  });

  /* ==========================================================================
     5. NAVIGATION & ROLES
     ========================================================================== */
  function switchSection(id, { push = true, focus = true } = {}) {
    if (!SECTIONS.includes(id)) return;
    STATE.activeSection = id;

    $$('#navTabs .nav-tab').forEach((tab) => {
      if (tab.dataset.section === id) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === `section-${id}`));

    if (push && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    if (id === 'scouting') renderCompare();

    if (focus) {
      window.scrollTo(0, 0);
      const heading = $(`#section-${id} h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  // The profile's section tabs stick just below the site header, which is only sticky on wide screens.
  function trackHeaderHeight() {
    const header = $('.site-header');
    const update = () => {
      const sticky = getComputedStyle(header).position === 'sticky';
      document.documentElement.style.setProperty('--header-h', sticky ? `${header.offsetHeight}px` : '0px');
    };
    update();
    window.addEventListener('resize', update);
  }

  function setRole(role) {
    const r = ROLES[role];
    if (!r) return;
    STATE.activeRole = role;
    $('#roleSelect').value = role;
    $('#contextName').textContent = r.name;
    $('#contextSummary').textContent = r.summary;
    $('#balanceLabel').textContent = r.balanceLabel;
    $('#balanceValue').textContent = role === 'admin' ? money(escrowHeld()) : r.balance;

    const [oneLabel, oneFn] = r.one;
    const [twoLabel, twoFn] = r.two;
    const [hLabel, hFn] = r.header;
    $('#contextActionOne').textContent = oneLabel;
    $('#contextActionOne').onclick = oneFn;
    $('#contextActionTwo').textContent = twoLabel;
    $('#contextActionTwo').onclick = twoFn;
    $('#headerActionBtn').textContent = hLabel;
    $('#headerActionBtn').onclick = hFn;
  }

  function viewProfile(id) {
    renderProfile(id);
    switchSection('profile');
  }

  function openCompare() {
    switchSection('scouting', { focus: false });
    const panel = $('#comparePanel');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel.focus({ preventScroll: true });
  }

  /* ==========================================================================
     6. DELEGATED ACTIONS
     ========================================================================== */
  function wireGlobalActions() {
    $('#roleSelect').addEventListener('change', (e) => setRole(e.target.value));

    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const { action, id } = el.dataset;

      switch (action) {
        case 'nav':
          e.preventDefault();
          switchSection(el.dataset.section);
          break;
        case 'view-profile':
          viewProfile(id);
          break;
        case 'toggle-compare':
          toggleCompare(id);
          break;
        case 'open-compare':
          openCompare();
          break;
        case 'clear-compare':
          STATE.compareQueue = [];
          compareChanged();
          break;
        case 'load-list':
          loadWatchlist(id);
          break;
        case 'print':
          window.print();
          break;
        case 'open-rep':
          // An athlete account always signs for itself; other roles act on the athlete they last opened.
          openRepresentation(el.dataset.athlete || (STATE.activeRole === 'athlete' ? 'ath-01' : STATE.selectedAthleteId), el.dataset.agent, el);
          break;
        case 'contact-agent': {
          const agent = STATE.agents.find((a) => a.id === id);
          if (agent) showToast(`${agent.name}: ${agent.contact.email} · ${agent.contact.phone}`);
          break;
        }
        case 'apply':
          openApply(id, el);
          break;
        case 'play-clip':
          selectClip(parseInt(el.dataset.index, 10));
          break;
        case 'play-video':
          showToast('Video playback isn’t available in this prototype.');
          break;
        case 'close-modal':
          closeModal();
          break;
        case 'step':
          goToStep(parseInt(el.dataset.to, 10));
          break;
        case 'sign':
          signAgreement();
          break;
        case 'jump': {
          const target = document.getElementById(el.dataset.target);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
          break;
        }
        case 'reset-filters':
          applyPreset('reset');
          break;
        default:
          break;
      }
    });
  }

  /* ==========================================================================
     7. RESULTS STRIP, FEATURE, RISERS
     ========================================================================== */
  function renderResultsStrip() {
    $('#resultsStrip').innerHTML = LATEST_RESULTS.map((r) => `
      <li class="result-item">
        <span class="result-event">${esc(r.event)}</span>
        <span>${esc(r.text)}</span>
        <span class="result-score num">${esc(r.score)}</span>
      </li>`).join('');
  }

  function renderFeature() {
    const a = athleteById(FEATURED.athleteId);
    if (!a) return;
    const p = a.performance;
    $('#featureProspect').innerHTML = `
      <div>
        <p class="kicker">Featured prospect · ${esc(a.sport)} · ${esc(a.position)}</p>
        <h2 class="feature-name"><a href="#profile" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</a></h2>
        <p class="feature-copy">${esc(FEATURED.summary)}</p>
        <dl class="statline">
          <div><dt>${esc(p.primary_label)}</dt><dd>${esc(p.primary_val)}</dd></div>
          <div><dt>${esc(p.secondary_label)}</dt><dd>${esc(p.secondary_val)}</dd></div>
          <div><dt>${esc(p.tertiary_label)}</dt><dd>${esc(p.tertiary_val)}</dd></div>
          <div><dt>Vertical</dt><dd>${a.combine.vertical_leap_in}″</dd></div>
          <div><dt>Wingspan</dt><dd>${primes(a.biometrics.wingspan)}</dd></div>
        </dl>
        <div class="feature-actions">
          <button type="button" class="btn btn-primary" data-action="view-profile" data-id="${a.id}">Open profile</button>
          ${statusMarkup(a)}
        </div>
      </div>
      <div class="feature-grade">
        <div class="grade-figure num">${esc(a.composite_grade)}</div>
        <div class="grade-label">Scout grade</div>
        <div class="feature-rank">${esc(a.national_rank)}</div>
      </div>`;
  }

  function renderRisers() {
    $('#risersList').innerHTML = RISERS.map((r) => {
      const a = athleteById(r.athleteId);
      if (!a) return '';
      return `
        <li class="riser">
          <button type="button" class="riser-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
          <span class="riser-delta num">${esc(r.delta)}</span>
          <span class="riser-note">${esc(a.sport)} — ${esc(r.note)}</span>
          <span class="riser-time">${esc(r.time)}</span>
        </li>`;
    }).join('');
  }

  /* ==========================================================================
     8. FILTERS & PROSPECT BOARD
     ========================================================================== */
  function wireFilters() {
    $('#searchInput').addEventListener('input', (e) => {
      STATE.filter.search = e.target.value.trim().toLowerCase();
      renderProspects();
    });

    $$('#sportTabs .sport-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        STATE.filter.sport = tab.dataset.sport;
        syncFilterControls();
        renderProspects();
      });
    });

    [['#filterPosition', 'position'], ['#filterCountry', 'country'], ['#filterStatus', 'status']].forEach(([sel, key]) => {
      $(sel).addEventListener('change', (e) => {
        STATE.filter[key] = e.target.value;
        renderProspects();
      });
    });

    $('#filterHeight').addEventListener('input', (e) => {
      STATE.filter.minHeight = parseInt(e.target.value, 10);
      $('#filterHeightVal').textContent = feetInches(STATE.filter.minHeight);
      renderProspects();
    });

    $$('[data-preset]').forEach((btn) => btn.addEventListener('click', () => applyPreset(btn.dataset.preset)));

    $$('.segmented-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        STATE.viewMode = btn.dataset.view;
        $$('.segmented-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        renderProspects();
      });
    });
  }

  function syncFilterControls() {
    const f = STATE.filter;
    $('#searchInput').value = f.search;
    $('#filterPosition').value = f.position;
    $('#filterCountry').value = f.country;
    $('#filterStatus').value = f.status;
    $('#filterHeight').value = f.minHeight;
    $('#filterHeightVal').textContent = feetInches(f.minHeight);
    $$('#sportTabs .sport-tab').forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.sport === f.sport)));
  }

  function applyPreset(preset) {
    const presets = {
      'jamaican-wingers': { sport: 'Football', country: 'Jamaica', position: 'Left Winger' },
      'tall-wings': { sport: 'Basketball', minHeight: 77 },
      'sprinters': { sport: 'Track & Field', position: '100m' },
      'free-agents': { status: 'Free Agent' },
      'unrepresented': { status: 'Seeking Agent' },
      'reset': {}
    };
    STATE.filter = { ...DEFAULT_FILTER, ...(presets[preset] || {}) };
    syncFilterControls();
    renderProspects();
  }

  function filteredAthletes() {
    const f = STATE.filter;
    return byGrade(STATE.athletes.filter((a) => {
      if (f.search) {
        const hay = `${a.name} ${a.sport} ${a.position} ${a.discipline} ${a.country} ${code(a)} ${a.city} ${a.school_team}`.toLowerCase();
        if (!f.search.split(/\s+/).every((word) => hay.includes(word))) return false;
      }
      if (f.sport !== 'all' && a.sport !== f.sport) return false;
      if (f.position !== 'all' && !a.position.toLowerCase().includes(f.position.toLowerCase())) return false;
      if (f.country !== 'all' && a.country !== f.country) return false;
      if (f.status !== 'all' && a.status !== f.status) return false;
      if (a.biometrics.height_in < f.minHeight) return false;
      return true;
    }));
  }

  function renderProspects() {
    const list = filteredAthletes();
    const grid = $('#prospectGrid');
    const tableWrap = $('#prospectTableWrap');
    $('#resultCount').textContent = list.length;

    const empty = `
      <div class="empty">
        <h3>No athletes match these filters</h3>
        <p>Try a lower minimum height or a different position.</p>
        <button type="button" class="btn btn-secondary" data-action="reset-filters">Clear filters</button>
      </div>`;

    if (STATE.viewMode === 'table') {
      grid.hidden = true;
      tableWrap.hidden = false;
      $('#prospectTableBody').innerHTML = list.length ? list.map((a, i) => `
        <tr>
          <td class="col-num"><span class="board-rank">${i + 1}</span></td>
          <td>
            <button type="button" class="board-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
            <span class="cell-sub">${esc(a.school_team)} (${esc(a.city)}, ${code(a)})</span>
          </td>
          <td>${esc(a.position)}<span class="cell-sub">${esc(a.sport)}</span></td>
          <td class="col-num">${a.age}</td>
          <td class="num cell-nowrap">${shortHeight(a)} / ${a.biometrics.weight_lbs}</td>
          <td class="num"><span class="cell-strong">${esc(a.performance.primary_val)}</span> <span class="cell-unit">${esc(a.performance.primary_label)}</span></td>
          <td class="col-num"><span class="board-grade">${esc(a.composite_grade)}</span></td>
          <td class="col-num">${(() => { const r = ranks(a); return `${r.sport.rank}<span class="cell-unit"> · </span>${r.country.rank}`; })()}</td>
          <td>${statusMarkup(a)}</td>
          <td><div class="cell-actions">${compareButton(a.id, 'btn-sm')}</div></td>
        </tr>`).join('') : `<tr><td colspan="10">${empty}</td></tr>`;
      return;
    }

    grid.hidden = false;
    tableWrap.hidden = true;
    if (!list.length) {
      grid.innerHTML = empty;
      return;
    }

    grid.innerHTML = list.map((a) => {
      const p = a.performance;
      return `
        <article class="prospect">
          <div class="prospect-top">
            <span class="prospect-rank num" aria-label="Board rank">${ranks(a).board.rank}</span>
            <div>
              <p class="prospect-meta"><strong>${code(a)}</strong> · ${esc(a.sport)} · Age ${a.age}</p>
              <h3 class="prospect-name"><button type="button" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button></h3>
              <p class="prospect-pos">${esc(a.position)}</p>
              <p class="prospect-team">${esc(a.school_team)}</p>
            </div>
            <div class="prospect-grade">
              <div class="prospect-grade-figure num">${esc(a.composite_grade)}</div>
              <div class="prospect-grade-label">Grade</div>
            </div>
          </div>
          ${rankRow(a)}
          <dl class="measure-grid">
            <div><dt>Height</dt><dd>${primes(a.biometrics.height)}</dd></div>
            <div><dt>Weight</dt><dd>${a.biometrics.weight_lbs} lb</dd></div>
            <div><dt>Wingspan</dt><dd>${primes(a.biometrics.wingspan_in ? feetInches(a.biometrics.wingspan_in) : a.biometrics.wingspan)}</dd></div>
            <div><dt>${esc(p.primary_label)}</dt><dd>${esc(p.primary_val)}</dd></div>
            <div><dt>${esc(p.secondary_label)}</dt><dd>${esc(p.secondary_val)}</dd></div>
            <div><dt>${esc(p.tertiary_label)}</dt><dd>${esc(p.tertiary_val)}</dd></div>
          </dl>
          <div class="prospect-foot">
            ${statusMarkup(a)}
            ${compareButton(a.id, 'btn-sm')}
          </div>
        </article>`;
    }).join('');
  }

  /* ==========================================================================
     9. PROFILE
     ========================================================================== */
  function renderProfile(id) {
    const a = athleteById(id) || STATE.athletes[0];
    STATE.selectedAthleteId = a.id;
    const p = a.performance;
    const inCompare = STATE.compareQueue.includes(a.id);

    const standings = [
      ['Height', primes(a.biometrics.height), boardStanding((x) => x.biometrics.height_in, a)],
      ['Wingspan', primes(feetInches(a.biometrics.wingspan_in)), boardStanding((x) => x.biometrics.wingspan_in, a)],
      ['Vertical jump', `${a.combine.vertical_leap_in}″`, boardStanding((x) => x.combine.vertical_leap_in, a)]
    ];

    const signAction = a.status === 'Represented'
      ? `<p class="muted">Represented by ${esc(a.agent_name || 'an agent')}</p>`
      : `<button type="button" class="btn btn-primary" data-action="open-rep" data-athlete="${a.id}">Sign with an agent</button>`;

    $('#profileBody').innerHTML = `
      <header class="profile-head">
        <div class="profile-id">
          <a href="#discovery" class="btn-link profile-back" data-action="nav" data-section="discovery">← All prospects</a>
          <p class="kicker">${esc(a.sport)} · ${esc(a.position)}</p>
          <p class="profile-number num" aria-label="Shirt number ${esc(a.jersey.replace('#', ''))}">${esc(a.jersey)}</p>
          <h1 class="profile-name" id="profileName">${splitName(a.name)}</h1>
          ${rankRow(a)}
        </div>
        <dl class="bio-list">
          <div><dt>Ht / Wt</dt><dd>${primes(a.biometrics.height)}, ${a.biometrics.weight_lbs} lb</dd></div>
          <div><dt>Born</dt><dd>${formatDate(a.dob)} (${a.age})</dd></div>
          <div><dt>From</dt><dd>${esc(a.city)}, ${esc(a.country)}</dd></div>
          <div><dt>Team</dt><dd>${esc(a.school_team)}</dd></div>
          <div><dt>Agent</dt><dd>${a.agent_name ? esc(a.agent_name) : a.status === 'Free Agent' ? 'None — free agent' : 'None — seeking'}</dd></div>
        </dl>
        <div class="profile-side">
          <div class="profile-grade">
            <div class="grade-label">Scout grade</div>
            <div class="grade-figure num">${esc(a.composite_grade)}</div>
            <div class="feature-rank">${esc(a.national_rank)}</div>
          </div>
          <div class="profile-actions">
            ${signAction}
            <button type="button" class="btn btn-quiet" data-action="toggle-compare" data-id="${a.id}" aria-pressed="${inCompare}">${inCompare ? 'In comparison' : 'Add to comparison'}</button>
            <button type="button" class="btn btn-quiet" data-action="print">Print profile</button>
          </div>
        </div>
      </header>

      <nav class="profile-tabs" aria-label="Profile sections">
        ${[['h-season', 'Season'], ['h-measure', 'Measurements'], ['h-tests', 'Testing'], ['h-video', 'Video'], ['h-career', 'Career'], ['h-honours', 'Honours'], ['h-school', 'Education'], ['h-news', 'News']]
          .map(([target, label]) => `<button type="button" class="profile-tab" data-action="jump" data-target="${target}">${label}</button>`).join('')}
      </nav>

      <section class="profile-block" aria-labelledby="h-season">
        <h2 class="block-title" id="h-season">This season</h2>
        <dl class="statline">
          <div><dt>${esc(p.primary_label)}</dt><dd>${esc(p.primary_val)}</dd></div>
          <div><dt>${esc(p.secondary_label)}</dt><dd>${esc(p.secondary_val)}</dd></div>
          <div><dt>${esc(p.tertiary_label)}</dt><dd>${esc(p.tertiary_val)}</dd></div>
        </dl>
        <dl class="stat-grid">
          ${p.stats_grid.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.val)}</dd></div>`).join('')}
        </dl>
      </section>

      <div class="profile-cols">
        <div>
          <section class="profile-block" aria-labelledby="h-measure">
            <h2 class="block-title" id="h-measure">Measurements</h2>
            <dl class="kv">
              <div><dt>Height</dt><dd>${primes(a.biometrics.height)}</dd></div>
              <div><dt>Weight</dt><dd>${a.biometrics.weight_lbs} lb</dd></div>
              <div><dt>Wingspan</dt><dd>${primes(a.biometrics.wingspan)}</dd></div>
              <div><dt>Standing reach</dt><dd>${primes(a.biometrics.reach)}</dd></div>
              <div><dt>Dominant hand</dt><dd>${esc(a.biometrics.dominant_hand)}</dd></div>
              <div><dt>Dominant foot</dt><dd>${esc(a.biometrics.dominant_foot)}</dd></div>
            </dl>
          </section>

          <section class="profile-block" aria-labelledby="h-standing">
            <h2 class="block-title" id="h-standing">Against the board</h2>
            <p class="muted standing-note">Where ${esc(firstName(a))} ranks among the ${STATE.athletes.length} athletes listed, across all sports.</p>
            <ul class="standings">
              ${standings.map(([label, value, s]) => `
                <li class="standing">
                  <span class="standing-label">${label}</span>
                  <span class="standing-value num">${value}</span>
                  <span class="standing-rank num">${s.rank} of ${s.of}</span>
                  <span class="standing-bar" aria-hidden="true"><span style="width:${Math.max(4, s.pct)}%"></span></span>
                </li>`).join('')}
            </ul>
          </section>

          <section class="profile-block" aria-labelledby="h-tests">
            <h2 class="block-title" id="h-tests">Testing</h2>
            <ul class="plain-list num">
              <li>Vertical jump — ${a.combine.vertical_leap_in}″</li>
              <li>${esc(a.combine.sprint_time)}</li>
              <li>${esc(a.combine.lane_agility)}</li>
              <li>${esc(a.combine.shuttle_run)}</li>
            </ul>
          </section>

          <section class="profile-block" aria-labelledby="h-career">
            <h2 class="block-title" id="h-career">Career</h2>
            <ol class="timeline">
              ${a.career.map((c) => `
                <li>
                  <div class="timeline-when">${esc(c.season)} · ${esc(c.league)}</div>
                  <div class="timeline-team">${esc(c.team)}</div>
                  <p class="timeline-note">${esc(c.notes)}</p>
                </li>`).join('')}
            </ol>
          </section>
        </div>

        <div>
          <section class="profile-block" aria-labelledby="h-video">
            <h2 class="block-title" id="h-video">Video</h2>
            <div class="player">
              <button type="button" class="player-play" data-action="play-video" aria-label="Play video">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <p class="player-title" id="playerTitle">${esc(a.highlights[0].title)}</p>
              <p class="player-meta num" id="playerMeta">${esc(a.highlights[0].tag)} · ${esc(a.highlights[0].duration)}</p>
            </div>
            <ul class="clip-list">
              ${a.highlights.map((h, i) => `
                <li><button type="button" class="clip" data-action="play-clip" data-index="${i}" aria-current="${i === 0}">
                  <span class="clip-title">${esc(h.title)}</span><span class="clip-time">${esc(h.duration)}</span>
                </button></li>`).join('')}
            </ul>
          </section>

          <section class="profile-block" aria-labelledby="h-honours">
            <h2 class="block-title" id="h-honours">Honours</h2>
            <ul class="plain-list">${a.achievements.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          </section>

          <section class="profile-block" aria-labelledby="h-school">
            <h2 class="block-title" id="h-school">Education</h2>
            <dl class="kv">
              <div><dt>School</dt><dd>${esc(a.academics.institution)}</dd></div>
              <div><dt>GPA</dt><dd>${esc(a.academics.gpa)}</dd></div>
              <div><dt>Exams</dt><dd>${esc(a.academics.standardized_score)}</dd></div>
              <div><dt>Eligibility</dt><dd>${esc(a.academics.eligibility)}</dd></div>
            </dl>
          </section>

          <section class="profile-block" aria-labelledby="h-news">
            <h2 class="block-title" id="h-news">In the news</h2>
            <ul class="news-list">
              ${a.news.map((n) => `<li><div class="news-source">${esc(n.source)} · ${esc(n.date)}</div><div class="news-head">${esc(n.headline)}</div></li>`).join('')}
            </ul>
          </section>
        </div>
      </div>`;

    syncPermissions(a);
  }

  function selectClip(index) {
    const a = athleteById(STATE.selectedAthleteId);
    const clip = a && a.highlights[index];
    if (!clip) return;
    $('#playerTitle').textContent = clip.title;
    $('#playerMeta').textContent = `${clip.tag} · ${clip.duration}`;
    $$('.clip').forEach((c) => c.setAttribute('aria-current', String(parseInt(c.dataset.index, 10) === index)));
  }

  function syncPermissions(a) {
    const level = a.permissions.current_level.toLowerCase();
    $$('#permList input[name="perm"]').forEach((input) => {
      input.checked = input.value === level;
      input.onchange = () => {
        a.permissions.current_level = input.value;
        const label = input.closest('.perm').querySelector('.perm-name').textContent;
        showToast(`${a.name}’s agent permission set to ${label.toLowerCase()}.`, 'success');
      };
    });
  }

  /* ==========================================================================
     10. AGENTS
     ========================================================================== */
  function renderAgents() {
    $('#agentList').innerHTML = STATE.agents.map((ag) => `
      <article class="agent">
        <div class="agent-head">
          <div>
            <h2 class="agent-name">${esc(ag.name)}</h2>
            <p class="agent-firm">${esc(ag.agency)}</p>
            <p class="agent-where">${esc(ag.headquarters)} · ${esc(ag.sports.join(', '))}</p>
          </div>
          <div class="agent-rating">
            <div class="agent-rating-figure num">${ag.rating.toFixed(2)}</div>
            <div class="grade-label">${ag.review_count} reviews</div>
          </div>
        </div>
        <p class="agent-bio">${esc(ag.bio)}</p>
        <dl class="statline">
          <div><dt>Athletes</dt><dd>${ag.athletes_count}</dd></div>
          <div><dt>Years</dt><dd>${ag.experience_years}</dd></div>
          <div><dt>Commission</dt><dd>${esc(ag.commission_rate.split(' ')[0])}</dd></div>
        </dl>
        <ul class="agent-licences">${ag.credentials.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        <p class="agent-clients"><strong>Clients include</strong> ${esc(ag.notable_clients.join(', '))}</p>
        <div class="agent-actions">
          <button type="button" class="btn btn-primary" data-action="open-rep" data-agent="${ag.id}">Start an agreement</button>
          <button type="button" class="btn btn-quiet" data-action="contact-agent" data-id="${ag.id}">Contact</button>
        </div>
      </article>`).join('');
  }

  /* ==========================================================================
     11. WATCHLISTS & COMPARISON
     ========================================================================== */
  function renderWatchlists() {
    $('#watchlists').innerHTML = STATE.scoutLists.map((list) => {
      const names = list.athlete_ids.map(athleteById).filter(Boolean);
      return `
        <article class="watchlist">
          <p class="kicker">Kept by ${esc(list.scout_name)} · updated ${formatDate(list.created_at)}</p>
          <h2 class="watchlist-title">${esc(list.title)}</h2>
          <p class="watchlist-desc">${esc(list.description)}</p>
          <ul class="watchlist-names">
            ${names.map((a) => `<li><button type="button" class="btn-link" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button><span>${esc(a.position)}</span></li>`).join('')}
          </ul>
          <p class="watchlist-note">“${esc(list.notes)}”</p>
          <button type="button" class="btn btn-secondary" data-action="load-list" data-id="${list.id}">Compare these athletes</button>
        </article>`;
    }).join('');
  }

  function toggleCompare(id) {
    const i = STATE.compareQueue.indexOf(id);
    if (i > -1) STATE.compareQueue.splice(i, 1);
    else STATE.compareQueue.push(id);
    compareChanged();
  }

  function loadWatchlist(listId) {
    const list = STATE.scoutLists.find((l) => l.id === listId);
    if (!list) return;
    STATE.compareQueue = [...new Set([...STATE.compareQueue, ...list.athlete_ids])];
    compareChanged();
    openCompare();
  }

  function compareChanged() {
    updateCompareCount();
    renderCompare();
    renderProspects();
    if (STATE.activeSection === 'profile') {
      const btn = $('#profileBody [data-action="toggle-compare"]');
      if (btn) {
        const on = STATE.compareQueue.includes(STATE.selectedAthleteId);
        btn.setAttribute('aria-pressed', String(on));
        btn.textContent = on ? 'In comparison' : 'Add to comparison';
      }
    }
  }

  function updateCompareCount() {
    $('#compareCount').textContent = STATE.compareQueue.length;
  }

  function renderCompare() {
    const wrap = $('#compareWrap');
    const list = STATE.compareQueue.map(athleteById).filter(Boolean);

    if (!list.length) {
      wrap.innerHTML = `
        <div class="empty">
          <h3>Nothing to compare yet</h3>
          <p>Add athletes from the prospects board, or load one of the watchlists above.</p>
          <button type="button" class="btn btn-secondary" data-action="load-list" data-id="list-01">Load basketball prospects</button>
        </div>`;
      return;
    }

    const multi = list.length > 1;
    const best = (getter) => Math.max(...list.map(getter));
    const mark = (value, top) => (multi && value === top ? 'best' : '');
    const top = {
      height: best((a) => a.biometrics.height_in),
      wing: best((a) => a.biometrics.wingspan_in),
      vert: best((a) => a.combine.vertical_leap_in),
      grade: best((a) => parseFloat(a.composite_grade))
    };

    const row = (label, cell) => `<tr><td>${label}</td>${list.map((a) => `<td>${cell(a)}</td>`).join('')}</tr>`;

    wrap.innerHTML = `
      <table class="data-table compare-table">
        <thead>
          <tr>
            <th scope="col"><span class="visually-hidden">Measure</span></th>
            ${list.map((a) => `
              <th scope="col">
                <div class="compare-head">
                  <div>
                    <button type="button" class="board-name compare-name" data-action="view-profile" data-id="${a.id}">${esc(a.name)}</button>
                    <span class="compare-sub">${code(a)} · ${esc(a.sport)}</span>
                  </div>
                  <button type="button" class="compare-remove" data-action="toggle-compare" data-id="${a.id}" aria-label="Remove ${esc(a.name)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
                  </button>
                </div>
              </th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${row('Scout grade', (a) => `<span class="num ${mark(parseFloat(a.composite_grade), top.grade)}">${esc(a.composite_grade)}</span>`)}
          ${row('Ranking', (a) => esc(a.national_rank))}
          ${row('Position', (a) => esc(a.position))}
          ${row('Age', (a) => `<span class="num">${a.age}</span>`)}
          ${row('Height', (a) => `<span class="num ${mark(a.biometrics.height_in, top.height)}">${primes(a.biometrics.height)}</span>`)}
          ${row('Weight', (a) => `<span class="num">${a.biometrics.weight_lbs} lb</span>`)}
          ${row('Wingspan', (a) => `<span class="num ${mark(a.biometrics.wingspan_in, top.wing)}">${primes(feetInches(a.biometrics.wingspan_in))}</span>`)}
          ${row('Vertical jump', (a) => `<span class="num ${mark(a.combine.vertical_leap_in, top.vert)}">${a.combine.vertical_leap_in}″</span>`)}
          ${row('Speed test', (a) => `<span class="num">${esc(a.combine.sprint_time)}</span>`)}
          ${row('Key stat', (a) => `<span class="num"><strong>${esc(a.performance.primary_val)}</strong> ${esc(a.performance.primary_label)}</span>`)}
          ${row('Status', (a) => statusMarkup(a))}
        </tbody>
      </table>`;
  }

  /* ==========================================================================
     12. TRIALS
     ========================================================================== */
  function renderOpportunities() {
    const today = new Date();
    $('#oppList').innerHTML = STATE.opportunities.map((o) => {
      const r = o.requirements;
      const threshold = r.sprint_threshold || r.height_threshold || r.timing_threshold || r.verification;
      const daysLeft = Math.ceil((new Date(o.deadline) - today) / 86400000);
      const soon = daysLeft >= 0 && daysLeft <= 30;
      return `
        <article class="opp">
          <div>
            <p class="opp-sport">${esc(o.sport)} · ${esc(o.org_type)}</p>
            <h2 class="opp-title">${esc(o.title)}</h2>
            <p class="opp-org">${esc(o.organization)}</p>
            <p class="opp-tags">${esc(o.tags.join(' · '))}</p>
          </div>
          <dl class="kv">
            <div><dt>Where</dt><dd>${esc(o.location)}</dd></div>
            <div><dt>When</dt><dd>${esc(o.date)}</dd></div>
            <div><dt>Apply by</dt><dd class="${soon ? 'deadline-soon' : ''}">${esc(o.deadline)}${soon ? ` — ${daysLeft} days left` : ''}</dd></div>
            <div><dt>Age</dt><dd>${esc(r.age_range)}</dd></div>
            <div><dt>Standard</dt><dd>${esc(threshold)}</dd></div>
            <div><dt>On offer</dt><dd>${esc(o.compensation)}</dd></div>
          </dl>
          <div class="opp-side">
            <p class="opp-spots"><strong class="num">${o.spots_available}</strong> places · ${o.applicants_count} applied</p>
            <button type="button" class="btn btn-primary" data-action="apply" data-id="${o.id}">Apply</button>
          </div>
        </article>`;
    }).join('');
  }

  function openApply(oppId, opener) {
    const o = STATE.opportunities.find((x) => x.id === oppId);
    if (!o) return;
    $('#applyTitle').textContent = o.title;
    $('#applyOrg').textContent = `${o.organization} · ${o.location}`;
    const select = $('#applyAthlete');
    const eligible = STATE.athletes.filter((a) => a.sport === o.sport);
    const options = eligible.length ? eligible : STATE.athletes;
    select.innerHTML = options.map((a) => `<option value="${a.id}">${esc(a.name)} — ${esc(a.position)}</option>`).join('');
    if (options.some((a) => a.id === STATE.selectedAthleteId)) select.value = STATE.selectedAthleteId;
    const syncAgent = () => {
      const a = athleteById(select.value);
      $('#applyAgent').value = a && a.agent_name ? a.agent_name : 'None — applying directly';
    };
    select.onchange = syncAgent;
    syncAgent();
    $('#applyNote').value = '';
    $('#applyForm').onsubmit = (e) => {
      e.preventDefault();
      const a = athleteById(select.value);
      o.applicants_count += 1;
      renderOpportunities();
      closeModal();
      showToast(`Application for ${a.name} sent to ${o.organization.split(' / ')[0]}.`, 'success');
    };
    openModal($('#applyModal'), opener);
  }

  /* ==========================================================================
     13. PAYMENTS
     ========================================================================== */
  function escrowHeld() {
    return STATE.transactions.filter((t) => t.status !== 'Settled').reduce((s, t) => s + t.amount_usd, 0);
  }

  function renderLedger() {
    const txs = STATE.transactions;
    const settled = txs.filter((t) => t.status === 'Settled');
    const held = txs.filter((t) => t.status !== 'Settled');
    const sum = (arr) => arr.reduce((s, t) => s + t.amount_usd, 0);

    $('#ledgerTotals').innerHTML = `
      <div><dt>Held in escrow</dt><dd>${money(sum(held))}<span class="totals-sub">${held.length} payment${held.length === 1 ? '' : 's'} waiting for release</span></dd></div>
      <div><dt>Settled</dt><dd>${money(sum(settled))}<span class="totals-sub">${settled.length} payments</span></dd></div>
      <div><dt>Transactions</dt><dd>${txs.length}<span class="totals-sub">Since ${formatDate(txs[txs.length - 1].date)}</span></dd></div>`;

    $('#ledgerBody').innerHTML = txs.map((t) => `
      <tr>
        <td>${formatDate(t.date)}<span class="cell-sub">${esc(t.contract_ref)}</span></td>
        <td><span class="cell-strong">${esc(t.type)}</span><span class="cell-sub">${esc(t.description)}</span></td>
        <td>${esc(t.payer)}</td>
        <td>${esc(t.payee)}</td>
        <td class="col-num">${money(t.amount_usd)}</td>
        <td>${t.status === 'Settled' ? '<span class="status status-ok">Settled</span>' : '<span class="status status-wait">In escrow</span>'}</td>
      </tr>`).join('');

    if (STATE.activeRole === 'admin') $('#balanceValue').textContent = money(escrowHeld());
  }

  /* ==========================================================================
     14. REPRESENTATION AGREEMENT
     ========================================================================== */
  function openRepresentation(athleteId, agentId, opener) {
    const a = athleteById(athleteId) || STATE.athletes[0];
    const agent = STATE.agents.find((x) => x.id === agentId) || STATE.agents[0];
    STATE.stepper.targetAthleteId = a.id;
    STATE.stepper.selectedAgent = agent;
    STATE.stepper.authorityLevel = 'representative';

    $('#repTitle').textContent = `${a.name} and ${agent.name}`;
    $('#repAgent').textContent = `${agent.name}, ${agent.agency}`;
    $('#repLicence').textContent = agent.credentials[0];
    $('#repCommission').textContent = agent.commission_rate;
    $$('input[name="repAuthority"]').forEach((r) => { r.checked = r.value === 'representative'; });
    $('#signerName').value = a.name;
    $('#signaturePreview').textContent = a.name;
    $('#signatureMeta').textContent = `Signed electronically · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;

    $('#signerName').oninput = (e) => { $('#signaturePreview').textContent = e.target.value.trim(); };
    $$('input[name="repAuthority"]').forEach((r) => { r.onchange = () => { STATE.stepper.authorityLevel = r.value; }; });

    goToStep(1, false);
    openModal($('#repModal'), opener);
  }

  function goToStep(n, moveFocus = true) {
    STATE.stepper.currentStep = n;
    $$('#repSteps li').forEach((li) => {
      const step = parseInt(li.dataset.step, 10);
      li.classList.toggle('is-done', step < n);
      if (step === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    $$('#repModal .step').forEach((pane) => { pane.hidden = parseInt(pane.dataset.pane, 10) !== n; });
    if (moveFocus) {
      const pane = $(`#repModal .step[data-pane="${n}"]`);
      const target = pane.querySelector('input:not([type="radio"]), input:checked, .btn-primary');
      if (target) target.focus();
    }
  }

  function signAgreement() {
    const name = $('#signerName').value.trim();
    if (!name) {
      showToast('Type your full name to sign.');
      $('#signerName').focus();
      return;
    }
    const a = athleteById(STATE.stepper.targetAthleteId);
    const agent = STATE.stepper.selectedAgent || STATE.agents[0];
    a.status = 'Represented';
    a.agent_name = agent.name;
    a.agent_id = agent.id;
    a.permissions.current_level = STATE.stepper.authorityLevel;

    STATE.transactions.unshift({
      id: `tx-${txCounter++}`,
      date: new Date().toISOString().slice(0, 10),
      type: 'Representation retainer',
      payer: `${a.name} (athlete)`,
      payee: `${agent.agency} (${agent.name})`,
      amount_usd: 2500,
      fee_type: 'Retainer',
      status: 'Escrow Held',
      contract_ref: `AGR-2026-${String(txCounter).padStart(4, '0')}`,
      description: `Agreement signed by ${name}. Authority: ${STATE.stepper.authorityLevel}.`
    });

    closeModal();
    renderProspects();
    renderFeature();
    renderProfile(STATE.selectedAthleteId);
    renderCompare();
    renderLedger();
    showToast(`${a.name} is now represented by ${agent.name}. A $2,500 retainer is held in escrow.`, 'success');
  }

  /* ==========================================================================
     15. MODALS
     ========================================================================== */
  let activeModal = null;
  let lastFocus = null;

  function wireModals() {
    document.addEventListener('keydown', (e) => {
      if (!activeModal) return;
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', activeModal.querySelector('.modal-dialog'))
          .filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function openModal(modal, opener) {
    if (activeModal) closeModal();
    lastFocus = opener || document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector('.step:not([hidden]) .btn-primary, form select, .modal-close');
    if (first) first.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.hidden = true;
    activeModal = null;
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ==========================================================================
     16. TOASTS
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = $('#toasts');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 220);
    }, 4000);
  }

  // Public hook kept for the showcase page and console use.
  window.AAX = { viewProfile, switchSection, toggleCompare, setRole };
})();
