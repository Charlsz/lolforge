'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';

interface ShareableRecapProps {
  player: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
  };
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    kda: number;
    topChampion: string;
    topChampionWR: number;
  };
  aiInsights: string;
}

const DDRAGON_VERSION = '14.23.1';

// Helper function to download slide as image
const downloadSlide = async (slideId: string, filename: string) => {
  const element = document.getElementById(slideId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
      logging: false,
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error downloading slide:', error);
  }
};

export function ShareableRecap({ player, stats, aiInsights }: ShareableRecapProps) {
  const currentYear = new Date().getFullYear();
  const sections = aiInsights.split('|||').filter(s => s.trim());
  
  // Parse sections into title and content
  const parsedSections = [];
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i] && sections[i + 1]) {
      parsedSections.push({
        title: sections[i].trim(),
        content: sections[i + 1].trim()
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Slide 1: Cover/Intro */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-1"
        onClick={() => downloadSlide('recap-slide-1', `${player.gameName}-${currentYear}-cover.png`)}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={60}
            height={60}
            className="mb-4"
          />
          <h1 className="text-4xl font-black text-white mb-2">
            Your {currentYear}
          </h1>
          <h2 className="text-5xl font-black text-white">
            Wrapped
          </h2>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30">
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${player.profileIconId || 29}.png`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-white font-bold text-xl">
                {player.gameName}
              </div>
              <div className="text-white/70 text-sm">
                #{player.tagLine}
              </div>
            </div>
          </div>
          
          <div className="text-white/80 text-sm">
            {stats.totalGames} games analyzed
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Click to download
        </div>
      </div>

      {/* Slide 2: Stats Overview */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#23262A] to-[#1C1E22] rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-2"
        onClick={() => downloadSlide('recap-slide-2', `${player.gameName}-${currentYear}-stats.png`)}
      >
        <div className="absolute top-8 right-8">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={40}
            height={40}
            className="opacity-50"
          />
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <div className="text-[#E0EDFF]/60 text-sm mb-2">Your Win Rate</div>
            <div className={`text-7xl font-black ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-[#E0EDFF]/60 text-sm mt-2">
              {stats.wins}W / {stats.losses}L
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#6366F1]/10 rounded-xl p-4 text-center border border-[#6366F1]/20">
              <div className="text-[#E0EDFF]/60 text-xs mb-1">KDA</div>
              <div className="text-3xl font-bold text-white">{stats.kda.toFixed(2)}</div>
            </div>
            <div className="bg-[#6366F1]/10 rounded-xl p-4 text-center border border-[#6366F1]/20">
              <div className="text-[#E0EDFF]/60 text-xs mb-1">Games</div>
              <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
            </div>
          </div>

          <div className="bg-[#6366F1]/10 rounded-xl p-4 border border-[#6366F1]/20">
            <div className="text-[#E0EDFF]/60 text-xs mb-2 text-center">Your Best Champion</div>
            <div className="text-2xl font-bold text-white text-center">{stats.topChampion}</div>
            <div className="text-[#6366F1] text-lg font-semibold text-center mt-1">
              {stats.topChampionWR.toFixed(1)}% WR
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Click to download
        </div>
      </div>

      {/* Slides 3-6: AI Insights (one per section) */}
      {parsedSections.map((section, index) => (
        <div 
          key={index}
          className="w-full aspect-[9/16] bg-gradient-to-br from-[#23262A] to-[#1C1E22] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          id={`recap-slide-${index + 3}`}
          onClick={() => downloadSlide(`recap-slide-${index + 3}`, `${player.gameName}-${currentYear}-insight-${index + 1}.png`)}
        >
          <div className="absolute top-8 right-8">
            <Image
              src="/logo.png"
              alt="LOLFORGE"
              width={40}
              height={40}
              className="opacity-50"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-6">
              <div className="text-[#6366F1] text-sm font-semibold mb-2 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="h-1 w-16 bg-[#6366F1] rounded-full"></div>
            </div>
            
            <p className="text-[#FFFAFA] text-xl leading-relaxed">
              {section.content}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-[#E0EDFF]/40 text-xs">
              {index + 1} of {parsedSections.length}
            </div>
            <div className="text-white/40 text-xs">
              Click to download
            </div>
          </div>
        </div>
      ))}

      {/* Final Slide: CTA */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA] rounded-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-final"
        onClick={() => downloadSlide('recap-slide-final', `${player.gameName}-${currentYear}-cta.png`)}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to level up<br />in 2025?
          </h2>
          
          <p className="text-white/80 text-lg mb-8">
            Get your own personalized recap
          </p>

          <div className="text-white/60 text-sm">
            lolforge.app
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Click to download
        </div>
      </div>
    </div>
  );
}
