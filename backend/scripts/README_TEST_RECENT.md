Test recent recipes script and verification

This folder contains a small script to exercise the recent-recipes endpoints and instructions your friend (who has DB access) can use to verify writes in Supabase.

1) How your friend can run the quick API test (from their machine with proper DB keys not required):

# Start backend (if not already running)
# From backend/ folder
source .venv/bin/activate
python nova_backend.py

# In another shell, run the test script
cd backend
python scripts/test_recent_recipes.py

This will:
- Sign in as testuser@example.com
- Add a recent recipe
- Retrieve the recent recipes and print the response

2) CURL examples (they can also run these manually):

# Sign in
curl -X POST http://localhost:8000/auth/signin -H "Content-Type: application/json" -d '{"email":"testuser@example.com"}'

# Add recent recipe (replace <SESSION_ID> with returned session_id)
curl -X POST http://localhost:8000/recent-recipes/add -H "Content-Type: application/json" -d '{"session_id":"<SESSION_ID>","recipe":{"id":"script-recipe-1","name":"Scripted Test Recipe"}}'

# Get recent recipes
curl -X POST http://localhost:8000/recent-recipes/get -H "Content-Type: application/json" -d '{"session_id":"<SESSION_ID>"}'

3) SQL your friend can run in Supabase Table Editor to confirm the recent_recipes column updated for the user email:

-- Show recent_recipes for the test user
SELECT id, email, recent_recipes
FROM public."Users"
WHERE email = 'testuser@example.com';

4) Notes
- The backend manages sessions in-memory. If the backend restarts, previously returned session_ids become invalid. Re-run signin if you see "Invalid or expired session".
- `backend/.env` contains Supabase keys and should NOT be committed to Git. It's ignored by .gitignore. 
- If your friend wants to test with their own email, change `TEST_EMAIL` env var before running the script.

