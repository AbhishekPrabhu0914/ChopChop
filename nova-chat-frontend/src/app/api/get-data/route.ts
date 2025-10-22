import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Call the Python backend
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${pythonBackendUrl}/get-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email
      }),
    });

    // Attempt to parse backend response (JSON preferred, fallback to text)
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
      console.error('Failed to parse Python backend response for get-data:', parseErr);
      data = { error: 'Failed to parse backend response' };
    }

    // If backend returned an error status, forward it and the body to the client
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error calling Python backend for get-data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve data',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
