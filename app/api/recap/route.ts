import { NextRequest, NextResponse } from 'next/server';
import { MatchAnalyzer } from '@/lib/analyzer';
import { MatchInfo, PlayerAccount } from '@/lib/types';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'americas';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const count = searchParams.get('count') || '20';
  
  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'Missing gameName or tagLine parameters' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Get player account info
    const accountResponse = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const accountData = await accountResponse.json();
    const player: PlayerAccount = {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
    };

    // Step 2: Get match IDs
    const matchesResponse = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player.puuid}/ids?start=0&count=${count}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    if (!matchesResponse.ok) {
      throw new Error('Failed to fetch match IDs');
    }

    const matchIds: string[] = await matchesResponse.json();

    if (matchIds.length === 0) {
      return NextResponse.json({
        error: 'No matches found for this player',
      }, { status: 404 });
    }

    // Step 3: Fetch detailed data for all matches
    const matchDetailsPromises = matchIds.map(async (matchId) => {
      const response = await fetch(
        `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch match ${matchId}`);
        return null;
      }

      const matchData = await response.json();
      
      const matchInfo: MatchInfo = {
        matchId: matchData.metadata.matchId,
        gameCreation: matchData.info.gameCreation,
        gameDuration: matchData.info.gameDuration,
        gameMode: matchData.info.gameMode,
        participants: matchData.info.participants.map((p: any) => ({
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
        })),
      };

      return matchInfo;
    });

    const matches = (await Promise.all(matchDetailsPromises))
      .filter((match): match is MatchInfo => match !== null);

    if (matches.length === 0) {
      return NextResponse.json({
        error: 'Failed to fetch match details',
      }, { status: 500 });
    }

    // Step 4: Analyze data
    const analyzer = new MatchAnalyzer(matches, player.puuid);
    const recap = analyzer.generateRecap(player);

    return NextResponse.json(recap);
  } catch (error) {
    console.error('Error generating recap:', error);
    return NextResponse.json(
      { error: 'Failed to generate recap' },
      { status: 500 }
    );
  }
}
