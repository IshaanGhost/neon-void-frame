# Supabase Database Setup Instructions

This guide will help you set up all the necessary tables in your Supabase project.

## Quick Setup

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project (ID: `wmddiudmxsgejrppnlpe`)

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Setup Script**
   - Open the file `supabase_setup.sql` in this project
   - Copy the entire contents
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **(Optional) Fix Existing Data**
   - If you previously created tables without the new relationships, run `supabase_fix_relationship.sql`
   - This ensures the `high_scores.user_id → profiles.id` relationship is registered so the leaderboard query works

## What Gets Created

### Tables

1. **`profiles`** - User profile information
   - `id` (UUID, linked to auth.users)
   - `username` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **`high_scores`** - Game high scores
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `score` (INTEGER)
   - `created_at` (TIMESTAMP)

### Features Enabled

- ✅ **Row Level Security (RLS)** - Secure access control
- ✅ **Automatic Profile Creation** - Profiles created when users sign up
- ✅ **Indexes** - Fast leaderboard queries
- ✅ **Foreign Keys** - Proper data relationships
- ✅ **Triggers** - Automatic timestamp updates

## Verification

After running the SQL, verify the setup:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - `profiles` table
   - `high_scores` table

3. Check **Authentication** → **Users**
   - When a new user signs up, a profile should be automatically created

4. Test the application:
   - Sign up a new user
   - Play a game and submit a score
   - Check the leaderboard

## Troubleshooting

### If you get permission errors:
- Make sure you're running the SQL as a project owner/admin
- Check that RLS policies are enabled

### If profiles aren't created automatically:
- Check the `auth.users` table has the trigger
- Verify the trigger function exists: `handle_new_user()`
- If users already exist without profiles, run the "Fix Existing Data" script

### If you need to reset:
```sql
-- Drop tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.high_scores CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
```
Then run `supabase_setup.sql` again.

## Next Steps

Once the database is set up:
1. Your app should work with authentication
2. Users can submit high scores
3. The leaderboard will display scores from all users
4. Profiles are automatically created on signup

