# Mandi Connect — Vercel & Supabase Deployment Guide

This guide walks you through deploying the **Mandi Connect** application to **Vercel** (Frontend / Office Web App) and **Supabase** (PostgreSQL Database & Auth).

---

## Architecture Overview

- **Frontend (`apps/office`):** Next.js 16 (App Router) deployed on **Vercel**.
- **Database (`packages/db` & `supabase/`):** PostgreSQL database hosted on **Supabase** with pooled connections.
- **Backend API (`apps/backend`):** Hardened Express REST API (deployable to Railway, Render, Fly.io, or Vercel Serverless).

---

## Part 1: Supabase Database Setup

### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project**, name it (e.g. `mandi-connect`), choose an organization, choose your nearest region, and set a strong database password.

### Step 1.2: Retrieve Connection Strings & API Keys
1. In the Supabase Dashboard, navigate to **Project Settings** -> **Database**:
   - Scroll down to **Connection string**.
   - Select the **URI** tab.
   - **Transaction Pooler (Port 6543):**
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
     *(This is your `DATABASE_URL`)*
   - **Session / Direct Connection (Port 5432):**
     ```text
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
     *(This is your `DIRECT_URL`)*

2. Navigate to **Project Settings** -> **API**:
   - Copy **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - Copy **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy **service_role key** (`SUPABASE_SERVICE_ROLE_KEY` — *keep this secret!*)

### Step 1.3: Apply Database Schema to Supabase
You can apply the schema using either of the following two methods:

#### Method A: Direct SQL Execution in Supabase Dashboard (Fastest)
1. In your Supabase Dashboard, click on the **SQL Editor** tab on the left sidebar.
2. Click **+ New query**.
3. Open the file [`supabase/schema.sql`](./supabase/schema.sql) in this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run**.
5. All tables, enums, relationships, foreign keys, and indexes will be created instantly.

#### Method B: Automated CLI Push via Prisma
1. In your local repository, create a `.env` file at root or in `packages/db/.env`:
   ```bash
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```
2. Run:
   ```bash
   pnpm db:push
   ```
   or
   ```bash
   pnpm db:generate
   ```

---

## Part 2: Vercel Frontend Deployment

### Step 2.1: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import the repository: `https://github.com/Athithyan07/Mandi.git`.

### Step 2.2: Configure Project Settings
- **Framework Preset:** `Next.js`
- **Root Directory:** Click "Edit" and select `apps/office`
  *(Note: If you keep root `./`, Vercel uses the configured root `vercel.json` automatically)*
- **Build Command:** `pnpm run build` (or `pnpm run build:frontend`)
- **Install Command:** `pnpm install`

### Step 2.3: Add Environment Variables in Vercel
In the **Environment Variables** section in Vercel, add:

| Key | Value / Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `DATABASE_URL` | Supabase Transaction Pooler URL (port 6543) |
| `DIRECT_URL` | Supabase Direct Session URL (port 5432) |
| `NEXT_PUBLIC_API_URL` | URL of your deployed backend or API proxy |

### Step 2.4: Deploy
Click **Deploy**. Vercel will install dependencies using `pnpm`, run Turbopack / Next.js build, and provide your live production URL (e.g. `https://mandi-office.vercel.app`).

---

## Part 3: Backend API Deployment (Optional / Dedicated Service)

The Express backend (`apps/backend`) can be deployed to any Node.js hosting platform:
- **Render / Railway / Fly.io:**
  - Build Command: `pnpm --filter @mandi/backend run build`
  - Start Command: `node apps/backend/dist/server.js`
  - Environment Variables:
    - `PORT=5000`
    - `NODE_ENV=production`
    - `DATABASE_URL`
    - `DIRECT_URL`
    - `CORS_ORIGIN=https://mandi-office.vercel.app` (your Vercel URL)
    - `JWT_SECRET`
