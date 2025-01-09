/*
  # Add nickname field for employee profiles

  1. Changes
    - Add nickname column to profiles table
    - Set default nicknames for existing employees
    - Add constraints to ensure only employees can have nicknames
    - Add unique constraint for employee nicknames

  2. Security
    - Maintain existing RLS policies
*/

-- Add nickname column without constraints first
ALTER TABLE profiles
ADD COLUMN nickname text;

-- Set default nicknames for existing employees using their email
DO $$ 
BEGIN
  UPDATE profiles 
  SET nickname = CONCAT('emp_', SUBSTR(MD5(email), 1, 8))
  WHERE role = 'employee' 
  AND nickname IS NULL;
END $$;

-- Now add the unique constraint
CREATE UNIQUE INDEX employee_nickname_idx ON profiles (nickname)
WHERE role = 'employee' AND nickname IS NOT NULL;

-- Finally add the check constraint
ALTER TABLE profiles
ADD CONSTRAINT employee_nickname_check
CHECK (
  (role = 'employee' AND nickname IS NOT NULL) OR
  (role = 'customer' AND nickname IS NULL)
);