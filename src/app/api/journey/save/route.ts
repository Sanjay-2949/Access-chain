import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const journeyData = await request.json();
    
    // For prototype, simply echo back with a generated ID
    const journeyId = `journey-${Date.now()}`;
    
    return NextResponse.json({ 
      success: true, 
      journeyId,
      message: 'Journey saved successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save journey' }, { status: 500 });
  }
}
