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

You need **Node.js 20.9 or newer** and **MongoDB** installed locally (or a free MongoDB Atlas cluster).

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

In `backend/.env`, set `JWT_SECRET` to a long random string and set `MONGO_URI` to your MongoDB connection string.

### 3. Run both apps

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser. The API runs at http://localhost:5000/api.

## Build plan

- [x] Stage 1 – Project setup and folder structure
- [ ] Stage 2 – Frontend design and public website
- [ ] Stage 3 – Backend setup and MongoDB connection
- [ ] Stage 4 – Registration, login and authentication
- [ ] Stage 5 – User roles and dashboards
- [ ] Stage 6 – M&A deal management features
- [ ] Stage 7 – Document management and other functionality
- [ ] Stage 8 – Testing, fixes and deployment preparation

## Safety notes

- Secrets (JWT secret, database password) live **only** in `backend/.env`, never in frontend code.
- The frontend only knows the public API URL (`NEXT_PUBLIC_API_URL`).
- Uploaded business documents are stored on the backend and protected by authentication.
