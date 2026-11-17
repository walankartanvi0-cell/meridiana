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

> Read `HANDOFF.md` and continue Meridiana from Stage 8.

The project files and this note are on disk, so a new session can continue even without the old chat.

## Current stage

Stages 1 through 7 are complete and committed. The next work is **Stage 8: deployment preparation and final testing**.

### What Stage 7 delivered

Backend:

- Document model and secure uploads: generated file names, allowed extensions, 10 MB default limit, authenticated download route.
- NDA model and workflow with role-based scoping, signature recording and safe document linking.
- Meeting model with deal links, attendees, duration, location, agenda and status; deal-linked meetings auto-invite the deal parties.
- Task model with assignee, creator, priority, status and due date.
- Message model with deal links, recipients, read tracking and unread counts.
- Shared `dealAccess` helpers used by every collaboration controller.
- New notification types: `nda`, `task` and `message`.
- Collaboration routers: `/api/documents`, `/api/ndas`, `/api/meetings`, `/api/tasks`, `/api/messages`.
- `GET /api/documents/options` supplies deal and user choices for collaboration forms.

Frontend:

- Five role-aware panels: documents, NDAs, meetings, tasks and messages.
- 19 role route pages across the four dashboards (54 dashboard pages in total).
- Live sidebar links for every collaboration section; overview quick links and open-task counts.
- Null-safe NDA rendering when a deal is no longer present.

### Quality fixes made during Stage 7 QA

- Invalid ObjectId query parameters now return `400` instead of `500` (shared `queryObjectId` helper).
- NDA list filters use `$and`, so query parameters narrow the role scope instead of widening it.
- NDA document linking only accepts a document tied to the deal, uploaded by the acting user, uploaded by staff, or uploaded by the NDA's own buyer.
- Deleting a deal cascades its documents, NDAs, meetings, tasks and messages, and removes files from disk.
- Deleting a buyer/seller profile or a user attached to a deal is blocked until the deal is reassigned.
- `errorHandler` now handles `CastError`, Multer size errors, body-parser 4xx and `413` payloads.
- `express.urlencoded` now has a `100kb` limit.
- Frontend `NdaPanel` no longer crashes when an NDA's deal is missing.

### Verification completed

All of these passed before the Stage 7 commit:

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

Test scripts (all currently green):

```text
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-hostile-input.mjs              (68 checks)
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage7-api-integration.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage7-ui-smoke.mjs            (56 page checks)
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-ui-flow-test.mjs               (14 checks)
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-responsive-audit.mjs           (1440/1024/768/390 px)
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-api-test.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-ui-api-integration.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage6-api-integration.mjs
```

The frontend production build generates 70 routes. `npm audit --omit=dev` reports zero vulnerabilities in both projects.

### Important Next.js 16 notes

- The project's `AGENTS.md` requires reading the installed docs in `frontend/node_modules/next/dist/docs/` before writing frontend code.
- `params` in dynamic pages is a `Promise`. Do not access it synchronously.
- With `cacheComponents`, dynamic params must be read inside `<Suspense>` or a route-level `loading.tsx`.
- Do not use current dates/times during prerendering.
- React lint rules reject synchronous `setState` inside effects.

## Next stage: Stage 8

Stage 8 is deployment preparation and final testing. Suggested work:

1. Add rate limiting to auth, contact and consultation endpoints.
2. Replace placeholder contact details in `frontend/src/lib/site.ts` (`hello@meridiana.com`, `+1 (212) 555-0148`).
3. Decide on production document storage (local disk is fine for a single server; cloud storage is better for multiple servers).
4. Set production environment values: real `MONGO_URI`, strong `JWT_SECRET`, production `CLIENT_URL`, new admin password.
5. Create the GitHub remote and push the repository.
6. Choose hosting (for example Vercel for the frontend and Render/Railway/Fly for the backend).
7. Run the full test suite once more against the deployed environment.
8. Write deployment instructions in the README.

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
- Uploaded files are stored in the ignored `backend/uploads` folder.
- API success shape: `{ success: true, message, data? }`.
- API error shape: `{ success: false, message, errors?, stack? }` (stack only in development).
- An advisor account can be created by registering a buyer account and then having the administrator change its role through Manage Users.
- No GitHub remote exists yet.

## Checkpoint commit

Stage 7 is saved in Git. Check the latest commit with:

```bash
git log -1 --oneline
```
