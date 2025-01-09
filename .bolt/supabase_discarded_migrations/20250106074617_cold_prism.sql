/*
  # Create super admin profile

  1. Changes
    - Updates the profile for ray@rocketads360.com to super_admin role
    - Sets nickname for the super admin

  2. Security
    - Only modifies existing profile
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Update existing profile to super_admin
  UPDATE profiles
  SET 
    role = 'super_admin',
    nickname = 'Super Admin'
  WHERE email = 'ray@rocketads360.com';
END $$;