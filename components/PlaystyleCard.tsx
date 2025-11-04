'use client';

import React from 'react';
import { PlaystyleAnalysis } from '@/lib/types';

interface PlaystyleCardProps {
  playstyle: PlaystyleAnalysis;
}

export function PlaystyleCard({ playstyle }: PlaystyleCardProps) {
  const getPlaystyleInfo = (type: string) => {
    switch (type) {
      case 'aggressive':
        return {
          icon: '⚔️',
          color: '#ef4444',
          bgColor: 'from-red-500/20 to-orange-500/20',
          borderColor: 'border-red-500/40',
        };
      case 'defensive':
        return {
          icon: '🛡️',
          color: '#3b82f6',
          bgColor: 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/40',
        };
      case 'team_player':
        return {
          icon: '🤝',
          color: '#10b981',
          bgColor: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/40',
        };
      case 'solo_carry':
        return {
          icon: '👑',
          color: '#f59e0b',
          bgColor: 'from-yellow-500/20 to-amber-500/20',
          borderColor: 'border-yellow-500/40',
        };
      case 'strategic':
        return {
          icon: '🧠',
          color: '#8b5cf6',
          bgColor: 'from-purple-500/20 to-violet-500/20',
          borderColor: 'border-purple-500/40',
        };
      default:
        return {
          icon: '🎮',
          color: '#6366f1',
          bgColor: 'from-indigo-500/20 to-blue-500/20',
          borderColor: 'border-indigo-500/40',
        };
    }
  };

  const primaryInfo = getPlaystyleInfo(playstyle.primary);
  const secondaryInfo = playstyle.secondary ? getPlaystyleInfo(playstyle.secondary) : null;

  const formatTraitName = (trait: string) => {
    return trait.charAt(0).toUpperCase() + trait.slice(1);
  };

  // Convert percentage to descriptive text
  const getTraitLevel = (value: number): { text: string; color: string } => {
    if (value >= 80) return { text: 'Exceptional', color: 'text-green-400' };
    if (value >= 65) return { text: 'Very High', color: 'text-emerald-400' };
    if (value >= 50) return { text: 'High', color: 'text-blue-400' };
    if (value >= 35) return { text: 'Moderate', color: 'text-yellow-400' };
    if (value >= 20) return { text: 'Low', color: 'text-orange-400' };
    return { text: 'Very Low', color: 'text-red-400' };
  };

  return (
    <div className="bg-[#1C1E22] rounded-lg p-5 border border-[#E0EDFF]/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#FFFAFA] mb-1">Your Playstyle</h2>
        <p className="text-xs text-[#E0EDFF]/60">AI-powered analysis</p>
      </div>

      {/* Primary & Secondary Combined */}
      <div className="space-y-2 mb-4">
        {/* Primary Playstyle */}
        <div className={`bg-gradient-to-br ${primaryInfo.bgColor} rounded-lg p-3 border ${primaryInfo.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{primaryInfo.icon}</div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wide text-[#E0EDFF]/60 mb-0.5">Primary Style</div>
              <h3 className="text-base font-bold text-[#FFFAFA]">
                {playstyle.primary.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h3>
            </div>
          </div>
        </div>

        {/* Secondary Playstyle */}
        {secondaryInfo && playstyle.secondary && (
          <div className={`bg-gradient-to-br ${secondaryInfo.bgColor} rounded-lg p-3 border ${secondaryInfo.borderColor}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{secondaryInfo.icon}</div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wide text-[#E0EDFF]/60">Secondary</div>
                <h4 className="text-sm font-bold text-[#FFFAFA]">
                  {playstyle.secondary.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description - Compact */}
      <p className="text-xs text-[#FFFAFA]/80 leading-relaxed mb-4 line-clamp-3">
        {playstyle.description}
      </p>

      {/* Trait Breakdown - More Compact */}
      <div className="bg-[#23262A] rounded-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-[#FFFAFA] mb-2">Your Attributes</div>
        {Object.entries(playstyle.traits).map(([trait, value]) => {
          const level = getTraitLevel(value);
          return (
            <div key={trait} className="flex items-center justify-between py-1.5 border-b border-[#E0EDFF]/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#E0EDFF]/80 min-w-[85px]">{formatTraitName(trait)}</span>
                <div className="w-16 bg-[#1C1E22] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#8b5cf6] rounded-full transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs font-semibold ${level.color}`}>{level.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
