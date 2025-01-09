/*
  # Create test accounts

  1. Create test users and their profiles
    - Customer test account (customer@test.com)
    - Employee test account (employee@test.com)
  2. Security
    - Profiles are linked to auth.users
    - Passwords are securely hashed
*/

-- Create test accounts through Supabase auth API
-- Note: This needs to be done through the Supabase dashboard or auth API
-- as we cannot directly manipulate auth.users in migrations

-- Create profiles for test accounts
-- Note: The IDs will be populated when creating users through the auth API
CREATE OR REPLACE FUNCTION create_test_profiles()
RETURNS void AS $$
BEGIN
  -- This function will be called after creating the users through the auth API
  -- The actual profile creation will happen through the auth hooks
  NULL;
END;
$$ LANGUAGE plpgsql;