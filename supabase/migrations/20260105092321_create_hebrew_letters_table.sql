/*
  # Create Hebrew Letters Learning System

  1. New Tables
    - `hebrew_letters`
      - `id` (uuid, primary key)
      - `letter` (text) - The Hebrew letter character
      - `letter_name` (text) - Name of the letter (e.g., "Alef")
      - `letter_name_hebrew` (text) - Name in Hebrew (e.g., "אלף")
      - `object_name` (text) - Associated object name in Spanish
      - `object_name_hebrew` (text) - Object name in Hebrew
      - `audio_url` (text) - URL to the audio file
      - `order_index` (integer) - Order in the alphabet
      - `image_url` (text, optional) - URL to object image
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `hebrew_letters` table
    - Add policy for public read access (educational content)
    - Add policy for authenticated users to manage content
*/

CREATE TABLE IF NOT EXISTS hebrew_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter text NOT NULL,
  letter_name text NOT NULL,
  letter_name_hebrew text NOT NULL,
  object_name text NOT NULL,
  object_name_hebrew text NOT NULL,
  audio_url text NOT NULL,
  order_index integer NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hebrew_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view Hebrew letters"
  ON hebrew_letters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert Hebrew letters"
  ON hebrew_letters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update Hebrew letters"
  ON hebrew_letters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete Hebrew letters"
  ON hebrew_letters FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS hebrew_letters_order_idx ON hebrew_letters(order_index);