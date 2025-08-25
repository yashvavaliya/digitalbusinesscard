/*
  # Enhanced business cards schema

  1. Schema Updates
    - Add new fields to business_cards table for enhanced functionality
    - office_showcase: JSON field for office images and location
    - media_integration: JSON field for video and media links
    - google_reviews: JSON field for review data
    - theme_customization: JSON field for design preferences

  2. Data Migration
    - Safely add new columns with default values
    - Preserve existing data
*/

-- Add new columns to business_cards table if they don't exist
DO $$
BEGIN
  -- Add office_showcase column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_cards' AND column_name = 'office_showcase'
  ) THEN
    ALTER TABLE business_cards ADD COLUMN office_showcase jsonb DEFAULT '{"images": []}';
  END IF;

  -- Add media_integration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_cards' AND column_name = 'media_integration'
  ) THEN
    ALTER TABLE business_cards ADD COLUMN media_integration jsonb DEFAULT '{}';
  END IF;

  -- Add google_reviews column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_cards' AND column_name = 'google_reviews'
  ) THEN
    ALTER TABLE business_cards ADD COLUMN google_reviews jsonb DEFAULT '{}';
  END IF;

  -- Add theme_customization column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_cards' AND column_name = 'theme_customization'
  ) THEN
    ALTER TABLE business_cards ADD COLUMN theme_customization jsonb DEFAULT '{"template": "modern", "primary_color": "#3B82F6", "secondary_color": "#8B5CF6"}';
  END IF;
END $$;