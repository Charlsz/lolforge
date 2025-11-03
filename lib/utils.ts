/**
 * Format a number to a fixed decimal place
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, totalGames: number): number {
  if (totalGames === 0) return 0;
  return (wins / totalGames) * 100;
}

/**
 * Calculate KDA ratio
 */
export function calculateKDA(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
}

/**
 * Format KDA as string (e.g., "5.2 / 3.1 / 8.4")
 */
export function formatKDA(kills: number, deaths: number, assists: number): string {
  return `${formatNumber(kills, 1)} / ${formatNumber(deaths, 1)} / ${formatNumber(assists, 1)}`;
}

/**
 * Get color class based on win rate
 */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 55) return 'text-green-600 dark:text-green-400';
  if (winRate >= 50) return 'text-green-500 dark:text-green-300';
  if (winRate >= 45) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get color class based on KDA
 */
export function getKDAColor(kda: number): string {
  if (kda >= 4) return 'text-purple-600 dark:text-purple-400';
  if (kda >= 3) return 'text-green-600 dark:text-green-400';
  if (kda >= 2) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Format role name for display
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'TOP': 'Top',
    'JUNGLE': 'Jungle',
    'MIDDLE': 'Mid',
    'BOTTOM': 'ADC',
    'UTILITY': 'Support',
    'UNKNOWN': 'Fill',
  };
  return roleMap[role] || role;
}
