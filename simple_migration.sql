-- Simple migration to add chat_history column to Users table
-- Your current schema: id (uuid), email (text), items (json), grocery_list (json), recipes (json), recent_recipes (json)

-- Add chat_history column
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS chat_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Update existing records to have empty chat_history
UPDATE "Users" 
SET chat_history = '[]'::jsonb 
WHERE chat_history IS NULL;

-- Verify the new schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;
