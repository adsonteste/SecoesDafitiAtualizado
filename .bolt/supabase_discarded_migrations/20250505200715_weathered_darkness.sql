/*
  # Add additional fields to orders table

  1. Changes
    - Add new columns to store additional order information:
      - `retailer` (text) - Store name (e.g., 'dafiti')
      - `customer` (text) - Customer name
      - `month_ref` (text) - Reference month
      - `driver` (text) - Driver name
      - `br_nf` (text) - BR NF number
      - `recipient` (text) - Recipient name
      - `customer_phone` (text) - Customer phone
      - `address` (text) - Delivery address
      - `order_value` (text) - Order value
      - `delivery_date` (timestamptz) - Delivery date
      - `return_deadline` (timestamptz) - Return deadline
      - `return_check_date` (timestamptz) - Return check date
      - `return_status` (text) - Return status
      - `financial_action` (text) - Financial action
      - `should_discount` (boolean) - Discount flag
      - `email_link` (text) - Email link
      - `proof_link` (text) - Proof link
      - `check_responsible` (text) - Check responsible
      - `last_occurrence` (text) - Last occurrence
      - `last_occurrence_date` (timestamptz) - Last occurrence date
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - User who last updated the record

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'retailer') THEN
    ALTER TABLE orders ADD COLUMN retailer text DEFAULT 'dafiti';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer') THEN
    ALTER TABLE orders ADD COLUMN customer text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'month_ref') THEN
    ALTER TABLE orders ADD COLUMN month_ref text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'driver') THEN
    ALTER TABLE orders ADD COLUMN driver text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'br_nf') THEN
    ALTER TABLE orders ADD COLUMN br_nf text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'recipient') THEN
    ALTER TABLE orders ADD COLUMN recipient text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE orders ADD COLUMN customer_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'address') THEN
    ALTER TABLE orders ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_value') THEN
    ALTER TABLE orders ADD COLUMN order_value text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_date') THEN
    ALTER TABLE orders ADD COLUMN delivery_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'return_deadline') THEN
    ALTER TABLE orders ADD COLUMN return_deadline timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'return_check_date') THEN
    ALTER TABLE orders ADD COLUMN return_check_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'return_status') THEN
    ALTER TABLE orders ADD COLUMN return_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'financial_action') THEN
    ALTER TABLE orders ADD COLUMN financial_action text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'should_discount') THEN
    ALTER TABLE orders ADD COLUMN should_discount boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'email_link') THEN
    ALTER TABLE orders ADD COLUMN email_link text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'proof_link') THEN
    ALTER TABLE orders ADD COLUMN proof_link text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'check_responsible') THEN
    ALTER TABLE orders ADD COLUMN check_responsible text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'last_occurrence') THEN
    ALTER TABLE orders ADD COLUMN last_occurrence text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'last_occurrence_date') THEN
    ALTER TABLE orders ADD COLUMN last_occurrence_date timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
    ALTER TABLE orders ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_by') THEN
    ALTER TABLE orders ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;