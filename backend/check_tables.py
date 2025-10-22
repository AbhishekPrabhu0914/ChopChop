#!/usr/bin/env python3
"""
Check what tables exist in the database
"""

import os
import sys
from supabase_config import SupabaseManager

def check_tables():
    """Check what tables exist in the database"""
    print("🔍 Checking database tables...")
    
    supabase_manager = SupabaseManager()
    
    if not supabase_manager.enabled:
        print("❌ Supabase is not enabled")
        return
    
    try:
        # Try to access the Users table (old table)
        print("🔍 Checking Users table...")
        result = supabase_manager.supabase.table('Users').select('*').limit(1).execute()
        print(f"✅ Users table exists with {len(result.data)} records")
        
        # Check if it has the columns we need
        if result.data:
            sample_record = result.data[0]
            print(f"📋 Users table columns: {list(sample_record.keys())}")
            
            # Check if chat_history column exists
            if 'chat_history' in sample_record:
                print("✅ chat_history column exists in Users table")
            else:
                print("❌ chat_history column missing in Users table")
        
    except Exception as e:
        print(f"❌ Users table check failed: {e}")
    
    try:
        # Try to access the user_data table (new table)
        print("\n🔍 Checking user_data table...")
        result = supabase_manager.supabase.table('user_data').select('*').limit(1).execute()
        print(f"✅ user_data table exists with {len(result.data)} records")
        
    except Exception as e:
        print(f"❌ user_data table check failed: {e}")

if __name__ == "__main__":
    check_tables()
