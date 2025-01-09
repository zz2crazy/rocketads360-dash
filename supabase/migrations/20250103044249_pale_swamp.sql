/*
  # Additional policies setup

  1. Security Updates
    - Add policies for profile management
    - Ensure proper access control
*/

-- Add policy for employees to update profiles
CREATE POLICY "Employees can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employee'
    )
  );

-- Add policy for profile creation during signup
CREATE POLICY "Enable insert for authentication service"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);