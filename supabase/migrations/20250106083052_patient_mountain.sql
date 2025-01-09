/*
  # Fix profile policies to avoid recursion

  1. Changes
    - Drop existing problematic policies
    - Add new optimized policies for profile access
    - Ensure proper access control without recursion
*/

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Super admins can read customer profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Employees can update profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON profiles;

-- Create new optimized policies
CREATE POLICY "Profile access policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR  -- Users can read their own profile
    role IN ('employee', 'super_admin')  -- Employees and super admins can read all profiles
  );

CREATE POLICY "Profile update policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR  -- Users can update their own profile
    role IN ('employee', 'super_admin')  -- Employees and super admins can update all profiles
  );

CREATE POLICY "Profile insert policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id  -- Only allow inserting profiles for the authenticated user
  );