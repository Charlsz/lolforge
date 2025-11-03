import { NextRequest, NextResponse } from 'next/server';
import { generateYearRecapInsights } from '@/lib/ai-generator';

export async function POST(request: NextRequest) {
  try {
    const playerStats = await request.json();
    const insights = await generateYearRecapInsights(playerStats);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
