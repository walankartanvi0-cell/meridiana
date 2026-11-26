# Meridiana

Meridiana is a premium M&A (mergers and acquisitions) advisory website and management platform for lower-middle-market companies (typically EBITDA of $2m–$10m).

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express.js (TypeScript) |
| Database | MongoDB with Mongoose |
| Authentication | JWT + bcrypt |
| Version control | Git / GitHub |

The frontend and backend are **separate projects** in separate folders.

## Folder structure

```
Project 1/
├── frontend/                 # Next.js website + dashboards (port 3000)
│   ├── public/               # Static files such as images
│   └── src/
│       ├── app/              # Pages (file-system routing)
│       ├── components/       # Reusable UI pieces
│       │   ├── layout/       # Navbar, footer, page shells
│       │   ├── ui/           # Buttons, cards, badges, inputs
│       │   ├── sections/     # Home page sections
│       │   └── dashboard/    # Dashboard widgets
│       ├── lib/              # API client and helper functions
│       ├── styles/           # Extra styles if needed
│       └── types/            # Shared TypeScript types
└── backend/                  # Express REST API (port 5000)
    ├── uploads/              # Uploaded documents (not committed)
    └── src/
        ├── config/           # Database and environment setup
        ├── controllers/      # Request handling logic
        ├── middleware/       # Auth, roles, errors, uploads
        ├── models/           # Mongoose schemas
        ├── routes/           # API route definitions
        ├── utils/            # Small helper functions
        └── validators/       # Form validation rules
```

## Getting started (simple commands)

You need **Node.js 20.9 or newer**. For local development, the backend can start its own temporary MongoDB automatically, so you do not need to install MongoDB yourself. For production, you will need a real MongoDB connection string (local MongoDB or MongoDB Atlas).

Open a terminal in this folder. There are also convenience commands at the project root, so you can run everything from one place:

```bash
npm run dev          # starts backend + frontend together
npm run db:check     # tests the database connection
npm run seed:admin   # creates the first administrator in a real database
npm run typecheck
npm run lint
npm run build
```

`npm run dev` automatically starts the backend on the database configured in `backend/.env`. If that file has no real `MONGO_URI`, it falls back to the automatic local development database.

### 1. Install packages (one time)

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Create your environment files (one time)

Copy the example files and fill in your own values:

- `frontend/.env.local.example` → `frontend/.env.local`
- `backend/.env.example` → `backend/.env`

In `backend/.env`, set `JWT_SECRET` to a long random string. The `MONGO_URI` value is only needed when using a real MongoDB server. The `SEED_ADMIN_*` values create the first administrator when the local development server starts.

### 3. Run both apps

From the **project root**, one command starts both apps:

```bash
npm run dev
```

This runs the backend on port 5000 and the frontend on port 3000 in the same terminal. Press **Ctrl+C** to stop both. To use different ports, set `BACKEND_PORT` and `FRONTEND_PORT` before running the command.

You can also run them in separate terminals:

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

This is the easiest local option. It starts a real MongoDB database automatically and keeps its data in the ignored `backend/.mongo-data` folder, so your records remain after restarting the server.

If you already have MongoDB running and want to use the `MONGO_URI` from `backend/.env`, use this instead:

```bash
npm run dev:real
```

For a production-style start, first build the TypeScript code and then start the compiled server:

```bash
npm run build
npm start
```

`npm start` always uses the `MONGO_URI` from `backend/.env`; it does not start the automatic local database.

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser. The API runs at http://localhost:5000/api.

You can check that the backend is working by opening http://localhost:5000/api/health. When connected, the response includes `"database":"connected"`.

### Connecting a real MongoDB Atlas database

**Current status:** this project is connected to a free Atlas cluster through `backend/.env`. Run `npm run db:check` from the project root to confirm it. The steps below are for connecting a different cluster later.

The automatic database is only for local development. To use a cloud database (needed for a deployed site), create a free MongoDB Atlas cluster:

1. Sign up at https://www.mongodb.com/cloud/atlas/register.
2. Create a **free M0 cluster** and choose the region closest to you.
3. In **Database Access**, add a database user with a username and a strong password. Write the password down.
4. In **Network Access**, add an IP address. For testing you can allow `0.0.0.0/0`; for production, allow only your server's IP.
5. Click **Connect → Drivers** and copy the connection string. It looks like:

   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Open `backend/.env` and replace `MONGO_URI` with your string. Put the database name `meridiana` before the `?` and replace `USER` and `PASSWORD`:

   ```text
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/meridiana?retryWrites=true&w=majority
   ```

7. Test the connection (this never starts the website, it only checks the database):

   ```bash
   cd backend
   npm run db:check
   ```

   A successful check prints `Connection OK`, the database name and a list of collections.

8. Create the first administrator in the new database:

   ```bash
   npm run seed:admin
   ```

9. Start the backend against the real database:

   ```bash
   npm run dev:real
   ```

`npm run dev` always uses the automatic local database. `npm run dev:real` and `npm start` always use the `MONGO_URI` from `backend/.env`. Only run one of them at a time, because both use port `5000`.

The new database starts empty, so the records from the local `.mongo-data` folder do not move across. Create your accounts again, or use the admin account created in step 8.

The contact and consultation forms save their submissions to MongoDB through:

- `POST /api/contact`
- `POST /api/consultations`

### 4. Accounts and sign-in

The website has two public registration roles: **Buyer** and **Seller**. Administrator and Advisor accounts are created by an administrator through the protected API.

Local development creates one administrator from `backend/.env` on first start:

- Email: the value of `SEED_ADMIN_EMAIL`
- Password: the value of `SEED_ADMIN_PASSWORD`

For a real database, set those values and run this command once from the `backend` folder:

```bash
npm run seed:admin
```

Authentication endpoints:

- `POST /api/auth/register` – public buyer/seller registration
- `POST /api/auth/login` – returns a JWT and the safe user profile
- `GET /api/auth/me` – returns the current user (requires a token)
- `POST /api/auth/logout` – confirms sign-out; the browser then removes its token
- `POST /api/auth/users` – administrator-only account creation

After signing in, each role is sent to its own dashboard: `/dashboard/admin`, `/dashboard/advisor`, `/dashboard/buyer` or `/dashboard/seller`. Passwords are hashed with bcrypt, and every protected API request checks the JWT and the user's role.

### 5. Dashboard management features

Stage 5 adds working role-specific dashboards:

- **Administrator:** manage users, buyer profiles and seller profiles; review platform analytics; read notifications; update account details and password.
- **Advisor:** review notifications and manage account settings.
- **Buyer:** maintain investment criteria through the buyer profile, review notifications and manage account settings.
- **Seller:** maintain the business profile, review notifications and manage account details and password.

The sidebar only links to pages that exist. Documents, NDAs, meetings, tasks and messages became live pages in Stage 7.

The main API groups used by the dashboards are:

- `/api/admin` – administrator-only user, buyer, seller and analytics endpoints
- `/api/account` – profile and password endpoints for the signed-in user
- `/api/notifications` – in-app notification endpoints

### 6. M&A deal management

Stage 6 adds a complete transaction workspace:

- **Deal model and API:** stages, seller and buyer profiles, assigned advisor, enterprise value, EBITDA, expected close date, probability, description, internal notes and buyer saved lists.
- **Administrator:** create, edit, delete, search and filter every deal; view the whole transaction pipeline.
- **Advisor:** manage assigned deals, buyer pipeline, seller pipeline and deal progress.
- **Buyer:** browse available opportunities, save or remove opportunities and open deal details.
- **Seller:** follow transaction progress with a stage tracker and review buyer interest.
- **Deal details:** shared detail screen with role-aware controls; internal notes are only shown to administrators and advisors.

The deal API group is `/api/deals`:

- `GET /api/deals` – admin/advisor deal list with optional `stage` and `search` query parameters
- `GET /api/deals/pipeline` – stage counts and total value
- `GET /api/deals/options` – buyer, seller and advisor choices for deal forms
- `GET /api/deals/available`, `GET /api/deals/saved` – buyer opportunity views
- `GET /api/deals/mine` – seller transaction view
- `GET /api/deals/:id` – role-checked deal detail
- `POST /api/deals`, `PATCH /api/deals/:id`, `DELETE /api/deals/:id` – admin/advisor management
- `POST /api/deals/:id/save`, `DELETE /api/deals/:id/save` – buyer saved opportunities

Deal creation notifications are written to the assigned advisor's in-app notification list. All deal endpoints verify the JWT and role on the server.

### 7. Documents, NDAs, meetings, tasks and messages

Stage 7 completes the collaboration workspace for every role:

- **Documents:** authenticated upload and download with generated file names, an allowed file-type list and a 10 MB default size limit. Each document can be linked to a deal and limited to chosen roles.
- **NDAs:** buyers request confidentiality for an assigned deal or an unassigned buyer-visible opportunity; administrators and advisors record status, signature dates and the signed file.
- **Meetings:** schedule meetings with optional deal links, attendees, duration, location, agenda and status. Deal-linked meetings invite the advisor, buyer and seller parties automatically.
- **Tasks:** assign work with priority, status and optional due date. Deals, assignees and creators are linked.
- **Messages:** deal-linked or general messages with recipients, read tracking and unread counts.
- **Delete safety:** deleting a deal removes its documents, NDAs, meetings, tasks, messages and uploaded files. A buyer or seller profile, or a user account, cannot be deleted while a deal still references it.

The collaboration API groups are:

- `/api/documents` – upload, list, detail, authenticated download, update and delete
- `/api/ndas` – request, list, detail, update status/signature and delete
- `/api/meetings` – list, detail, create, update and delete
- `/api/tasks` – list, detail, create, update and delete
- `/api/messages` – list, detail, send, mark read and delete
- `/api/documents/options` – deal and user choices for collaboration forms

Access rules are enforced on the server. Administrators see everything; advisors see only assigned deals; buyers and sellers see only records linked to their own profiles. Malformed identifiers return a clean `400`, and oversized or invalid payloads return `400` or `413` instead of crashing.

### 8. Quality checks

The backend was tested with hostile input as well as normal use. The suites cover:

- invalid and malformed identifiers, malformed JSON, oversized JSON and oversized uploads
- NoSQL injection attempts, mass-assignment attempts and tampered or missing tokens
- role escalation and cross-tenant access between buyers, sellers and advisors
- NDA list scoping and safe document linking
- deal deletion cascades and referential-integrity checks on profile and user deletion
- consistent error envelopes and administrator self-protection

Run the checks while both apps are running:

```bash
cd backend
npm run typecheck
npm run build
```

```bash
cd frontend
npm run lint
npm run build
```

## Running this repo on another computer

The `.env` files are intentionally **not** committed because they contain secrets. After cloning, set them up once:

1. Install packages:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ..
```

2. Copy the example env files:

- `frontend/.env.local.example` → `frontend/.env.local` (the default API URL works for local development)
- `backend/.env.example` → `backend/.env`, then set a long random `JWT_SECRET` and a `SEED_ADMIN_PASSWORD`

3. Start both apps from the project root:

```bash
npm run dev
```

This uses the automatic local MongoDB — no Atlas account is needed. On the first start, `mongodb-memory-server` downloads a MongoDB binary (~780 MB), so allow a few minutes and an internet connection. The local admin created from `SEED_ADMIN_PASSWORD` is separate from any admin in a shared Atlas database.

To use a shared MongoDB Atlas database instead, put its `MONGO_URI` in `backend/.env` and run `npm --prefix backend run dev:real` plus the frontend dev server. **Never commit real credentials.**

## Build plan

- [x] Stage 1 – Project setup and folder structure
- [x] Stage 2 – Frontend design and public website
- [x] Stage 3 – Backend setup and MongoDB connection
- [x] Stage 4 – Registration, login and authentication
- [x] Stage 5 – User roles and dashboards
- [x] Stage 6 – M&A deal management features
- [x] Stage 7 – Documents, NDAs, meetings, tasks and messages
- [ ] Stage 8 – Deployment preparation and final testing

## Safety notes

- Secrets (JWT secret, database password) live **only** in `backend/.env`, never in frontend code.
- The frontend only knows the public API URL (`NEXT_PUBLIC_API_URL`).
- Uploaded business documents are stored on the backend and protected by authentication.
