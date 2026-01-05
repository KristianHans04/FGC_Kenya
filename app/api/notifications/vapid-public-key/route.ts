import { NextResponse } from 'next/server';

// GET: Return VAPID public key for push subscriptions
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { error: 'VAPID public key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    publicKey
  });
}