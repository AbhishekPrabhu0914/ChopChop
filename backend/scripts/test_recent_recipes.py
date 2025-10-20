#!/usr/bin/env python3
"""
Simple test client to sign in, add a recent recipe, and fetch recent recipes.

Usage:
  python scripts/test_recent_recipes.py

Requires: requests (pip install requests)
Set SERVER_URL env var if backend not at http://localhost:8000
Optionally set TEST_EMAIL env var to choose the email used for signin.
"""

import os
import requests
import json

server = os.getenv("SERVER_URL", "http://localhost:8000")
email = os.getenv("TEST_EMAIL", "testuser@example.com")


def signin():
    resp = requests.post(f"{server}/auth/signin", json={"email": email})
    print("SIGNIN ->", resp.status_code, resp.text)
    resp.raise_for_status()
    return resp.json().get("session_id")


def add_recent(session_id):
    recipe = {
        "id": "script-recipe-1",
        "name": "Scripted Test Recipe",
        "description": "Test recipe added by script",
        "cooking_time": "5 minutes",
        "difficulty": "Easy",
        "servings": "1",
        "ingredients_needed": [{"name": "ingredient", "amount": "1", "available": True}],
        "instructions": ["Do something quick"],
        "tips": "No tips"
    }
    resp = requests.post(f"{server}/recent-recipes/add", json={"session_id": session_id, "recipe": recipe})
    print("ADD ->", resp.status_code, resp.text)
    resp.raise_for_status()


def get_recent(session_id):
    resp = requests.post(f"{server}/recent-recipes/get", json={"session_id": session_id})
    print("GET ->", resp.status_code, resp.text)
    resp.raise_for_status()
    return resp.json()


def main():
    print("Server:", server)
    print("Email:", email)
    try:
        sid = signin()
        print("Got session_id:", sid)
        add_recent(sid)
        data = get_recent(sid)
        print("Recent recipes response:\n", json.dumps(data, indent=2))
    except Exception as e:
        print("Error during test:", e)


if __name__ == '__main__':
    main()
