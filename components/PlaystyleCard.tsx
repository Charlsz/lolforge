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

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Your Playstyle</h2>
        <p className="text-sm text-[#E0EDFF]/60">AI-powered personality analysis</p>
      </div>

      {/* Primary Playstyle */}
      <div className={`bg-gradient-to-br ${primaryInfo.bgColor} rounded-lg p-6 border-2 ${primaryInfo.borderColor} mb-4`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{primaryInfo.icon}</div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[#E0EDFF]/60 mb-1">Primary Style</div>
            <h3 className="text-2xl font-bold text-[#FFFAFA]">
              {playstyle.primary.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h3>
          </div>
        </div>
        <p className="text-[#FFFAFA]/90 text-base leading-relaxed mb-4">
          {playstyle.description}
        </p>
        <p className="text-xs text-[#E0EDFF]/60 italic">
          {playstyle.reasoning}
        </p>
      </div>

      {/* Secondary Playstyle */}
      {secondaryInfo && playstyle.secondary && (
        <div className={`bg-gradient-to-br ${secondaryInfo.bgColor} rounded-lg p-4 border ${secondaryInfo.borderColor} mb-4`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{secondaryInfo.icon}</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[#E0EDFF]/60">Secondary Trait</div>
              <h4 className="text-lg font-bold text-[#FFFAFA]">
                {playstyle.secondary.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Trait Breakdown */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-[#FFFAFA] mb-2">Trait Breakdown</div>
        {Object.entries(playstyle.traits).map(([trait, value]) => (
          <div key={trait}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[#E0EDFF]/80">{formatTraitName(trait)}</span>
              <span className="text-sm font-semibold text-[#FFFAFA]">{Math.round(value)}%</span>
            </div>
            <div className="w-full bg-[#23262A] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#8b5cf6] rounded-full transition-all duration-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
