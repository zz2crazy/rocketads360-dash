/*
  # Add client name to orders table

  1. Changes
    - Add client_name column to orders table
    - Copy existing client names from profiles
    - Update order creation to include client_name

  2. Benefits
    - Faster order listing without joins
    - Historical client name preservation
    - Better query performance
*/

-- Add client_name column to orders
ALTER TABLE orders ADD COLUMN client_name text;

-- Update existing orders with client names from profiles
UPDATE orders
SET client_name = profiles.client_name
FROM profiles
WHERE orders.user_id = profiles.id;