# SmartClinic

A digital clinic system with a public website, appointment booking, patient portal, and admin/doctor dashboard. Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Vercel Postgres**, and **NextAuth**.

## Features

- **Public:** Homepage, Services, Doctors, Book Appointment, Login, Signup
- **Patient:** Dashboard, Upcoming appointments, History, Profile, Cancel/reschedule
- **Admin/Doctor:** Dashboard, Appointments management, Doctors schedule, Queue management

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/cpanchal112233-svg/Smart-clinic.git
   cd Smart-clinic
   npm install
   ```

2. **Database (Vercel Postgres or Neon)**

   - **Vercel:** In your Vercel project, go to Storage → Create Database → Postgres. Connect it to your project so `POSTGRES_URL` is set.
   - **Neon:** Create a project at [neon.tech](https://neon.tech), create a database, and copy the connection string.
   - Run the schema: in the SQL editor (Vercel Postgres or Neon console), run the contents of `lib/postgres-schema.sql`.

3. **Environment**

   Copy `env.template` to `.env.local` and set:

   ```env
   POSTGRES_URL=postgres://...    # From Vercel Postgres or Neon
   NEXTAUTH_SECRET=...            # Generate with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open **http://localhost:3000** in your browser (or the port shown in the terminal, e.g. 3001 if 3000 is in use).

## Creating an admin user

New signups get role `patient` by default. To make a user an admin:

1. Sign up a user (e.g. `admin@clinic.com`).
2. In your database (Vercel Postgres or Neon), open the `profiles` table and set that user’s `role` to `admin`.

You can then sign in and use **Admin** in the header.

## Creating doctors

1. Create a user (or use an existing one) and set their `role` to `doctor` in `profiles`.
2. In `doctors`, insert a row with that user’s profile `id` as `profile_id`, plus `specialty` and optional `bio`.
3. In `doctor_schedules`, add rows for each day they work: `doctor_id`, `day_of_week` (0–6, Sunday–Saturday), `start_time`, `end_time` (e.g. `09:00:00`, `17:00:00`).

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend / data:** Vercel Postgres (or any Postgres), NextAuth (Credentials)

## Project structure

```
app/
  page.tsx
  services/page.tsx
  doctors/page.tsx
  book/page.tsx
  book/confirmation/page.tsx
  login/page.tsx
  login/success/page.tsx
  signup/page.tsx
  patient/
  admin/
  api/
    auth/[...nextauth]/
    auth/signup/
    profile/
    appointments/
    slots/
    admin/queue/
lib/
  db.ts
  auth.ts
  postgres-schema.sql
  utils.ts
types/
```

## MVP checklist

- [x] Patient can sign up and log in
- [x] Patient can book an appointment (service → doctor → date → time → confirm)
- [x] Appointment is saved in the database
- [x] Patient sees appointments in dashboard and history
- [x] Admin sees appointments and can update status
- [x] Queue page: check in, add to queue, mark in progress / completed
- [x] Homepage and core pages in place
