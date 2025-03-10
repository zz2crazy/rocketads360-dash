/*
  # Fix Profile Policies

  1. Changes
    - Fix infinite recursion in profile policies
    - Simplify policy conditions
    - Add better role-based access control
    - Ensure proper profile management

  2. Security
    - Maintain RLS protection
    - Fix policy recursion issues
    - Keep role-based restrictions
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Webhook profile access" ON profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "Allow users to read own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  -- User can read their own profile
  auth.uid() = id
  OR
  -- Employees and admins can read all profiles
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' IN ('employee', 'super_admin'))
  )
);

CREATE POLICY "Allow users to update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add webhook access policy without recursion
CREATE POLICY "Allow webhook access to customer profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Allow access to customer profiles
  role = 'customer' AND client_name IS NOT NULL
  OR
  -- Or if user is super_admin
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_client ON profiles(role, client_name);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(id);

-- Update or create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::text,
      'customer'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();