# Supabase Setup Guide for ChopChop

This guide will help you set up Supabase integration with your ChopChop application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Choose a name for your project (e.g., "chopchop-app")
4. Set a database password and choose a region
5. Wait for the project to be created

## 2. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase_schema.sql` into the editor
3. Run the SQL to create the `user_data` table and related functions

## 3. Get API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (secret)

## 4. Configure Environment Variables

### Backend (.env file in backend/ directory)
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS Configuration (existing)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Frontend (.env.local file in nova-chat-frontend/ directory)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Email Configuration (Optional)

To enable email functionality:

1. **Gmail Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password:
     - Go to Google Account settings
     - Security > 2-Step Verification > App passwords
     - Generate a password for "Mail"
   - Use this app password in `SMTP_PASSWORD`

2. **Other Email Providers:**
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` accordingly

## 6. Database Schema Details

The `user_data` table has the following structure:
- `id`: UUID (primary key)
- `email`: VARCHAR(255) (unique, indexed)
- `items`: JSONB (grocery items array)
- `recipes`: JSONB (recipes array)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP (auto-updated)

## 7. Row Level Security (RLS)

The table is protected with RLS policies:
- Users can only access their own data based on email
- Service role has full access for backend operations

## 8. Features Enabled

With Supabase integration, you get:
- ✅ **Data Persistence**: Save and load grocery lists and recipes
- ✅ **Email Integration**: Send formatted emails with your data
- ✅ **User Management**: Email-based user identification
- ✅ **Real-time Updates**: Data syncs across sessions
- ✅ **Security**: Row-level security protects user data

## 9. API Endpoints

New backend endpoints:
- `POST /save-data` - Save user data to Supabase
- `POST /get-data` - Retrieve user data from Supabase
- `POST /update-data` - Update existing user data
- `POST /send-email` - Send email with grocery list and recipes

## 10. Testing the Integration

1. Start the application: `./start_chopchop.sh`
2. Upload a fridge photo to generate data
3. Click "Save Data" and enter your email
4. Click "Load Data" to retrieve saved data
5. Click "Send Email" to receive a formatted email

## Troubleshooting

### Common Issues:

1. **"Supabase URL and Service Role Key must be set"**
   - Check that your `.env` file is in the `backend/` directory
   - Verify the environment variable names are correct

2. **"Failed to save data"**
   - Check your Supabase service role key
   - Verify the database schema was created correctly

3. **"Failed to send email"**
   - Check your SMTP credentials
   - For Gmail, ensure you're using an App Password, not your regular password

4. **Frontend Supabase errors**
   - Check that `.env.local` is in the `nova-chat-frontend/` directory
   - Verify the environment variable names start with `NEXT_PUBLIC_`

### Getting Help:

- Check the Supabase dashboard logs for database errors
- Check the browser console for frontend errors
- Check the backend logs for API errors
