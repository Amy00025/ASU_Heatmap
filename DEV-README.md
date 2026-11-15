# Developer guide — ASU Sun Devil Crowd Tracker

Setup notes for contributors. The public project overview stays in [README.md](./README.md) (shown on the GitHub repo home page).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing page |
| `/login` | Log in / sign up (ASU email required) |
| `/home` | Live dashboard (requires session) |
| `/profile` | Name, role, email + change password |

Landing CTA → `/login` → `/home` after a successful session.

## First-time setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local: set AUTH_SECRET (openssl rand -base64 32)
# Optional: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
npm run db:init          # creates data/auth.db schema (safe to re-run)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with an `@asu.edu` email, then use the live dashboard.

The Maps API key is optional. For live scraped data, run the FastAPI server in `backend/` (default `http://127.0.0.1:8000`).

`better-sqlite3` needs its native build allowed on install (see `allowScripts` in `package.json`).

## Auth (local SQLite)

Auth is **local-only**. There is no cloud user database.

### What lives where

| Shared in git | Stays on each developer’s machine |
|---------------|-----------------------------------|
| Schema + API routes + UI | `data/auth.db` (user rows + password hashes) |
| `.env.local.example` | `.env.local` with real `AUTH_SECRET` |

- Passwords are stored as **bcrypt hashes**, never plaintext.
- Sessions use an **httpOnly** cookie signed with `AUTH_SECRET` (`jose` JWT).
- Signup rules: email must end with `@asu.edu`; password ≥ 6 characters; collect **name** and **role**.

### Useful scripts

```bash
npm run db:init    # ensure data/auth.db + users table exist
npm run db:reset   # delete local auth.db (wipes accounts on THIS machine only)
```

### Do not commit / push

- `data/*.db` and `data/*.db-*` (already gitignored)
- `.env.local` / any real `AUTH_SECRET`
- `node_modules/`, `.next/`

Each teammate gets their **own** local accounts. Sharing a `.db` file is optional and usually unnecessary.

### Deploy note

This SQLite setup is intended for **local / self-hosted** `next start`. Ephemeral serverless hosts (e.g. Vercel) are a poor fit for a file-backed DB without a different storage strategy.

## How auth fits the stack

- **Frontend:** Next.js dashboard → `/api/crowd-data`
- **Auth:** Next.js API routes → local SQLite (`data/auth.db`)
- **Backend (optional):** FastAPI + Redis when available
- **Offline:** mock crowd data without the Python server or a Maps key

## Dev tech extras

Sonner (toasts) · better-sqlite3 · bcryptjs · jose (session tokens)
