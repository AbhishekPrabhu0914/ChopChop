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

- 💬 Real-time chat interface with Nova Lite
- 🖼️ Image upload and analysis
- 📱 Responsive design
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

### Backend Setup (Python)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   # OR set environment variables:
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   ```

### Frontend Setup (Next.js)

1. **Install dependencies**:
   ```bash
   cd nova-chat-frontend
   npm install
   ```

2. **Configure backend URL** (optional):
   ```bash
   # Create .env.local
   echo "PYTHON_BACKEND_URL=http://localhost:8000" > .env.local
   ```

## Usage

1. **Text Chat**: Type your message and press Enter
2. **Image Analysis**: Click the 📷 button to upload an image, then ask questions about it
3. **Multimodal**: Combine text and images in the same message

## API Endpoints

### Backend (Python Flask)
- `GET /health` - Health check
- `POST /chat` - Send messages to Nova Lite model

### Frontend (Next.js)
- `POST /api/chat` - Proxy to Python backend

## Project Structure

```
Cairt/
├── backend/                    # Python backend
│   ├── nova_backend.py        # Flask API server
│   ├── nova_chat.py           # Original Nova chat script
│   ├── nova_multimodal.py     # Enhanced Nova script
│   ├── test.py                # Test script
│   └── requirements.txt       # Python dependencies
├── nova-chat-frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/chat/route.ts    # Frontend API proxy
│   │   │   └── page.tsx             # Main page
│   │   └── components/
│   │       └── ChatInterface.tsx   # Chat component
│   └── package.json
├── start_chopchop.sh         # Startup script
└── README.md                  # This file
```

## Environment Variables

### Backend (Python)
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `PORT` - Backend port (default: 8000)
- `FLASK_DEBUG` - Debug mode (default: False)

### Frontend (Next.js)
- `PYTHON_BACKEND_URL` - Backend URL (default: http://localhost:8000)

## AWS Permissions Required

Your AWS credentials need the following permissions:
- `bedrock:InvokeModel` for `amazon.nova-lite-v1:0`
- Access to Bedrock Runtime service

## Troubleshooting

- **Backend not starting**: Check AWS credentials and permissions
- **Frontend can't connect**: Verify backend is running on port 8000
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