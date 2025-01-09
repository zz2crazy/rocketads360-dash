/*
  # Add super admin nickname

  1. Changes
    - Set nickname for super admin profile
*/

DO $$ 
BEGIN
  -- Update super admin profile nickname
  UPDATE profiles
  SET nickname = 'Super Admin'
  WHERE role = 'super_admin'
  AND email = 'ray@rocketads360.com';
END $$;