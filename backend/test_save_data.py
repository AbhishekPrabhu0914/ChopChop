#!/usr/bin/env python3
"""
Test script to check save-data endpoint functionality
"""

import requests
import json

def test_save_data():
    """Test the save-data endpoint"""
    print("🔍 Testing save-data endpoint...")
    
    # Test data
    test_data = {
        "email": "test@example.com",
        "items": [
            {"name": "Test Item", "quantity": "1", "category": "test"}
        ],
        "recipes": [
            {"name": "Test Recipe", "ingredients": ["Test Item"], "instructions": "Test instructions"}
        ]
    }
    
    try:
        # Test with local backend
        response = requests.post(
            "http://localhost:10000/save-data",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ save-data endpoint working correctly!")
            return True
        else:
            print("❌ save-data endpoint failed")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on localhost:10000")
        return False
    except Exception as e:
        print(f"❌ Error testing save-data: {e}")
        return False

if __name__ == "__main__":
    success = test_save_data()
    if success:
        print("\n🎉 save-data test passed!")
        exit(0)
    else:
        print("\n💥 save-data test failed!")
        exit(1)
