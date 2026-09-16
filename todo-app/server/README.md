# Todo API (Express + MySQL)

REST API for the Todo app. Stores todos in a MySQL database via `mysql2`.

## Setup

**1. Get a MySQL server running.** Easiest with Docker:

```bash
docker compose up -d
```

This starts MySQL 8.4 on `localhost:3306` with an empty root password and a
`todo_app` database already created (see `docker-compose.yml`).

If you already have MySQL installed locally instead, just create the database:

```sql
CREATE DATABASE todo_app;
```

**2. Configure connection details.** Copy `.env.example` to `.env` and adjust
if your MySQL isn't on the defaults:

```bash
cp .env.example .env
```

**3. Install dependencies and start the server:**

```bash
npm install
npm start
```

The `todos` table is created automatically on startup if it doesn't exist.
The API listens on `http://localhost:4001` (override with `PORT`).

For auto-reload during development: `npm run dev`.

## API

| Method | Path             | Description                          |
|--------|------------------|----------------------------------------|
| GET    | `/api/todos`     | List all todos (newest first)          |
| POST   | `/api/todos`     | Create a todo `{ title }`              |
| PATCH  | `/api/todos/:id` | Update a todo `{ title?, done? }`      |
| DELETE | `/api/todos/:id` | Delete a todo                          |

## Tests

```bash
npm test
```

Tests run against the MySQL instance configured in `.env` / environment
variables, wiping and reseeding the `todos` table between each test. If no
MySQL connection is available, the tests are skipped rather than failing.
