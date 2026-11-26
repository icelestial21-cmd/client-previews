// CSQ Leagues & Tournaments module: public pages, admin section, organizer section.
export * from "./types";
export { CompetitionDataProvider, useData, useBundle, useFollows } from "./data/DataProvider";
export { supabaseSource } from "./data/supabaseSource";
export { competitionRoutes, paths, BASE } from "./routes";
export { LeaguesTournamentsPage } from "./pages/public/LeaguesTournamentsPage";
export { CompetitionPage } from "./pages/public/CompetitionPage";
export { AdminCompetitionsPage } from "./pages/admin/AdminCompetitionsPage";
export { OrganizerPage } from "./pages/organizer/OrganizerPage";
export { EditCompetitionPage } from "./pages/manage/EditCompetitionPage";
export { CircularBracket } from "./components/CircularBracket";
export { computeStandings, validateScore, scoringFor } from "./engine/standings";
export { qualify, roundNames, seedOrder } from "./engine/bracket";
import "./styles.css";
