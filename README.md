# 🔱 ASU Sun Devil Crowd Tracker

> **“By the student, For the student.”**

An interactive live crowd density, campus heatmap, and dwell time intelligence platform for **Arizona State University (Tempe Campus)**. Designed with a clean, Scandinavian minimalist aesthetic inspired by CountMatters.

---

## 👥 Project Team & Attribution
- **Team**: **Delta Y**
- **Author**: Anurag Singh
- **Institution**: Arizona State University (Tempe, AZ)

---

## 🚀 Features
- **Real-Time Heatmap**: Dual-engine map layer supporting Google Maps JS API (HeatmapLayer) and zero-key CartoDB Voyager tiles.
- **CountMatters-Inspired Dwell Intelligence**: Volume vs. dwell paradigm analyzing workout windows (SDFC), study zones (Hayden Library), and dining line turnaround (Memorial Union).
- **Interactive Analytics**: 4-tier differentiated occupancy chart (Bar & Area view) with popular time projections.
- **Live Scraper Backend**: FastAPI service streaming live Google Popular Times sensor estimates with Redis caching support.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Leaflet / Google Maps JS API.
- **Backend**: FastAPI, Uvicorn, Python 3.12, Redis.
