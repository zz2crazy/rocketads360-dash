/*
  # Fix webhook permissions

  1. Changes
    - Add policy for employees to read webhook settings
    - Add policy for employees to read global webhook config
    - Update existing webhook policies to include employee role

  2. Security
    - Maintains existing super_admin permissions
    - Adds read-only access for employees
    - Preserves existing client access restrictions
*/

-- Drop existing webhook policies
DROP POLICY IF EXISTS "Super admins can manage webhook settings" ON webhook_settings;
DROP POLICY IF EXISTS "Super admins can manage global webhook config" ON global_webhook_config;

-- Create new webhook_settings policies
CREATE POLICY "Webhook settings access policy"
  ON webhook_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Webhook settings management policy"
  ON webhook_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create new global_webhook_config policies
CREATE POLICY "Global webhook config access policy"
  ON global_webhook_config
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Global webhook config management policy"
  ON global_webhook_config
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );