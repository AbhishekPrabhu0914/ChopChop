#!/usr/bin/env python3
"""
Check the exact schema by trying to insert data
"""

import os
import sys
import json
from supabase_config import SupabaseManager

def check_schema():
    """Check the exact schema by trying to insert data"""
    print("🔍 Checking Users table schema by testing insert...")
    
    supabase_manager = SupabaseManager()
    
    if not supabase_manager.enabled:
        print("❌ Supabase is not enabled")
        return
    
    try:
        # Try to insert minimal data to see what columns are required
        test_data = {
            'email': 'schema_test@example.com',
            'items': json.dumps([]),
            'recipes': json.dumps([]),
            'grocery_list': json.dumps([])
        }
        
        print("🔍 Trying to insert with basic columns...")
        result = supabase_manager.supabase.table('Users').insert(test_data).execute()
        
        if result.data:
            print("✅ Insert successful with basic columns")
            print(f"📋 Inserted record: {result.data[0]}")
            
            # Clean up
            record_id = result.data[0]['id']
            supabase_manager.supabase.table('Users').delete().eq('id', record_id).execute()
            print("✅ Test record cleaned up")
            
            # Now try to get the record to see all columns
            print("\n🔍 Checking what columns are returned...")
            get_result = supabase_manager.supabase.table('Users').select('*').eq('email', 'schema_test@example.com').execute()
            if get_result.data:
                print(f"📋 All columns in record: {list(get_result.data[0].keys())}")
            else:
                print("📋 No records found (already cleaned up)")
                
        else:
            print("❌ Insert failed")
            
    except Exception as e:
        print(f"❌ Error checking schema: {e}")
        
        # Try to parse the error to understand what's missing
        error_str = str(e)
        if 'column' in error_str.lower():
            print("💡 This looks like a column-related error. The schema might be different than expected.")

if __name__ == "__main__":
    check_schema()
