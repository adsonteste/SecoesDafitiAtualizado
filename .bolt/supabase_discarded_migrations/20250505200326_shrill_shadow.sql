/*
  # Create deliveries table for route tracking

  1. New Tables
    - `deliveries`
      - `id` (uuid, primary key)
      - `data` (date)
      - `motorista` (text)
      - `hora_inicio` (time)
      - `percentual_entregas` (numeric)
      - `rotas` (text)
      - `total_pedido` (integer)
      - `entregues` (integer)
      - `pendente` (integer)
      - `insucessos` (integer)
      - `percentual_rota` (numeric)
      - `regiao` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `deliveries` table
    - Add policies for authenticated users to read and insert data
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own deliveries" ON deliveries;
  DROP POLICY IF EXISTS "Users can insert their own deliveries" ON deliveries;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  motorista text NOT NULL,
  hora_inicio time NOT NULL,
  percentual_entregas numeric NOT NULL,
  rotas text NOT NULL,
  total_pedido integer NOT NULL,
  entregues integer NOT NULL,
  pendente integer NOT NULL,
  insucessos integer NOT NULL,
  percentual_rota numeric NOT NULL,
  regiao text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own deliveries"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own deliveries"
  ON deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);