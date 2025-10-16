#!/bin/bash

# Nova Chat Frontend Setup Script

echo "🚀 Setting up Nova Chat Frontend..."

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Optional: If using AWS SSO or IAM roles, you can leave the above empty
# and configure AWS credentials through AWS CLI or IAM roles
EOF
    echo "✅ Created .env.local file. Please update it with your AWS credentials."
else
    echo "✅ .env.local file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your AWS credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Make sure you have:"
echo "- AWS credentials configured"
echo "- Bedrock runtime permissions"
echo "- Nova Lite model access in your region"
