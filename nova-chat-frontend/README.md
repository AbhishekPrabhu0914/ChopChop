# ChopChop Frontend

A modern chat interface for Amazon Nova Lite model built with Next.js, React, and Tailwind CSS.

## Features

- 💬 Real-time chat interface with Nova Lite
- 🖼️ Image upload and analysis
- 📱 Responsive design
- ⚡ Fast and modern UI with Tailwind CSS
- 🔒 Secure API integration

## Setup

### 1. Install Dependencies

```bash
npm install aws-sdk lucide-react
```

### 2. Configure AWS Credentials

Create a `.env.local` file in the root directory:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Or configure AWS credentials using:
- AWS CLI: `aws configure`
- IAM roles (if running on AWS)
- Environment variables

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the chat interface.

## Usage

1. **Text Chat**: Type your message and press Enter
2. **Image Analysis**: Click the image icon to upload an image, then ask questions about it
3. **Multimodal**: Combine text and images in the same message

## API Endpoints

- `POST /api/chat` - Send messages to Nova Lite model

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # Backend API for Nova integration
│   ├── page.tsx             # Main page
│   └── layout.tsx           # App layout
├── components/
│   └── ChatInterface.tsx    # Main chat component
└── ...
```

## Technologies Used

- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **AWS SDK** - Bedrock integration
- **Lucide React** - Icons
- **TypeScript** - Type safety

## AWS Permissions Required

Your AWS credentials need the following permissions:
- `bedrock:InvokeModel` for `amazon.nova-lite-v1:0`
- Access to Bedrock Runtime service

## Troubleshooting

- **AWS Credentials**: Make sure your AWS credentials are properly configured
- **Region**: Ensure Nova Lite is available in your selected region
- **Permissions**: Verify you have Bedrock runtime permissions