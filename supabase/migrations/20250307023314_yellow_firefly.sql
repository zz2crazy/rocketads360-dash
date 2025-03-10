/*
  # Fix Profile Permissions

  1. Changes
    - Add RLS policies for profiles table to allow proper authentication flow
    - Enable RLS on profiles table
    - Add policies for:
      - Reading own profile
      - Reading profiles for employees/admins
      - Updating own profile
      - Creating profile during signup

  2. Security
    - Ensures users can only access their own data
    - Allows employees and admins to view all profiles
    - Restricts profile creation to auth process
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('employee', 'super_admin')
    )
  )
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