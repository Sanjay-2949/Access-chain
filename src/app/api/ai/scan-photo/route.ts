import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    return NextResponse.json({
      success: true,
      detections: [
        { label: 'Step-Free Ramp', confidence: 0.94, status: 'AI-detected — requires verification' },
        { label: 'Handrail Support', confidence: 0.91, status: 'AI-detected — requires verification' },
        { label: 'Elevator Signage', confidence: 0.88, status: 'AI-detected — requires verification' },
      ],
      disclaimer: 'AI detections must be verified by a certified venue operator or auditor before updating official accessibility rating.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
