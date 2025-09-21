/*
  # Create product files management system

  1. New Tables
    - `product_files`
      - `id` (uuid, primary key)
      - `name` (text, file name)
      - `type` (text, 'excel' or 'raw')
      - `data` (jsonb, product data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users)
    
    - `file_versions`
      - `id` (uuid, primary key)
      - `file_id` (uuid, references product_files)
      - `version_number` (integer)
      - `data` (jsonb, version data)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('excel', 'raw')),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES product_files(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- Policies for product_files
CREATE POLICY "Users can read own files"
  ON product_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
  ON product_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON product_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON product_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for file_versions
CREATE POLICY "Users can read own file versions"
  ON file_versions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own file versions"
  ON file_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_files_user_id ON product_files(user_id);
CREATE INDEX IF NOT EXISTS idx_product_files_created_at ON product_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON file_versions(file_id, version_number DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_product_files_updated_at
  BEFORE UPDATE ON product_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();