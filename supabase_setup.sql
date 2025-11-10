-- ============================================
-- GameVerse Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Create profiles table
-- ============================================
-- This table stores user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. Create high_scores table
-- ============================================
CREATE TABLE IF NOT EXISTS public.high_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Add foreign key to profiles for easier joins
  CONSTRAINT fk_high_scores_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create index on score for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON public.high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_user_id ON public.high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_created_at ON public.high_scores(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.high_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for high_scores
-- Everyone can read high scores (for leaderboard)
CREATE POLICY "High scores are viewable by everyone"
  ON public.high_scores FOR SELECT
  USING (true);

-- Users can insert their own high scores
CREATE POLICY "Users can insert their own high scores"
  ON public.high_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own high scores
CREATE POLICY "Users can update their own high scores"
  ON public.high_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own high scores
CREATE POLICY "Users can delete their own high scores"
  ON public.high_scores FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. Create function to automatically create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. Grant necessary permissions
-- ============================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.high_scores TO authenticated;
GRANT SELECT ON public.high_scores TO anon;

-- ============================================
-- Setup Complete!
-- ============================================
-- Your database is now ready to use.
-- Tables created:
--   - profiles (linked to auth.users)
--   - high_scores (stores game scores)
--
-- Features enabled:
--   - Row Level Security (RLS) on all tables
--   - Automatic profile creation on user signup
--   - Indexes for fast leaderboard queries
--   - Proper foreign key relationships
-- ============================================

