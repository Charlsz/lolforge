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
    // Check if player is in a live game
    const response = await fetch(
      `https://${REGION}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    if (response.status === 404) {
      // Player is not in a game
      return NextResponse.json({ liveGame: null });
    }

    if (!response.ok) {
      throw new Error(`Riot API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the player in participants
    const participant = data.participants.find((p: any) => p.puuid === puuid);
    
    if (!participant) {
      return NextResponse.json({ liveGame: null });
    }

    const liveGame = {
      gameId: data.gameId,
      gameMode: data.gameMode,
      gameStartTime: data.gameStartTime,
      championId: participant.championId,
      teamId: participant.teamId,
    };

    return NextResponse.json({ liveGame });
  } catch (error) {
    console.error('Error fetching live game:', error);
    // Return null instead of error for live game (it's optional)
    return NextResponse.json({ liveGame: null });
  }
}
