import { MatchInfo, ChampionStats, RoleStats, PlayerAccount, PlayerRecap, AdvancedMetrics } from './types';

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

  // 🚀 ADVANCED METRICS - "Beyond OP.GG"
  public getAdvancedMetrics(): AdvancedMetrics {
    // 1. Clutch Factor: % of games won with high comeback potential
    let clutchWins = 0;
    let totalGames = 0;

    // 2. Carry Potential: Games where you had >60% kill participation
    let carryGames = 0;

    // 3. Consistency Score: Based on KDA variance
    const kdaValues: number[] = [];

    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (!playerData) return;

      totalGames++;

      // Calculate kill participation
      const teamKills = match.participants
        .filter(p => p.win === playerData.win)
        .reduce((sum, p) => sum + p.kills, 0);
      
      const killParticipation = teamKills > 0 
        ? ((playerData.kills + playerData.assists) / teamKills) * 100 
        : 0;

      // Carry potential: >60% KP
      if (killParticipation >= 60 && playerData.win) {
        carryGames++;
      }

      // Clutch factor: Won despite being behind
      // Heuristic: Low gold but won = comeback
      const avgGold = match.participants.reduce((sum, p) => sum + p.goldEarned, 0) / 10;
      if (playerData.win && playerData.goldEarned < avgGold * 0.9) {
        clutchWins++;
      }

      // KDA for consistency
      const gameKDA = playerData.deaths > 0
        ? (playerData.kills + playerData.assists) / playerData.deaths
        : playerData.kills + playerData.assists;
      kdaValues.push(gameKDA);
    });

    // Calculate consistency score (inverse of coefficient of variation)
    const avgKDA = kdaValues.reduce((a, b) => a + b, 0) / kdaValues.length;
    const variance = kdaValues.reduce((sum, kda) => sum + Math.pow(kda - avgKDA, 2), 0) / kdaValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgKDA > 0 ? stdDev / avgKDA : 1;
    const consistencyScore = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 50)));

    // 4. Peak Performance Month
    const monthlyStats = new Map<string, { wins: number; games: number }>();
    
    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (!playerData) return;

      const date = new Date(match.gameCreation);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, { wins: 0, games: 0 });
      }

      const stats = monthlyStats.get(monthKey)!;
      stats.games++;
      if (playerData.win) stats.wins++;
    });

    let peakPerformanceMonth = 'Unknown';
    let bestMonthWR = 0;

    monthlyStats.forEach((stats, month) => {
      const wr = (stats.wins / stats.games) * 100;
      if (wr > bestMonthWR && stats.games >= 5) { // Min 5 games
        bestMonthWR = wr;
        peakPerformanceMonth = month;
      }
    });

    // 5. Early vs Late improvement
    const midpoint = Math.floor(this.matches.length / 2);
    const sortedMatches = [...this.matches].sort((a, b) => a.gameCreation - b.gameCreation);
    
    const earlyMatches = sortedMatches.slice(0, midpoint);
    const lateMatches = sortedMatches.slice(midpoint);

    const earlyWins = earlyMatches.filter(m => {
      const p = this.getPlayerData(m);
      return p?.win;
    }).length;

    const lateWins = lateMatches.filter(m => {
      const p = this.getPlayerData(m);
      return p?.win;
    }).length;

    const earlyWinRate = earlyMatches.length > 0 ? (earlyWins / earlyMatches.length) * 100 : 0;
    const lateWinRate = lateMatches.length > 0 ? (lateWins / lateMatches.length) * 100 : 0;
    const improvement = lateWinRate - earlyWinRate;

    return {
      clutchFactor: totalGames > 0 ? (clutchWins / totalGames) * 100 : 0,
      carryPotential: totalGames > 0 ? (carryGames / totalGames) * 100 : 0,
      consistencyScore,
      peakPerformanceMonth,
      earlyVsLateImprovement: {
        earlyWinRate,
        lateWinRate,
        improvement,
      },
    };
  }

  // Generate complete recap
  public generateRecap(player: PlayerAccount): PlayerRecap {
    const overallStats = this.getOverallStats();
    const topChampions = this.getTopChampions(5);
    const roleStats = this.getRoleStats();
    const streaks = this.getStreaks();
    const advancedMetrics = this.getAdvancedMetrics();

    return {
      player,
      ...overallStats,
      topChampions,
      roleStats,
      ...streaks,
      advancedMetrics,
    };
  }
}
