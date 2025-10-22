# Database Migration Instructions

## Problem
The backend was trying to use a `Users` table with a `chat_history` column, but the actual database schema uses a `user_data` table without the `chat_history` column.

## Solution
1. **Updated the database schema** to include `chat_history` column in `user_data` table
2. **Updated all backend code** to use `user_data` table instead of `Users` table
3. **Created migration script** to add the column to existing databases

## Steps to Fix

### 1. Run the Migration in Supabase
Go to your Supabase dashboard → SQL Editor and run this migration:

```sql
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
```

### 2. Redeploy the Backend
The backend code has been updated to use the correct table name (`user_data` instead of `Users`), so redeploy your backend to Render.

### 3. Test
After migration and redeployment, test the chat functionality to ensure chat history is being saved properly.

## Files Changed
- `supabase_schema.sql` - Added chat_history column
- `backend/supabase_config.py` - Updated all table references from 'Users' to 'user_data'
- `add_chat_history_migration.sql` - Migration script for existing databases
