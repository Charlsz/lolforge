'use client';

import React from 'react';
import { FunAchievement } from '@/lib/types';

interface FunAchievementsProps {
  achievements: FunAchievement[];
}

export function FunAchievements({ achievements }: FunAchievementsProps) {
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
      case 'epic':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      case 'rare':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/40';
    }
  };

  const getRarityLabel = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return '✨ Legendary';
      case 'epic':
        return '💎 Epic';
      case 'rare':
        return '⭐ Rare';
      default:
        return 'Common';
    }
  };

  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Fun Achievements</h2>
        <p className="text-sm text-[#E0EDFF]/60">Your quirky stats and milestones</p>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-lg p-4 border-2 transition-all hover:scale-[1.02]`}
          >
            {/* Rarity Badge */}
            {achievement.rarity && (
              <div className="flex justify-end mb-2">
                <span className="text-xs font-semibold text-[#FFFAFA]/80 px-2 py-1 rounded bg-black/20">
                  {getRarityLabel(achievement.rarity)}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex items-center gap-3">
              {/* Emoji Icon */}
              <div className="text-5xl flex-shrink-0">
                {achievement.emoji}
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFFAFA] mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-[#E0EDFF]/80 mb-2">
                  {achievement.description}
                </p>
                {typeof achievement.value === 'number' && (
                  <div className="text-3xl font-black text-[#6366F1]">
                    {achievement.value.toLocaleString()}
                  </div>
                )}
                {typeof achievement.value === 'string' && (
                  <div className="text-base font-bold text-[#6366F1]">
                    {achievement.value}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
