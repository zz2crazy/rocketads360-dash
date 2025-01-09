/*
  # Create Test Customer Function
  
  Creates a function to add a new customer user with:
  - Email: 16977513@qq.com
  - Client Name: Tester
  - Role: customer
*/

-- Create function to add new customer
CREATE OR REPLACE FUNCTION add_test_customer()
RETURNS void AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create profile for the user
  INSERT INTO public.profiles (
    id,
    email,
    role,
    client_name,
    created_at
  )
  VALUES (
    auth.uid(),
    '16977513@qq.com',
    'customer',
    'Tester',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_test_customer() TO service_role;