# Todo App

A simple full-stack example: **React UI → Express API → MySQL database**.

```
todo-app/
  client/   React (Vite) frontend
  server/   Express API backed by MySQL (via mysql2)
```

## Quick start

```bash
# 1. Start MySQL (via Docker) and the API
cd server
docker compose up -d
cp .env.example .env
npm install
npm start

# 2. In a second terminal, start the React app
cd client
npm install
npm run dev
```

Open http://localhost:5173.

See `server/README.md` and `client/README.md` for details on each piece.

## Features

- Add, complete/uncomplete, inline-rename (double-click a title), and delete todos.
- Filter by All / Active / Done.
- Data persists in MySQL — restarting the server keeps your todos.
