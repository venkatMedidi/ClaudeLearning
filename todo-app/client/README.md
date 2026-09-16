# Todo App (React)

A simple React frontend for the Todo app: add, complete, rename, delete, and
filter todos. Talks to the Express + MySQL API in [`../server`](../server).

## Getting started

Make sure the API is running first (see `../server/README.md`), then:

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). The dev server
proxies `/api/*` requests to `http://localhost:4001` (see `vite.config.js`).

## Build

```bash
npm run build
npm run preview
```
