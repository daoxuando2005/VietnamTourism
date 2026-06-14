# Supabase Database & Auth Migration Guide

This guide describes how to set up the Supabase backend for the Vietnam Tourism Platform. The application has been migrated from mock storage to a live Supabase implementation utilizing repositories, Supabase Auth, Row-Level Security (RLS) policies, and automatic database triggers.

---

## Prerequisites

1. Create a free project on [Supabase](https://supabase.com).
2. Retrieve your project's **API URL** and **Anon Key** from the Supabase dashboard (**Project Settings > API**).

---

## Step 1: Initialize Database Tables & Seed Data

Navigate to the **SQL Editor** in your Supabase dashboard, paste the contents of [supabase/schema.sql](file:///d:/Projects/VietnamTourism/supabase/schema.sql) and click **Run**.

This SQL script will:
1. Create tables for `provinces`, `profiles`, `destinations`, `reviews`, `favorites`, and `feed_activities`.
2. Seed the database with all 63 provinces, 20 destinations, and mock profiles, reviews, and favorites.

---

## Step 2: Automatic Activity Tracking Triggers

The SQL schema contains automated PostgreSQL triggers that populate the `feed_activities` table in real time:

- **Auth Triggers**: `on_auth_user_created` trigger automatically maps a new signup from `auth.users` into `public.profiles`.
- **Review Triggers**: `on_review_changed` creates, updates, or deletes records in `feed_activities` automatically on changes to `reviews`.
- **Favorite Triggers**: `on_favorite_changed` creates or deletes records in `feed_activities` automatically on changes to `favorites`.

This shifts activity timeline aggregation to the database level, ensuring data integrity and high performance.

---

## Step 3: Configure Environment Variables

Update the [.env](file:///d:/Projects/VietnamTourism/.env) file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Step 4: Row-Level Security (RLS) Policies

All tables are protected by Row-Level Security (RLS) in Supabase. The configurations are:

- **Provinces & Destinations**: Public read-only access.
- **Profiles**: Public read-only access. Users can only update or insert their own profiles (`auth.uid() = id`).
- **Reviews**: Public read-only access. Users can insert, update, or delete only their own reviews (`auth.uid() = user_id`).
- **Favorites**: Users can insert, update, or delete only their own favorites (`auth.uid() = user_id`).
- **Feed Activities**: Public read-only access (computed automatically by server-side triggers).

---

## Step 5: Verification

1. Start the local server:
   ```bash
   npm run dev
   ```
2. Navigate to the **Sign Up** page and register a new traveler profile.
3. Verify that your traveler profile is created in your Supabase database under `public.profiles`.
4. Browse destinations, add some to your favorites (heart toggle), and write reviews on destination pages.
5. Visit the **Social Feed** page and **Profile** page to confirm that the activities and reviews are rendered dynamically from Supabase.
