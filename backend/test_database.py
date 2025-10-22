#!/usr/bin/env python3
"""
Test script to check database connection and table structure
"""

import os
import sys
import json
from supabase_config import SupabaseManager

def test_database_connection():
    """Test database connection and table structure"""
    print("🔍 Testing database connection...")
    
    # Initialize Supabase manager
    supabase_manager = SupabaseManager()
    
    if not supabase_manager.enabled:
        print("❌ Supabase is not enabled. Check environment variables.")
        return False
    
    print("✅ Supabase is enabled")
    
    try:
        # Test basic connection by trying to select from Users table
        print("🔍 Testing Users table access...")
        result = supabase_manager.supabase.table('Users').select('*').limit(1).execute()
        print(f"✅ Users table accessible. Found {len(result.data)} records")
        
        # Test table structure by trying to insert a test record
        print("🔍 Testing table structure...")
        test_data = {
            'email': 'test@example.com',
            'items': json.dumps([]),
            'recipes': json.dumps([]),
            'grocery_list': json.dumps([])
        }
        
        # Try to insert test data
        insert_result = supabase_manager.supabase.table('Users').insert(test_data).execute()
        if insert_result.data:
            print("✅ Table structure is correct - can insert data with existing schema")
            
            # Clean up test data
            test_id = insert_result.data[0]['id']
            supabase_manager.supabase.table('Users').delete().eq('id', test_id).execute()
            print("✅ Test data cleaned up")
            return True
        else:
            print("❌ Failed to insert test data")
            return False
            
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        
        # Check if it's a column issue
        if 'column' in str(e).lower() and 'does not exist' in str(e).lower():
            print("💡 This looks like a missing column error. You need to run the migration:")
            print("   1. Go to Supabase SQL Editor")
            print("   2. Run the migration from add_chat_history_migration.sql")
        elif 'relation' in str(e).lower() and 'does not exist' in str(e).lower():
            print("💡 This looks like a missing table error. You need to create the user_data table:")
            print("   1. Go to Supabase SQL Editor") 
            print("   2. Run the schema from supabase_schema.sql")
        
        return False

if __name__ == "__main__":
    success = test_database_connection()
    if success:
        print("\n🎉 Database connection test passed!")
        sys.exit(0)
    else:
        print("\n💥 Database connection test failed!")
        sys.exit(1)
