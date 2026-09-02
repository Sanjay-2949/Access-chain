import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }
    
    // Decode the JWT payload (base64url)
    const parts = credential.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      avatarUrl: payload.picture || null,
      authMethod: 'google' as const,
    };
    
    return NextResponse.json({ user, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
