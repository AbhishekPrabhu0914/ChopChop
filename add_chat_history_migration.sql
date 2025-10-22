-- Migration to add chat_history column to existing user_data table
-- Run this in your Supabase SQL editor

-- Add chat_history column if it doesn't exist
ALTER TABLE user_data 
ADD COLUMN IF NOT EXISTS chat_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Update the view to include chat_history
CREATE OR REPLACE VIEW user_data_view AS
SELECT 
    id,
    email,
    items,
    recipes,
    chat_history,
    created_at,
    updated_at,
    jsonb_array_length(items) as item_count,
    jsonb_array_length(recipes) as recipe_count,
    jsonb_array_length(chat_history) as chat_count
FROM user_data;

-- Grant access to the updated view
GRANT SELECT ON user_data_view TO authenticated;
GRANT SELECT ON user_data_view TO service_role;
