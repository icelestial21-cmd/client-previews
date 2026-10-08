---
target: athlete-discovery
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:/home/user/client-previews/athlete-discovery/index.html"
target_fingerprint: "sha256:6b73565e5ee1a5e1ea36074ac79dceadf46546e5d0b1e9a9fd22e8761f52f336"
target_path: /home/user/client-previews/athlete-discovery/index.html
timestamp: 2026-10-08T02-20-15Z
slug: athlete-discovery-index-html
closed: true
---
Method: dual-agent (A: design-review subagent · B: detector-and-browser subagent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Nav, stepper, live result count, toasts work; agreement signing confirmed only by a 6-second toast |
| 2 | Match System / Real World | 2 | PPG/RPG/APG, "Big board", "Board 2/7 · TRACK 1/1 · JAM 1/4", "id verified"; scout grade never defined |
| 3 | User Control and Freedom | 3 | Back/Esc/cancel everywhere; closing the agreement modal silently loses progress; offers can't be withdrawn |
| 4 | Consistency and Standards | 2 | Profile has 4 permission levels, agreement 2, ignoring the athlete's setting; rank denominators differ by role; ledger not date-sorted |
| 5 | Error Prevention | 2 | Highest authority pre-selected, even for a 17-year-old (app.js:1365); terms omit commission % |
| 6 | Recognition Rather Than Recall | 2 | Rank fractions only in title tooltips; 8% must be recalled from step 1; compare far from the board |
| 7 | Flexibility and Efficiency | 2 | Presets/table/CSV/shortlists exist; table unsortable; no bulk shortlist add |
| 8 | Aesthetic and Minimalist Design | 2 | Board leaders duplicates board; 12 data cells per card; $0 KPI cards |
| 9 | Error Recovery | 3 | Specific messages; no path to fix (e.g. how to get verified) |
| 10 | Help and Documentation | 1 | Scout grade and verification ladder never explained; no help entry point |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

LLM: genre-specific (broadcast sports vocabulary) but product-generic; ~40% authored for Apex. The four positioning commitments are barely designed; only the verification badge ladder is unmistakably Apex.

Deterministic scan: detect on index.html exit 2, 35 findings; directory scan 40. 19 of 20 low-contrast hits are false positives (dark-theme tokens resolved against white). Confirmed: dark --live white on #F85149 3.35:1 (.badge-live, .btn-danger); .status-wait on navy header 3.29:1 (light); search placeholder 4.33:1 light / 3.43:1 dark; breadcrumb #C9420E on #F1F2F3 4.39:1; 125 visible <11px labels on #board (.rank-row dt, .metric-grid dt, .tick-event, .glance dt, .spotlight-stats dt 10px; .grade-tile span 9.5px; .steps li 10px mobile); h1→h3 skips on Clients and empty Payments; .notice left stripe; .modal-dialog 4px top accent on 10px radius; radial glow on spotlight/player header; marquee (mitigated: pause button, pause on hover/focus, reduced-motion off). Browser overlay ran headless on 5 views + dark; no user-visible overlay.

## Priority Issues

- [P1] Front page never says what Apex is or promises: visually hidden h1 (index.html:104); four commitments only at the bottom; escrow and verification ladder absent there. Fix: visible headline, 4-promise strip beside spotlight, designed verification-ladder explainer linked from badges. Command: /impeccable clarify, /impeccable layout.
- [P1] Under-18 journey dead-ends; defaults work against the minor: no under-18 swimming listing (Chloe can't apply); next steps have no actions; agreement defaults to Exclusive representative even for a minor and ignores athlete permission; guardian consent is same-device checkbox. Fix: add listing, eligibility-first trial cards with "how to get verified", default authority = athlete's setting / Manager for minors, guardian handoff step. Command: /impeccable harden, /impeccable onboard.
- [P1] Scout grade unexplained; trust not shown on primary numbers: no scale/source/verification on grade; rank fractions via title only; no verification column in table; "Against the board" compares across sports. Fix: grade explainer, ranks in words, verification column and grade marker, same-sport comparison. Command: /impeccable clarify.
- [P1] Mobile buries results: first card ~1,950px down at 390px; scout desktop landing shows no athletes above fold; nav overflow without cue. Fix: Filters (n) bottom sheet on mobile, leaders below results, nav fade cue. Command: /impeccable adapt, /impeccable distill.
- [P2] Signing and money moments hide terms: terms say "a percentage"; toast-only success; ledger has no in/out direction, not date-sorted, no escrow release info. Fix: live summary card on steps 3-4, confirmation pane, ledger ± direction, date sort, release column. Command: /impeccable clarify, /impeccable polish.

## Persona Red Flags

- Jordan (first-time parent): jargon, no help, no sign-in path on visitor Trials/Agents, unlabeled rating, "Held for you" unexplained.
- Sam (keyboard/screen reader): modal focus lands on Close (app.js:1925); title-only rank meanings; disabled radios styled as choices; 6s toast; sub-11px labels; placeholder contrast.
- Casey (mobile): ~2.4 screens before first athlete; nav overflow without cue; truncated role select; visitor profile primary action is Print; non-playing play button; nested scroll in terms.
- Shanice (16, Spanish Town, PAYG Android): dead-end trials; same-phone guardian consent; scouts see her body measurements/club/town; pay-to-verify $250; full variable-font download.
- Tom (UK academy scout): unsortable table, no verification column; compare far from board; ft/in and lb only; can't weigh self-reported vs combine-verified grades.

## Minor Observations

Green success colour used as decoration in Trending; arbitrary KPI top-border colours; dark-mode navy buttons vanish on dark cards; agent dashboard prospects lack "Offer representation"; club can't post trials; admin can't act on escrow; lowercase "id verified"; truncated labels "AERIALS W…"/"BOWLING A…"; empty-board hint blames height when search text is the cause; "Licences are checked when an agent signs up" is an unmodelled claim; top stories open profiles, not stories.

## Questions to Consider

1. Who gives the scout grade, and should self-reported data ever outrank combine data?
2. Should a safeguarding-led exchange open with a teenager's body measurements or with its four promises?
3. Should a 17-year-old ever be offered "Exclusive representative, approves escrow payouts" by default?
4. Does a $250 Apex-branded combine fee undercut "fair money"?
5. Does ~250px of navy chrome and ticker earn its place on a teenager's phone, or could a Caribbean identity replace borrowed broadcast prestige?
