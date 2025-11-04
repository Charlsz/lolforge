'use client';

import React, { useEffect, useState } from 'react';
import { ChampionMastery } from '@/lib/types';

interface ChampionMasteryCardProps {
  masteries: ChampionMastery[];
  topChampions: Array<{ championName: string; championId: number }>;
  isLoading?: boolean;
}

const DDRAGON_VERSION = '14.23.1';

// Cache global para el mapeo de campeones (se carga una sola vez)
let championIdMapCache: { [key: number]: string } | null = null;
let championDataPromise: Promise<void> | null = null;

// Función para cargar datos de campeones desde Data Dragon
async function loadChampionData(): Promise<{ [key: number]: string }> {
  if (championIdMapCache) {
    return championIdMapCache;
  }

  if (!championDataPromise) {
    championDataPromise = (async () => {
      try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/champion.json`);
        const data = await response.json();
        
        const idMap: { [key: number]: string } = {};
        Object.values(data.data).forEach((champ: any) => {
          idMap[parseInt(champ.key)] = champ.id;
        });
        
        championIdMapCache = idMap;
      } catch (error) {
        console.error('Error loading champion data:', error);
        championIdMapCache = {};
      }
    })();
  }

  await championDataPromise;
  return championIdMapCache || {};
}

export function ChampionMasteryCard({ masteries, topChampions, isLoading = false }: ChampionMasteryCardProps) {
  const [enrichedMasteries, setEnrichedMasteries] = useState<Array<ChampionMastery & { championName: string }>>([]);
  const [isLoadingChampions, setIsLoadingChampions] = useState(true);

  useEffect(() => {
    async function enrichMasteryData() {
      setIsLoadingChampions(true);
      
      // Cargar datos de campeones desde Data Dragon
      const championIdMap = await loadChampionData();
      
      // Enriquecer masteries con nombres de campeones
      const enriched = masteries.map(mastery => {
        // Primero intenta con el mapa de Data Dragon
        const championNameFromId = championIdMap[mastery.championId];
        
        // Fallback a topChampions si está disponible
        const matchedChamp = topChampions.find(c => c.championId === mastery.championId);
        
        return {
          ...mastery,
          championName: championNameFromId || matchedChamp?.championName || `Champion${mastery.championId}`,
        };
      });
      
      setEnrichedMasteries(enriched);
      setIsLoadingChampions(false);
    }

    if (masteries && masteries.length > 0) {
      enrichMasteryData();
    }
  }, [masteries, topChampions]);

  if (isLoading || isLoadingChampions) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Champion Mastery</h2>
          <p className="text-sm text-[#E0EDFF]/60">Your most mastered champions</p>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 border-4 border-[#E0EDFF]/30 border-t-[#6366F1] rounded-full animate-spin"></div>
          <p className="text-[#E0EDFF]/60">Loading mastery data...</p>
        </div>
      </div>
    );
  }

  if (!masteries || masteries.length === 0) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Champion Mastery</h2>
          <p className="text-sm text-[#E0EDFF]/60">Your most mastered champions</p>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🎯</div>
          <p className="text-lg font-semibold text-[#FFFAFA] mb-2">No Mastery Data</p>
          <p className="text-sm text-[#E0EDFF]/60">
            Play more games to earn mastery points!
          </p>
        </div>
      </div>
    );
  }

  // Helper to get correct champion key for Data Dragon (some champs have different keys)
  const getChampionImageKey = (championName: string) => {
    // Map of champion names that differ from their image keys
    const nameMap: { [key: string]: string } = {
      'FiddleSticks': 'Fiddlesticks',
      'Wukong': 'MonkeyKing',
      'Renata': 'Renata',
      'BelVeth': 'Belveth',
      'KSante': 'KSante',
      'KaiSa': 'Kaisa',
      'Nunu': 'Nunu',
      'LeBlanc': 'Leblanc',
      'VelKoz': 'Velkoz',
      'KhaZix': 'Khazix',
      'ChoGath': 'Chogath',
      'RekSai': 'Reksai',
    };
    
    return nameMap[championName] || championName;
  };

  const getMasteryColor = (level: number) => {
    if (level >= 7) return 'from-yellow-400 to-amber-500';
    if (level >= 6) return 'from-purple-400 to-purple-500';
    if (level >= 5) return 'from-blue-400 to-cyan-500';
    return 'from-gray-500 to-gray-600';
  };

  const getMasteryBadge = (level: number) => {
    if (level >= 7) return '👑';
    if (level >= 6) return '💎';
    if (level >= 5) return '⭐';
    return '🎯';
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(0)}K`;
    return points.toString();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Champion Mastery</h2>
        <p className="text-sm text-[#E0EDFF]/60">Your most mastered champions</p>
      </div>

      <div className="space-y-2">
        {enrichedMasteries.map((mastery, index) => (
          <div
            key={mastery.championId}
            className="bg-gradient-to-r from-yellow-400/10 to-orange-500/5 rounded-lg p-2.5 border border-yellow-500/20"
          >
            <div className="flex items-center gap-2.5">
              {/* Rank Number */}
              <div className="text-xl font-black text-[#FFFAFA]/70 w-7 flex-shrink-0">
                #{index + 1}
              </div>

              {/* Champion Icon */}
              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-yellow-500/30 flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${getChampionImageKey(mastery.championName)}.png`}
                  alt={mastery.championName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: try without special formatting
                    const target = e.currentTarget;
                    if (!target.src.includes('profileicon')) {
                      target.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/29.png`;
                    }
                  }}
                />
              </div>

              {/* Champion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-bold text-[#FFFAFA]">
                    {mastery.championName}
                  </h3>
                  <span className="text-base">{getMasteryBadge(mastery.championLevel)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#E0EDFF]/70 mt-0.5">
                  <span className="font-semibold">Lvl {mastery.championLevel}</span>
                  <span>•</span>
                  <span>{formatPoints(mastery.championPoints)} pts</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
