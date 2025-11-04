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
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#FFFAFA] mb-1">Advanced Analysis</h2>
        <p className="text-sm text-[#E0EDFF]/60">Lol Forge</p>
      </div>
      
      <div className="space-y-4">
        {/* Clutch Factor */}
        <div className="bg-[#23262A] rounded-lg p-4 border border-[#E0EDFF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#E0EDFF]/80 text-sm">Clutch Factor</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              Comebacks
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(metrics.clutchFactor)}`}>
              {metrics.clutchFactor.toFixed(1)}%
            </span>
            <span className="text-xs text-[#E0EDFF]/60">of games</span>
          </div>
          <p className="text-xs text-[#E0EDFF]/60 mt-2">
            Win rate when behind in gold
          </p>
        </div>

        {/* Carry Potential */}
        <div className="bg-[#23262A] rounded-lg p-4 border border-[#E0EDFF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#E0EDFF]/80 text-sm">Carry Potential</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              Impact
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(metrics.carryPotential)}`}>
              {metrics.carryPotential.toFixed(1)}%
            </span>
            <span className="text-xs text-[#E0EDFF]/60">carry games</span>
          </div>
          <p className="text-xs text-[#E0EDFF]/60 mt-2">
            Games with &gt;60% kill participation
          </p>
        </div>

        {/* Consistency Score */}
        <div className="bg-[#23262A] rounded-lg p-4 border border-[#E0EDFF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#E0EDFF]/80 text-sm">Consistency</span>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
              Stability
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(metrics.consistencyScore)}`}>
              {metrics.consistencyScore.toFixed(0)}
            </span>
            <span className="text-xs text-[#E0EDFF]/60">/ 100</span>
          </div>
          <div className="mt-2">
            <div className="h-2 bg-[#1C1E22] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                style={{ width: `${metrics.consistencyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Season Progress */}
        <div className="bg-[#23262A] rounded-lg p-4 border border-[#E0EDFF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#E0EDFF]/80 text-sm">Season Progress</span>
            <span className={`text-xs px-2 py-1 rounded ${improvementBadge.color}`}>
              {improvementBadge.text}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-[#E0EDFF]/60 mb-1">Early Season</div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.earlyVsLateImprovement.earlyWinRate)}`}>
                {metrics.earlyVsLateImprovement.earlyWinRate.toFixed(1)}%
              </div>
              <div className="text-xs text-[#E0EDFF]/60 mt-1">Win Rate</div>
            </div>
            <div>
              <div className="text-xs text-[#E0EDFF]/60 mb-1">Late Season</div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.earlyVsLateImprovement.lateWinRate)}`}>
                {metrics.earlyVsLateImprovement.lateWinRate.toFixed(1)}%
              </div>
              <div className="text-xs text-[#E0EDFF]/60 mt-1">Win Rate</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E0EDFF]/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#E0EDFF]/60">Your highest win rate period</span>
              <span className="text-yellow-400 font-bold">
                {metrics.peakPerformanceMonth.month} - {metrics.peakPerformanceMonth.winRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
