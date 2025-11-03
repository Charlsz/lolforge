import { ChampionStats } from '@/lib/types';

interface ChampionCardProps {
  champion: ChampionStats;
  rank: number;
}

export default function ChampionCard({ champion, rank }: ChampionCardProps) {
  const winRateColor = champion.winRate >= 50 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5">
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-gray-900/80 to-gray-700/80 dark:from-white/10 dark:to-white/5 backdrop-blur-sm flex items-center justify-center">
        <span className="text-xs font-bold text-white dark:text-gray-200">
          #{rank}
        </span>
      </div>

      <div className="flex items-center gap-4 pl-10">
        {/* Champion Icon Placeholder */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-500/10 dark:to-blue-500/10 border border-white/30 dark:border-white/20 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {champion.championName.substring(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Champion Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
            {champion.championName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>{champion.games} games</span>
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span className={winRateColor}>
              {champion.winRate.toFixed(1)}% WR
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            KDA
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {champion.kda.toFixed(2)}
          </p>
        </div>
        <div className="text-center border-x border-gray-200/50 dark:border-white/10">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Avg K/D/A
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {champion.avgKills.toFixed(1)}/{champion.avgDeaths.toFixed(1)}/{champion.avgAssists.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            W/L
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {champion.wins}/{champion.losses}
          </p>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-purple-500/5 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
