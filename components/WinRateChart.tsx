'use client';

interface WinRateChartProps {
  wins: number;
  losses: number;
  winRate: number;
}

export default function WinRateChart({ wins, losses, winRate }: WinRateChartProps) {
  const totalGames = wins + losses;
  const lossRate = 100 - winRate;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#E0EDFF] dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 hover:shadow-xl">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-6">
        Win Rate Distribution
      </h3>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            className="text-gray-200 dark:text-white/10"
          />
          {/* Win rate arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - winRate / 100)}`}
            className={`transition-all duration-1000 ${
              winRate >= 50 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-red-500 dark:text-red-400'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {winRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Win Rate
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-xl bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 dark:border-green-500/10">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {wins}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Wins
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {losses}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Losses
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>{totalGames} Total Games</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 dark:from-green-600 dark:to-green-500 transition-all duration-1000"
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
