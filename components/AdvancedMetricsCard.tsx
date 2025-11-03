import { AdvancedMetrics } from '@/lib/types';

interface AdvancedMetricsCardProps {
  metrics: AdvancedMetrics;
}

export default function AdvancedMetricsCard({ metrics }: AdvancedMetricsCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement > 10) return { text: 'Rising Star', color: 'bg-green-500/20 text-green-300' };
    if (improvement > 5) return { text: 'Improving', color: 'bg-blue-500/20 text-blue-300' };
    if (improvement > -5) return { text: 'Stable', color: 'bg-gray-500/20 text-gray-300' };
    if (improvement > -10) return { text: 'Declining', color: 'bg-orange-500/20 text-orange-300' };
    return { text: 'Needs Work', color: 'bg-red-500/20 text-red-300' };
  };

  const improvementBadge = getImprovementBadge(metrics.earlyVsLateImprovement.improvement);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-xl border border-white/10 p-8">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Advanced Analysis
          </h3>
          <span className="text-xs text-gray-400 font-mono">Lol Forge</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clutch Factor */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Clutch Factor</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                Comebacks
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(metrics.clutchFactor)}`}>
                {metrics.clutchFactor.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">of games</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Win rate when behind in gold
            </p>
          </div>

          {/* Carry Potential */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Carry Potential</span>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                Impact
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(metrics.carryPotential)}`}>
                {metrics.carryPotential.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">carry games</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Games with &gt;60% kill participation
            </p>
          </div>

          {/* Consistency Score */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Consistency</span>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                Stability
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(metrics.consistencyScore)}`}>
                {metrics.consistencyScore.toFixed(0)}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                  style={{ width: `${metrics.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Peak Performance */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Peak Performance</span>
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                Best Month
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-yellow-400">
                {metrics.peakPerformanceMonth}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your highest win rate period
            </p>
          </div>
        </div>

        {/* Improvement Section */}
        <div className="mt-6 bg-black/30 rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Season Progress</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${improvementBadge.color}`}>
              {improvementBadge.text}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Early Season</div>
              <div className="text-2xl font-bold text-blue-400">
                {metrics.earlyVsLateImprovement.earlyWinRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>

            <div className="text-center flex items-center justify-center">
              <div className="flex flex-col items-center">
                {metrics.earlyVsLateImprovement.improvement > 0 ? (
                  <>
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-xl font-bold text-green-400">
                      +{Math.abs(metrics.earlyVsLateImprovement.improvement).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-xl font-bold text-red-400">
                      {metrics.earlyVsLateImprovement.improvement.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Late Season</div>
              <div className="text-2xl font-bold text-purple-400">
                {metrics.earlyVsLateImprovement.lateWinRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
