/*
  # Add account name specification field
  
  1. Changes
    - Add account_name_spec column to orders table
    - Maximum 100 characters
    - Optional field
*/

ALTER TABLE orders
ADD COLUMN account_name_spec text
CHECK (char_length(account_name_spec) <= 100);