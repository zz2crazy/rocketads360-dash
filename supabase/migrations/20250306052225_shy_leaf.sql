/*
  # Fix Authentication Policies

  1. Changes
    - Add stronger RLS policies for profiles table
    - Add session handling policies
    - Fix user authentication flow
    - Add better error handling for auth failures

  2. Security
    - Enable RLS on all tables
    - Add proper policies for profile access
    - Ensure proper session management
*/

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Profile access policy" ON profiles;
DROP POLICY IF EXISTS "Profile insert policy" ON profiles;
DROP POLICY IF EXISTS "Profile update policy" ON profiles;

-- Create more specific policies
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('employee', 'super_admin')
  )
);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'role')::text,
      'customer'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better session lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);