#!/usr/bin/env python3
"""
Check the exact schema of the Users table
"""

import os
import sys
from supabase_config import SupabaseManager

def check_schema():
    """Check the exact schema of the Users table"""
    print("🔍 Checking Users table schema...")
    
    supabase_manager = SupabaseManager()
    
    if not supabase_manager.enabled:
        print("❌ Supabase is not enabled")
        return
    
    try:
        # Get a sample record to see the exact column names
        result = supabase_manager.supabase.table('Users').select('*').limit(1).execute()
        
        if result.data:
            print("✅ Users table has data")
            sample_record = result.data[0]
            print(f"📋 Available columns: {list(sample_record.keys())}")
            
            # Show data types
            for key, value in sample_record.items():
                print(f"  - {key}: {type(value).__name__} = {str(value)[:100]}...")
        else:
            print("📋 Users table is empty, checking schema via information_schema...")
            
            # Try to get schema info
            schema_result = supabase_manager.supabase.rpc('get_table_columns', {'table_name': 'Users'}).execute()
            if schema_result.data:
                print(f"📋 Schema info: {schema_result.data}")
            else:
                print("❌ Could not get schema information")
                
    except Exception as e:
        print(f"❌ Error checking schema: {e}")

if __name__ == "__main__":
    check_schema()
