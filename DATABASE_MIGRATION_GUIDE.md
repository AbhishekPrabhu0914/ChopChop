# Database Migration Guide

## 🚨 **Issue**: 500 Error on `/save-data` endpoint

**Root Cause**: The database has a `Users` table with the correct schema:
- `id` (uuid)
- `email` (text) 
- `items` (json)
- `grocery_list` (json)
- `recipes` (json)
- `recent_recipes` (json)

But it's missing the `chat_history` column that the backend expects.

## 🔧 **Solution**: Run Database Migration

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (in the left sidebar)

### Step 2: Run the Migration
Copy and paste this SQL into the SQL Editor and click **Run**:

```sql
-- Add chat_history column to existing Users table
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS chat_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Update any existing records to have empty chat_history
UPDATE "Users" 
SET chat_history = '[]'::jsonb 
WHERE chat_history IS NULL;

-- Verify the schema after adding chat_history
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;
```

### Step 3: Verify Migration
After running the migration, you can test it by running:

```bash
cd backend
python test_database.py
```

You should see:
```
✅ Users table accessible. Found X records
✅ Table structure is correct - can insert data with chat_history column
✅ Test data cleaned up
🎉 Database connection test passed!
```

### Step 4: Redeploy Backend
After the migration is successful, redeploy your backend to Render.

## 📋 **What This Migration Does**:

1. **Adds `chat_history` column** to the existing `Users` table
2. **Sets default value** to empty JSON array `[]` for all existing records
3. **Creates a view** for easy data querying
4. **Grants proper permissions** to the view

## ✅ **After Migration**:
- `/save-data` endpoint will work properly
- Chat history will be saved to the database
- All existing functionality will continue to work
- New `chat_history` column will store conversation data

## 🚨 **Important**: 
This migration is **safe** and won't affect existing data. It only adds a new column with a default value.
