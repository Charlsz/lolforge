interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, subtitle, trend }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5">
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <span className={`text-sm font-medium mb-1 ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
