import type { RouteObject } from "react-router-dom";
import { LeaguesTournamentsPage } from "./pages/public/LeaguesTournamentsPage";
import { CompetitionPage } from "./pages/public/CompetitionPage";
import { AdminCompetitionsPage } from "./pages/admin/AdminCompetitionsPage";
import { OrganizerPage } from "./pages/organizer/OrganizerPage";
import { EditCompetitionPage } from "./pages/manage/EditCompetitionPage";

/** Change these if the site uses different URLs. */
export const BASE = { public: "/leagues", admin: "/admin/competitions", organizer: "/organizer" };

export const paths = {
  list: () => BASE.public,
  competition: (slug: string, tab?: string) => `${BASE.public}/${slug}${tab ? `?tab=${tab}` : ""}`,
  admin: () => BASE.admin,
  adminEdit: (slug: string) => `${BASE.admin}/${slug}`,
  organizer: () => BASE.organizer,
  organizerEdit: (slug: string) => `${BASE.organizer}/${slug}`,
};

/** Spread into the site's router: <Routes>{competitionRoutes.map(...)}</Routes> or createBrowserRouter([...]). */
export const competitionRoutes: RouteObject[] = [
  { path: BASE.public, element: <LeaguesTournamentsPage /> },
  { path: `${BASE.public}/:slug`, element: <CompetitionPage /> },
  { path: BASE.admin, element: <AdminCompetitionsPage /> },
  { path: `${BASE.admin}/:slug`, element: <EditCompetitionPage area="admin" /> },
  { path: BASE.organizer, element: <OrganizerPage /> },
  { path: `${BASE.organizer}/:slug`, element: <EditCompetitionPage area="organizer" /> },
];
