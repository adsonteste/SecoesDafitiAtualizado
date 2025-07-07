/*
  # Create orders table for Dafiti tracking

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `referencia` (text)
      - `ultima_ocorrencia` (text)
      - `data_ultima_ocorrencia` (timestamptz)
      - `merchandise_value` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for authenticated users to read and modify their data
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referencia text NOT NULL,
  ultima_ocorrencia text,
  data_ultima_ocorrencia timestamptz,
  merchandise_value text,
  status text DEFAULT 'Pendentes',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);