// Player types
export interface PlayerAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
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
}
