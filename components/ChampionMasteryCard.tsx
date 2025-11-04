'use client';

import React from 'react';
import { ChampionMastery } from '@/lib/types';

interface ChampionMasteryCardProps {
  masteries: ChampionMastery[];
  topChampions: Array<{ championName: string; championId: number }>;
  isLoading?: boolean;
}

const DDRAGON_VERSION = '14.23.1';

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

  // Match mastery data with champion names from topChampions
  const enrichedMasteries = masteries.map(mastery => {
    const matchedChamp = topChampions.find(c => c.championId === mastery.championId);
    return {
      ...mastery,
      championName: matchedChamp?.championName || `Champion${mastery.championId}`,
    };
  });

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

      <div className="space-y-3">
        {enrichedMasteries.map((mastery, index) => (
          <div
            key={mastery.championId}
            className={`relative bg-gradient-to-r ${getMasteryColor(mastery.championLevel)} rounded-lg p-4 overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              {/* Rank Number */}
              <div className="text-3xl font-black text-white/40">
                #{index + 1}
              </div>

              {/* Champion Icon */}
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${mastery.championName}.png`}
                  alt={mastery.championName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/29.png`;
                  }}
                />
              </div>

              {/* Champion Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">
                    {mastery.championName}
                  </h3>
                  <span className="text-xl">
                    {getMasteryBadge(mastery.championLevel)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span className="font-semibold">Level {mastery.championLevel}</span>
                  <span>•</span>
                  <span>{formatPoints(mastery.championPoints)} points</span>
                  {mastery.lastPlayTime > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatDate(mastery.lastPlayTime)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mastery Level Badge */}
              <div className="flex flex-col items-center bg-black/30 rounded-lg px-3 py-2">
                <div className="text-2xl font-black text-white">
                  {mastery.championLevel}
                </div>
                <div className="text-xs text-white/70 uppercase tracking-wide">
                  Mastery
                </div>
              </div>
            </div>

            {/* Progress Bar (if not max level) */}
            {mastery.championLevel < 7 && mastery.championPointsUntilNextLevel > 0 && (
              <div className="relative z-10 mt-3">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>Progress to Level {mastery.championLevel + 1}</span>
                  <span>{formatPoints(mastery.championPointsSinceLastLevel)} / {formatPoints(mastery.championPointsSinceLastLevel + mastery.championPointsUntilNextLevel)}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${(mastery.championPointsSinceLastLevel / (mastery.championPointsSinceLastLevel + mastery.championPointsUntilNextLevel)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
