-- ============================================
-- Fix Relationship Between high_scores and profiles
-- ============================================
-- Run this if you're getting the error:
-- "Could not find a relationship between 'high_scores' and 'profiles'"
-- ============================================

-- Step 1: Ensure all users in high_scores have corresponding profiles
-- (This creates profiles for any users that might have scores but no profile)
INSERT INTO public.profiles (id, username)
SELECT DISTINCT 
  hs.user_id,
  COALESCE(
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = hs.user_id),
    'Player' || substr(hs.user_id::text, 1, 8)
  ) as username
FROM public.high_scores hs
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = hs.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop the existing foreign key constraint if it exists
ALTER TABLE public.high_scores 
  DROP CONSTRAINT IF EXISTS fk_high_scores_profile;

-- Step 3: Add explicit foreign key relationship from high_scores.user_id to profiles.id
-- This allows Supabase to automatically detect the relationship for joins
ALTER TABLE public.high_scores
  ADD CONSTRAINT fk_high_scores_profile 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Verify the relationship exists
-- You can check this in Supabase Dashboard > Table Editor > high_scores > Relationships
-- The relationship should now show: high_scores.user_id -> profiles.id

