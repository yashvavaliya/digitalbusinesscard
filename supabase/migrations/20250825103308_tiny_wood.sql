/*
  # Create automatic user record creation

  1. Function
    - Create function to automatically create user record when auth user is created
    - Create business card record for new users

  2. Trigger
    - Trigger on auth.users insert to create corresponding user record
    - Ensures data consistency between auth and custom tables

  3. Security
    - Function runs with security definer privileges
    - Maintains RLS policies
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );

  -- Create a default business card for the new user
  INSERT INTO public.business_cards (
    user_id,
    personal_info,
    business_info,
    social_media,
    office_showcase,
    media_integration,
    google_reviews,
    theme_customization,
    is_published,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    '{}',
    '{}',
    '{}',
    '{"images": []}',
    '{}',
    '{}',
    '{"template": "modern", "primary_color": "#3B82F6", "secondary_color": "#8B5CF6"}',
    false,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
GRANT ALL ON public.business_cards TO supabase_auth_admin;