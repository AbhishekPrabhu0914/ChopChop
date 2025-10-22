-- Migration to add chat_history column to existing Users table
-- Run this in your Supabase SQL Editor

-- Add chat_history column if it doesn't exist
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS chat_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Update any existing records to have empty chat_history
UPDATE "Users" 
SET chat_history = '[]'::jsonb 
WHERE chat_history IS NULL;

-- Verify the schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;
