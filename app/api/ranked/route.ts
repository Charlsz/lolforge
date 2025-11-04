import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'na1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');

  if (!puuid) {
    return NextResponse.json({ error: 'PUUID is required' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Fetch ranked league entries
    const response = await fetch(
      `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ rankedInfo: [] }); // Unranked player
      }
      throw new Error(`Riot API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to our format
    const rankedInfo = data.map((entry: any) => ({
      queueType: entry.queueType,
      tier: entry.tier,
      rank: entry.rank,
      leaguePoints: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: ((entry.wins / (entry.wins + entry.losses)) * 100),
      veteran: entry.veteran || false,
      hotStreak: entry.hotStreak || false,
    }));

    return NextResponse.json({ rankedInfo });
  } catch (error) {
    console.error('Error fetching ranked info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranked info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
