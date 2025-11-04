import { NextRequest, NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const ROUTING_REGIONS = ['americas', 'europe', 'asia', 'sea'] as const;

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

// Helper function to determine platform region from match ID
function getPlatformRegion(matchId: string): string {
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
  if (matchId.startsWith('ME1_')) return 'me1';
  return 'na1';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { error: 'Riot API key not configured' },
        { status: 500 }
      );
    }

    // Parse query - puede ser "PlayerName" o "PlayerName#TAG"
    const parts = query.split('#');
    const gameName = parts[0].trim();
    const tagLine = parts[1]?.trim() || '';

    // Common tags to try if no tag specified or partial tag
    const commonTags = ['NA1', 'EUW', 'LAN', 'LAS', 'BR1', 'KR', 'JP1', 'OCE', 'EUNE', 'TR1', 'RU'];
    
    // If has complete tag, search for that exact account
    if (tagLine.length >= 2) {
      const searchPromises = ROUTING_REGIONS.map(async (region) => {
        try {
          const response = await fetch(
            `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
            {
              headers: {
                'X-Riot-Token': RIOT_API_KEY!,
              },
            }
          );

          if (!response.ok) {
            return null;
          }

          const accountData = await response.json();
          return await enrichAccountData(accountData, region);
        } catch (error) {
          return null;
        }
      });

      const results = (await Promise.all(searchPromises)).filter(Boolean);
      const uniqueResults = filterUniqueResults(results);
      return NextResponse.json({ results: uniqueResults });
    }

    // If no tag or short tag, try common tags
    if (gameName.length >= 2) {
      const searchPromises = commonTags.flatMap(tag => 
        ROUTING_REGIONS.map(async (region) => {
          try {
            const response = await fetch(
              `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`,
              {
                headers: {
                  'X-Riot-Token': RIOT_API_KEY!,
                },
              }
            );

            if (!response.ok) {
              return null;
            }

            const accountData = await response.json();
            return await enrichAccountData(accountData, region);
          } catch (error) {
            return null;
          }
        })
      );

      const results = (await Promise.all(searchPromises)).filter(Boolean);
      const uniqueResults = filterUniqueResults(results);
      return NextResponse.json({ results: uniqueResults.slice(0, 8) }); // Limit to 8 results
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Helper function to enrich account data with platform and icon
async function enrichAccountData(accountData: any, region: string) {
  let profileIconId = 29;
  let detectedPlatform = 'unknown';
  
  try {
    const matchResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountData.puuid}/ids?start=0&count=1`,
      {
        headers: {
          'X-Riot-Token': process.env.RIOT_API_KEY!,
        },
      }
    );

    if (matchResponse.ok) {
      const matchIds = await matchResponse.json();
      if (matchIds.length > 0) {
        detectedPlatform = getPlatformRegion(matchIds[0]);
        
        // Get summoner info for profile icon
        try {
          const summonerResponse = await fetch(
            `https://${detectedPlatform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
            {
              headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY!,
              },
            }
          );
          
          if (summonerResponse.ok) {
            const summonerData = await summonerResponse.json();
            profileIconId = summonerData.profileIconId;
          }
        } catch (err) {
          // Ignore icon fetch errors
        }
      }
    }
  } catch (err) {
    // Ignore platform detection errors
  }

  return {
    puuid: accountData.puuid,
    gameName: accountData.gameName,
    tagLine: accountData.tagLine,
    platform: detectedPlatform,
    platformDisplay: getPlatformDisplayName(detectedPlatform),
    profileIconId,
  };
}

// Helper function to filter unique results
function filterUniqueResults(results: any[]) {
  return results.reduce((acc: any[], current) => {
    if (current && current.platform !== 'unknown') {
      const exists = acc.find(item => item.puuid === current.puuid && item.platform === current.platform);
      if (!exists) {
        acc.push(current);
      }
    }
    return acc;
  }, []);
}
