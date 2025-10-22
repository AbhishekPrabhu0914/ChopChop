# 🔧 AWS Credentials Setup for Render Backend

## The Issue
The error `"Unable to locate credentials"` occurs because the Python backend on Render doesn't have access to AWS credentials needed for Amazon Bedrock.

## ✅ Solution: Configure AWS Environment Variables in Render

### Step 1: Get Your AWS Credentials

1. **Go to AWS Console** → IAM → Users → Your User
2. **Click "Security credentials" tab**
3. **Create Access Key** (if you don't have one)
4. **Copy the Access Key ID and Secret Access Key**

### Step 2: Configure Render Environment Variables

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Select your `chopchop-backend` service**
3. **Click on "Environment" tab**
4. **Add these environment variables:**

```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your_access_key_id_here
AWS_SECRET_ACCESS_KEY = your_secret_access_key_here
```

### Step 3: Required AWS Permissions

Your AWS user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0"
            ]
        }
    ]
}
```

### Step 4: Redeploy Backend

1. **In Render Dashboard** → Your Backend Service
2. **Click "Manual Deploy"** → "Deploy latest commit"
3. **Wait for deployment to complete**

## 🔍 Verification

After deployment, check the logs:

1. **Go to Render Dashboard** → Your Backend Service → "Logs"
2. **Look for these messages:**
   ```
   Initializing Bedrock client with region: us-east-1
   Bedrock client initialized successfully
   ```

## 🚨 Troubleshooting

### If you still get credential errors:

1. **Double-check environment variables** in Render dashboard
2. **Verify AWS credentials** are correct
3. **Check AWS permissions** for Bedrock access
4. **Ensure region** is set to `us-east-1`

### If you get permission errors:

1. **Verify IAM policy** includes Bedrock permissions
2. **Check resource ARN** matches your model
3. **Ensure user** has the policy attached

## 📋 Environment Variables Summary

**Required for Backend:**
- `AWS_REGION` = `us-east-1`
- `AWS_ACCESS_KEY_ID` = `your_key_here`
- `AWS_SECRET_ACCESS_KEY` = `your_secret_here`
- `SUPABASE_URL` = `your_supabase_url`
- `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_key`

**Required for Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
- `PYTHON_BACKEND_URL` = `https://chopchop-kqae.onrender.com`

## 🎯 Expected Result

After proper configuration:
- ✅ Backend starts without AWS credential errors
- ✅ Image analysis works in production
- ✅ Nova Pro model responds correctly
- ✅ Recipes are generated successfully

---

**Need help?** Check the Render logs for detailed error messages after deployment.
