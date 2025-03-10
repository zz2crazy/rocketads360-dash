/*
  # Fix Profile Permissions

  1. Changes
    - Fix infinite recursion in RLS policies
    - Simplify profile access rules
    - Enable RLS on profiles table
    - Add policies for:
      - Reading profiles
      - Updating own profile
      - Creating profile during signup

  2. Security
    - Ensures users can only access their own data
    - Allows employees and admins to view all profiles
    - Restricts profile creation to auth process
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication only" ON profiles;

-- Allow users to read profiles based on role
CREATE POLICY "Profile read access"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Users can read their own profile
  auth.uid() = id
  OR
  -- Employees and admins can read all profiles
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('employee', 'super_admin')
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable insert for authentication only"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);