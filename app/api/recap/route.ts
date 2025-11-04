import { NextRequest, NextResponse } from 'next/server';
import { MatchAnalyzer } from '@/lib/analyzer';
import { MatchInfo, PlayerAccount } from '@/lib/types';
import { generateYearRecapInsights } from '@/lib/ai-generator';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'americas';

// Helper function to determine platform region from match region
function getPlatformRegion(matchId: string): string {
  if (matchId.startsWith('NA1_')) return 'na1';
  if (matchId.startsWith('BR1_')) return 'br1';
  if (matchId.startsWith('LA1_')) return 'la1'; // LAN
  if (matchId.startsWith('LA2_')) return 'la2'; // LAS
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
  return 'na1'; // default
}

// Helper function to fetch match with retry logic
async function fetchMatchWithRetry(matchId: string, retries = 2): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY!,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }

      // If it's a 404 or 403, don't retry (match doesn't exist)
      if (response.status === 404 || response.status === 403) {
        console.warn(`⚠️ Match ${matchId} not available (Status: ${response.status})`);
        return null;
      }

      // For other errors, retry
      if (attempt < retries) {
        console.log(`Retrying match ${matchId} (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }
    } catch (error) {
      if (attempt < retries) {
        console.log(`Error fetching match ${matchId}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.warn(`⚠️ Skipping match ${matchId} after ${retries} retries`);
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  
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
    
    // Step 1.5: Get summoner info for profile icon
    let profileIconId = 29; // Default icon
    let summonerLevel = 0;
    
    try {
      const summonerResponse = await fetch(
        `https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY!,
          },
        }
      );
      
      if (summonerResponse.ok) {
        const summonerData = await summonerResponse.json();
        profileIconId = summonerData.profileIconId;
        summonerLevel = summonerData.summonerLevel;
      }
    } catch (summonerError) {
      console.warn('Could not fetch summoner info, using default icon');
    }
    
    const player: PlayerAccount = {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      profileIconId,
      summonerLevel,
    };

    // Step 2: Get match IDs with smart filtering strategy
    console.log(`📊 Fetching matches for ${player.gameName}#${player.tagLine}...`);
    
    // Strategy: Get more match IDs initially so we can filter intelligently
    const matchesResponse = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player.puuid}/ids?start=0&count=100`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!,
        },
      }
    );

    if (!matchesResponse.ok) {
      throw new Error('Failed to fetch match IDs');
    }

    const allMatchIds: string[] = await matchesResponse.json();
    console.log(`✅ Found ${allMatchIds.length} match IDs`);

    if (allMatchIds.length === 0) {
      return NextResponse.json({
        error: 'No matches found for this player',
      }, { status: 404 });
    }

    // Step 3: Smart sampling - fetch match details with intelligent filtering
    // Fetch recent matches first to check metadata
    console.log(`📥 Fetching match details with smart filtering...`);
    
    const recentMatchIds = allMatchIds.slice(0, 30); // Get 30 most recent
    const matchDetailsPromises = recentMatchIds.map(async (matchId: string) => {
      try {
        const matchData = await fetchMatchWithRetry(matchId);
        
        if (!matchData) {
          return null;
        }

        const queueId = matchData.info.queueId;
        const gameDuration = matchData.info.gameDuration;
        
        // Smart filtering:
        // 420 = Ranked Solo/Duo, 440 = Ranked Flex
        // 400 = Normal Draft, 430 = Normal Blind (include for broader recap)
        const isRanked = queueId === 420 || queueId === 440;
        const isNormal = queueId === 400 || queueId === 430;
        const isValidQueue = isRanked || isNormal;
        const isValidDuration = gameDuration >= 900; // >15 minutes (900 seconds)
        
        // Filter: only ranked/normal games that lasted >15 min
        if (!isValidQueue || !isValidDuration) {
          console.log(`⏭️ Skipping match ${matchId} (Queue: ${queueId}, Duration: ${Math.floor(gameDuration/60)}m)`);
          return null;
        }
        
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
      } catch (error) {
        console.warn(`Failed to process match ${matchId}:`, error);
        return null;
      }
    });

    const matches = (await Promise.all(matchDetailsPromises))
      .filter((match: MatchInfo | null): match is MatchInfo => match !== null);

    console.log(`✅ Successfully fetched ${matches.length} valid matches (filtered from ${recentMatchIds.length})`);

    if (matches.length === 0) {
      return NextResponse.json({
        error: 'Failed to fetch match details from the last year',
      }, { status: 500 });
    }

    // Detect player's platform region from their matches
    const PLATFORM = matches.length > 0 ? getPlatformRegion(matches[0].matchId) : 'na1';
    console.log(`🌍 Detected platform region: ${PLATFORM}`);

    // Step 4: Analyze data
    const analyzer = new MatchAnalyzer(matches, player.puuid);
    const recap = analyzer.generateRecap(player);

    // Step 5: Fetch additional data (ranked, mastery, live game) in parallel
    console.log('🔍 Fetching additional player data...');
    const additionalDataPromises = [
      // Ranked info
      fetch(`https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${player.puuid}`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY! },
      }).then(res => res.ok ? res.json() : []).catch(() => []),
      
      // Champion mastery (top 5)
      fetch(`https://${PLATFORM}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${player.puuid}/top?count=5`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY! },
      }).then(res => res.ok ? res.json() : []).catch(() => []),
      
      // Live game
      fetch(`https://${PLATFORM}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${player.puuid}`, {
        headers: { 'X-Riot-Token': RIOT_API_KEY! },
      }).then(res => res.ok ? res.json() : null).catch(() => null),
    ];

    const [rankedData, masteryData, liveGameData] = await Promise.all(additionalDataPromises);

    console.log('📊 Ranked data received:', rankedData.length, 'entries');
    console.log('🎖️ Mastery data received:', masteryData.length, 'champions');
    console.log('⚡ Live game data:', liveGameData ? 'Active' : 'Not in game');

    // Transform ranked info
    const rankedInfo = rankedData.map((entry: any) => ({
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

    // Transform mastery info
    const championMasteries = masteryData.slice(0, 5).map((mastery: any) => ({
      championId: mastery.championId,
      championLevel: mastery.championLevel,
      championPoints: mastery.championPoints,
      lastPlayTime: mastery.lastPlayTime,
      tokensEarned: mastery.tokensEarned || 0,
    }));

    // Transform live game info
    let liveGame = null;
    if (liveGameData && liveGameData.participants) {
      const participant = liveGameData.participants.find((p: any) => p.puuid === player.puuid);
      if (participant) {
        liveGame = {
          gameId: liveGameData.gameId,
          gameMode: liveGameData.gameMode,
          gameStartTime: liveGameData.gameStartTime,
          championId: participant.championId,
          teamId: participant.teamId,
        };
      }
    }

    console.log(`✅ Additional data fetched: ${rankedInfo.length} ranked queues, ${championMasteries.length} masteries, live game: ${liveGame ? 'yes' : 'no'}`);

    // Step 6: Return recap WITHOUT AI insights (on-demand generation)
    return NextResponse.json({
      ...recap,
      rankedInfo,
      championMasteries,
      liveGame,
      aiInsights: null, // Don't generate automatically to save AWS costs
    });
  } catch (error) {
    console.error('Error generating recap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to generate recap',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
