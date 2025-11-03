import { NextRequest, NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  
  // Check if API key exists
  if (!RIOT_API_KEY) {
    console.error('❌ RIOT_API_KEY is not configured');
    return NextResponse.json(
      { 
        error: 'Server configuration error',
        details: 'RIOT_API_KEY not found in environment variables'
      },
      { status: 500 }
    );
  }
  
  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'Missing gameName or tagLine' },
      { status: 400 }
    );
  }

  try {
    console.log(`🔍 Searching for player: ${gameName}#${tagLine}`);
    
    // Get account info
    const accountResponse = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    console.log(`📡 Riot API response status: ${accountResponse.status}`);

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error(`❌ Riot API error: ${accountResponse.status} - ${errorText}`);
      
      if (accountResponse.status === 403) {
        return NextResponse.json(
          { 
            error: 'API key invalid or expired',
            details: 'Please regenerate your Riot API key (24h expiration for dev keys)'
          },
          { status: 403 }
        );
      }
      
      if (accountResponse.status === 404) {
        return NextResponse.json(
          { error: 'Player not found. Please check your Game Name and Tag Line.' },
          { status: 404 }
        );
      }
      
      throw new Error(`Riot API error: ${accountResponse.status}`);
    }

    const accountData = await accountResponse.json();
    console.log(`✅ Player found: ${accountData.gameName}#${accountData.tagLine}`);
    
    return NextResponse.json({
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
    });
  } catch (error) {
    console.error('❌ Error in /api/player:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch player data',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
