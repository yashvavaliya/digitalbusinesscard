/*
  # Fix user creation and data storage

  1. Updates
    - Ensure proper RLS policies for user creation
    - Add better error handling for user records
    - Fix any missing indexes

  2. Security
    - Ensure users can create their own records
    - Maintain data integrity
*/

-- Ensure users can insert their own data during signup
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure users can insert their own business cards
DROP POLICY IF EXISTS "Users can insert own business cards" ON business_cards;
CREATE POLICY "Users can insert own business cards"
  ON business_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy for upsert operations on business cards
DROP POLICY IF EXISTS "Users can upsert own business cards" ON business_cards;
CREATE POLICY "Users can upsert own business cards"
  ON business_cards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- Add a function to handle user creation more reliably
CREATE OR REPLACE FUNCTION create_user_profile(user_id uuid, user_email text, user_username text)
RETURNS void AS $$
BEGIN
  -- Insert user record
  INSERT INTO users (id, email, username)
  VALUES (user_id, user_email, user_username)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    updated_at = now();

  -- Insert business card record
  INSERT INTO business_cards (
    user_id,
    personal_info,
    business_info,
    social_media,
    office_showcase,
    media_integration,
    google_reviews,
    theme_customization,
    is_published
  )
  VALUES (
    user_id,
    '{}',
    '{}',
    '{}',
    '{"images": []}',
    '{}',
    '{}',
    '{"template": "modern", "primary_color": "#3B82F6", "secondary_color": "#8B5CF6"}',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;