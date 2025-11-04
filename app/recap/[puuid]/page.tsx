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
import { ShareableRecap } from '@/components/ShareableRecap';
import { TimelineChart } from '@/components/TimelineChart';
import { HighlightMoments } from '@/components/HighlightMoments';
import { SocialComparison } from '@/components/SocialComparison';
import { PlaystyleCard } from '@/components/PlaystyleCard';
import { FunAchievements } from '@/components/FunAchievements';
import { SocialShare } from '@/components/SocialShare';
import { RankedCard } from '@/components/RankedCard';
import { ChampionMasteryCard } from '@/components/ChampionMasteryCard';
import { LiveGameBadge } from '@/components/LiveGameBadge';
import { MatchHistory } from '@/components/MatchHistory';
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
        console.log('🏆 Ranked info:', data.rankedInfo);
        console.log('🎖️ Mastery info:', data.championMasteries);
        console.log('⚡ Live game:', data.liveGame);
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

  // Function to generate AI insights on-demand with MUCH more data
  const generateAIInsights = async () => {
    if (!recap) return;
    
    setIsGeneratingAI(true);
    setAiError('');

    try {
      console.log('Generating enhanced AI insights...');
      
      // Calculate additional metrics for better insights
      const uniqueChampions = new Set(recap.topChampions.map(c => c.championName)).size;
      const totalKills = recap.averageKills * recap.totalGames;
      const totalDeaths = recap.averageDeaths * recap.totalGames;
      const totalAssists = recap.averageAssists * recap.totalGames;
      const mainRole = recap.roleStats[0]?.role || 'FILL';
      const bestChampion = recap.topChampions[0]?.championName || 'Unknown';
      const worstChampion = recap.topChampions[recap.topChampions.length - 1]?.championName || 'Unknown';
      
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic stats
          totalGames: recap.totalGames,
          wins: recap.wins,
          losses: recap.losses,
          winRate: recap.overallWinRate.toFixed(1),
          kda: recap.overallKDA.toFixed(2),
          avgKills: recap.averageKills.toFixed(1),
          avgDeaths: recap.averageDeaths.toFixed(1),
          avgAssists: recap.averageAssists.toFixed(1),
          
          // Champion data
          topChampion: recap.topChampions[0]?.championName || 'Unknown',
          topChampionWR: recap.topChampions[0]?.winRate.toFixed(1) || '0',
          topChampionGames: recap.topChampions[0]?.games || 0,
          uniqueChampions: uniqueChampions,
          bestChampion: bestChampion,
          worstChampion: worstChampion,
          
          // Advanced metrics
          clutchFactor: recap.advancedMetrics?.clutchFactor.toFixed(1) || '0',
          carryPotential: recap.advancedMetrics?.carryPotential.toFixed(1) || '0',
          consistencyScore: recap.advancedMetrics?.consistencyScore.toFixed(0) || '0',
          
          // Growth & trends
          peakMonth: recap.advancedMetrics?.peakPerformanceMonth || 'Unknown',
          improvement: recap.advancedMetrics?.earlyVsLateImprovement.improvement.toFixed(1) || '0',
          bestStreak: recap.bestStreak,
          worstStreak: recap.worstStreak,
          currentStreak: recap.currentStreak,
          
          // Playstyle indicators
          mainRole: mainRole,
          roleFlexibility: recap.roleStats.length > 2 ? 'High' : 'Low',
          aggressionScore: recap.overallKDA > 3 ? 'Calculated' : recap.overallKDA < 2 ? 'Aggressive' : 'Balanced',
          teamfightScore: recap.averageAssists > 8 ? 'High' : 'Moderate',
          objectiveScore: 'Average', // Placeholder - would need more data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI insights');
      }

      const data = await response.json();
      setAiInsights(data.insights);
      console.log('Enhanced AI insights generated successfully');
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

            {/* Player Info with Rank */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#FFFAFA]">
                  {recap.player.gameName}
                  <span className="text-[#E0EDFF]/60">#{recap.player.tagLine}</span>
                </h1>
                
                {/* Ranked Badges - Both Queues */}
                {recap.rankedInfo && recap.rankedInfo.length > 0 && (
                  <div className="flex items-center gap-2">
                    {recap.rankedInfo.map((rank, index) => {
                      const winRate = ((rank.wins / (rank.wins + rank.losses)) * 100).toFixed(0);
                      return (
                        <div 
                          key={index}
                          className="flex flex-col gap-2 px-3 py-2 rounded-lg bg-[#23262A] border border-[#E0EDFF]/10"
                        >
                          {/* Queue Type Header */}
                          <div className="text-[11px] font-bold text-[#E0EDFF]/50 uppercase tracking-wide">
                            {rank.queueType.includes('SOLO') ? 'Ranked Solo' : 'Ranked Flex'}
                          </div>
                          
                          {/* Rank Info */}
                          <div className="flex items-center gap-2">
                            <img 
                              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${rank.tier.toLowerCase()}.png`}
                              alt={rank.tier}
                              className="w-6 h-6"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-bold text-[#FFFAFA]">
                                {rank.tier} {rank.rank}
                              </span>
                              <span className="text-[10px] text-[#E0EDFF]/60">
                                {rank.leaguePoints}LP • {winRate}% • {rank.wins}W {rank.losses}L
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Live Status Badge */}
                {recap.liveGame && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-green-400">IN GAME</span>
                  </div>
                )}
              </div>
              <p className="text-[#E0EDFF]/60 text-sm mt-1">
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

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* AI Insights at Top */}
        <div className="mb-8">
          {aiInsights || recap.aiInsights ? (
            <div className="bg-gradient-to-br from-[#1C1E22] to-[#23262A] rounded-lg p-8 border border-[#6366F1]/30">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-[#FFFAFA] mb-1">Your {new Date().getFullYear()} Wrapped</h2>
                  <p className="text-sm text-[#E0EDFF]/60">Powered by AWS Bedrock Claude</p>
                </div>
                <button
                  onClick={() => {
                    const modal = document.getElementById('share-modal');
                    if (modal) {
                      modal.classList.remove('hidden');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-semibold transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  View Shareable Cards
                </button>
              </div>
              <p className="text-[#E0EDFF]/80 text-center text-lg">
                ✨ Click "View Shareable Cards" to see your personalized year recap images
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#6366F1]/10 to-transparent rounded-lg p-8 border border-[#6366F1]/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#FFFAFA] mb-2">Unlock Your {new Date().getFullYear()} Wrapped</h3>
              <p className="text-sm text-[#E0EDFF]/70 mb-6 max-w-md mx-auto">
                Get personalized shareable recap cards powered by AWS Bedrock Claude
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
                    <span>Generate Your Wrapped</span>
                  </>
                )}
              </button>
              <p className="text-xs text-[#E0EDFF]/50 mt-3">Takes 5-10 seconds</p>
            </div>
          )}
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Col span 3 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Win Rate Chart + Streaks Combined */}
            <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
              <h3 className="text-sm font-semibold text-[#FFFAFA] mb-4">Win Rate Distribution</h3>
              <WinRateChart 
                wins={recap.wins}
                losses={recap.losses}
                winRate={recap.overallWinRate}
              />
              
              {/* Streaks */}
              <div className="mt-6 pt-6 border-t border-[#E0EDFF]/10">
                <div className="grid grid-cols-2 gap-4">
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

            {/* Champion Mastery - Full */}
            <ChampionMasteryCard 
              masteries={recap.championMasteries || []} 
              topChampions={recap.topChampions}
            />

            {/* Role Distribution */}
            <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
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

            {/* Timeline + Fun Achievements Side by Side */}
            <div className="space-y-6">
              {/* Timeline Chart */}
              {recap.monthlyTimeline && recap.monthlyTimeline.length > 0 && (
                <TimelineChart data={recap.monthlyTimeline} />
              )}
              
              {/* Fun Achievements */}
              {recap.funAchievements && recap.funAchievements.length > 0 && (
                <FunAchievements achievements={recap.funAchievements} />
              )}
            </div>

          </div>

          {/* CENTER CONTENT - Col span 6 - Match History */}
          <div className="lg:col-span-6">
            <div className="bg-[#1C1E22] rounded-lg border border-[#E0EDFF]/10 overflow-hidden flex flex-col" style={{ height: 'fit-content', minHeight: '800px' }}>
              <div className="p-6 border-b border-[#E0EDFF]/10">
                <h2 className="text-xl font-bold text-[#FFFAFA]">Match History</h2>
                <p className="text-sm text-[#E0EDFF]/60 mt-1">Last {recap.totalGames} games</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {recap.matches && recap.matches.length > 0 ? (
                  <MatchHistory matches={recap.matches} playerPuuid={recap.player.puuid} />
                ) : (
                  <div className="p-8 text-center text-[#E0EDFF]/60">
                    No match history available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Col span 3 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Advanced Metrics */}
            {recap.advancedMetrics && (
              <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
                <AdvancedMetricsCard metrics={recap.advancedMetrics} />
              </div>
            )}

            {/* Playstyle + Highlight Moments Stacked */}
            <div className="space-y-6">
              {/* Playstyle Analysis */}
              {recap.playstyle && (
                <PlaystyleCard playstyle={recap.playstyle} />
              )}
              
              {/* Highlight Moments */}
              {recap.highlightMoments && recap.highlightMoments.length > 0 && (
                <HighlightMoments highlights={recap.highlightMoments} />
              )}
            </div>

            {/* Social Share */}
            <SocialShare 
              gameName={recap.player.gameName}
              wins={recap.wins}
              losses={recap.losses}
              winRate={recap.overallWinRate}
              kda={recap.overallKDA}
              topChampion={recap.topChampions[0]?.championName || 'N/A'}
            />

            {/* Social Comparison */}
            <SocialComparison currentPlayer={recap} />

          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 border-t border-[#E0EDFF]/10">
          <p className="text-xs text-[#E0EDFF]/50">
            Data provided by Riot Games API
          </p>
        </div>
      </div>

      {/* Share Modal - Spotify Wrapped Style */}
      <div 
        id="share-modal"
        className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.classList.add('hidden');
          }
        }}
      >
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => {
                const modal = document.getElementById('share-modal');
                if (modal) modal.classList.add('hidden');
              }}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#6366F1] hover:bg-[#6366F1]/90 flex items-center justify-center text-white transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-white/70">Tap any slide to download and share</p>
              </div>

              {aiInsights && (
                <ShareableRecap 
                  player={{
                    gameName: recap.player.gameName,
                    tagLine: recap.player.tagLine,
                    profileIconId: recap.player.profileIconId || 29
                  }}
                  stats={{
                    totalGames: recap.totalGames,
                    wins: recap.wins,
                    losses: recap.losses,
                    winRate: recap.overallWinRate,
                    kda: recap.overallKDA,
                    topChampion: recap.topChampions[0]?.championName || 'Unknown',
                    topChampionWR: recap.topChampions[0]?.winRate || 0
                  }}
                  aiInsights={aiInsights}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}