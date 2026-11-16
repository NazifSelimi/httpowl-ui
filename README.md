# HTTPowl — frontend

React 18 + TypeScript single-page app for https://httpowl.net: the marketing
page, sign-in, onboarding and the dashboard. It talks to the Go API in
`httpowl-api` (`/api`, see its API.md) with the `owl_session` cookie.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api (+ WebSocket) to 127.0.0.1:8090
npm run build      # type-check, then bundle to dist/
npm run lint
deploy/deploy.sh   # build and publish to https://httpowl.net (keeps the previous build as app.prev)
```

Run the API locally first (`go run ./cmd/api` in httpowl-api), or point the
proxy at the live API with `VITE_API_TARGET=https://httpowl.net npm run dev`.

## How a page gets on screen

```
main.tsx ── loads styles/index.css, renders <App/>
app/App.tsx ── Redux Provider → Router
app/routes.tsx ── every URL → lazy page; /onboarding and /app/* wrapped in ProtectedRoute
components/layout/DashboardLayout ── sidebar, top bar, live feed; <Outlet/> for the page
pages/… ── the page: reads data with RTK Query hooks, renders components
```

1. **Data** — all server data goes through **RTK Query**. One instance,
   `api/baseApi.ts` (cookie auth; a 401 resets the cache so ProtectedRoute
   sends the person to /login). Each feature adds endpoints with
   `baseApi.injectEndpoints` in `features/<name>/api.ts`. Mutations invalidate
   `API_TAGS`, so lists refetch by themselves.
2. **Client state** — the store (`store/index.ts`) holds only what isn't on the
   server: `sites` (current site, saved to localStorage) and `live` (range,
   filters, requests pushed over the WebSocket).
3. **Live feed** — `features/live/websocketMiddleware.ts` keeps one socket to
   `/api/sites/{id}/live` while DashboardLayout is mounted.

## Where things live

```
src/
  app/          App.tsx, routes.tsx, typed Redux hooks
  api/          baseApi.ts — the one RTK Query instance + cache tags
  store/        Redux store
  features/<x>/ Everything for one area: api.ts (endpoints), slice.ts, feature-only components
                auth (AuthCard), sites, traffic, live, rules (useIpBlocks), notes, team, landing (content)
  pages/        One file per route: LandingPage, auth/, OnboardingPage, app/ (Live, Threats, Blocked, …)
  components/   Reusable React components
    layout/     DashboardLayout, Brand/OwlMark, PageHeading, LoadingState, ErrorNotice
    routing/    ProtectedRoute
    dashboard/  StatCard, RangePicker, TrafficChart, CountryList, RequestsTable
    ui/         shadcn components (button)
  hooks/        useCurrentSite, useCopyToClipboard
  shared/       Plain TypeScript, no React: utils/ (format, error, storage, cn), constants/
  styles/       Global CSS in cascade order, imported by styles/index.css
  types/        API data types (snake_case, exactly as the JSON)
```

Rule of thumb: used by one feature → keep it in `features/<x>/`; used by
several pages → `components/` (React) or `shared/` (plain TS).

## Reuse these instead of writing your own

| Need | Use |
| --- | --- |
| Which site is shown, its role | `useCurrentSite()` |
| Can this role do X? | `hasRole(role, 'admin')` from `shared/constants` |
| Block / unblock an IP from any list | `useIpBlocks(siteId, canEdit)` |
| Text for an API error | `<ErrorNotice error={…} />` or `extractErrorMessage(error)` |
| Numbers, times, countries, plurals | `shared/utils/format` |
| Page title row | `components/layout/PageHeading` |
| localStorage | `storage.get/set` — never throws |

## Conventions

- `.ts` / `.tsx` only. Import with the `@/` alias, not `../../`.
- Prettier: single quotes, semicolons, 160 columns (`.prettierrc`); run `npx prettier --write src`.
- Server data via RTK Query hooks only — no raw `fetch` in components.
- Every file starts with a short comment saying what it is for when that isn't obvious.
- The API is the security boundary: the UI hides controls a role can't use, the API refuses them anyway.
- New dashboard page: add it to `APP_ROUTES` in `app/routes.tsx` and to the sidebar links in `DashboardLayout`.
