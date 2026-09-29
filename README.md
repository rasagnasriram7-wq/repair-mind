# REPAIR-MIND
### AI-Powered Field Technician Memory Agent for Recurring Equipment Failures

**REPAIR-MIND** is an enterprise AI maintenance assistant and institutional memory engine for industrial field technicians. It stores historical equipment failures, symptoms, diagnoses, root causes, repair actions, replaced components, and outcomes.

When a technician reports a problem or snaps a photo of a damaged component, the agent searches persistent maintenance memory via **pgvector** semantic similarity and structured queries. After completing a repair, the technician enters the verified root cause, and Gemini synthesizes a concise **Hindsight Reflection Record**, permanently enriching the organizational memory bank for future troubleshooting.

---

## The Persistent Memory Loop

```
New Problem Statement / Component Photo
               │
               ▼
       AI Understands Symptoms
               │
               ▼
  Search Persistent Memory (pgvector + Structured)
               │
               ▼
     Retrieve Historical Cases & Hindsight
               │
               ▼
 Grounded AI Diagnostic & Suggested Safety Checks
               │
               ▼
 Technician Performs Inspection & Verification
               │
               ▼
    Records Actual Diagnosis & Verified Fix
               │
               ▼
 Gemini Synthesizes Hindsight Reflection
               │
               ▼
  Stored in Vector Database & Equipment Bank
               │
               ▼
   Future Troubleshooting Recalls It!
```

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js Serverless API routes, TypeScript
- **Database**: Supabase PostgreSQL with `pgvector` extension
- **Authentication**: Supabase Auth (with instant one-click demo accounts for testing)
- **AI Reasoning & Multimodal Vision**: Google Gemini API (`@google/generative-ai` & `@google/genai`)
- **Embeddings**: Gemini `text-embedding-004` (768-dimensional) with local fallback
- **Deployment**: Vercel ready

---

## Application Pages

- `/` — Product landing page with hero, workflow diagram, feature breakdown, and B2B pricing model.
- `/login` & `/signup` — Field technician & maintenance manager authentication with 1-click demo personas.
- `/dashboard` — Fleet overview, 5 core maintenance metrics, recurring failure alerts, and B2B SaaS ROI savings.
- `/assistant` — The primary AI Field Technician Memory Agent with grounded chat, multimodal image analysis, and similar case cards.
- `/equipment` — Equipment fleet management (search, filters, add, edit, delete, and memory case counts).
- `/equipment/[id]` — Machine details, chronological maintenance history timeline, recurring failure detection, and hindsight lessons.
- `/maintenance` — Searchable log of historical maintenance cases with status badges.
- `/maintenance/new` — Case reporting form with pgvector embedding indexing and post-repair Hindsight Learning Loop.
- `/maintenance/[id]` — Complete case breakdown and embedding synchronization.
- `/knowledge` — Searchable historical memory bank with quick query presets.
- `/documents` — PDF, TXT, and CSV technical manual upload and text extraction.
- `/settings` — System health check, live Gemini API test, database seeding, and B2B subscription metrics.

---

## Setup & Deployment Guide

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL**, **Anon Key**, and **Service Role Key** from *Project Settings > API*.

### 2. Enable pgvector & Run Database Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the contents of `supabase/migrations/01_schema.sql` and run it. This creates:
   - `vector` & `uuid-ossp` extensions
   - Tables: `profiles`, `equipment`, `maintenance_cases`, `documents`, `maintenance_embeddings`, `hindsight_memories`
   - Semantic similarity RPC: `match_maintenance_cases(query_embedding, match_threshold, match_count, filter_equipment_id)`
   - Row Level Security (RLS) policies
3. (Optional) Run `supabase/seed.sql` to populate demonstration equipment (P-204, M-102, C-301, G-110) and historical repair memories.

### 3. Obtain Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/) and create an API Key.
2. The default model is configured as `gemini-1.5-flash` (or `gemini-2.5-flash`).

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Set the values in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
```

*(Note: If environment variables are omitted, REPAIR-MIND gracefully switches to an in-memory/browser-synced store pre-loaded with the exact seed data, allowing immediate zero-friction evaluation!)*

### 5. Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm start
```

### 7. Deploy to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
4. Click **Deploy**.

---

## Field Verification Scenario

To test the complete end-to-end memory loop:

1. **Sign In**: Click **Sign In** and select **Field Tech** (Dave Kowalski).
2. **Review Equipment**: Open **Equipment Fleet** and verify **P-204 (Centrifugal Slurry Pump)**.
3. **Record a Repair Case**:
   - Go to **Report Case** (or click *Auto-fill Verification Scenario*).
   - Equipment: `P-204`
   - Symptoms: `Excessive vibration and abnormal bearing noise`
   - Diagnosis: `Bearing damage`
   - Repair: `Bearing replacement`
   - Outcome: `Successfully resolved`
   - Click **Save Case to Memory**.
4. **Hindsight Learning**:
   - The Hindsight modal prompts for actual root cause: `Thermal expansion coupling misalignment`.
   - Click **Store Hindsight Memory**.
   - Gemini synthesizes the lesson learned into persistent memory.
5. **Ask REPAIR-MIND**:
   - Navigate to **AI Technician**.
   - Query: *"Pump P-204 is showing excessive vibration and abnormal bearing noise. What happened in the past?"*
   - Verify that REPAIR-MIND retrieves the historical case, outputs similarity ratings, highlights the hindsight lesson, and provides grounded suggested checks with safety disclaimers.
