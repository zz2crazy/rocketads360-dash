/*
  # Add super admin role and webhook settings

  1. Changes
    - Add super_admin role to profiles
    - Create webhook_settings table for client-specific webhooks
    - Add RLS policies for webhook settings

  2. Security
    - Only super admins can manage webhook settings
    - Clients can't access webhook settings
*/

-- Update profile role type
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('customer', 'employee', 'super_admin'));

-- Create webhook_settings table
CREATE TABLE webhook_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id),
  webhook_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create webhook_settings policies
CREATE POLICY "Super admins can manage webhook settings"
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

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_webhook_settings_updated_at
  BEFORE UPDATE ON webhook_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();