/*
  # Update promotions table policies

  1. Changes
    - Allow public access to read promotions
    - Remove authenticated-only restriction
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read all promotions" ON promotions;
DROP POLICY IF EXISTS "Allow authenticated users to create promotions" ON promotions;

-- Create new policy for public read access
CREATE POLICY "Allow public to read promotions"
ON promotions
FOR SELECT
TO public
USING (true);