'use client';

import React, { useEffect, useState } from 'react';
import { LiveGameInfo } from '@/lib/types';

interface LiveGameBadgeProps {
  liveGame: LiveGameInfo | null | undefined;
  isLoading?: boolean;
}

const CHAMPION_MAP: Record<number, string> = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'TwistedFate', 5: 'XinZhao',
  222: 'Jinx', 236: 'Lucian', 238: 'Zed', 245: 'Ekko', 777: 'Yone'
};

export function LiveGameBadge({ liveGame, isLoading = false }: LiveGameBadgeProps) {
  const [gameTime, setGameTime] = useState('');

  useEffect(() => {
    if (!liveGame) return;

    const updateGameTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - liveGame.gameStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setGameTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateGameTime();
    const interval = setInterval(updateGameTime, 1000);

    return () => clearInterval(interval);
  }, [liveGame]);

  if (isLoading) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-4 border border-[#E0EDFF]/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#E0EDFF]/30 rounded-full animate-pulse"></div>
          <div className="text-sm text-[#E0EDFF]/60">Checking live game status...</div>
        </div>
      </div>
    );
  }

  if (!liveGame) {
    return (
      <div className="bg-[#1C1E22] rounded-lg p-4 border border-[#E0EDFF]/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[#FFFAFA]">
              Not Playing Right Now
            </div>
            <div className="text-xs text-[#E0EDFF]/60">
              Player is currently offline or not in a game
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getGameModeDisplay = (mode: string) => {
    if (mode.includes('RANKED')) return '🏆 Ranked';
    if (mode.includes('ARAM')) return '❄️ ARAM';
    if (mode.includes('NORMAL')) return '🎮 Normal';
    return mode;
  };

  const championName = CHAMPION_MAP[liveGame.championId] || 'Unknown';

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 border-2 border-green-400 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>

        <div className="flex-1">
          <div className="text-sm font-bold text-white uppercase tracking-wide">
            🎮 Live In-Game
          </div>
          <div className="text-xs text-white/90">
            {getGameModeDisplay(liveGame.gameMode)} • {championName} • {gameTime}
          </div>
        </div>

        <div className="bg-white/20 rounded-lg px-3 py-2">
          <div className="text-lg font-mono font-bold text-white">
            {gameTime}
          </div>
        </div>
      </div>
    </div>
  );
}
