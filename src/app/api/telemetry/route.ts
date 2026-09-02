import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetId, status, description, source } = body;

    if (!targetId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: targetId and status' },
        { status: 400 }
      );
    }

    const liveCondition = {
      id: `live-${Date.now()}`,
      targetId,
      status, // "OPERATIONAL" | "TEMPORARILY_UNAVAILABLE" | "CLOSED"
      description: description || 'Automated IoT telemetry update',
      source: source || 'IOT_SENSOR',
      reportedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Live telemetry updated for target ${targetId}`,
      condition: liveCondition,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process IoT telemetry' },
      { status: 500 }
    );
  }
}
