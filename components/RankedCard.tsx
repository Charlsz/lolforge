'use client';

import React from 'react';
import { RankedInfo } from '@/lib/types';
import Image from 'next/image';

interface RankedCardProps {
  rankedInfo: RankedInfo[];
  isLoading?: boolean;
}

export function RankedCard({ rankedInfo, isLoading = false }: RankedCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-4">Ranked Status</h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 border-4 border-[#E0EDFF]/30 border-t-[#6366F1] rounded-full animate-spin"></div>
          <p className="text-[#E0EDFF]/60">Loading ranked info...</p>
        </div>
      </div>
    );
  }

  if (!rankedInfo || rankedInfo.length === 0) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-4">Ranked Status</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🎮</div>
          <p className="text-lg font-semibold text-[#FFFAFA] mb-2">Unranked This Season</p>
          <p className="text-sm text-[#E0EDFF]/60">
            Play 10 ranked games to get placed!
          </p>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'CHALLENGER':
        return 'from-cyan-400 to-blue-500';
      case 'GRANDMASTER':
        return 'from-red-500 to-red-600';
      case 'MASTER':
        return 'from-purple-500 to-purple-600';
      case 'DIAMOND':
        return 'from-blue-400 to-blue-500';
      case 'EMERALD':
        return 'from-emerald-400 to-emerald-500';
      case 'PLATINUM':
        return 'from-cyan-500 to-teal-500';
      case 'GOLD':
        return 'from-yellow-400 to-yellow-500';
      case 'SILVER':
        return 'from-gray-400 to-gray-500';
      case 'BRONZE':
        return 'from-orange-600 to-orange-700';
      case 'IRON':
        return 'from-gray-600 to-gray-700';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getQueueName = (queueType: string) => {
    if (queueType.includes('SOLO')) return 'Ranked Solo/Duo';
    if (queueType.includes('FLEX')) return 'Ranked Flex';
    return queueType;
  };

  const getTierEmoji = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'CHALLENGER':
        return '💎';
      case 'GRANDMASTER':
        return '🔥';
      case 'MASTER':
        return '👑';
      case 'DIAMOND':
        return '💠';
      case 'EMERALD':
        return '💚';
      case 'PLATINUM':
        return '🌊';
      case 'GOLD':
        return '⭐';
      case 'SILVER':
        return '⚪';
      case 'BRONZE':
        return '🟤';
      case 'IRON':
        return '⚫';
      default:
        return '🎮';
    }
  };

  return (
    <div className="space-y-4">
      {rankedInfo.map((rank, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${getTierColor(rank.tier)} rounded-lg p-5 overflow-hidden border-2 border-white/20`}
        >
          {/* Queue Type & Badges */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-white uppercase tracking-wide">
              {getQueueName(rank.queueType)}
            </div>
            <div className="flex gap-2">
              {rank.hotStreak && (
                <span className="px-2 py-1 rounded bg-orange-500/30 text-white text-xs font-bold">
                  🔥 Hot Streak
                </span>
              )}
              {rank.veteran && (
                <span className="px-2 py-1 rounded bg-purple-500/30 text-white text-xs font-bold">
                  ⚔️ Veteran
                </span>
              )}
            </div>
          </div>

          {/* Rank Display */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">
              {getTierEmoji(rank.tier)}
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">
                {rank.tier} {rank.rank}
              </div>
              <div className="text-xl font-bold text-white/90">
                {rank.leaguePoints} LP
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-white/70 mb-1">Games</div>
              <div className="text-lg font-bold text-white">{rank.wins + rank.losses}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/70 mb-1">Win Rate</div>
              <div className={`text-lg font-bold ${((rank.wins / (rank.wins + rank.losses)) * 100) >= 50 ? 'text-green-300' : 'text-red-300'}`}>
                {((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/70 mb-1">Record</div>
              <div className="text-lg font-bold text-white">{rank.wins}W {rank.losses}L</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
