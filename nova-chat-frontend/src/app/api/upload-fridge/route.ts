import { NextRequest, NextResponse } from 'next/server';

// Configure for larger request bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageFormat, email } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Call the Python backend for fridge photo analysis
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'https://chopchop-kqae.onrender.com';
    
    const response = await fetch(`${pythonBackendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Analyze this fridge photo and suggest recipes based on the ingredients you can see. List the ingredients first, then provide 2-3 recipe suggestions with cooking instructions.",
        imageBase64: imageBase64,
        imageFormat: imageFormat,
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

  } catch (error: unknown) {
    console.error('Error calling Python backend for fridge analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze fridge photo',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
