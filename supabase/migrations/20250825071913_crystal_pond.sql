/*
  # Create business cards table

  1. New Tables
    - `business_cards`
      - `id` (uuid, primary key) - unique identifier for each business card
      - `user_id` (uuid, foreign key) - references users.id
      - `personal_info` (jsonb) - stores personal information like name, email, phone, address, photo
      - `business_info` (jsonb) - stores business information like company name, services, description, logo
      - `social_media` (jsonb) - stores social media usernames for various platforms
      - `is_published` (boolean) - whether the business card is published and visible
      - `created_at` (timestamp) - when the business card was created
      - `updated_at` (timestamp) - when the business card was last updated

  2. Security
    - Enable RLS on `business_cards` table
    - Add policy for authenticated users to manage their own business cards
    - Add policy for public to read published business cards

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on is_published for public queries
*/

CREATE TABLE IF NOT EXISTS business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  personal_info jsonb DEFAULT '{}',
  business_info jsonb DEFAULT '{}',
  social_media jsonb DEFAULT '{}',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to manage their own business cards
CREATE POLICY "Users can read own business cards"
  ON business_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business cards"
  ON business_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business cards"
  ON business_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business cards"
  ON business_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for public to read published business cards
CREATE POLICY "Anyone can read published business cards"
  ON business_cards
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS business_cards_user_id_idx ON business_cards(user_id);
CREATE INDEX IF NOT EXISTS business_cards_published_idx ON business_cards(is_published);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON business_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();