# Deployment Guide

## Environment Variables

This application requires Supabase environment variables to be set in your deployment platform.

### Required Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### How to Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

### Setting Environment Variables by Platform

#### Vercel
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Redeploy your application

#### Netlify
1. Go to **Site settings** → **Environment variables**
2. Add each variable:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Redeploy your site

#### Other Platforms
Add the environment variables in your platform's settings/configuration section, then redeploy.

### Important Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- The `.env` file is only for local development
- For production, set environment variables in your deployment platform's dashboard
- After setting environment variables, you must **redeploy** for changes to take effect

