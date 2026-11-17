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

In `backend/.env`, set `JWT_SECRET` to a long random string. The `MONGO_URI` value is only needed when using a real MongoDB server.

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

## Build plan

- [x] Stage 1 – Project setup and folder structure
- [x] Stage 2 – Frontend design and public website
- [x] Stage 3 – Backend setup and MongoDB connection
- [ ] Stage 4 – Registration, login and authentication
- [ ] Stage 5 – User roles and dashboards
- [ ] Stage 6 – M&A deal management features
- [ ] Stage 7 – Document management and other functionality
- [ ] Stage 8 – Testing, fixes and deployment preparation

## Safety notes

- Secrets (JWT secret, database password) live **only** in `backend/.env`, never in frontend code.
- The frontend only knows the public API URL (`NEXT_PUBLIC_API_URL`).
- Uploaded business documents are stored on the backend and protected by authentication.
