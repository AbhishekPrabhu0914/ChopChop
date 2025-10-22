# AWS Credentials Setup for Render

## Problem
Render deployment cannot access AWS Bedrock/Nova because AWS credentials are not configured.

## Solution

### Step 1: Get Your AWS Credentials
If you don't have AWS credentials yet, create them:

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Username: `chopchop-render-user`
4. Attach policies:
   - `AmazonBedrockFullAccess` (for Nova model access)
   - Or create custom policy with these permissions:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "bedrock:InvokeModel",
             "bedrock:InvokeModelWithResponseStream",
             "bedrock:Converse",
             "bedrock:ConverseStream"
           ],
           "Resource": "*"
         }
       ]
     }
     ```
5. Go to "Security credentials" tab → "Create access key"
6. Choose "Application running outside AWS"
7. Copy the **Access Key ID** and **Secret Access Key**

### Step 2: Configure Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your `chopchop-backend` service
3. Go to "Environment" tab
4. Add these environment variables:

```
AWS_ACCESS_KEY_ID = your-access-key-id
AWS_SECRET_ACCESS_KEY = your-secret-access-key
AWS_REGION = us-east-1
SUPABASE_URL = https://afvyuqrmqspoyudubswb.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-supabase-service-role-key
FLASK_DEBUG = false
```

### Step 3: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Check the logs for AWS initialization messages

### Step 4: Verify AWS Access
Check the health endpoint: `https://your-render-url.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "aws_configured": true,
  "aws_client_ready": true,
  "aws_region": "us-east-1"
}
```

## Troubleshooting

### If AWS credentials are still not working:

1. **Check Render logs** for AWS errors
2. **Verify region**: Nova Pro is available in `us-east-1`
3. **Test locally** with the same credentials:
   ```bash
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   export AWS_REGION=us-east-1
   cd backend
   python3 -c "from aws_config import setup_aws; print(setup_aws())"
   ```

### Common Issues:
- **Wrong region**: Nova Pro is only available in `us-east-1`
- **Insufficient permissions**: Need Bedrock invoke permissions
- **Credential format**: Make sure no extra spaces in Render dashboard
- **Service restart**: Render may need a restart after adding env vars

## Security Notes
- Never commit AWS credentials to git
- Use least-privilege IAM policies
- Consider using AWS IAM roles for better security (advanced)
