-- Drop existing webhook policies
DROP POLICY IF EXISTS "Webhook settings access policy" ON webhook_settings;
DROP POLICY IF EXISTS "Webhook settings management policy" ON webhook_settings;
DROP POLICY IF EXISTS "Global webhook config access policy" ON global_webhook_config;
DROP POLICY IF EXISTS "Global webhook config management policy" ON global_webhook_config;

-- Create new webhook_settings policies
CREATE POLICY "Webhook settings read policy"
  ON webhook_settings
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins and employees can read all webhook settings
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employee', 'super_admin')
    )
    OR
    -- Customers can read webhook settings for their client_name
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND p1.role = 'customer'
      AND EXISTS (
        SELECT 1 FROM profiles p2
        WHERE p2.id = webhook_settings.client_id
        AND p2.client_name = p1.client_name
      )
    )
  );

CREATE POLICY "Webhook settings management policy"
  ON webhook_settings
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create new global_webhook_config policies
CREATE POLICY "Global webhook config read policy"
  ON global_webhook_config
  FOR SELECT
  TO authenticated
  USING (true);  -- All authenticated users can read global config

CREATE POLICY "Global webhook config management policy"
  ON global_webhook_config
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );