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

> Read `HANDOFF.md` and continue Meridiana from Stage 6.

The project files and this note are on disk, so a new session can continue even without the old chat.

## Current stage

Stages 1 through 5 are complete and committed. The next work is Stage 6: M&A deal management.

### What Stage 5 delivered

Backend:

- Buyer, Seller and Notification models.
- Admin user, buyer profile and seller profile management.
- Buyer and seller self-service profile endpoints.
- Account details update and password change.
- In-app notifications and admin analytics.
- Welcome notifications on account creation.

Frontend:

- Responsive role-specific dashboard shell.
- Live navigation with no dead links.
- Role-specific overview pages using live API data.
- Admin user, buyer and seller management panels.
- Admin analytics panel.
- Notifications panel for all four roles.
- Account settings panel for all four roles.
- Buyer profile and seller business profile forms.
- Stage 6 and Stage 7 features are shown as clearly marked future badges.

### Verification completed

All of these passed before the Stage 5 commit:

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

Two API test scripts also passed:

```text
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-api-test.mjs
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-ui-api-integration.mjs
```

The second script specifically tests the payloads and CRUD operations used by the new dashboard panels, including role-based access blocks.

## Next stage: Stage 6

Stage 6 should add deal management:

1. Deal model with stages, parties, values and assigned advisor.
2. Admin/advisor deal CRUD APIs.
3. Buyer and seller read-only deal views where appropriate.
4. Transaction pipeline UI.
5. Deal detail view.
6. Buyer interest and seller progress views.
7. Final tests, README update and commit.

The sidebar currently marks these sections with **Stage 6** badges. Replace those badges with live links as each page is built.

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
- `frontend/next.config.ts` uses `cacheComponents: true`; avoid using current dates/times during prerendering.
- React lint rules in this project reject synchronous `setState` inside effects.
- Stage 7 will add documents, NDAs, meetings, tasks and messages.
- Stage 8 will cover final testing, fixes and deployment preparation.

## Checkpoint commit

Stage 5 is saved in Git. Check the latest commit with:

```bash
git log -1 --oneline
```
