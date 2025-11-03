import { NextRequest, NextResponse } from 'next/server';
import { MatchInfo, MatchParticipant } from '@/lib/types';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'americas'; // Adjust based on your needs

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const matchId = searchParams.get('matchId');
  
  if (!matchId) {
    return NextResponse.json(
      { error: 'Missing matchId parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch detailed match data
    const matchResponse = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    if (!matchResponse.ok) {
      const errorText = await matchResponse.text();
      console.error('Riot API Error:', errorText);
      throw new Error('Failed to fetch match details');
    }

    const matchData = await matchResponse.json();
    
    // Extract relevant information
    const participants: MatchParticipant[] = matchData.info.participants.map((p: any) => ({
      puuid: p.puuid,
      summonerName: p.riotIdGameName || p.summonerName,
      championName: p.championName,
      championId: p.championId,
      teamPosition: p.teamPosition || p.individualPosition,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      win: p.win,
      totalMinionsKilled: p.totalMinionsKilled,
      goldEarned: p.goldEarned,
      champLevel: p.champLevel,
      item0: p.item0,
      item1: p.item1,
      item2: p.item2,
      item3: p.item3,
      item4: p.item4,
      item5: p.item5,
      item6: p.item6,
    }));

    const matchInfo: MatchInfo = {
      matchId: matchData.metadata.matchId,
      gameCreation: matchData.info.gameCreation,
      gameDuration: matchData.info.gameDuration,
      gameMode: matchData.info.gameMode,
      participants,
    };
    
    return NextResponse.json(matchInfo);
  } catch (error) {
    console.error('Error fetching match details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}
