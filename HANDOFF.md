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

> Read `HANDOFF.md` and continue Meridiana from the Stage 5 checkpoint.

The project files and this note are on disk, so a new session can continue even without the old chat.

## Current stage

Stage 5 (user roles and dashboards) is in progress.

### Backend status: complete for this stage

Stage 5 backend work has been implemented and tested:

- Buyer, Seller and Notification models.
- Admin user management: list, update and delete users.
- Admin buyer and seller profile management: list, create, update and delete.
- Buyer and seller self-service profile endpoints.
- Account details update and password change.
- In-app notifications: list, mark one as read, mark all as read.
- Admin analytics summary.
- Welcome notifications when an account is created.

The Stage 5 API test passed all checks. The test script is at:

```text
C:\Users\Tejal\AppData\Local\Temp\opencode\meridiana-stage5-api-test.mjs
```

### Frontend status: partially complete

Finished frontend pieces:

- Shared dashboard UI helpers.
- Responsive dashboard sidebar and header.
- Role-specific navigation with live links and clearly marked future-stage badges.
- Admin user management panel and page.
- Admin analytics panel and page.
- Notifications panel and pages for admin, advisor, buyer and seller.
- Account settings panel and pages for admin, advisor, buyer and seller.
- Seller profile page currently uses the account settings panel.

Still to build:

1. Admin Buyers management panel and page.
2. Admin Sellers management panel and page.
3. Buyer profile panel and `/dashboard/buyer/profile` page.
4. Seller business profile panel and `/dashboard/seller/business-profile` page.
5. Role-specific overview pages (replace the current overview placeholders with live summary cards and links).
6. Update `README.md` Stage 5 checkbox and account-management notes.
7. Run final checks, rerun the Stage 5 API test, and commit Stage 5 as complete.

The unfinished sections are marked with **Stage 5** badges in the sidebar, so the current checkpoint has no dead links.

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
- Stage 6 will add deal management. Stage 7 will add documents, NDAs, meetings, tasks and messages.

## Checkpoint commit

The current work is saved in a Git checkpoint commit. Check it with:

```bash
git log -1 --oneline
```

Stage 5 should be committed again as complete once the remaining panels and pages above are finished.
