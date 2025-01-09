/*
  # Update employee client names

  1. Changes
    - Sets client_name to 'rocketads360' for all employees and super admin
  
  2. Security
    - Maintains existing RLS policies
    - Only affects employee and super_admin roles
*/

DO $$ 
BEGIN
  -- Update client_name for all employees and super admin
  UPDATE profiles
  SET client_name = 'rocketads360'
  WHERE role IN ('employee', 'super_admin');
END $$;