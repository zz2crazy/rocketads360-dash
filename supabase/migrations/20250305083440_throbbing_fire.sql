/*
  # Fix Business Manager Provider Validation

  1. Changes
    - Update provider validation to use an enum type
    - Ensure proper validation for the provider field
    - Add better error handling for invalid providers

  2. Technical Details
    - Creates a new enum type for providers
    - Updates the business_managers table to use the enum
    - Maintains existing data integrity
*/

-- First create an enum type for providers
CREATE TYPE bm_provider AS ENUM ('facebook');

-- Temporarily disable the check constraint
ALTER TABLE business_managers 
DROP CONSTRAINT IF EXISTS business_managers_provider_check;

-- Convert the column to use the enum type
ALTER TABLE business_managers
ALTER COLUMN provider TYPE bm_provider 
USING provider::bm_provider;

-- Add any additional validation needed
ALTER TABLE business_managers
ADD CONSTRAINT business_managers_provider_valid
CHECK (provider IS NOT NULL);

-- Add a comment to explain the provider field
COMMENT ON COLUMN business_managers.provider IS 
'The provider of the business manager (e.g., facebook). Uses bm_provider enum type.';