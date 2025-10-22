import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Call the Python backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${pythonBackendUrl}/chat-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email
      }),
    });

    // Parse backend response (prefer JSON)
    let data: any;
    const contentType = response.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
    } catch (parseErr) {
      console.error('Failed to parse Python backend response for chat-history:', parseErr);
      data = { error: 'Failed to parse backend response' };
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error calling Python backend for chat-history:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat history',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
