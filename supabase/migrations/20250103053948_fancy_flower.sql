/*
  # Add cancelled status to orders

  1. Changes
    - Add 'cancelled' as a valid status for orders
    - Update existing check constraint
*/

DO $$ BEGIN
  -- Update the check constraint for status
  ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS orders_status_check;
    
  ALTER TABLE orders
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));
END $$;