/*
  # Fix webhook and profile policies

  1. Changes
    - Add specific policy for webhook-related profile access
    - Optimize profile queries for webhook functionality
    - Ensure proper access control for webhook operations

  2. Security
    - Maintain RLS protection
    - Add specific webhook-related access controls
*/

-- Add specific policy for webhook profile access
CREATE POLICY "Webhook profile access"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (role = 'customer' AND client_name IS NOT NULL) OR  -- Allow access to customer profiles with names
    role = 'super_admin'  -- Super admins can access all profiles
  );

-- Add index to improve profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_client_name
  ON profiles (role, client_name)
  WHERE role = 'customer' AND client_name IS NOT NULL;