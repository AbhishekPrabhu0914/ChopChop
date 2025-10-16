# ChopChop Backend

Python Flask backend for the ChopChop application that integrates with Amazon Nova Lite via AWS Bedrock.

## Files

- `nova_backend.py` - Main Flask API server
- `nova_chat.py` - Original Nova chat script
- `nova_multimodal.py` - Enhanced Nova script with image support
- `test.py` - Simple test script
- `requirements.txt` - Python dependencies

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

3. **Run the server**:
   ```bash
   python nova_backend.py
   ```

## API Endpoints

- `GET /health` - Health check
- `POST /chat` - Send messages to Nova Lite model

## Environment Variables

- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `PORT` - Server port (default: 8000)
- `FLASK_DEBUG` - Debug mode (default: False)

## AWS Permissions Required

- `bedrock:InvokeModel` for `amazon.nova-lite-v1:0`
- Access to Bedrock Runtime service
