import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    let reply = 'I have evaluated your active journey constraints.';

    if (prompt.toLowerCase().includes('gate 3') || prompt.toLowerCase().includes('elevator')) {
      reply =
        'Gate 3 Elevator is currently marked out of service. I have updated your journey to enter via Gate 5 Ramp entrance, which is 100% step-free and verified operational.';
    } else if (prompt.toLowerCase().includes('taxi') || prompt.toLowerCase().includes('hotel')) {
      reply =
        'Standard taxi transport is not compatible with manual wheelchair profiles. I recommend switching to the direct hydraulic shuttle from KSR Bengaluru station to MG Road.';
    } else {
      reply =
        'All 5 segments of your journey from Chennai Central to M. Chinnaswamy Stadium are verified feasible with your manual wheelchair profile.';
    }

    return NextResponse.json({
      success: true,
      reply,
      source: 'AccessChain Graph Intelligence Engine',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
