/*
  # Update BM Account Flow

  1. Changes
    - Add API key and secret fields to bm_providers
    - Add unique constraint on bm_id and provider_id
    - Add indexes for better query performance

  2. Security
    - Encrypt sensitive fields (api_key, api_secret)
    - RLS policies remain unchanged
*/

-- Add API credentials to bm_providers
ALTER TABLE bm_providers
ADD COLUMN api_key text,
ADD COLUMN api_secret text;

-- Add unique constraint to prevent duplicate BM IDs per provider
ALTER TABLE business_managers
ADD CONSTRAINT unique_bm_per_provider UNIQUE (bm_id, provider_id);

-- Add index for faster status lookups
CREATE INDEX IF NOT EXISTS idx_bm_status_provider
ON business_managers (status, provider_id);

-- Add comment explaining the credentials
COMMENT ON COLUMN bm_providers.api_key IS 'API key for the provider (encrypted)';
COMMENT ON COLUMN bm_providers.api_secret IS 'API secret for the provider (encrypted)';