-- Migration: 015_auto_create_profile_trigger.sql
-- Description: Automatically create profile when user signs in via Web3
-- Sprint: 3.3 (SIWE Native Migration - Race Condition Fix)
-- Date: 2025-11-04

-- Create function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract wallet_address from raw_user_meta_data
  -- Supabase Web3 auth stores it as raw_user_meta_data.wallet_address
  INSERT INTO public.profiles (id, wallet_address, ens_name)
  VALUES (
    NEW.id,
    LOWER(NEW.raw_user_meta_data->>'wallet_address'),
    NULL  -- ENS will be resolved later if needed
  )
  ON CONFLICT (id) DO NOTHING;  -- Skip if profile already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
-- This fires AFTER a new user is inserted (i.e., after first sign-in)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile in public.profiles when a user signs in via Web3 auth. Fixes race condition between auth.signInWithWeb3() and manual profile creation.';
