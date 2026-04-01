# ⛳ Fairway Forward – Digital Heroes Selection Assignment

Welcome to the **Fairway Forward** repository. This full-stack application was built meticulously according to the **Golf Charity Subscription Platform PRD** provided by the Digital Heroes selection process.

## 🚀 Live Demo / Deployment
* **Vercel Hosted URL:** *(Add your deployed vercel link here)*

## 📖 PRD Feature Completion Sheet
This repository fulfills **100% of the Phase 1-4 deliverables** requested inside the PRD.

### 1. Subscription & Security Engine
* **Integration:** Stripe subscription check required to access any dashboard components. `requireActiveSubscription()` guards are attached via Supabase SSR logic.
* **Status Syncing:** Next.js Server API Webhooks listen to Stripe events to set profiles to `active`, `canceled`, or `lapsed`.

### 2. Score Management (The "5-Score Limit")
* **Strict Constraints:** Using Supabase Postgres schema rules and Next.js Server Actions, the database aggressively limits users to exactly **5 concurrent scores**.
* **Automatic Rolling Logic:** The `addScore` action seamlessly deletes the oldest submitted entry chronologically upon any new addition, satisfying the rolling constraint exactly.

### 3. Charity & Impact Rules
* **Database Scaling:** The `users_charity_preferences` actively tracks percentages (enforcing the minimum 10% bounds natively via Zod Server Actions).
* **Live Revalidation:** Adjusting your split instantly updates the UI using `revalidatePath`.

### 4. Admin Control Panel
* Secured layout `(/admin)` heavily guarded by `requireAdmin()` referencing the `profiles.role` table.
* **User Management:** See complete tables merging internal UUID auths and Stripe active plans.
* **Draw Logic:** Configure PRD-demanded "Random" vs "Algorithmic" monthly executions.
* **Charities:** CRUD system to update non-profits in the directory.

### 5. Algorithmic Monthly Draws (Phase 3)
* Contains powerful simulation capabilities merging global active subscriber counts to automatically generate a cash "Prize Pool".
* "Publishing" instantly locks snapshots for thousands of users simultaneously mapping 3, 4, or 5 matches, automatically executing 40%/35%/25% split logic arrays inside `draw_entries`.

### 6. High-End Emotion UI/UX 
* Strictly avoiding golf clichés, utilizing glassmorphic aesthetics, fluid orbital CSS scaling backgrounds, and `framer-motion` staggered spring animations. 

---

## 💻 Running Locally

### 1. Environment Configuration
Create a `.env.local` directly inside the root mimicking `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_db_instance
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role # needed for server actions & webhooks

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Database Generation
In your Supabase SQL editor window, completely paste and execute the provided `supabase/schema.sql` file. This establishes every RLS policy, table structure, and automatic function.

### 3. Server Initialization
```bash
npm install
npm run build
npm run start
```

## Setup Admin Access
Register locally. Then directly edit your row in the Supabase `profiles` table to change your role from `subscriber` to `admin`. Navigate to `/admin` to begin exploring the backend systems!
