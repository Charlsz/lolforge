import { NextRequest, NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Routing regions principales - Riot redirige automáticamente al servidor correcto
const ROUTING_REGIONS = ['americas', 'europe', 'asia', 'sea'];

// Mapeo de región a nombre amigable
const REGION_DISPLAY_NAMES: { [key: string]: string } = {
  'americas': 'Americas',
  'europe': 'Europe', 
  'asia': 'Asia',
  'sea': 'Southeast Asia',
};

// Mapeo de platform a routing region
const PLATFORM_TO_ROUTING: { [key: string]: string } = {
  // Americas
  'na1': 'americas',
  'br1': 'americas',
  'la1': 'americas',
  'la2': 'americas',
  // Europe
  'euw1': 'europe',
  'eun1': 'europe',
  'tr1': 'europe',
  'ru': 'europe',
  // Asia
  'kr': 'asia',
  'jp1': 'asia',
  // Southeast Asia
  'oc1': 'sea',
  'ph2': 'sea',
  'sg2': 'sea',
  'th2': 'sea',
  'tw2': 'sea',
  'vn2': 'sea',
};

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
    console.log(`🔍 Searching for player: ${gameName}#${tagLine} across regions...`);
    
    let accountData = null;
    let foundRegion = null;

    // Intentar en todas las routing regions (Riot redirige al servidor correcto)
    for (const region of ROUTING_REGIONS) {
      try {
        console.log(`  📡 Checking region: ${region}`);
        
        const accountResponse = await fetch(
          `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          {
            headers: {
              'X-Riot-Token': RIOT_API_KEY!,
            },
            // No seguir redirects para evitar problemas
            redirect: 'manual',
          }
        );

        // Manejar redirect manual si existe
        if (accountResponse.status === 301 || accountResponse.status === 302) {
          const redirectUrl = accountResponse.headers.get('location');
          if (redirectUrl) {
            console.log(`  ↪️  Redirected to: ${redirectUrl}`);
            const redirectResponse = await fetch(redirectUrl, {
              headers: {
                'X-Riot-Token': RIOT_API_KEY!,
              },
            });
            if (redirectResponse.ok) {
              accountData = await redirectResponse.json();
              foundRegion = region;
              break;
            }
          }
        }

        if (accountResponse.ok) {
          accountData = await accountResponse.json();
          foundRegion = region;
          console.log(`  ✅ Found in ${REGION_DISPLAY_NAMES[region]}`);
          break;
        }
        
        // Error de API key - no continuar
        if (accountResponse.status === 403) {
          console.error(`❌ API key invalid or expired`);
          return NextResponse.json(
            { 
              error: 'API key invalid or expired',
              details: 'Please regenerate your Riot API key (24h expiration for dev keys)'
            },
            { status: 403 }
          );
        }
        
        // Si es 404, intentar siguiente región
        if (accountResponse.status === 404) {
          console.log(`  ⚠️  Not found in ${region}`);
        }
      } catch (err) {
        console.error(`  ❌ Error checking region ${region}:`, err);
        // Continuar con siguiente región
      }
    }

    if (!accountData || !foundRegion) {
      console.log(`❌ Player not found in any region`);
      return NextResponse.json(
        { error: 'Player not found. Please check your Game Name and Tag Line.' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Player found: ${accountData.gameName}#${accountData.tagLine} in ${REGION_DISPLAY_NAMES[foundRegion]}`);
    
    return NextResponse.json({
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      region: foundRegion,
      regionDisplay: REGION_DISPLAY_NAMES[foundRegion],
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
