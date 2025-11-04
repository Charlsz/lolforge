'use client';

import React from 'react';
import { HighlightMoment } from '@/lib/types';

interface HighlightMomentsProps {
  highlights: HighlightMoment[];
}

const DDRAGON_VERSION = '14.23.1';

const getIconForType = (type: HighlightMoment['type']) => {
  switch (type) {
    case 'best_game':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    case 'biggest_comeback':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'worst_loss':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    case 'longest_game':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'pentakill':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
  }
};

const getColorForType = (type: HighlightMoment['type']) => {
  switch (type) {
    case 'best_game':
      return 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30';
    case 'biggest_comeback':
      return 'from-green-500/20 to-green-600/5 border-green-500/30';
    case 'worst_loss':
      return 'from-red-500/20 to-red-600/5 border-red-500/30';
    case 'longest_game':
      return 'from-blue-500/20 to-blue-600/5 border-blue-500/30';
    case 'pentakill':
      return 'from-purple-500/20 to-purple-600/5 border-purple-500/30';
  }
};

const getIconColorForType = (type: HighlightMoment['type']) => {
  switch (type) {
    case 'best_game':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'biggest_comeback':
      return 'text-green-400 bg-green-500/20';
    case 'worst_loss':
      return 'text-red-400 bg-red-500/20';
    case 'longest_game':
      return 'text-blue-400 bg-blue-500/20';
    case 'pentakill':
      return 'text-purple-400 bg-purple-500/20';
  }
};

export function HighlightMoments({ highlights }: HighlightMomentsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Highlight Moments</h2>
        <p className="text-sm text-[#E0EDFF]/60">Your most memorable games</p>
      </div>

      <div className="space-y-3">
        {highlights.slice(0, 4).map((highlight, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getColorForType(highlight.type)} rounded-lg p-4 border-2 hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${getIconColorForType(highlight.type)} flex items-center justify-center flex-shrink-0`}>
                {getIconForType(highlight.type)}
              </div>
              
              {/* Title */}
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#FFFAFA]">{highlight.title}</h3>
                <p className="text-xs text-[#E0EDFF]/70">{highlight.description}</p>
              </div>
            </div>

            {/* Stats Compact */}
            <div className="flex items-center gap-4">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${highlight.stats.championName}.png`}
                alt={highlight.stats.championName}
                className="w-10 h-10 rounded"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-[#FFFAFA]">
                  {highlight.stats.kills}/{highlight.stats.deaths}/{highlight.stats.assists}
                </div>
                <div className="text-xs text-[#E0EDFF]/60">
                  {highlight.stats.kda.toFixed(2)} KDA • {Math.floor(highlight.stats.gameDuration / 60)}:{String(highlight.stats.gameDuration % 60).padStart(2, '0')}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${highlight.stats.win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {highlight.stats.win ? 'Victory' : 'Defeat'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {highlights.length > 4 && (
        <div className="mt-4 text-center">
          <div className="text-sm text-[#E0EDFF]/60">
            +{highlights.length - 4} more highlight{highlights.length - 4 > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
