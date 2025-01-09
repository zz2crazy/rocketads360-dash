/*
  # Add client name to profiles

  1. Changes
    - Add `client_name` column to profiles table
    - Set default value for existing records
*/

ALTER TABLE profiles
ADD COLUMN client_name text;

-- Set default value for existing customer profiles
UPDATE profiles 
SET client_name = email 
WHERE role = 'customer' AND client_name IS NULL;