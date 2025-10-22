# 🚀 ChopChop Deployment Guide - chopchop.vercel.app

## Quick Deployment Steps

### 1. Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository** (ChopChop)
5. **Configure the project:**
   - **Project Name**: `chopchop`
   - **Root Directory**: `nova-chat-frontend`
   - **Framework Preset**: Next.js
6. **Add Environment Variables** (see below)
7. **Click "Deploy"**

### 2. Set Custom Domain

After deployment:

1. **Go to your project dashboard**
2. **Click on "Settings" tab**
3. **Click on "Domains"**
4. **Add Domain**: `chopchop.vercel.app`
5. **Verify the domain** (Vercel will handle this automatically)

## Required Environment Variables

Set these in your Vercel project settings:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://afvyuqrmqspoyudubswb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdnl1cXJtcXNwb3l1ZHVic3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDM2MDIsImV4cCI6MjA3NjMxOTYwMn0.v4XNngB5B-XxEIJRKH9ujKpSUPix1hbmQt3kNQGRhqM
```

### Backend Configuration
```
PYTHON_BACKEND_URL=https://chopchop-kqae.onrender.com
```

## Project Structure

```
ChopChop/
├── nova-chat-frontend/          # Next.js frontend (deployed to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/             # API routes
│   │   │   └── page.tsx         # Main page
│   │   ├── components/          # React components
│   │   └── lib/                 # Utilities
│   ├── package.json
│   └── next.config.ts
├── backend/                     # Python backend (deployed to Render)
│   ├── nova_backend.py
│   └── requirements.txt
├── vercel.json                  # Vercel configuration
└── render.yaml                  # Render configuration
```

## Features Included

✅ **40MB Image Upload Support** - Chunked uploads for large images
✅ **Progressive Image Compression** - Smart compression with quality adjustment
✅ **Real-time Upload Progress** - Visual progress indicators
✅ **Backend URL Configuration** - Properly configured API endpoints
✅ **Supabase Integration** - User data persistence
✅ **Email Functionality** - Send grocery lists and recipes
✅ **Responsive Design** - Works on all devices

## Deployment URLs

- **Frontend**: https://chopchop.vercel.app
- **Backend**: https://chopchop-kqae.onrender.com
- **Supabase**: https://afvyuqrmqspoyudubswb.supabase.co

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all environment variables are set
   - Ensure `PYTHON_BACKEND_URL` is accessible
   - Verify Supabase credentials

2. **API Errors**
   - Check backend URL is correct
   - Verify backend is running on Render
   - Check network connectivity

3. **Image Upload Issues**
   - Large images (>5MB) use chunked upload
   - Check browser console for errors
   - Verify Vercel function limits

### Environment Variable Issues

If you see errors about missing environment variables:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all required variables listed above
3. Redeploy the project

## Performance Optimizations

- **Image Compression**: Automatic compression for files >5MB
- **Chunked Uploads**: Large files uploaded in 3MB chunks
- **Progressive Loading**: Smart quality reduction
- **Caching**: Optimized for Vercel's CDN

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check Vercel dashboard for API errors
- **Backend Logs**: Monitor Render dashboard for backend issues

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure backend is running and accessible
4. Check Vercel function logs for API issues

---

**Ready to deploy?** Follow the steps above and your ChopChop app will be live at `chopchop.vercel.app`! 🎉
