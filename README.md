# StudyMate

StudyMate is a study planning and academic notes platform for university students. Students plan study sessions, organise subjects, keep course notes, and track their study progress in one place.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth + Postgres) · Vercel

## Features

- **Landing page** with product overview and preview
- **Authentication**: sign up, log in, forgot / reset password (Supabase Auth), with form validation and password visibility toggle
- **Dashboard**: personalised welcome, summary cards (sessions, completed, notes, study hours), upcoming sessions, recent notes, weekly activity chart, weekly goal progress, and a getting-started checklist for new students
- **Study Planner**: list and week calendar views, search, filters (subject, status, priority), create / edit / delete sessions, one-click complete
- **My Notes**: search, subject filter chips, note cards with previews and last-updated dates, note editor, delete confirmation
- **Subjects**: colour-coded subject cards with course codes, session/note counts, hours and completion progress
- **Profile & Settings**: edit profile, weekly study goal, log out
- Loading skeletons, empty states, error states with retry, success toasts, and confirmation before destructive actions
- Responsive layouts: sidebar on desktop/tablet, bottom navigation on mobile
- Accessible: visible labels, keyboard focus states, focus-trapped dialogs, screen-reader text for charts

## User journey

Landing → Sign up → Dashboard → Create subject → Schedule study session → Create note → Track progress → Log out

## Database

All data lives in Supabase Postgres. See [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

| Table | Purpose |
| --- | --- |
| `profiles` | Student information (name, university, course, year, weekly goal). Created automatically on sign-up. |
| `subjects` | Courses with name, code and colour |
| `study_sessions` | Planned sessions: title, subject, start time, duration, priority, status |
| `notes` | Notes: title, subject, content, last updated |

Row Level Security is enabled on every table, so each student can only read and change their own rows.

## Running locally

1. Create a Supabase project, open **SQL Editor**, and run `supabase/migrations/0001_init.sql`.
2. Copy `.env.example` to `.env.local` and fill in your project URL and publishable key (Project Settings → API).
3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open http://localhost:3000.

## Deploying to Vercel

1. Import the GitHub repository in Vercel.
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Deploy, then in Supabase → **Authentication → URL Configuration** set the **Site URL** to your Vercel URL and add `https://<your-app>.vercel.app/**` to **Redirect URLs** so email links work.

## Project structure

```
src/
  app/
    page.tsx              Landing page
    (auth)/               Sign up, log in, forgot & reset password
    (app)/                Dashboard, planner, notes, subjects, settings (signed-in only)
    auth/callback/        Handles Supabase email links
  components/
    ui/                   Design system: Button, fields, Dialog, Toast, Badge, Card, EmptyState…
    app/                  App shell, data provider, shared forms
  lib/                    Supabase clients, formatting, validation, colours
  middleware.ts           Session refresh + route protection
supabase/migrations/      Database schema and security policies
```
