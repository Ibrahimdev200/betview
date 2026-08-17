-- ========================================================
-- BetLens Supabase Production Database Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Create Profiles Table (Users & Subscriptions)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' or 'premium'
  code_generations_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index phone for fast login lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2. Create Notifications Table (Direct & Broadcast Messages)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = Broadcast to all
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Generated Bet Codes Log Table
CREATE TABLE IF NOT EXISTS public.generated_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'SportyBet', 'Bet9ja', '1xBet'
  target_odds INT NOT NULL, -- 2, 3, or 5
  actual_odds NUMERIC(5,2) NOT NULL,
  selections JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Seed Default Master Admin Account
-- Phone: 09033675852 / Password: @Dherinosha1
INSERT INTO public.profiles (phone, password_hash, role, plan, expires_at)
VALUES (
  '09033675852',
  '@Dherinosha1',
  'admin',
  'premium',
  '2099-12-31 23:59:59+00'
)
ON CONFLICT (phone) DO UPDATE 
SET role = 'admin', plan = 'premium';

-- 5. Seed Welcome Broadcast Notification
INSERT INTO public.notifications (user_id, title, message)
VALUES (
  NULL,
  'Welcome to BetLens Pro!',
  'Get free 2, 3, and 5 odds codes daily on SportyBet, Bet9ja, and 1xBet. Upgrade to Premium for ₦1,000/mo for unlimited access!'
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_codes ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for Anon/Authenticated Client Access
CREATE POLICY "Allow public read/write profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public read/write notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow public read/write generated_codes" ON public.generated_codes FOR ALL USING (true);
