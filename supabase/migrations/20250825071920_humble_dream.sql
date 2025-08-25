/*
  # Create storage bucket for uploads

  1. Storage
    - Create 'uploads' bucket for user files (photos, logos, business cards)
    - Enable public access for published content
    - Set up RLS policies for secure file access

  2. Security
    - Users can upload files to their own folder
    - Users can read their own files
    - Public can read files from published business cards
*/

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to read files (for published business cards)
CREATE POLICY "Public can read uploaded files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'uploads');