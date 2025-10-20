# Amazon Cognito Authentication Setup

This guide explains how to set up Amazon Cognito authentication for ChopChop.

## Prerequisites

1. AWS Account
2. AWS CLI configured (optional, for easier setup)

## Step 1: Create Cognito User Pool

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click "Create user pool"
3. Configure sign-in experience:
   - Choose "Email" as the sign-in option
   - Keep "Cognito user pool" as the user pool sign-in options
4. Configure security requirements:
   - Set password policy (minimum 8 characters recommended)
   - Enable MFA if desired
5. Configure sign-up experience:
   - Enable self-registration
   - Choose required attributes (email is required)
6. Configure message delivery:
   - Choose "Send email with Cognito"
7. Integrate your app:
   - Give your user pool a name (e.g., "chopchop-users")
   - Choose "Public client" for the app client
   - Generate a client secret (optional but recommended for production)
8. Review and create the user pool

## Step 2: Configure App Client

1. In your user pool, go to "App integration" > "App clients"
2. Note down:
   - **User Pool ID** (e.g., `us-east-1_XXXXXXXXX`)
   - **App Client ID** (e.g., `1234567890abcdef1234567890`)
3. Configure app client settings:
   - Enable "ALLOW_USER_SRP_AUTH" for authentication flow
   - Enable "ALLOW_REFRESH_TOKEN_AUTH" for token refresh

## Step 3: Environment Variables

Add these to your `.env.local` file:

```bash
# Amazon Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_app_client_id

# Example:
# NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
# NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdef1234567890
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Go to the landing page
3. Click "Sign In" to open the authentication modal
4. Try both "Sign Up" and "Sign In" flows
5. Check your email for verification codes (if email verification is enabled)

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Email Verification**: New users receive verification emails
- **Secure Sessions**: JWT tokens managed by Cognito
- **Password Reset**: Built-in password reset functionality
- **User Management**: Admin can manage users through AWS Console

## Advanced Configuration

### Password Policies
- Minimum length: 8 characters
- Require uppercase, lowercase, numbers, special characters
- Password expiration (optional)

### MFA (Multi-Factor Authentication)
- SMS-based MFA
- TOTP-based MFA
- Email-based MFA

### Social Sign-In (Optional)
- Google
- Facebook
- Amazon
- Apple

## Troubleshooting

- **User Pool ID/Client ID**: Make sure these are correctly set in environment variables
- **CORS Issues**: Ensure your domain is added to allowed origins in Cognito
- **Email Delivery**: Check if SES is configured for email delivery
- **Token Expiration**: Configure appropriate token expiration times

## Security Best Practices

- Use HTTPS in production
- Enable MFA for sensitive applications
- Regularly rotate app client secrets
- Monitor authentication logs in CloudWatch
- Use least privilege IAM policies
