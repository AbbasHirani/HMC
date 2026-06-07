Neon schema and setup
=====================

This folder contains the SQL schema for the HMC project to run on Neon (Postgres).

Files:
- `neon_schema.sql` — schema for `categories`, `subcategories` and `products`.

How to run
----------

Option A — Neon Console (recommended):
1. Open your Neon project dashboard.
2. Open the SQL editor and paste the contents of `neon_schema.sql`.
3. Run the script.

Option B — psql (local):
1. Install `psql` (Postgres client) if not already installed.
2. Run:

```bash
psql "<YOUR_DATABASE_URL>" -f sql/neon_schema.sql
```

Replace `<YOUR_DATABASE_URL>` with your Neon connection string (the `DATABASE_URL` in `.env.local`).

After running the schema, your API endpoints will be able to read/write categories, subcategories and products.
