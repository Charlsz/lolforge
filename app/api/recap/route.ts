import { NextRequest, NextResponse } from 'next/server';
import { MatchAnalyzer } from '@/lib/analyzer';
import { MatchInfo, PlayerAccount } from '@/lib/types';
import { generateYearRecapInsights } from '@/lib/ai-generator';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = 'americas';

// Routing regions para búsqueda
const ROUTING_REGIONS = ['americas', 'europe', 'asia', 'sea'];

// Función auxiliar para buscar jugador en todas las regiones
async function findPlayerInAllRegions(gameName: string, tagLine: string): Promise<{ puuid: string; gameName: string; tagLine: string; region: string; regionDisplay: string } | null> {
  const regionDisplayNames: { [key: string]: string } = {
    'americas': 'Americas',
    'europe': 'Europe', 
    'asia': 'Asia',
    'sea': 'Southeast Asia',
  };

  // Intentar primero en Americas (más común)
  const priorityOrder = ['americas', 'europe', 'asia', 'sea'];

  for (const region of priorityOrder) {
    try {
      console.log(`  📡 Searching in ${region}...`);
      
      const accountResponse = await fetch(
        `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY!,
          },
        }
      );

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        console.log(`  ✅ Account found in ${regionDisplayNames[region]} routing`);
        
        // IMPORTANTE: El routing region puede ser diferente del servidor donde juega
        // Vamos a detectar el servidor real desde las partidas
        return {
          puuid: accountData.puuid,
          gameName: accountData.gameName,
          tagLine: accountData.tagLine,
          region: region, // Routing region donde está la cuenta
          regionDisplay: regionDisplayNames[region],
        };
      }
      
      // Si hay error 403, la API key es inválida
      if (accountResponse.status === 403) {
        throw new Error('API key invalid or expired');
      }
    } catch (err) {
      // Si es error de API key, propagar el error
      if (err instanceof Error && err.message.includes('API key')) {
        throw err;
      }
      console.log(`  ⚠️  Not found in ${region}`);
      // Continuar con la siguiente región
    }
  }
  
  return null; // No encontrado en ninguna región
}

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
  if (matchId.startsWith('ME1_')) return 'me1'; // Middle East
  return 'na1'; // default
}

// Helper function to get display name for platform
function getPlatformDisplayName(platform: string): string {
  const platformNames: Record<string, string> = {
    'na1': 'NA',
    'br1': 'BR',
    'la1': 'LAN',
    'la2': 'LAS',
    'euw1': 'EUW',
    'eun1': 'EUNE',
    'tr1': 'TR',
    'ru': 'RU',
    'jp1': 'JP',
    'kr': 'KR',
    'oc1': 'OCE',
    'ph2': 'PH',
    'sg2': 'SG',
    'th2': 'TH',
    'tw2': 'TW',
    'vn2': 'VN',
    'me1': 'ME',
  };
  return platformNames[platform] || platform.toUpperCase();
}

// Helper function to fetch match with retry logic
async function fetchMatchWithRetry(matchId: string, region: string, retries = 2): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
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
    // Step 1: Get player account info - buscar en todas las regiones
    console.log(`🔍 Searching for player: ${gameName}#${tagLine} across all regions...`);
    
    const accountData = await findPlayerInAllRegions(gameName, tagLine);
    
    if (!accountData) {
      return NextResponse.json(
        { error: 'Player not found in any region. Please check your Game Name and Tag Line.' },
        { status: 404 }
      );
    }
    
    // Usar la región donde se encontró el jugador
    const routingRegion = accountData.region;
    console.log(`✅ Player found in region: ${accountData.regionDisplay}`);
    
    // Step 1.5: Get summoner info for profile icon
    let profileIconId = 29; // Default icon
    let summonerLevel = 0;
    
    // Detect platform from first match or use default
    let detectedPlatform = 'la1'; // Will be updated based on matches
    
    try {
      // Try to get a match ID first to detect platform
      const quickMatchResponse = await fetch(
        `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountData.puuid}/ids?start=0&count=1`,
        {
          headers: {
            'X-Riot-Token': RIOT_API_KEY!,
          },
        }
      );
      
      if (quickMatchResponse.ok) {
        const matchIds = await quickMatchResponse.json();
        if (matchIds.length > 0) {
          detectedPlatform = getPlatformRegion(matchIds[0]);
        }
      }

      const summonerResponse = await fetch(
        `https://${detectedPlatform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
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
      platform: detectedPlatform, // Real game server (la1, euw1, eune1, etc.)
      platformDisplay: getPlatformDisplayName(detectedPlatform), // NA, EUW, EUNE, LAN, etc.
    };

    // Step 2: Get match IDs - buscar en TODAS las regiones porque el jugador puede jugar en diferentes servidores
    console.log(`📊 Fetching matches for ${player.gameName}#${player.tagLine} across all regions...`);
    
    let allMatchIds: string[] = [];
    let actualPlayRegion = routingRegion; // Región donde tiene más partidas
    
    console.log(`📥 Fetching ALL available matches...`);
    
    // Intentar obtener partidas de todas las regiones con paginación
    for (const region of ROUTING_REGIONS) {
      try {
        let regionMatchIds: string[] = [];
        let start = 0;
        const count = 100; // Max per request
        let hasMore = true;
        
        // Paginar hasta obtener todas las partidas (máximo 1000 para evitar rate limits)
        while (hasMore && start < 1000) {
          const matchesResponse = await fetch(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${player.puuid}/ids?start=${start}&count=${count}`,
            {
              headers: {
                'X-Riot-Token': RIOT_API_KEY!,
              },
            }
          );

          if (matchesResponse.ok) {
            const matchIds: string[] = await matchesResponse.json();
            
            if (matchIds.length > 0) {
              regionMatchIds.push(...matchIds);
              console.log(`  📦 Fetched ${matchIds.length} matches from ${region} (offset ${start})`);
              
              // Si obtenemos menos de 100, ya no hay más
              if (matchIds.length < count) {
                hasMore = false;
              } else {
                start += count;
                // Small delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
        
        if (regionMatchIds.length > 0) {
          console.log(`  ✅ Total ${regionMatchIds.length} matches found in ${region}`);
          
          // Si encontramos más partidas en esta región, es probablemente donde juega
          if (regionMatchIds.length > allMatchIds.length) {
            actualPlayRegion = region;
            allMatchIds = regionMatchIds;
          }
        }
      } catch (err) {
        console.log(`  ⚠️  Error fetching matches from ${region}`);
      }
    }
    
    console.log(`✅ Total: ${allMatchIds.length} match IDs from ${actualPlayRegion}`);

    // Update detected platform based on actual matches found
    if (allMatchIds.length > 0) {
      detectedPlatform = getPlatformRegion(allMatchIds[0]);
      player.platform = detectedPlatform;
      player.platformDisplay = getPlatformDisplayName(detectedPlatform);
      console.log(`🎮 Detected game server: ${player.platformDisplay} (${detectedPlatform})`);
    }

    if (allMatchIds.length === 0) {
      return NextResponse.json({
        error: 'No matches found for this player',
      }, { status: 404 });
    }

    // Step 3: Smart sampling - fetch match details with intelligent filtering
    // Fetch recent matches first to check metadata
    console.log(`📥 Fetching match details with smart filtering...`);
    
    // Process ALL matches (not just recent 30) but with date filter
    // We'll fetch matches and filter by Ranked Solo + last 2 years
    console.log(`🔍 Processing up to ${Math.min(allMatchIds.length, 500)} matches (Ranked Solo only)...`);
    
    const maxMatchesToProcess = Math.min(allMatchIds.length, 500); // Max 500 to avoid timeout
    const twoYearsAgo = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000); // 2 years in milliseconds
    
    const matchDetailsPromises = allMatchIds.slice(0, maxMatchesToProcess).map(async (matchId: string) => {
      try {
        const matchData = await fetchMatchWithRetry(matchId, actualPlayRegion);
        
        if (!matchData) {
          return null;
        }

        const queueId = matchData.info.queueId;
        const gameDuration = matchData.info.gameDuration;
        const gameCreation = matchData.info.gameCreation;
        
        // Filter by date: only last 2 years
        if (gameCreation < twoYearsAgo) {
          return null;
        }
        
        // FILTER: Only Ranked Solo/Duo (queueId 420)
        // 420 = Ranked Solo/Duo ✓
        // 440 = Ranked Flex (excluded)
        // 400 = Normal Draft (excluded)
        // 430 = Normal Blind (excluded)
        // 450 = ARAM (excluded)
        const isRankedSolo = queueId === 420;
        const isValidDuration = gameDuration >= 900; // >15 minutes (900 seconds)
        
        // Only include Ranked Solo games that lasted >15 min
        if (!isRankedSolo || !isValidDuration) {
          return null;
        }
        
        const matchInfo: MatchInfo = {
          matchId: matchData.metadata.matchId,
          gameCreation: matchData.info.gameCreation,
          gameDuration: matchData.info.gameDuration,
          gameMode: matchData.info.gameMode,
          queueId: matchData.info.queueId,
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

    console.log(`✅ Successfully fetched ${matches.length} Ranked Solo matches (from ${maxMatchesToProcess} processed)`);

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
      matches, // Include full match history for display
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
