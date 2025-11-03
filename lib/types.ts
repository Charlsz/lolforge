// Player types
export interface PlayerAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId?: number;
  summonerLevel?: number;
}

// Match types
export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  championName: string;
  championId: number;
  teamPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalMinionsKilled: number;
  goldEarned: number;
  champLevel: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
}

export interface MatchInfo {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  participants: MatchParticipant[];
}

// Analyzer types
export interface ChampionStats {
  championName: string;
  championId: number;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
}

export interface RoleStats {
  role: string;
  games: number;
  wins: number;
  winRate: number;
}

// Advanced metrics - "Beyond OP.GG"
export interface AdvancedMetrics {
  clutchFactor: number; // % of comebacks (behind early, won late)
  carryPotential: number; // % of games with >60% kill participation
  consistencyScore: number; // 0-100, lower variance = higher score
  peakPerformanceMonth: string; // Best month by winrate
  earlyVsLateImprovement: {
    earlyWinRate: number; // First 50% of games
    lateWinRate: number; // Last 50% of games
    improvement: number; // Difference
  };
}

// Timeline data for charts
export interface MonthlyTimeline {
  month: string; // "2024-10"
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKDA: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

// Highlight moments
export interface HighlightMoment {
  type: 'best_game' | 'biggest_comeback' | 'worst_loss' | 'longest_game' | 'pentakill';
  matchId: string;
  title: string;
  description: string;
  stats: {
    kda: number;
    kills: number;
    deaths: number;
    assists: number;
    championName: string;
    gameDuration: number;
    win: boolean;
    goldEarned?: number;
    killParticipation?: number;
  };
  date: number; // timestamp
}

export interface PlayerRecap {
  player: PlayerAccount;
  totalGames: number;
  wins: number;
  losses: number;
  overallWinRate: number;
  overallKDA: number;
  topChampions: ChampionStats[];
  roleStats: RoleStats[];
  bestStreak: number;
  worstStreak: number;
  currentStreak: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  advancedMetrics?: AdvancedMetrics;
  monthlyTimeline?: MonthlyTimeline[]; // NEW!
  highlightMoments?: HighlightMoment[]; // NEW!
  aiInsights?: string | null;
}
