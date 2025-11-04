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

// Playstyle Classification (AI-powered)
export interface PlaystyleAnalysis {
  primary: 'aggressive' | 'defensive' | 'team_player' | 'solo_carry' | 'strategic';
  secondary?: 'aggressive' | 'defensive' | 'team_player' | 'solo_carry' | 'strategic';
  description: string;
  traits: {
    aggression: number; // 0-100
    teamwork: number; // 0-100
    consistency: number; // 0-100
    mechanical: number; // 0-100
    strategic: number; // 0-100
  };
  reasoning: string; // AI-generated explanation
}

// Fun/Quirky Achievements
export interface FunAchievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  value: number | string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// Ranked League Info
export interface RankedInfo {
  queueType: string; // RANKED_SOLO_5x5, RANKED_FLEX_SR
  tier: string; // IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
  rank: string; // I, II, III, IV
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  veteran: boolean;
  hotStreak: boolean;
}

// Champion Mastery
export interface ChampionMastery {
  championId: number;
  championName?: string;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  tokensEarned: number;
  milestoneGrades?: string[];
}

// Live Game Info
export interface LiveGameInfo {
  gameId: number;
  gameMode: string;
  gameStartTime: number;
  championId: number;
  championName?: string;
  teamId: number;
}

// Challenge Info
export interface ChallengeInfo {
  challengeId: number;
  title?: string;
  level: string; // NONE, IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
  value: number;
  achievedTime?: number;
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
  monthlyTimeline?: MonthlyTimeline[];
  highlightMoments?: HighlightMoment[];
  playstyle?: PlaystyleAnalysis;
  funAchievements?: FunAchievement[];
  rankedInfo?: RankedInfo[]; // NEW!
  championMasteries?: ChampionMastery[]; // NEW!
  liveGame?: LiveGameInfo | null; // NEW!
  topChallenges?: ChallengeInfo[]; // NEW!
  aiInsights?: string | null;
}
