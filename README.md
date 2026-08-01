# Task API (SQLite edition)

A small Express CRUD API for managing tasks, backed by a SQLite database instead of an in-memory array. Restarting the server no longer wipes your data.

## Why SQLite

SQLite needs no separate database server to install or run — the whole database lives in a single file (`tasks.db`) right next to the code. That makes it perfect for a small project like this: zero setup, zero config, and the data survives restarts. `better-sqlite3` gives synchronous, simple SQL access from Node without any async ceremony.

## Where the database file is stored

`tasks.db` in the project root, created automatically the first time the server runs (see [db.js](db.js)). It's excluded from git via `.gitignore` — each clone generates and seeds its own fresh copy.

## How to start the project

```bash
npm install
node server.js
```

The server starts on `http://localhost:3000`. On first run it creates `tasks.db`, creates the `tasks` table, and seeds three example tasks. Subsequent restarts reuse the existing data.

## API endpoints

| Method | Route          | Description                    |
|--------|----------------|---------------------------------|
| GET    | `/tasks`       | List all tasks                  |
| GET    | `/tasks/:id`   | Get one task (404 if missing)   |
| POST   | `/tasks`       | Create a task (400 if no title) |
| PUT    | `/tasks/:id`   | Update a task (404 if missing)  |
| DELETE | `/tasks/:id`   | Delete a task (404 if missing)  |

## Exploring the database manually

Open the database with any SQLite viewer, e.g. the `sqlite3` CLI:

```bash
sqlite3 tasks.db
```

Example query used during Stage 4 (see [queries.sql](queries.sql) for the full set):

```sql
SELECT * FROM tasks WHERE done = 1;
```

Changes made this way show up immediately through the API (`GET /tasks`) — there's no separate in-memory cache to go stale.

### Screenshot

<!-- TODO: paste a screenshot here of `sqlite3 tasks.db` (or DB Browser for SQLite)
     showing the tasks table / a query result, e.g.:
     ![tasks.db query result](screenshot.png) -->
