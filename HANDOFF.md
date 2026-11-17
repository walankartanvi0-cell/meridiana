# Meridiana handoff

This file records where the project paused so work can continue safely after closing OpenCode or starting a new session.

## How to resume

Open a terminal in the project folder:

```bash
cd "C:\Users\Tejal\OneDrive\Desktop\Ricoz Internship\Project 1"
opencode
```

Then return to the existing conversation:

- Run `/sessions`, or
- Press **Ctrl+X**, then **L**, and choose this project/session.

If you start a **new** session instead, tell the assistant:

> Read `HANDOFF.md` and continue Meridiana from Stage 7.

The project files and this note are on disk, so a new session can continue even without the old chat.

## Current stage

Stages 1 through 6 are complete and committed. The next work is Stage 7: documents, NDAs, meetings, tasks and messages.

### What Stage 6 delivered

Backend:

- Deal model with stages, seller and buyer references, advisor assignment, values, probability, dates, notes and buyer saved list.
- Deal constants and validation.
- Protected `/api/deals` router with role-restricted list, pipeline, options, available, saved, mine, detail, create, update, delete, save and unsave endpoints.
- In-app notification when a deal is created or moves stage.
- Buyer-visible stage rules so only appropriate opportunities are shown.
- Server-side checks preventing buyers and sellers from managing deals and preventing advisors from editing deals assigned to someone else.

Frontend:

- Admin deal management with search, stage filtering, create, edit, delete and detail links.
- Advisor assigned-deal management.
- Shared transaction pipeline board with buyer and seller pipeline filters and deal progress watchlist.
- Buyer available, saved and all-deal pages with working save/remove actions.
- Seller transaction progress with a visual stage tracker and buyer interest view.
- Shared role-aware deal detail page with stage updates for managers and internal notes restricted to managers.
- Live Stage 6 sidebar links and deal counts on all four role overviews.
- Dynamic deal detail routes use a Server Component Suspense boundary, as required by Next.js 16 with `cacheComponents`.

### Important Next.js 16 notes

- The project's `AGENTS.md` requires reading the installed docs in `frontend/node_modules/next/dist/docs/` before writing frontend code.
- `params` in dynamic pages is a `Promise`. Do not access it synchronously.
- With `cacheComponents`, dynamic params must be read inside `<Suspense>` or a route-level `loading.tsx`.
- Do not use current dates/times during prerendering.
- React lint rules reject synchronous `setState` inside effects.

### Verification completed

All of these passed before the Stage 6 commit:

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend
npm run typecheck
npm run build
```

Three API test scripts passed:

```text
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-api-test.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-ui-api-integration.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage6-api-integration.mjs
```

The Stage 6 script covers deal CRUD, pipeline data, deal options, buyer/seller views, saved opportunities, stage updates, validation and role-based access blocks. No `href="#"`, empty links or `Stage 6` placeholder badges remain in `frontend/src`.

The frontend production build generated 50 routes, including four partial-prerendered dynamic deal detail routes.

## Next stage: Stage 7

Stage 7 should add the remaining portal functionality:

1. Secure document storage and download with access checks.
2. NDA management for buyers and sellers.
3. Meeting scheduling and meeting records.
4. Task assignment and completion.
5. Direct messages between role participants.
6. Sidebar links, tests, README update and commit.

The sidebar currently marks these sections with **Stage 7** badges. Replace those badges with live links as each page is built.

## Useful commands

Backend:

```bash
cd backend
npm run dev
npm run typecheck
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run dev
```

The backend runs at `http://localhost:5000/api` and the frontend at `http://localhost:3000`.

The local admin email and password are configured in `backend/.env`. Do not put real secrets in frontend code or commit `.env` files. Change the local admin password before any real deployment.

## Project notes

- Frontend and backend are separate folders.
- JWT is stored in browser `localStorage` under `meridiana_token` and sent as `Authorization: Bearer <token>`.
- Local MongoDB data is stored in the ignored `backend/.mongo-data` folder, so records survive a server restart.
- API success shape: `{ success: true, message, data? }`.
- API error shape: `{ success: false, message, errors?, stack? }`.
- An advisor account can be created by registering a buyer account and then having the administrator change its role through Manage Users.
- Stage 8 will cover final testing, fixes and deployment preparation.

## Checkpoint commit

Stage 6 is saved in Git. Check the latest commit with:

```bash
git log -1 --oneline
```
