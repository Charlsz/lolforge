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
  yearFilter?: string; // Add year filter prop
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

export function ShareableRecap({ player, stats, aiInsights, yearFilter = 'all' }: ShareableRecapProps) {
  const displayYear = yearFilter === 'all' ? 'Career' : yearFilter;
  
  // Parse sections: AI returns "TITLE|||CONTENT|||TITLE|||CONTENT"
  const parts = aiInsights.split('|||').map(s => s.trim()).filter(s => s.length > 0);
  
  // Group into pairs: [title, content, title, content] -> [{title, content}, {title, content}]
  const parsedSections = [];
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      parsedSections.push({
        title: parts[i],
        content: parts[i + 1]
      });
    }
  }
  
  console.log('Parsed sections:', parsedSections.length, parsedSections);

  return (
    <div className="flex flex-col gap-6">
      {/* Slide 1: Cover/Intro */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-1"
        onClick={() => downloadSlide('recap-slide-1', `${player.gameName}-${displayYear}-cover.png`)}
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
            Your {displayYear}
          </h1>
          <h2 className="text-6xl font-black text-white">
            Wrapped
          </h2>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white/40 shadow-xl">
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${player.profileIconId || 29}.png`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-white font-black text-2xl">
                {player.gameName}
              </div>
              <div className="text-white/80 text-lg">
                #{player.tagLine}
              </div>
            </div>
          </div>
          
          <div className="text-white/90 text-base font-semibold">
            {stats.totalGames} games • {displayYear} recap
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Tap to save
        </div>
      </div>

      {/* Slide 2: Stats Overview - More Visual */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#23262A] to-[#1C1E22] rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-2"
        onClick={() => downloadSlide('recap-slide-2', `${player.gameName}-${displayYear}-stats.png`)}
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

        <div className="space-y-10">
          <div className="text-center">
            <div className="text-[#E0EDFF]/60 text-base font-semibold mb-3 uppercase tracking-wider">Win Rate</div>
            <div className={`text-8xl font-black mb-3 ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.winRate.toFixed(0)}%
            </div>
            <div className="text-[#E0EDFF]/80 text-lg font-medium">
              {stats.wins}W - {stats.losses}L
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/5 rounded-2xl p-6 text-center border-2 border-[#6366F1]/30">
              <div className="text-[#E0EDFF]/70 text-sm font-semibold mb-2 uppercase tracking-wide">KDA</div>
              <div className="text-4xl font-black text-white">{stats.kda.toFixed(1)}</div>
            </div>
            <div className="bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/5 rounded-2xl p-6 text-center border-2 border-[#6366F1]/30">
              <div className="text-[#E0EDFF]/70 text-sm font-semibold mb-2 uppercase tracking-wide">Games</div>
              <div className="text-4xl font-black text-white">{stats.totalGames}</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#6366F1]/20 to-[#4338CA]/20 rounded-2xl p-6 border-2 border-[#6366F1]/40">
            <div className="text-[#E0EDFF]/70 text-sm font-semibold mb-3 text-center uppercase tracking-wide">Your Main</div>
            <div className="text-3xl font-black text-white text-center mb-2">{stats.topChampion}</div>
            <div className="text-[#6366F1] text-2xl font-black text-center">
              {stats.topChampionWR.toFixed(0)}% Win Rate
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Tap to save
        </div>
      </div>

      {/* Slides 3-6: AI Insights - Shorter and punchier */}
      {parsedSections.map((section, index) => (
        <div 
          key={index}
          className="w-full aspect-[9/16] bg-gradient-to-br from-[#23262A] to-[#1C1E22] rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          id={`recap-slide-${index + 3}`}
          onClick={() => downloadSlide(`recap-slide-${index + 3}`, `${player.gameName}-${displayYear}-insight-${index + 1}.png`)}
        >
          <div className="absolute top-8 right-8">
            <Image
              src="/logo.png"
              alt="LOLFORGE"
              width={40}
              height={40}
              className="opacity-30"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <div className="text-[#6366F1] text-lg font-black mb-4 uppercase tracking-[0.15em]">
                {section.title}
              </div>
              <div className="h-1.5 w-24 bg-gradient-to-r from-[#6366F1] to-[#4338CA] rounded-full"></div>
            </div>
            
            <p className="text-[#FFFAFA] text-2xl font-bold leading-relaxed">
              {section.content}
            </p>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-[#E0EDFF]/50 text-sm font-bold">
              {index + 1} / {parsedSections.length}
            </div>
            <div className="text-white/40 text-xs">
              Tap to save
            </div>
          </div>
        </div>
      ))}

      {/* Final Slide: CTA - More engaging */}
      <div 
        className="w-full aspect-[9/16] bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#4338CA] rounded-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        id="recap-slide-final"
        onClick={() => downloadSlide('recap-slide-final', `${player.gameName}-${displayYear}-cta.png`)}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <Image
            src="/logo.png"
            alt="LOLFORGE"
            width={100}
            height={100}
            className="mx-auto mb-8"
          />
          
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Get Your<br />Wrapped
          </h2>
          
          <p className="text-white/90 text-xl font-semibold mb-10">
            Discover your League stats
          </p>

          <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/40">
            <div className="text-white font-black text-2xl tracking-wide">
              lolforge.app
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/40 text-xs">
          Tap to save
        </div>
      </div>
    </div>
  );
}
