/*
  # Create promotions table

  1. New Tables
    - `promotions`
      - `id` (uuid, primary key)
      - `brand_icon_url` (text, required)
      - `title` (text, required)
      - `description` (text, required)
      - `start_date` (date, required)
      - `end_date` (date, required)
      - `created_at` (timestamp with timezone, default: now())

  2. Security
    - Enable RLS on `promotions` table
    - Add policy for authenticated users to read all promotions
    - Add policy for authenticated users to create promotions
*/

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_icon_url text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read promotions
CREATE POLICY "Allow users to read all promotions" 
  ON promotions
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to create promotions
CREATE POLICY "Allow authenticated users to create promotions" 
  ON promotions
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);