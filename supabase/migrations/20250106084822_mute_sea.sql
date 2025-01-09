/*
  # Add webhook payload configuration

  1. Changes
    - Add payload_config column to webhook_settings table
    - Add global_webhook_config table for storing global webhook configuration
    - Add policies for managing webhook configurations

  2. Security
    - Enable RLS on global_webhook_config table
    - Add policy for super admins to manage global webhook config
*/

-- Add payload_config column to webhook_settings
ALTER TABLE webhook_settings
ADD COLUMN payload_config jsonb;

-- Create global_webhook_config table
CREATE TABLE global_webhook_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload_config jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_webhook_config ENABLE ROW LEVEL SECURITY;

-- Create policies for global_webhook_config
CREATE POLICY "Super admins can manage global webhook config"
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

-- Add updated_at trigger for global_webhook_config
CREATE TRIGGER update_global_webhook_config_updated_at
  BEFORE UPDATE ON global_webhook_config
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();