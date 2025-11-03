/*
 * RECAP PAGE - Diseño Moderno Inspirado en OP.GG
 * 
 * COLORES DEL TEMA:
 * - #FFFAFA: Blanco (texto principal)
 * - #23262A: Fondo oscuro principal
 * - #E0EDFF: Azul claro (acentos)
 * - #6366F1: Índigo (botones, enlaces)
 * 
 * ESTRUCTURA:
 * - Header: Logo + perfil del jugador con stats principales
 * - Sidebar izquierdo: Gráfico de winrate + role distribution
 * - Contenido central: Historial de partidas con detalles
 * - Bottom: Champions performance + AI insights (creativamente integrado)
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PlayerRecap } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import ChampionCard from '@/components/ChampionCard';
import WinRateChart from '@/components/WinRateChart';
import AdvancedMetricsCard from '@/components/AdvancedMetricsCard';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';
import Image from 'next/image';

export default function RecapPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const puuid = params.puuid as string;
  const gameName = searchParams.get('gameName') || '';
  const tagLine = searchParams.get('tagLine') || '';

  // Data Dragon version for icons
  const DDRAGON_VERSION = '14.24.1';

  const [recap, setRecap] = useState<PlayerRecap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once - prevent multiple calls using ref (persists across re-renders)
    if (hasFetchedRef.current || !gameName || !tagLine) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchRecap = async () => {
      try {
        console.log(`Fetching recap for ${gameName}#${tagLine}...`);
        const response = await fetch(`/api/recap?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('Error response:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          throw new Error(errorData.details || errorData.error || `Failed to load recap (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log('Recap data received:', data);
        setRecap(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your recap. Please try again.';
        setError(errorMessage);
        console.error('Recap error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecap();
  }, [gameName, tagLine]);

  // Function to generate AI insights on-demand
  const generateAIInsights = async () => {
    if (!recap) return;
    
    setIsGeneratingAI(true);
    setAiError('');

    try {
      console.log('Generating AI insights...');
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalGames: recap.totalGames,
          winRate: recap.overallWinRate.toFixed(1),
          topChampion: recap.topChampions[0]?.championName || 'Unknown',
          topChampionWR: recap.topChampions[0]?.winRate.toFixed(1) || '0',
          kda: recap.overallKDA.toFixed(2),
          clutchFactor: recap.advancedMetrics?.clutchFactor.toFixed(1) || '0',
          carryPotential: recap.advancedMetrics?.carryPotential.toFixed(1) || '0',
          consistencyScore: recap.advancedMetrics?.consistencyScore.toFixed(0) || '0',
          peakMonth: recap.advancedMetrics?.peakPerformanceMonth || 'Unknown',
          improvement: recap.advancedMetrics?.earlyVsLateImprovement.improvement.toFixed(1) || '0',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI insights');
      }

      const data = await response.json();
      setAiInsights(data.insights);
      console.log('AI insights generated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI insights';
      setAiError(errorMessage);
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#23262A] flex items-center justify-center">
        <Link href="/" className="absolute top-6 left-6 z-20">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={60}
            height={60}
            className="h-[60px] w-[60px] hover:scale-110 transition-transform"
          />
        </Link>

        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#E0EDFF]/30 border-t-[#6366F1] rounded-full animate-spin mb-4" />
          <p className="text-[#FFFAFA] text-lg font-medium">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (error || !recap) {
    return (
      <div className="min-h-screen bg-[#23262A] flex items-center justify-center px-6">
        <Link href="/" className="absolute top-6 left-6 z-20">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={60}
            height={60}
            className="h-[60px] w-[60px] hover:scale-110 transition-transform"
          />
        </Link>

        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#FFFAFA] mb-2">Something went wrong</h2>
          <p className="text-[#E0EDFF]/70 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block py-3 px-6 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium shadow-lg transition-all"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#23262A]">
      {/* Logo en esquina superior izquierda */}
      <Link href="/" className="fixed top-6 left-6 z-50">
        <Image
          src="/logo.png"
          alt="LOLFORGE"
          width={60}
          height={60}
          className="h-[60px] w-[60px] hover:scale-110 transition-transform"
        />
      </Link>

      {/* Header con perfil del jugador */}
      <div className="bg-[#1C1E22] border-b border-[#E0EDFF]/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {/* Profile Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#6366F1]">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${recap.player.profileIconId || 29}.png`}
                  alt="Profile Icon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/29.png`;
                  }}
                />
              </div>
              {recap.player.summonerLevel && (
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-[#6366F1] text-xs font-bold text-white">
                  {recap.player.summonerLevel}
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#FFFAFA]">
                {recap.player.gameName}
                <span className="text-[#E0EDFF]/60">#{recap.player.tagLine}</span>
              </h1>
              <p className="text-[#E0EDFF]/60 text-sm">
                Last {recap.totalGames} games
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FFFAFA]">{recap.totalGames}</div>
                <div className="text-xs text-[#E0EDFF]/60">Played</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${recap.overallWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {recap.overallWinRate.toFixed(1)}%
                </div>
                <div className="text-xs text-[#E0EDFF]/60">{recap.wins}W {recap.losses}L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FFFAFA]">{recap.overallKDA.toFixed(2)}</div>
                <div className="text-xs text-[#E0EDFF]/60">KDA</div>
              </div>
            </div>

            {/* Share Button */}
            <ShareButton 
              playerName={`${recap.player.gameName}#${recap.player.tagLine}`}
              wins={recap.wins}
              losses={recap.losses}
              winRate={recap.overallWinRate}
              kda={recap.overallKDA}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Izquierdo */}
          <div className="lg:col-span-1 space-y-4">
            {/* Win Rate Chart */}
            <div className="bg-[#1C1E22] rounded-lg p-4 border border-[#E0EDFF]/10">
              <WinRateChart 
                wins={recap.wins}
                losses={recap.losses}
                winRate={recap.overallWinRate}
              />
            </div>

            {/* Role Distribution */}
            <div className="bg-[#1C1E22] rounded-lg p-4 border border-[#E0EDFF]/10">
              <h3 className="text-sm font-semibold text-[#FFFAFA] mb-4">Roles</h3>
              <div className="space-y-3">
                {recap.roleStats.map((role, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#FFFAFA]">{role.role || 'FILL'}</span>
                      <span className="text-xs text-[#E0EDFF]/60">{role.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#23262A] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6366F1]"
                        style={{ width: `${(role.games / recap.totalGames) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streaks */}
            <div className="bg-[#1C1E22] rounded-lg p-4 border border-[#E0EDFF]/10">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-[#E0EDFF]/60 mb-1">Best Streak</div>
                  <div className="text-2xl font-bold text-green-400">{recap.bestStreak}W</div>
                </div>
                <div>
                  <div className="text-xs text-[#E0EDFF]/60 mb-1">Worst Streak</div>
                  <div className="text-2xl font-bold text-red-400">{recap.worstStreak}L</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Champions */}
            <div>
              <h2 className="text-xl font-bold text-[#FFFAFA] mb-4">Champion Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {recap.topChampions.slice(0, 6).map((champion, index) => (
                  <div key={champion.championName} className="bg-[#1C1E22] rounded-lg p-3 border border-[#E0EDFF]/10">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${champion.championName}.png`}
                        alt={champion.championName}
                        className="w-12 h-12 rounded"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#FFFAFA]">{champion.championName}</div>
                        <div className="text-xs text-[#E0EDFF]/60">{champion.games} played</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${champion.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {champion.winRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-[#E0EDFF]/60">{champion.kda.toFixed(2)} KDA</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Metrics */}
            {recap.advancedMetrics && (
              <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
                <AdvancedMetricsCard metrics={recap.advancedMetrics} />
              </div>
            )}

            {/* AI Insights - Diseño Creativo */}
            <div className="relative overflow-hidden">
              {aiInsights || recap.aiInsights ? (
                <div className="bg-gradient-to-br from-[#6366F1]/20 to-[#E0EDFF]/5 rounded-lg p-6 border border-[#6366F1]/30">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#FFFAFA] mb-1">AI Performance Analysis</h3>
                      <p className="text-xs text-[#E0EDFF]/60 mb-3">Powered by AWS Bedrock Claude</p>
                      <p className="text-sm text-[#FFFAFA]/90 leading-relaxed whitespace-pre-line">
                        {aiInsights || recap.aiInsights}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#6366F1]/10 to-transparent rounded-lg p-8 border border-[#6366F1]/20 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#FFFAFA] mb-2">Unlock AI-Powered Insights</h3>
                  <p className="text-sm text-[#E0EDFF]/70 mb-6 max-w-md mx-auto">
                    Get personalized recommendations and deep performance analysis powered by AWS Bedrock Claude
                  </p>
                  
                  {aiError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {aiError}
                    </div>
                  )}

                  <button
                    onClick={generateAIInsights}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 disabled:bg-[#6366F1]/50 text-white font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI Insights</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-[#E0EDFF]/50 mt-3">Takes 5-10 seconds</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 border-t border-[#E0EDFF]/10">
          <p className="text-xs text-[#E0EDFF]/50">
            Data provided by Riot Games API
          </p>
        </div>
      </div>
    </div>
  );
}