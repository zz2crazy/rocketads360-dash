/*
  # Add profile read policy for super admins

  1. Security
    - Add policy allowing super admins to read all customer profiles
    - Required for webhook settings management
*/

-- Add policy for super admins to read customer profiles
CREATE POLICY "Super admins can read customer profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );