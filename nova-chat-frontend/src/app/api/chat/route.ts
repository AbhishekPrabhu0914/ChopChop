import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, email } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the Python backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${pythonBackendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        email
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      response: data.response
    });

  } catch (error: any) {
    console.error('Error calling Python backend:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from Nova model',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Uncomment the code below to integrate with real AWS Bedrock Nova Lite model
/*
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bedrock = new AWS.BedrockRuntime();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, imageBase64, imageFormat } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare the content array
    const content: any[] = [{ text: message }];

    // Add image if provided
    if (imageBase64) {
      content.push({
        image: {
          format: imageFormat || 'jpeg',
          source: {
            bytes: imageBase64
          }
        }
      });
    }

    // Prepare the conversation
    const conversation = [
      {
        role: 'user',
        content: content,
      }
    ];

    // Call Amazon Nova Lite model
    const params = {
      modelId: 'amazon.nova-lite-v1:0',
      messages: conversation,
      inferenceConfig: {
        maxTokens: 512,
        temperature: 0.5,
        topP: 0.9
      }
    };

    const response = await bedrock.converse(params).promise();
    
    // Extract the response text
    const responseText = response.output?.message?.content?.[0]?.text || 'No response received';

    return NextResponse.json({
      success: true,
      response: responseText
    });

  } catch (error: any) {
    console.error('Error calling Nova model:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from Nova model',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
*/