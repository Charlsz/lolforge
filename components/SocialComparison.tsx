'use client';

import React, { useState } from 'react';
import { PlayerRecap } from '@/lib/types';

interface SocialComparisonProps {
  currentPlayer: PlayerRecap;
}

const DDRAGON_VERSION = '14.23.1';

export function SocialComparison({ currentPlayer }: SocialComparisonProps) {
  const [friendTag, setFriendTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [friendData, setFriendData] = useState<PlayerRecap | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!friendTag.includes('#')) {
      setError('Please use format: GameName#TAG');
      return;
    }

    setIsLoading(true);
    setError('');
    setFriendData(null);

    try {
      const [gameName, tagLine] = friendTag.split('#');
      
      // Get friend's recap directly with gameName and tagLine
      const recapRes = await fetch(`/api/recap?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
      
      if (!recapRes.ok) {
        const errorData = await recapRes.json();
        throw new Error(errorData.error || 'Could not load friend stats');
      }

      const recapData = await recapRes.json();
      setFriendData(recapData);
    } catch (err) {
      console.error('Error comparing friend:', err);
      setError(err instanceof Error ? err.message : 'Failed to load friend');
    } finally {
      setIsLoading(false);
    }
  };

  const renderComparison = (
    label: string,
    currentValue: number | string,
    friendValue: number | string,
    format: 'number' | 'percent' | 'kda' = 'number'
  ) => {
    const current = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue;
    const friend = typeof friendValue === 'string' ? parseFloat(friendValue) : friendValue;
    const isCurrentBetter = current > friend;

    const formatValue = (val: number) => {
      if (format === 'percent') return `${val.toFixed(1)}%`;
      if (format === 'kda') return val.toFixed(2);
      return Math.round(val).toString();
    };

    return (
      <div className="bg-[#23262A] rounded-lg p-4">
        <div className="text-xs text-[#E0EDFF]/60 mb-3 text-center uppercase tracking-wide">{label}</div>
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* Current Player */}
          <div className={`text-center ${isCurrentBetter ? 'text-green-400 font-bold' : 'text-[#FFFAFA]'}`}>
            <div className="text-lg">{formatValue(current)}</div>
          </div>

          {/* VS Indicator */}
          <div className="text-center">
            <div className="text-xs text-[#E0EDFF]/40 font-semibold">VS</div>
          </div>

          {/* Friend */}
          <div className={`text-center ${!isCurrentBetter ? 'text-green-400 font-bold' : 'text-[#FFFAFA]'}`}>
            <div className="text-lg">{formatValue(friend)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Compare with Friends</h2>
        <p className="text-sm text-[#E0EDFF]/60">See how you stack up against your friends</p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Friend's GameName#TAG"
            value={friendTag}
            onChange={(e) => setFriendTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            className="flex-1 px-4 py-3 rounded-lg bg-[#23262A] border border-[#E0EDFF]/10 text-[#FFFAFA] placeholder-[#E0EDFF]/40 focus:outline-none focus:border-[#6366F1] transition-colors"
          />
          <button
            onClick={handleCompare}
            disabled={isLoading || !friendTag}
            className="px-6 py-3 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 disabled:bg-[#6366F1]/50 text-white font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Compare'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Comparison Results */}
      {friendData && (
        <div>
          {/* Player Names with Profile Icons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {/* Current Player */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#6366F1] mb-2">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${currentPlayer.player.profileIconId || 29}.png`}
                  alt={currentPlayer.player.gameName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/29.png`;
                  }}
                />
              </div>
              <div className="text-sm font-bold text-[#6366F1] text-center">
                {currentPlayer.player.gameName}
              </div>
              <div className="text-xs text-[#E0EDFF]/60">You</div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold text-[#E0EDFF]/40">VS</div>
            </div>

            {/* Friend */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#6366F1] mb-2">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${friendData.player.profileIconId || 29}.png`}
                  alt={friendData.player.gameName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/29.png`;
                  }}
                />
              </div>
              <div className="text-sm font-bold text-[#6366F1] text-center">
                {friendData.player.gameName}
              </div>
              <div className="text-xs text-[#E0EDFF]/60">Friend</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {renderComparison('Win Rate', currentPlayer.overallWinRate, friendData.overallWinRate, 'percent')}
            {renderComparison('KDA', currentPlayer.overallKDA, friendData.overallKDA, 'kda')}
            {renderComparison('Total Games', currentPlayer.totalGames, friendData.totalGames)}
            {renderComparison('Wins', currentPlayer.wins, friendData.wins)}
            {renderComparison('Avg Kills', currentPlayer.averageKills, friendData.averageKills, 'kda')}
            {renderComparison('Avg Deaths', currentPlayer.averageDeaths, friendData.averageDeaths, 'kda')}
          </div>

          {/* Champion Comparison */}
          <div className="mt-6 bg-[#23262A] rounded-lg p-4">
            <div className="text-xs text-[#E0EDFF]/60 mb-4 text-center uppercase tracking-wide">
              Most Played Champions
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Current Player Champion */}
              <div className="flex flex-col items-center">
                {currentPlayer.topChampions[0] ? (
                  <>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#6366F1]/30 mb-2">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${currentPlayer.topChampions[0].championName}.png`}
                        alt={currentPlayer.topChampions[0].championName}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                    <div className="text-sm font-semibold text-[#FFFAFA] mb-1 text-center">
                      {currentPlayer.topChampions[0].championName}
                    </div>
                    <div className="text-xs text-[#E0EDFF]/60 text-center">
                      {currentPlayer.topChampions[0].games} games
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${currentPlayer.topChampions[0].winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPlayer.topChampions[0].winRate.toFixed(0)}% WR
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#E0EDFF]/60">N/A</div>
                )}
              </div>

              {/* Friend Champion */}
              <div className="flex flex-col items-center">
                {friendData.topChampions[0] ? (
                  <>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#6366F1]/30 mb-2">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${friendData.topChampions[0].championName}.png`}
                        alt={friendData.topChampions[0].championName}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                    <div className="text-sm font-semibold text-[#FFFAFA] mb-1 text-center">
                      {friendData.topChampions[0].championName}
                    </div>
                    <div className="text-xs text-[#E0EDFF]/60 text-center">
                      {friendData.topChampions[0].games} games
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${friendData.topChampions[0].winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {friendData.topChampions[0].winRate.toFixed(0)}% WR
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#E0EDFF]/60">N/A</div>
                )}
              </div>
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={() => {
              setFriendData(null);
              setFriendTag('');
            }}
            className="mt-4 w-full py-2 text-sm text-[#E0EDFF]/60 hover:text-[#FFFAFA] transition-colors"
          >
            Clear Comparison
          </button>
        </div>
      )}

      {/* Empty State */}
      {!friendData && !isLoading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-[#E0EDFF]/60">
            Enter a friend&apos;s GameName#TAG to compare stats
          </p>
        </div>
      )}
    </div>
  );
}
