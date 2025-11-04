import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Helper to get platform region from routing region or match ID
function getPlatformFromRegion(region?: string, matchId?: string): string {
  // If we have a match ID, detect from it
  if (matchId) {
    if (matchId.startsWith('NA1_')) return 'na1';
    if (matchId.startsWith('BR1_')) return 'br1';
    if (matchId.startsWith('LA1_')) return 'la1';
    if (matchId.startsWith('LA2_')) return 'la2';
    if (matchId.startsWith('EUW1_')) return 'euw1';
    if (matchId.startsWith('EUN1_')) return 'eun1';
    if (matchId.startsWith('TR1_')) return 'tr1';
    if (matchId.startsWith('RU_')) return 'ru';
    if (matchId.startsWith('JP1_')) return 'jp1';
    if (matchId.startsWith('KR_')) return 'kr';
    if (matchId.startsWith('OC1_')) return 'oc1';
    if (matchId.startsWith('PH2_')) return 'ph2';
    if (matchId.startsWith('SG2_')) return 'sg2';
    if (matchId.startsWith('TH2_')) return 'th2';
    if (matchId.startsWith('TW2_')) return 'tw2';
    if (matchId.startsWith('VN2_')) return 'vn2';
  }
  
  // Map routing regions to a default platform
  if (region === 'americas') return 'na1';
  if (region === 'europe') return 'euw1';
  if (region === 'asia') return 'kr';
  if (region === 'sea') return 'oc1';
  
  return 'na1'; // default
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');
  const region = searchParams.get('region') || undefined; // routing region
  const platform = searchParams.get('platform') || undefined; // platform override

  if (!puuid) {
    return NextResponse.json({ error: 'PUUID is required' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  // Determine which platform to use
  const targetPlatform = platform || getPlatformFromRegion(region);
  console.log(`🏆 Fetching ranked info for region: ${region || 'unknown'}, platform: ${targetPlatform}`);

  try {
    // Fetch ranked league entries
    const response = await fetch(
      `https://${targetPlatform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
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
