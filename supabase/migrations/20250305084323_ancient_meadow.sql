/*
  # Add BM Provider Management

  1. New Tables
    - `bm_providers`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `status` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)

  2. Changes
    - Add provider_id to business_managers table
    - Update business_managers constraints

  3. Security
    - Enable RLS on bm_providers
    - Add policies for employee and admin access
*/

-- Create bm_providers table
CREATE TABLE bm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

-- Add provider relationship to business_managers
ALTER TABLE business_managers
ADD COLUMN provider_id uuid REFERENCES bm_providers(id);

-- Enable RLS
ALTER TABLE bm_providers ENABLE ROW LEVEL SECURITY;

-- Create policies for bm_providers
CREATE POLICY "Employees and admins can read providers"
  ON bm_providers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Employees and admins can create providers"
  ON bm_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

CREATE POLICY "Employees and admins can update providers"
  ON bm_providers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
  );

-- Add indexes
CREATE INDEX idx_bm_providers_status ON bm_providers (status);
CREATE INDEX idx_business_managers_provider_id ON business_managers (provider_id);

-- Add trigger to set created_by
CREATE OR REPLACE FUNCTION set_provider_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_provider_created_by_trigger
  BEFORE INSERT ON bm_providers
  FOR EACH ROW
  EXECUTE FUNCTION set_provider_created_by();