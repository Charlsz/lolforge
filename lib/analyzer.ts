import { MatchInfo, ChampionStats, RoleStats, PlayerAccount, PlayerRecap } from './types';

export class MatchAnalyzer {
  private matches: MatchInfo[];
  private playerPuuid: string;

  constructor(matches: MatchInfo[], playerPuuid: string) {
    this.matches = matches;
    this.playerPuuid = playerPuuid;
  }

  // Get player's participant data from a match
  private getPlayerData(match: MatchInfo) {
    return match.participants.find(p => p.puuid === this.playerPuuid);
  }

  // Calculate overall statistics
  public getOverallStats() {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let wins = 0;
    let losses = 0;

    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (playerData) {
        totalKills += playerData.kills;
        totalDeaths += playerData.deaths;
        totalAssists += playerData.assists;
        if (playerData.win) {
          wins++;
        } else {
          losses++;
        }
      }
    });

    const totalGames = wins + losses;
    const overallWinRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const overallKDA = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;

    return {
      totalGames,
      wins,
      losses,
      overallWinRate,
      overallKDA,
      averageKills: totalGames > 0 ? totalKills / totalGames : 0,
      averageDeaths: totalGames > 0 ? totalDeaths / totalGames : 0,
      averageAssists: totalGames > 0 ? totalAssists / totalGames : 0,
    };
  }

  // Calculate top 5 most played champions with stats
  public getTopChampions(limit: number = 5): ChampionStats[] {
    const championMap = new Map<string, ChampionStats>();

    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (playerData) {
        const key = playerData.championName;
        
        if (!championMap.has(key)) {
          championMap.set(key, {
            championName: playerData.championName,
            championId: playerData.championId,
            games: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            kda: 0,
          });
        }

        const stats = championMap.get(key)!;
        stats.games++;
        stats.totalKills += playerData.kills;
        stats.totalDeaths += playerData.deaths;
        stats.totalAssists += playerData.assists;
        
        if (playerData.win) {
          stats.wins++;
        } else {
          stats.losses++;
        }
      }
    });

    // Calculate averages and KDA
    championMap.forEach(stats => {
      stats.winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
      stats.avgKills = stats.games > 0 ? stats.totalKills / stats.games : 0;
      stats.avgDeaths = stats.games > 0 ? stats.totalDeaths / stats.games : 0;
      stats.avgAssists = stats.games > 0 ? stats.totalAssists / stats.games : 0;
      stats.kda = stats.totalDeaths > 0 
        ? (stats.totalKills + stats.totalAssists) / stats.totalDeaths 
        : stats.totalKills + stats.totalAssists;
    });

    // Sort by games played and return top N
    return Array.from(championMap.values())
      .sort((a, b) => b.games - a.games)
      .slice(0, limit);
  }

  // Calculate role statistics
  public getRoleStats(): RoleStats[] {
    const roleMap = new Map<string, RoleStats>();

    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (playerData) {
        const role = playerData.teamPosition || 'UNKNOWN';
        
        if (!roleMap.has(role)) {
          roleMap.set(role, {
            role,
            games: 0,
            wins: 0,
            winRate: 0,
          });
        }

        const stats = roleMap.get(role)!;
        stats.games++;
        if (playerData.win) {
          stats.wins++;
        }
      }
    });

    // Calculate win rates
    roleMap.forEach(stats => {
      stats.winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
    });

    // Sort by games played
    return Array.from(roleMap.values())
      .sort((a, b) => b.games - a.games);
  }

  // Calculate win/loss streaks
  public getStreaks() {
    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let tempStreak = 0;
    let lastWin: boolean | null = null;

    // Sort matches by game creation time (oldest first)
    const sortedMatches = [...this.matches].sort((a, b) => a.gameCreation - b.gameCreation);

    sortedMatches.forEach((match, index) => {
      const playerData = this.getPlayerData(match);
      if (playerData) {
        const isWin = playerData.win;

        if (lastWin === null) {
          // First match
          tempStreak = isWin ? 1 : -1;
        } else if (lastWin === isWin) {
          // Continue streak
          tempStreak = isWin ? tempStreak + 1 : tempStreak - 1;
        } else {
          // Streak broken
          if (lastWin) {
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            worstStreak = Math.min(worstStreak, tempStreak);
          }
          tempStreak = isWin ? 1 : -1;
        }

        lastWin = isWin;

        // If this is the last match, set current streak
        if (index === sortedMatches.length - 1) {
          currentStreak = tempStreak;
          if (isWin) {
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            worstStreak = Math.min(worstStreak, tempStreak);
          }
        }
      }
    });

    return {
      currentStreak,
      bestStreak,
      worstStreak: Math.abs(worstStreak),
    };
  }

  // Generate complete recap
  public generateRecap(player: PlayerAccount): PlayerRecap {
    const overallStats = this.getOverallStats();
    const topChampions = this.getTopChampions(5);
    const roleStats = this.getRoleStats();
    const streaks = this.getStreaks();

    return {
      player,
      ...overallStats,
      topChampions,
      roleStats,
      ...streaks,
    };
  }
}
