# 🔱 ASU Sun Devil Crowd Tracker

Real-time occupancy for ASU Tempe — SDFC, Hayden, MU, dining halls, and more — so students can see how busy campus is before they go.

*“By the student, for the student.”*

## Why it exists

- Gym, library, and dining lines feel packed with no easy way to check ahead
- Popular Times live in separate Google Maps pages per venue
- Students need one campus view: busiest spots, quietest spaces, and when to go

## Features

- Interactive Tempe heatmap (Google Maps with a key; Leaflet/CartoDB fallback without one)
- Live occupancy % and crowd level (Low → Very Busy)
- KPI strip: average crowd, busiest venue, quietest space, estimated visitors
- Filter, search, and sort by Fitness, Study, Dining, or Union
- Venue cards with capacity, dwell time, and directions
- Hourly busyness chart for a selected spot
- Campus flow & dwell tips (e.g. SDFC mornings, MU lunch rush)
- Auto-refresh (~12s) with live / cache / mock status

## How it works

- **Frontend:** Next.js dashboard → `/api/crowd-data`
- **Backend (optional):** FastAPI scrapes public popular-times style data; Redis cache when available
- **Offline:** mock data so the UI still works without the Python server or a Maps key

## Tracked venues

SDFC · Hayden Library · Memorial Union · Tooker Dining · Barrett Dining

## Quick start

```bash
npm install
cp .env.local.example .env.local   # optional: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Maps API key is optional. For live scraped data, run the FastAPI server in `backend/` (default `http://127.0.0.1:8000`).

## Tech stack

Next.js 14 · React · Tailwind · Recharts · Google Maps / Leaflet · FastAPI · Redis (optional)

## Credits

Made by **Team Delta Y** · Arizona State University, Tempe

Uses anonymized, public popular-times style signals — not official ASU occupancy counts. Not affiliated with Arizona State University.
