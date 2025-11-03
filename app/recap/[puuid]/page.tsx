'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PlayerRecap } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import ChampionCard from '@/components/ChampionCard';
import WinRateChart from '@/components/WinRateChart';
import Link from 'next/link';

export default function RecapPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const puuid = params.puuid as string;
  const gameName = searchParams.get('gameName') || '';
  const tagLine = searchParams.get('tagLine') || '';

  const [recap, setRecap] = useState<PlayerRecap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecap = async () => {
      try {
        const response = await fetch(`/api/recap?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&count=20`);
        
        if (!response.ok) {
          throw new Error('Failed to load recap');
        }

        const data = await response.json();
        setRecap(data);
      } catch (err) {
        setError('Failed to load your recap. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecap();
  }, [gameName, tagLine]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your recap...</p>
        </div>
      </div>
    );
  }

  if (error || !recap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg transition-all"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {recap.player.gameName}
                <span className="text-gray-500 dark:text-gray-400">#{recap.player.tagLine}</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Last {recap.totalGames} games analyzed
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Games" 
            value={recap.totalGames}
            subtitle={`${recap.wins}W / ${recap.losses}L`}
          />
          <StatsCard 
            title="Win Rate" 
            value={`${recap.overallWinRate.toFixed(1)}%`}
            trend={recap.overallWinRate >= 50 ? 'up' : 'down'}
          />
          <StatsCard 
            title="Overall KDA" 
            value={recap.overallKDA.toFixed(2)}
            subtitle={`${recap.averageKills.toFixed(1)} / ${recap.averageDeaths.toFixed(1)} / ${recap.averageAssists.toFixed(1)}`}
          />
          <StatsCard 
            title="Current Streak" 
            value={Math.abs(recap.currentStreak)}
            subtitle={recap.currentStreak > 0 ? 'Wins' : recap.currentStreak < 0 ? 'Losses' : 'N/A'}
            trend={recap.currentStreak > 0 ? 'up' : recap.currentStreak < 0 ? 'down' : 'neutral'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Win Rate Chart */}
          <div className="lg:col-span-1">
            <WinRateChart 
              wins={recap.wins}
              losses={recap.losses}
              winRate={recap.overallWinRate}
            />
          </div>

          {/* Streaks */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Best Win Streak
                </h3>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {recap.bestStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                consecutive wins
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Worst Loss Streak
                </h3>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {recap.worstStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                consecutive losses
              </p>
            </div>

            {/* Role Distribution */}
            <div className="sm:col-span-2 relative overflow-hidden rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                Role Distribution
              </h3>
              <div className="space-y-3">
                {recap.roleStats.map((role, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {role.role || 'FILL'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {role.games} games ({role.winRate.toFixed(0)}% WR)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                        style={{ width: `${(role.games / recap.totalGames) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Champions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Top Champions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {recap.topChampions.map((champion, index) => (
              <ChampionCard 
                key={champion.championName}
                champion={champion}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200/50 dark:border-white/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data provided by Riot Games API
          </p>
        </div>
      </div>
    </div>
  );
}
