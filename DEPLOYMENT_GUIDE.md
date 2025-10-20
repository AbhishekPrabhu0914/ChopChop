# 🚀 ChopChop Vercel Deployment Guide

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Backend Configuration
- `PYTHON_BACKEND_URL` - URL of your deployed Python backend (e.g., `https://your-backend.herokuapp.com`)

### Optional AWS Configuration (if using direct Bedrock integration)
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

## Deployment Steps

### 1. Prepare Your Repository
- Ensure all code is committed to your Git repository
- Make sure your `package.json` and `vercel.json` are properly configured

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Set the Root Directory to `nova-chat-frontend`
6. Add environment variables in the Vercel dashboard
7. Click "Deploy"

### 3. Configure Environment Variables in Vercel
1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each required variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PYTHON_BACKEND_URL`

### 4. Backend Deployment Options

Since your Python backend can't run on Vercel, you have several options:

#### Option A: Deploy Backend Separately
- Deploy to Heroku, Railway, or DigitalOcean
- Update `PYTHON_BACKEND_URL` to point to your deployed backend

#### Option B: Use Vercel Serverless Functions
- Convert your Python backend to Node.js/TypeScript
- Create API routes in the `src/app/api/` directory

#### Option C: Use AWS Lambda + API Gateway
- Convert your Python backend to AWS Lambda functions
- Use API Gateway to expose the endpoints

## Important Notes

1. **Backend Dependency**: Your current setup requires a separate Python backend. Vercel only hosts the frontend.

2. **API Routes**: Your existing API routes in `src/app/api/` will work as Vercel serverless functions.

3. **Database**: Make sure your Supabase database is properly configured and accessible from production.

4. **CORS**: Ensure your backend allows requests from your Vercel domain.

## Troubleshooting

### Common Issues:
1. **Environment Variables**: Make sure all required env vars are set in Vercel
2. **Build Errors**: Check that all dependencies are in `package.json`
3. **API Errors**: Verify your backend URL is correct and accessible
4. **CORS Issues**: Configure your backend to allow your Vercel domain

### Build Commands:
- Build: `npm run build`
- Start: `npm run start`
- Dev: `npm run dev`
