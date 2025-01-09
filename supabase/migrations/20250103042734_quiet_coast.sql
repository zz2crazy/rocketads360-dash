/*
  # Initial Schema Setup for Order Management Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `role` (text)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (text, primary key) - Format: YYYYMMDDHHMMSS
      - `user_id` (uuid, foreign key)
      - `account_count` (integer)
      - `timezone` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'employee')),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id text PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  account_count integer NOT NULL CHECK (account_count > 0),
  timezone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'customer'
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employee'
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'customer'
    )
  );

CREATE POLICY "Employees can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employee'
    )
  );