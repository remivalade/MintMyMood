-- Migration: 011_create_profiles_table.sql
-- Description: Create profiles table linking auth.users to wallet addresses
-- Sprint: 3.3 (SIWE Native Migration)
-- Date: 2025-11-04

-- Create the profiles table
-- This table links the secure auth.users.id (UUID) to public data like wallet_address
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key and foreign key to auth.users
  id UUID PRIMARY KEY,

  -- User's Ethereum wallet address (lowercase, unique)
  wallet_address TEXT NOT NULL UNIQUE,

  -- Optional ENS name (if resolved)
  ens_name TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraint to auth.users
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Create index on ens_name for ENS lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ens_name ON public.profiles(ens_name);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view profiles (public data)
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

-- RLS Policy: Users can only insert their own profile
CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'User profiles linking auth.users to wallet addresses. Created in Sprint 3.3 SIWE Native Migration.';
