'use client';

import React, { useState } from 'react';

interface SocialShareProps {
  gameName: string;
  wins: number;
  losses: number;
  winRate: number;
  kda: number;
  topChampion: string;
}

export function SocialShare({ gameName, wins, losses, winRate, kda, topChampion }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareText = `Just got my ${currentYear} League Recap! 🎮\n🏆 ${wins}W-${losses}L (${winRate.toFixed(1)}% WR)\n⚔️ ${kda.toFixed(2)} KDA\n🎯 Most Played: ${topChampion}\n\nCheck yours at lolforge.gg`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(shareText);
    const tweetUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
  };

  const handleDiscordShare = () => {
    handleCopyText();
    // Discord doesn't have a direct share API, so we copy the text
  };

  return (
    <div className="bg-[#1C1E22] rounded-lg p-6 border border-[#E0EDFF]/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#FFFAFA] mb-1">Share Your Recap</h3>
        <p className="text-sm text-[#E0EDFF]/60">Show off your stats on social media</p>
      </div>

      {/* Share Preview */}
      <div className="bg-[#23262A] rounded-lg p-4 mb-4 border border-[#E0EDFF]/10">
        <pre className="text-sm text-[#FFFAFA] whitespace-pre-wrap font-mono">
          {shareText}
        </pre>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Twitter/X */}
        <button
          onClick={handleTwitterShare}
          className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="text-xs font-semibold text-[#FFFAFA]">Twitter</span>
        </button>

        {/* Discord */}
        <button
          onClick={handleDiscordShare}
          className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="text-xs font-semibold text-[#FFFAFA]">Discord</span>
        </button>

        {/* Copy Text */}
        <button
          onClick={handleCopyText}
          className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg bg-[#6366F1] hover:bg-[#5558D9] transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-semibold text-[#FFFAFA]">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-[#FFFAFA]">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
