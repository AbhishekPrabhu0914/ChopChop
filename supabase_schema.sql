-- ChopChop Database Schema for Supabase
-- This file contains the SQL commands to set up the database schema

-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    recipes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data(email);
CREATE INDEX IF NOT EXISTS idx_user_data_created_at ON user_data(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_data_updated_at 
    BEFORE UPDATE ON user_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only access their own data
CREATE POLICY "Users can view their own data" ON user_data
    FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can insert their own data" ON user_data
    FOR INSERT WITH CHECK (auth.email() = email);

CREATE POLICY "Users can update their own data" ON user_data
    FOR UPDATE USING (auth.email() = email);

CREATE POLICY "Users can delete their own data" ON user_data
    FOR DELETE USING (auth.email() = email);

-- Grant necessary permissions
GRANT ALL ON user_data TO authenticated;
GRANT ALL ON user_data TO service_role;

-- Create a view for easy querying of user data
CREATE OR REPLACE VIEW user_data_view AS
SELECT 
    id,
    email,
    items,
    recipes,
    created_at,
    updated_at,
    jsonb_array_length(items) as item_count,
    jsonb_array_length(recipes) as recipe_count
FROM user_data;

-- Grant access to the view
GRANT SELECT ON user_data_view TO authenticated;
GRANT SELECT ON user_data_view TO service_role;
