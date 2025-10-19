#!/usr/bin/env python3
"""
Test script for Supabase integration
Run this to test if Supabase is properly configured
"""

import os
import sys
from supabase_config import supabase_manager

def test_supabase_connection():
    """Test basic Supabase connection"""
    try:
        # Test saving data
        test_email = "test@example.com"
        test_items = [
            {
                "item": "Test Item",
                "category": "test",
                "needed_for": "testing",
                "priority": "medium",
                "checked": False
            }
        ]
        test_recipes = [
            {
                "name": "Test Recipe",
                "description": "A test recipe",
                "cooking_time": "30 minutes",
                "difficulty": "Easy",
                "servings": "2 servings",
                "ingredients_needed": [
                    {
                        "name": "test ingredient",
                        "amount": "1 cup",
                        "available": True
                    }
                ],
                "instructions": ["Step 1: Test", "Step 2: Complete"],
                "tips": "This is a test recipe"
            }
        ]
        
        print("🧪 Testing Supabase integration...")
        
        # Test save
        print("1. Testing save functionality...")
        record_id = supabase_manager.save_user_data(test_email, test_items, test_recipes)
        if record_id:
            print(f"   ✅ Data saved successfully with ID: {record_id}")
        else:
            print("   ❌ Failed to save data")
            return False
        
        # Test retrieve
        print("2. Testing retrieve functionality...")
        user_data = supabase_manager.get_user_data(test_email)
        if user_data and user_data['items'] and user_data['recipes']:
            print(f"   ✅ Data retrieved successfully: {len(user_data['items'])} items, {len(user_data['recipes'])} recipes")
        else:
            print("   ❌ Failed to retrieve data")
            return False
        
        # Test update
        print("3. Testing update functionality...")
        updated_items = test_items + [{"item": "Updated Item", "category": "test", "needed_for": "testing", "priority": "high", "checked": False}]
        success = supabase_manager.update_user_data(test_email, updated_items, test_recipes)
        if success:
            print("   ✅ Data updated successfully")
        else:
            print("   ❌ Failed to update data")
            return False
        
        print("\n🎉 All Supabase tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        return False

def test_email_configuration():
    """Test email configuration (without actually sending)"""
    print("\n📧 Testing email configuration...")
    
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if smtp_user and smtp_password:
        print("   ✅ Email credentials found")
        print(f"   📧 SMTP User: {smtp_user}")
        print("   🔐 SMTP Password: [HIDDEN]")
        return True
    else:
        print("   ⚠️  Email credentials not configured")
        print("   💡 Set SMTP_USER and SMTP_PASSWORD environment variables to enable email")
        return False

if __name__ == "__main__":
    print("🚀 ChopChop Supabase Integration Test")
    print("=" * 50)
    
    # Check environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase environment variables not set!")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("See SUPABASE_SETUP.md for instructions")
        sys.exit(1)
    
    print(f"🔗 Supabase URL: {supabase_url}")
    print(f"🔑 Service Role Key: {supabase_key[:10]}...")
    
    # Run tests
    supabase_success = test_supabase_connection()
    email_configured = test_email_configuration()
    
    print("\n" + "=" * 50)
    if supabase_success:
        print("✅ Supabase integration is working correctly!")
        if email_configured:
            print("✅ Email integration is configured!")
        else:
            print("⚠️  Email integration not configured (optional)")
        print("\n🎉 Your ChopChop app is ready to use with Supabase!")
    else:
        print("❌ Supabase integration failed!")
        print("Please check your configuration and try again.")
        sys.exit(1)
