# Practical 4 — Run Guide

Step-by-step commands to bring this project up. The code is already in place (schema, controllers, middleware, seed). You just need to set up the database, run the migration, seed it, and test.

Open a terminal in `C:\Users\DELL\jamyang_WEB102_Practicals\Connecting TikTok to PostgreSQL\TikTok_Server` for every `npm` / `npx` step.

---

## Part 1 — Create the PostgreSQL database and user

Open a terminal and access psql as the postgres superuser. On Windows the easiest way is:

```powershell
psql -U postgres
```

(If `psql` isn't on your PATH, open the SQL Shell (psql) program that came with the PostgreSQL installer.)

Then run these four statements one at a time:

```sql
CREATE DATABASE tiktok_db;
CREATE USER tiktok_user WITH ENCRYPTED PASSWORD 'jamyangtupac';
GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;
\q
```

On Postgres 15+, the `public` schema needs an extra grant. Reconnect as postgres into the new database and run:

```powershell
psql -U postgres -d tiktok_db
```

```sql
GRANT ALL ON SCHEMA public TO tiktok_user;
ALTER SCHEMA public OWNER TO tiktok_user;
\q
```

---

## Part 2 — Confirm dependencies & .env

`node_modules` is already installed and `.env` is already pointing at `tiktok_user` with your password. If you ever need to reinstall:

```powershell
npm install
```

The `.env` now contains:

```
DATABASE_URL="postgresql://tiktok_user:jamyangtupac@localhost:5432/tiktok_db?schema=public"
JWT_SECRET=mySuperSecretKey_TikTokApp_2026_random_string_change_this
JWT_EXPIRE=30d
PORT=8000
```

---

## Part 3 — Run Prisma migrations

This creates the tables in your fresh `tiktok_db`:

```powershell
npx prisma migrate dev --name init
```

Prisma may say the migration history is already there. If it asks to reset the database, type `y` — your DB is empty anyway. After this, generate the client (usually automatic, but safe to run):

```powershell
npx prisma generate
```

Verify with Prisma Studio (optional but useful):

```powershell
npx prisma studio
```

You should see empty tables for users, videos, comments, video_likes, comment_likes, follows.

---

## Part 4 — Seed test data

```powershell
npm run seed
```

This will create:

- 10 users (`user1`..`user10`, all with password `password123`)
- 50 videos (5 per user)
- 200 comments
- 300 video likes (duplicates skipped)
- 150 comment likes (duplicates skipped)
- 40 follow relationships

---

## Part 5 — Start the server

```powershell
npm run dev
```

Server runs at http://localhost:8000.

---

## Part 6 — Test in Postman

### Register a new user (public)
- **POST** `http://localhost:8000/api/users/register`
- Body (JSON):
```json
{
  "username": "jamyang",
  "email": "jamyang@example.com",
  "password": "test1234"
}
```

### Login (public)
- **POST** `http://localhost:8000/api/users/login`
- Body (JSON):
```json
{
  "email": "user1@example.com",
  "password": "password123"
}
```
- Copy the `token` from the response.

### Create a video (protected)
- **POST** `http://localhost:8000/api/videos`
- Headers: `Authorization: Bearer <paste your token>`
- Body: form-data with a `video` file field and optional `caption` text field.

### Follow another user (protected)
- **POST** `http://localhost:8000/api/users/2/follow`
- Headers: `Authorization: Bearer <token>`

### Like a video (protected)
- **POST** `http://localhost:8000/api/videos/3/like`
- Headers: `Authorization: Bearer <token>`

### List all videos (public)
- **GET** `http://localhost:8000/api/videos`

---

## What's in the project (already done)

| Part | File | Status |
|---|---|---|
| Prisma schema (6 models) | `prisma/schema.prisma` | done |
| Migrations | `prisma/migrations/` | 3 migrations present |
| Prisma client instance | `src/lib/prisma.js` | done |
| Auth middleware (JWT) | `src/middleware/auth.js` | done |
| User controller (bcrypt + JWT + Prisma) | `src/controllers/userController.js` | done |
| Video controller (Prisma) | `src/controllers/videoController.js` | done |
| Comment controller (Prisma) | `src/controllers/commentController.js` | done |
| Routes + protect middleware | `src/routes/*.js` | done |
| Seed script (10/50/200/300/150/40) | `prisma/seed.js` | done |
| `seed` npm script | `package.json` | done |
| `.env` | `.env` | done |

---

## Troubleshooting

**`psql: command not found`**
Open the "SQL Shell (psql)" program from the Start menu (it ships with the Postgres installer), or add `C:\Program Files\PostgreSQL\<version>\bin` to your PATH.

**`Error: P1001: Can't reach database server`**
PostgreSQL service isn't running. On Windows: open Services → start "postgresql-x64-<version>". Or run `pg_ctl start` if it's on your PATH.

**`Authentication failed for user "tiktok_user"`**
Either the user wasn't created, or the password in `.env` doesn't match. Re-run the `CREATE USER` step or update the password in `.env`.

**Migration error: "permission denied for schema public"**
You're on Postgres 15+ and missed the second grant block. Run the `GRANT ALL ON SCHEMA public TO tiktok_user;` step above.

**`npm run seed` fails with "Unique constraint failed"**
Run it on a fresh database. If you've already seeded, the script deletes existing rows first — but if a migration is missing, recreate the DB and re-migrate.
