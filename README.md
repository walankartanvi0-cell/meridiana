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

Open a terminal in this folder.

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

The sidebar only links to pages that exist. Deal management, documents, NDAs, meetings, tasks and messages are clearly marked as later-stage features instead of appearing as broken links.

The main API groups used by the dashboards are:

- `/api/admin` – administrator-only user, buyer, seller and analytics endpoints
- `/api/account` – profile and password endpoints for the signed-in user
- `/api/notifications` – in-app notification endpoints

## Build plan

- [x] Stage 1 – Project setup and folder structure
- [x] Stage 2 – Frontend design and public website
- [x] Stage 3 – Backend setup and MongoDB connection
- [x] Stage 4 – Registration, login and authentication
- [x] Stage 5 – User roles and dashboards
- [ ] Stage 6 – M&A deal management features
- [ ] Stage 7 – Document management and other functionality
- [ ] Stage 8 – Testing, fixes and deployment preparation

## Safety notes

- Secrets (JWT secret, database password) live **only** in `backend/.env`, never in frontend code.
- The frontend only knows the public API URL (`NEXT_PUBLIC_API_URL`).
- Uploaded business documents are stored on the backend and protected by authentication.
