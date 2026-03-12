# SmartClinic – Vercel deployment guide

SmartClinic uses the **Neon serverless driver** (`@neondatabase/serverless`) and works with **DATABASE_URL** or **POSTGRES_URL**. You can use `vercel env pull .env.development.local` to pull env vars from Vercel.

If every button/link shows an error and signup fails, it’s almost always **missing or wrong environment variables** or **database not set up**. Follow these steps in order.

---

## Step 1: Add a Postgres database

### Option A: Vercel Postgres (recommended on Vercel)

1. Open your project on [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to the **Storage** tab.
3. Click **Create Database** → choose **Postgres**.
4. Create the database and **connect it to your SmartClinic project** when asked.
5. Vercel will add `POSTGRES_URL` (and related vars) to your project automatically.

### Option B: Neon

1. Go to [neon.tech](https://neon.tech) and create a project.
2. Create a database and copy the **connection string** (e.g. `postgres://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`).
3. You’ll add this as `POSTGRES_URL` in Step 2.

---

## Step 2: Run the database schema

Your app needs the tables (profiles, services, doctors, etc.) to exist.

1. **Vercel Postgres:** Project → **Storage** → your Postgres store → **Query** (or use the Vercel Postgres SQL tab).
2. **Neon:** Neon dashboard → **SQL Editor**.
3. Open the file **`lib/postgres-schema.sql`** in your repo and copy its **entire** contents.
4. Paste into the SQL editor and **run** it.

You should see success (tables created). If you get “already exists” that’s fine.

---

## Step 3: Set environment variables in Vercel

1. Vercel Dashboard → your **Smart-clinic** project.
2. Go to **Settings** → **Environment Variables**.
3. Add these for **Production** (and optionally Preview / Development):

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` or `POSTGRES_URL` | Your Postgres connection string | Neon: use the pooler URL (e.g. from Neon dashboard). Vercel: add as `DATABASE_URL` or `POSTGRES_URL`. Either name works. |
| `NEXTAUTH_SECRET` | A long random string | e.g. run `openssl rand -base64 32` locally and paste the result. |
| `NEXTAUTH_URL` | **Your live app URL** (optional on Vercel) | e.g. `https://smart-clinic-xyz.vercel.app` (no trailing slash). On Vercel, NextAuth can use `VERCEL_URL` automatically if you leave this unset. |

4. Save. **Redeploy** the project (Deployments → … on latest deployment → **Redeploy**), or push a small commit so Vercel redeploys. Env vars are applied on the next build/deploy.

---

## Step 4: Redeploy

After changing env vars you must redeploy:

- **Deployments** → open the latest deployment → **⋯** → **Redeploy** (with “Use existing Build Cache” unchecked if you want a clean build).

Or push a commit; that will trigger a new deployment with the new env.

---

## Checklist

- [ ] Postgres database created (Vercel Postgres or Neon).
- [ ] **`lib/postgres-schema.sql`** run in that database (all tables created).
- [ ] **`POSTGRES_URL`** set in Vercel (and matches the database you ran the schema on).
- [ ] **`NEXTAUTH_SECRET`** set (long random string).
- [ ] **`NEXTAUTH_URL`** set to your Vercel app URL (e.g. `https://your-app.vercel.app`).
- [ ] Project **redeployed** after setting/updating env vars.

---

## Why buttons/links “show error”

- **Links or pages that load data** (Home, Services, Doctors, Book, Dashboard, etc.) call the database. If `POSTGRES_URL` is missing or wrong, those requests fail and you see errors or 500s.
- **Sign up** uses the database to create a user. Same cause: missing/wrong `POSTGRES_URL` or tables not created.
- **Login** uses NextAuth; if `NEXTAUTH_SECRET` or `NEXTAUTH_URL` is wrong, auth can fail or redirect incorrectly.

Fixing the three env vars and the schema (Steps 1–4) should resolve “every button/link shows error” and “sign up shows error” on Vercel.
