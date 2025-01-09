/*
  # Update employee nickname constraint and create super admin

  1. Changes
    - Modifies employee_nickname_check to allow nicknames for super_admin role
    - Creates profile for ray@rocketads360.com if it doesn't exist
    - Sets appropriate role and nickname
  
  2. Security
    - Maintains data integrity with updated constraint
    - Links profile to auth.users using auth.uid()
*/

-- First modify the employee nickname constraint to include super_admin
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS employee_nickname_check;

ALTER TABLE profiles
ADD CONSTRAINT employee_nickname_check
CHECK (
  ((role IN ('employee', 'super_admin')) AND nickname IS NOT NULL) OR
  (role = 'customer' AND nickname IS NULL)
);

-- Then create the super admin profile
DO $$ 
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'ray@rocketads360.com';

  -- Create profile if user exists but profile doesn't
  IF user_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, role, nickname, client_name)
    VALUES (
      user_id,
      'ray@rocketads360.com',
      'super_admin',
      'Super Admin',
      'rocketads360'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'super_admin',
      nickname = 'Super Admin',
      client_name = 'rocketads360';
  END IF;
END $$;