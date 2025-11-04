'use client';

import React from 'react';
import { ChampionMastery } from '@/lib/types';

interface ChampionMasteryCardProps {
  masteries: ChampionMastery[];
  topChampions: Array<{ championName: string; championId: number }>;
  isLoading?: boolean;
}

const DDRAGON_VERSION = '14.23.1';

// Champion ID to Name mapping (actualizado con todos los campeones)
const CHAMPION_ID_MAP: { [key: number]: string } = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'TwistedFate', 5: 'XinZhao',
  6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
  11: 'MasterYi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
  16: 'Soraka', 17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu',
  21: 'MissFortune', 22: 'Ashe', 23: 'Tryndamere', 24: 'Jax', 25: 'Morgana',
  26: 'Zilean', 27: 'Singed', 28: 'Evelynn', 29: 'Twitch', 30: 'Karthus',
  31: 'Chogath', 32: 'Amumu', 33: 'Rammus', 34: 'Anivia', 35: 'Shaco',
  36: 'DrMundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
  41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
  46: 'Trundle', 48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank',
  54: 'Malphite', 55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton',
  59: 'JarvanIV', 60: 'Elise', 61: 'Orianna', 62: 'MonkeyKing', 63: 'Brand',
  64: 'LeeSin', 67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner',
  74: 'Heimerdinger', 75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy',
  79: 'Gragas', 80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick',
  84: 'Akali', 85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Malzahar',
  91: 'Talon', 92: 'Riven', 96: 'KogMaw', 98: 'Shen', 99: 'Lux',
  101: 'Xerath', 102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz',
  106: 'Volibear', 107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor',
  113: 'Sejuani', 114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven',
  120: 'Hecarim', 121: 'Khazix', 122: 'Darius', 126: 'Jayce', 127: 'Lissandra',
  131: 'Diana', 133: 'Quinn', 134: 'Syndra', 136: 'AurelionSol', 141: 'Kayn',
  142: 'Zoe', 143: 'Zyra', 145: 'Kaisa', 147: 'Seraphine', 150: 'Gnar',
  154: 'Zac', 157: 'Yasuo', 161: 'Velkoz', 163: 'Taliyah', 164: 'Camille',
  166: 'Akshan', 200: 'Belveth', 201: 'Braum', 202: 'Jhin', 203: 'Kindred',
  221: 'Zeri', 222: 'Jinx', 223: 'TahmKench', 233: 'Briar', 234: 'Viego',
  235: 'Senna', 236: 'Lucian', 238: 'Zed', 240: 'Kled', 245: 'Ekko',
  246: 'Qiyana', 254: 'Vi', 266: 'Aatrox', 267: 'Nami', 268: 'Azir',
  350: 'Yuumi', 360: 'Samira', 412: 'Thresh', 420: 'Illaoi', 421: 'RekSai',
  427: 'Ivern', 429: 'Kalista', 432: 'Bard', 497: 'Rakan', 498: 'Xayah',
  516: 'Ornn', 517: 'Sylas', 518: 'Neeko', 523: 'Aphelios', 526: 'Rell',
  555: 'Pyke', 711: 'Vex', 777: 'Yone', 875: 'Sett', 876: 'Lillia',
  887: 'Gwen', 888: 'Renata', 893: 'Aurora', 895: 'Nilah', 897: 'KSante',
  901: 'Smolder', 902: 'Milio', 910: 'Hwei', 950: 'Naafiri'
};

export function ChampionMasteryCard({ masteries, topChampions, isLoading = false }: ChampionMasteryCardProps) {
  if (isLoading) {
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

  // Match mastery data with champion names from CHAMPION_ID_MAP first, then topChampions as fallback
  const enrichedMasteries = masteries.map(mastery => {
    // First try to get name from our ID map
    const championNameFromId = CHAMPION_ID_MAP[mastery.championId];
    
    // Fallback to topChampions if available
    const matchedChamp = topChampions.find(c => c.championId === mastery.championId);
    
    return {
      ...mastery,
      championName: championNameFromId || matchedChamp?.championName || `Champion${mastery.championId}`,
    };
  });

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
