/*
  # Add super admin orders policy

  1. Changes
    - Add RLS policy for super admins to view all orders
    - Add RLS policy for super admins to update orders

  2. Security
    - Super admins can view all orders
    - Super admins can update any order status
*/

-- Add policy for super admins to view all orders
CREATE POLICY "Super admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Add policy for super admins to update orders
CREATE POLICY "Super admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );