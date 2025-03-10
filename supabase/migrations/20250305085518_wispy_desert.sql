-- Drop the provider column and use provider_id instead
ALTER TABLE business_managers
DROP COLUMN provider;

-- Add NOT NULL constraint to provider_id
ALTER TABLE business_managers
ALTER COLUMN provider_id SET NOT NULL;

-- Add comment explaining the relationship
COMMENT ON COLUMN business_managers.provider_id IS 
'References the bm_providers table to indicate which provider this business manager belongs to';