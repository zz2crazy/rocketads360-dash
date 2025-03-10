/*
  # Add Business Manager Management

  1. New Tables
    - `business_managers`
      - `id` (uuid, primary key)
      - `provider` (text, e.g., 'facebook')
      - `bm_id` (text, unique BM identifier)
      - `name` (text, BM name)
      - `status` (text, BM status)
      - `last_sync` (timestamptz)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for employee and super_admin access
*/

-- Create business_managers table
CREATE TABLE business_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('facebook')),
  bm_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'error')),
  last_sync timestamptz NOT NULL DEFAULT now(),
  error_message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, bm_id)
);

-- Enable RLS
ALTER TABLE business_managers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employees and admins can read business managers"
  ON business_managers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Employees and admins can insert business managers"
  ON business_managers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Employees and admins can update business managers"
  ON business_managers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Employees and admins can delete business managers"
  ON business_managers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

-- Add indexes
CREATE INDEX idx_business_managers_provider_bm_id ON business_managers (provider, bm_id);
CREATE INDEX idx_business_managers_status ON business_managers (status);