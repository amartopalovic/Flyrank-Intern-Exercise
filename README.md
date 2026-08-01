# Flyrank Intern Exercise – Task API

A small Express CRUD API for managing tasks. Storage has evolved twice during this exercise:

1. In-memory array (gone)
2. SQLite file (`tasks.db`) — kept for reference, see below
3. **Postgres running in Docker** — the current, active storage layer

The whole stack (app + database) now starts with a single command and survives both app and container restarts.

## How to run

```bash
docker compose up --build
```

That's it. This builds the app image, starts Postgres with a persistent volume, waits for Postgres to be healthy, then starts the app. The API is available at `http://localhost:3000`.

On first run against a fresh volume, [init.sql](init.sql) auto-creates the `tasks` table (mounted into Postgres's `/docker-entrypoint-initdb.d/`), and the app seeds three example tasks if the table is empty.

## Why Postgres in Docker

SQLite was great for zero-setup local dev, but a real backend eventually needs a database that runs as its own service — the kind every later stage of this course (jobs, caching, RAG) assumes is already there. Docker means Postgres needs no local install: `docker compose up` gives everyone the exact same database, version-pinned (`postgres:16`), torn down and rebuilt identically on any machine.

## Configuration — `.env`

The connection string lives in `.env` (gitignored — never commit real credentials, even local-dev ones, as a matter of habit). A committed [.env.example](.env.example) documents the variable shape for anyone cloning the repo:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/tasks
```

Note: this is only used when running the app *outside* Docker (e.g. `node server.js` directly, connecting to `localhost:5432`). Inside `docker-compose.yml`, the app container talks to Postgres over the compose network by service name instead (`DATABASE_URL=postgres://postgres:postgres@db:5432/tasks`), since `localhost` inside a container refers to the container itself, not the host machine.

## Architecture: the repository swap

`server.js` never talks to SQL directly — it calls a `taskRepository` module with five functions: `getAll`, `getById`, `create`, `update`, `remove`. Swapping storage backends meant only replacing what's *behind* that interface:

- `taskRepository.js` / `db.js` — the active Postgres implementation, using `pg`.
- `taskRepository.sqlite.js` / `db.sqlite.js` — the original SQLite implementation, kept for reference (not used at runtime, not installed in the Docker image).

**Honest caveat:** `better-sqlite3` is synchronous; `pg` is asynchronous. Swapping the driver meant `taskRepository`'s functions became `async`, which required adding `await` to the five route handlers in `server.js` that call them. No validation logic, status codes, or route structure changed — only the mechanical `async`/`await` keywords needed by the new driver. That's the one place the "only one file changes" claim needed an asterisk, and it's the honest reason for it.

## API endpoints

| Method | Route          | Description                    |
|--------|----------------|---------------------------------|
| GET    | `/tasks`       | List all tasks                  |
| GET    | `/tasks/:id`   | Get one task (404 if missing)   |
| POST   | `/tasks`       | Create a task (400 if no title) |
| PUT    | `/tasks/:id`   | Update a task (404 if missing)  |
| DELETE | `/tasks/:id`   | Delete a task (404 if missing)  |

## Persistence proof

Checked by:

1. Starting the stack with `docker compose up -d` and confirming the 3 seeded tasks via `GET /tasks`.
2. Creating two new tasks through the API (`POST /tasks`).
3. Running `docker compose down` — this **fully removes both containers** (app and db), not just stops them.
4. Running `docker compose up -d` again — brand-new containers are created from scratch.
5. Calling `GET /tasks` again: all 5 tasks (3 seeded + 2 created) were still present.

This proves the data lives in the named volume (`pgdata`), not in the container itself — the containers are disposable, the volume is not.

## Exploring the database manually

```bash
docker exec -it flyrank-intern-db-1 psql -U postgres -d tasks
```

Example query:

```sql
SELECT * FROM tasks WHERE done = true;
```

Changes made this way show up immediately through the API — there's no separate cache to go stale.

### Screenshot

<!-- TODO: paste a screenshot here of a query against the Postgres database, e.g.:
     ![tasks query result](screenshot.png) -->

## Appendix: original SQLite version

Earlier in this exercise, the app used SQLite (`tasks.db`, gitignored) via `better-sqlite3`. That implementation is preserved in `db.sqlite.js` and `taskRepository.sqlite.js` — not wired into `server.js` anymore, but a useful before/after reference for what the storage swap actually touched. To explore that file (if you still have it locally): `sqlite3 tasks.db`, see [queries.sql](queries.sql) for example queries used during that stage.
