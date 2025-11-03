import { NextRequest, NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'americas'; // Adjust based on your needs

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const puuid = searchParams.get('puuid');
  const count = searchParams.get('count') || '20';
  
  if (!puuid) {
    return NextResponse.json(
      { error: 'Missing puuid parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch match IDs for the player
    const matchesResponse = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    if (!matchesResponse.ok) {
      const errorText = await matchesResponse.text();
      console.error('Riot API Error:', errorText);
      throw new Error('Failed to fetch matches');
    }

    const matchIds = await matchesResponse.json();
    
    return NextResponse.json({
      puuid,
      matchIds,
      count: matchIds.length,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match history' },
      { status: 500 }
    );
  }
}
