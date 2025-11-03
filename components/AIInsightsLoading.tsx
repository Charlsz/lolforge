'use client';

export default function AIInsightsLoading() {
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 dark:from-purple-500/5 dark:via-blue-500/5 dark:to-purple-500/5 backdrop-blur-xl border border-purple-500/20 dark:border-purple-500/10 p-8 shadow-xl">
        {/* AI Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI-Powered Year Recap
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generating insights...
            </p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-5/6" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-4/6" />
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
