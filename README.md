# ChopChop Full-Stack Application

A modern chat interface for Amazon Nova Lite model with a Python Flask backend and Next.js React frontend.

## Architecture

```
Frontend (Next.js) → Backend API → Python Flask → AWS Bedrock Nova Lite
```

- **Frontend**: Next.js + React + TypeScript (port 3000)
- **Backend**: Python Flask API (port 8000) 
- **AI Model**: Amazon Nova Lite via AWS Bedrock

## Features

- 💬 Real-time chat interface with Nova Pro
- 🖼️ Image upload and analysis with structured output
- 🛒 Interactive grocery list management
- 👨‍🍳 Recipe browsing and detailed views
- 📧 Email integration for sharing lists and recipes
- 💾 Data persistence with Supabase
- 📱 Responsive design with tabbed interface
- ⚡ Fast and modern UI
- 🔒 Secure backend API integration
- 🐍 Python backend with AWS Bedrock integration

## Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start_chopchop.sh
```

### Option 2: Manual setup

1. **Start Python Backend**:
   ```bash
   source venv/bin/activate
   cd backend
   python nova_backend.py
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd nova-chat-frontend
   npm run dev
   ```

3. **Open the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- AWS Account with Bedrock access
- Supabase Account (for data persistence and email)

### Backend Setup (Python)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Supabase** (Required):
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create a `.env` file in the `backend/` directory with your Supabase credentials

3. **Configure AWS credentials**:
   ```bash
   aws configure
   # OR set environment variables:
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   ```

4. **Test Supabase integration**:
   ```bash
   cd backend
   python test_supabase.py
   ```

### Frontend Setup (Next.js)

1. **Install dependencies**:
   ```bash
   cd nova-chat-frontend
   npm install
   ```

2. **Configure Supabase** (Required):
   Create a `.env.local` file in the `nova-chat-frontend/` directory:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Usage

1. **Text Chat**: Type your message and press Enter
2. **Fridge Photo Analysis**: Click "📸 Upload Fridge Photo" to analyze ingredients and generate recipes
3. **Grocery List Management**: Switch to the "🛒 Grocery List" tab to manage your shopping list
4. **Recipe Browsing**: Switch to the "👨‍🍳 Recipes" tab to view detailed recipes
5. **Data Persistence**: Use "💾 Save Data" to save your lists and recipes
6. **Email Sharing**: Use "📧 Send Email" to share your grocery list and recipes via email

## API Endpoints

### Backend (Python Flask)
- `GET /health` - Health check
- `POST /chat` - Send messages to Nova Pro model
- `POST /save-data` - Save user data to Supabase
- `POST /get-data` - Retrieve user data from Supabase
- `POST /update-data` - Update user data in Supabase
- `POST /send-email` - Send email with grocery list and recipes

### Frontend (Next.js)
- `POST /api/chat` - Proxy to Python backend
- `POST /api/send-email` - Proxy for email sending

## Project Structure

```
Cairt/
├── backend/                    # Python backend
│   ├── nova_backend.py        # Flask API server
│   ├── supabase_config.py     # Supabase integration
│   ├── test_supabase.py       # Supabase test script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── nova-chat-frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/route.ts        # Chat API proxy
│   │   │   │   └── send-email/route.ts  # Email API proxy
│   │   │   └── page.tsx                 # Main page
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx        # Main chat component
│   │   │   ├── GroceryList.tsx          # Grocery list component
│   │   │   └── Recipes.tsx              # Recipes component
│   │   └── lib/
│   │       └── supabase.ts              # Supabase client
│   ├── .env.local             # Frontend environment variables
│   └── package.json
├── supabase_schema.sql        # Database schema
├── SUPABASE_SETUP.md          # Supabase setup guide
├── start_chopchop.sh         # Startup script
└── README.md                  # This file
```

## Environment Variables

### Backend (Python)
- `SUPABASE_URL` - Supabase project URL (required)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (required)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (required)
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key (required)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (required)
- `SMTP_HOST` - Email SMTP host (optional, default: smtp.gmail.com)
- `SMTP_PORT` - Email SMTP port (optional, default: 587)
- `SMTP_USER` - Email username (optional)
- `SMTP_PASSWORD` - Email password (optional)
- `PORT` - Backend port (default: 8000)
- `FLASK_DEBUG` - Debug mode (default: False)

### Frontend (Next.js)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (required)

## AWS Permissions Required

Your AWS credentials need the following permissions:
- `bedrock:InvokeModel` for `amazon.nova-pro-v1:0`
- Access to Bedrock Runtime service

## Troubleshooting

- **Backend not starting**: Check AWS credentials and Supabase configuration
- **Frontend can't connect**: Verify backend is running on port 8000
- **Supabase errors**: Run `python test_supabase.py` to diagnose issues
- **Email not sending**: Check SMTP credentials and email configuration
- **Data not saving**: Verify Supabase environment variables are set correctly
- **CORS errors**: Backend has CORS enabled for localhost:3000
- **Image upload issues**: Check image size limits and format support

## Development

- Backend logs: Check terminal running `cd backend && python nova_backend.py`
- Frontend logs: Check terminal running `npm run dev`
- API testing: Use `curl` or Postman to test backend endpoints

## Technologies Used

- **Backend**: Python, Flask, AWS SDK (boto3)
- **Frontend**: Next.js 15, React 19, TypeScript
- **AI**: Amazon Nova Lite via AWS Bedrock
- **Styling**: Custom CSS (no external dependencies)