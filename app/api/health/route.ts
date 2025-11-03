import { NextResponse } from 'next/server';

// Diagnostic endpoint to check environment variables
export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasRiotKey: !!process.env.RIOT_API_KEY,
    hasAccessKeyId: !!process.env.ACCESS_KEY_ID,
    hasSecretAccessKey: !!process.env.SECRET_ACCESS_KEY,
    hasRegion: !!process.env.REGION,
    riotKeyPrefix: process.env.RIOT_API_KEY?.substring(0, 10) || 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
}
