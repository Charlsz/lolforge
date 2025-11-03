import { MatchInfo, ChampionStats, RoleStats, PlayerAccount, PlayerRecap, AdvancedMetrics, MonthlyTimeline, HighlightMoment, MatchParticipant } from './types';

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

  // 📊 TIMELINE DATA - Monthly progression
  public getMonthlyTimeline(): MonthlyTimeline[] {
    const monthlyData = new Map<string, {
      games: number;
      wins: number;
      losses: number;
      totalKills: number;
      totalDeaths: number;
      totalAssists: number;
    }>();

    // Sort matches by date
    const sortedMatches = [...this.matches].sort((a, b) => a.gameCreation - b.gameCreation);

    sortedMatches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (!playerData) return;

      const date = new Date(match.gameCreation);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          games: 0,
          wins: 0,
          losses: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
        });
      }

      const stats = monthlyData.get(monthKey)!;
      stats.games++;
      if (playerData.win) {
        stats.wins++;
      } else {
        stats.losses++;
      }
      stats.totalKills += playerData.kills;
      stats.totalDeaths += playerData.deaths;
      stats.totalAssists += playerData.assists;
    });

    // Convert to array and calculate averages
    const timeline: MonthlyTimeline[] = [];
    monthlyData.forEach((stats, month) => {
      const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
      const avgKills = stats.games > 0 ? stats.totalKills / stats.games : 0;
      const avgDeaths = stats.games > 0 ? stats.totalDeaths / stats.games : 0;
      const avgAssists = stats.games > 0 ? stats.totalAssists / stats.games : 0;
      const avgKDA = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : avgKills + avgAssists;

      timeline.push({
        month,
        games: stats.games,
        wins: stats.wins,
        losses: stats.losses,
        winRate,
        avgKDA,
        avgKills,
        avgDeaths,
        avgAssists,
      });
    });

    // Sort by month
    return timeline.sort((a, b) => a.month.localeCompare(b.month));
  }

  // 🌟 HIGHLIGHT MOMENTS - Best games and achievements
  public getHighlightMoments(): HighlightMoment[] {
    const highlights: HighlightMoment[] = [];

    interface GameRecord {
      match: MatchInfo;
      playerData: MatchParticipant;
      kda: number;
      goldDiff?: number;
    }

    let bestGame: GameRecord | null = null;
    let biggestComeback: GameRecord | null = null;
    let worstLoss: GameRecord | null = null;
    let longestGame: GameRecord | null = null;

    this.matches.forEach(match => {
      const playerData = this.getPlayerData(match);
      if (!playerData) return;

      const kda = playerData.deaths > 0
        ? (playerData.kills + playerData.assists) / playerData.deaths
        : playerData.kills + playerData.assists;

      // Best Game (highest KDA in a win)
      if (playerData.win) {
        if (!bestGame || kda > bestGame.kda) {
          bestGame = { match, playerData, kda };
        }
      }

      // Biggest Comeback (won despite low gold)
      if (playerData.win) {
        const avgGold = match.participants.reduce((sum, p) => sum + p.goldEarned, 0) / 10;
        const goldDiff = avgGold - playerData.goldEarned;
        if (goldDiff > 0 && (!biggestComeback || (biggestComeback.goldDiff && goldDiff > biggestComeback.goldDiff))) {
          biggestComeback = { match, playerData, kda, goldDiff };
        }
      }

      // Worst Loss (lowest KDA in a loss)
      if (!playerData.win) {
        if (!worstLoss || kda < worstLoss.kda) {
          worstLoss = { match, playerData, kda };
        }
      }

      // Longest Game
      if (!longestGame || match.gameDuration > longestGame.match.gameDuration) {
        longestGame = { match, playerData, kda };
      }

      // Pentakill detection (if kills >= 5 in one game)
      if (playerData.kills >= 5 && playerData.win) {
        const teamKills = match.participants
          .filter(p => p.win === playerData.win)
          .reduce((sum, p) => sum + p.kills, 0);
        const killParticipation = teamKills > 0
          ? ((playerData.kills + playerData.assists) / teamKills) * 100
          : 0;

        highlights.push({
          type: 'pentakill',
          matchId: match.matchId,
          title: 'Pentakill Performance',
          description: `Dominated with ${playerData.kills} kills on ${playerData.championName}`,
          stats: {
            kda,
            kills: playerData.kills,
            deaths: playerData.deaths,
            assists: playerData.assists,
            championName: playerData.championName,
            gameDuration: match.gameDuration,
            win: playerData.win,
            killParticipation,
          },
          date: match.gameCreation,
        });
      }
    });

    // Add best game
    if (bestGame) {
      const game = bestGame as GameRecord;
      const teamKills = game.match.participants
        .filter(p => p.win === game.playerData.win)
        .reduce((sum, p) => sum + p.kills, 0);
      const killParticipation = teamKills > 0
        ? ((game.playerData.kills + game.playerData.assists) / teamKills) * 100
        : 0;

      highlights.unshift({
        type: 'best_game',
        matchId: game.match.matchId,
        title: 'Your Best Game',
        description: `${game.kda.toFixed(2)} KDA on ${game.playerData.championName}`,
        stats: {
          kda: game.kda,
          kills: game.playerData.kills,
          deaths: game.playerData.deaths,
          assists: game.playerData.assists,
          championName: game.playerData.championName,
          gameDuration: game.match.gameDuration,
          win: true,
          killParticipation,
        },
        date: game.match.gameCreation,
      });
    }

    // Add biggest comeback
    if (biggestComeback) {
      const game = biggestComeback as GameRecord;
      if (game.goldDiff) {
        const teamKills = game.match.participants
          .filter(p => p.win === game.playerData.win)
          .reduce((sum, p) => sum + p.kills, 0);
        const killParticipation = teamKills > 0
          ? ((game.playerData.kills + game.playerData.assists) / teamKills) * 100
          : 0;

        highlights.push({
          type: 'biggest_comeback',
          matchId: game.match.matchId,
          title: 'Biggest Comeback',
          description: `Won despite being ${Math.round(game.goldDiff)} gold behind`,
          stats: {
            kda: game.playerData.deaths > 0
              ? (game.playerData.kills + game.playerData.assists) / game.playerData.deaths
              : game.playerData.kills + game.playerData.assists,
            kills: game.playerData.kills,
            deaths: game.playerData.deaths,
            assists: game.playerData.assists,
            championName: game.playerData.championName,
            gameDuration: game.match.gameDuration,
            win: true,
            goldEarned: game.playerData.goldEarned,
          },
          date: game.match.gameCreation,
        });
      }
    }

    // Add longest game
    if (longestGame) {
      const game = longestGame as GameRecord;
      highlights.push({
        type: 'longest_game',
        matchId: game.match.matchId,
        title: 'Marathon Match',
        description: `${Math.floor(game.match.gameDuration / 60)} minutes of intense gameplay`,
        stats: {
          kda: game.kda,
          kills: game.playerData.kills,
          deaths: game.playerData.deaths,
          assists: game.playerData.assists,
          championName: game.playerData.championName,
          gameDuration: game.match.gameDuration,
          win: game.playerData.win,
        },
        date: game.match.gameCreation,
      });
    }

    return highlights;
  }

  // Generate complete recap
  public generateRecap(player: PlayerAccount): PlayerRecap {
    const overallStats = this.getOverallStats();
    const topChampions = this.getTopChampions(5);
    const roleStats = this.getRoleStats();
    const streaks = this.getStreaks();
    const advancedMetrics = this.getAdvancedMetrics();
    const monthlyTimeline = this.getMonthlyTimeline();
    const highlightMoments = this.getHighlightMoments();

    return {
      player,
      ...overallStats,
      topChampions,
      roleStats,
      ...streaks,
      advancedMetrics,
      monthlyTimeline,
      highlightMoments,
    };
  }
}
