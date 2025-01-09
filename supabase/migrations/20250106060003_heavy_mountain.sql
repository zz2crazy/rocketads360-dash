/*
  # Sync client names for customer profiles

  1. Changes
    - Set client_name to email for customer profiles where client_name is null
    - Ensures all customer profiles have a client name for display
*/

DO $$ 
BEGIN
  -- Update customer profiles to use email as client_name if not set
  UPDATE profiles 
  SET client_name = email 
  WHERE role = 'customer' 
  AND client_name IS NULL;
END $$;