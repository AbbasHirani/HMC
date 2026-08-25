Neon schema and setup
=====================

SQL schema for the HMC project, running on Neon (Postgres).

Files
-----

- `neon_schema.sql` — the authoritative schema: all eight tables, their
  later-added columns, and the indexes. Every statement is `IF NOT EXISTS`,
  so it is safe to re-run against a live database.

Tables: `categories`, `subcategories`, `brands`, `products`, `use_cases`,
`product_use_cases`, `repair_jobs`, `enquiries`.

Two ways to apply it
--------------------

**1. Neon console / psql** — for a new database, or to pick up new indexes.

```bash
psql "<YOUR_DATABASE_URL>" -f sql/neon_schema.sql
```

Or paste the file into the Neon SQL editor and run it. `<YOUR_DATABASE_URL>`
is the `DATABASE_URL` from `.env.local`.

**2. The admin "Run migration" button** — `POST /api/admin/migrate`, for when
you have no database console to hand. It applies the same tables and columns
at runtime, and is admin-authenticated.

Keeping the two in step
-----------------------

`neon_schema.sql` and `src/app/api/admin/migrate/route.ts` describe the same
schema and must be updated together when you add a table or column. They are
not identical in scope:

- The migrate route creates tables and columns only. It does **not** create
  the indexes — those live only in this file, so a database set up purely
  through the button will be missing them.
- Columns added after a table was first created must be written as
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, not folded into the
  `CREATE TABLE`. The `CREATE TABLE IF NOT EXISTS` is a no-op on any database
  that already has the table, so a column added inside it silently never
  appears on existing databases. This is why `products.brand/seo/videos`,
  `categories.seo`, `subcategories.seo` and `brands.description/seo` are all
  separate `ALTER` statements.
