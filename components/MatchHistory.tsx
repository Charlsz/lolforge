'use client';

import React from 'react';
import { MatchInfo } from '@/lib/types';

interface MatchHistoryProps {
  matches: MatchInfo[];
  playerPuuid: string;
  maxMatches?: number; // Configurable max matches to display
}

const DDRAGON_VERSION = '14.23.1';

export function MatchHistory({ matches, playerPuuid, maxMatches = 30 }: MatchHistoryProps) {
  // Take last N matches for display (default 30, max 40)
  const displayLimit = Math.min(maxMatches, 40);
  const recentMatches = matches.slice(0, displayLimit);

  const getPlayerData = (match: MatchInfo) => {
    return match.participants.find(p => p.puuid === playerPuuid);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-3 p-6">
      {recentMatches.map((match) => {
        const playerData = getPlayerData(match);
        if (!playerData) return null;

        const kda = playerData.deaths > 0 
          ? ((playerData.kills + playerData.assists) / playerData.deaths).toFixed(2)
          : (playerData.kills + playerData.assists).toFixed(2);

        return (
          <div
            key={match.matchId}
            className={`rounded-lg p-4 border-l-4 ${
              playerData.win 
                ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500' 
                : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Champion Icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#E0EDFF]/20 flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${playerData.championName}.png`}
                  alt={playerData.championName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* Match Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${playerData.win ? 'text-blue-400' : 'text-red-400'}`}>
                    {playerData.win ? 'Victory' : 'Defeat'}
                  </span>
                  <span className="text-xs text-[#E0EDFF]/60">•</span>
                  <span className="text-xs text-[#E0EDFF]/60">
                    {formatDuration(match.gameDuration)}
                  </span>
                  <span className="text-xs text-[#E0EDFF]/60">•</span>
                  <span className="text-xs text-[#E0EDFF]/60">
                    {formatTimeAgo(match.gameCreation)}
                  </span>
                </div>
                <div className="text-sm text-[#FFFAFA]">
                  {playerData.championName}
                </div>
              </div>

              {/* KDA */}
              <div className="text-right">
                <div className="text-sm font-semibold text-[#FFFAFA]">
                  {playerData.kills}/{playerData.deaths}/{playerData.assists}
                </div>
                <div className={`text-xs font-bold ${
                  parseFloat(kda) >= 3 ? 'text-yellow-400' : 
                  parseFloat(kda) >= 2 ? 'text-green-400' : 
                  'text-[#E0EDFF]/60'
                }`}>
                  {kda} KDA
                </div>
              </div>

              {/* CS */}
              <div className="text-right">
                <div className="text-sm text-[#E0EDFF]/80">
                  {playerData.totalMinionsKilled} CS
                </div>
                <div className="text-xs text-[#E0EDFF]/60">
                  {(playerData.totalMinionsKilled / (match.gameDuration / 60)).toFixed(1)}/min
                </div>
              </div>

              {/* Items */}
              <div className="flex gap-1">
                {[playerData.item0, playerData.item1, playerData.item2, playerData.item3, playerData.item4, playerData.item5].map((item, idx) => (
                  <div key={idx} className="w-7 h-7 rounded bg-[#23262A] border border-[#E0EDFF]/10">
                    {item > 0 && (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${item}.png`}
                        alt={`Item ${item}`}
                        className="w-full h-full rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
