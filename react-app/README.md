# CineBook (React)

A React rebuild of the CineBook movie ticket booking app: browse movies, pick a
showtime, select seats on an interactive map, and book tickets.

## Stack

- **Frontend:** React 19 + Vite + React Router, plain CSS (no UI framework).
- **Backend:** the Express API in [`../server`](../server) — this app expects
  it running on `http://localhost:4000`. The Vite dev server proxies `/api/*`
  requests to it (see `vite.config.js`).

## Getting started

From the repo root, in two terminals:

```bash
# Terminal 1 — API server
cd server
npm install
npm start

# Terminal 2 — React app
cd react-app
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

The production build is a static SPA — serve `dist/` behind anything that
falls back to `index.html` for unknown routes, with the API reachable at
`/api` (either reverse-proxied or via a full URL if you adjust `src/api/client.js`).

## Project structure

```
src/
  api/client.js       fetch wrapper for the API
  pages/               one component per screen (list, detail, seats, confirmation)
  App.jsx              route definitions
  main.jsx             app entry point
```
