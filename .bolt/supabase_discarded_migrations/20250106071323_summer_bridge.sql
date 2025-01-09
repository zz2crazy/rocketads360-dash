/*
  # Add employee nickname field

  1. Changes
    - Add nickname column to profiles table
    - Set default nicknames for existing employees
    - Add constraints for employee nicknames
    - Ensure uniqueness of employee nicknames

  2. Notes
    - Handles existing data before adding constraints
    - Uses email-based default nicknames
*/

-- First add the nickname column without constraints
ALTER TABLE profiles
ADD COLUMN nickname text;

-- Set default nicknames for existing employee profiles
DO $$ 
BEGIN
  -- Generate unique nicknames from email for existing employees
  UPDATE profiles 
  SET nickname = 'emp_' || SUBSTR(MD5(email || id::text), 1, 8)
  WHERE role = 'employee' 
  AND nickname IS NULL;

  -- Clear any nicknames for customer profiles
  UPDATE profiles
  SET nickname = NULL
  WHERE role = 'customer';
END $$;

-- Now add the unique constraint for employee nicknames
CREATE UNIQUE INDEX employee_nickname_idx 
ON profiles (nickname) 
WHERE role = 'employee' AND nickname IS NOT NULL;

-- Finally add the check constraint
ALTER TABLE profiles
ADD CONSTRAINT employee_nickname_check
CHECK (
  (role = 'employee' AND nickname IS NOT NULL) OR
  (role = 'customer' AND nickname IS NULL)
);