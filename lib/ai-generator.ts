import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function generateYearRecapInsights(playerStats: any) {
  const prompt = `You are an elite and funny League of Legends performance coach and data scientist. Analyze this player's COMPLETE year and provide insights that would cost $50+ from a personal coach.

 COMPLETE PLAYER PROFILE:

BASIC PERFORMANCE:
- Total Games: ${playerStats.totalGames}
- Win Rate: ${playerStats.winRate}% (${playerStats.wins || 0}W / ${playerStats.losses || 0}L)
- Overall KDA: ${playerStats.kda}
- Average K/D/A: ${playerStats.avgKills || 0}/${playerStats.avgDeaths || 0}/${playerStats.avgAssists || 0}

 CHAMPION MASTERY:
- Main: ${playerStats.topChampion} (${playerStats.topChampionWR}% WR, ${playerStats.topChampionGames || 0} games)
- Champion Pool: ${playerStats.uniqueChampions || 'Unknown'} unique champions
- Most Consistent: ${playerStats.bestChampion || playerStats.topChampion}
- Needs Work: ${playerStats.worstChampion || 'Multiple champions'}

 ADVANCED PERFORMANCE METRICS:
- Clutch Factor: ${playerStats.clutchFactor}% (Comeback win rate when behind)
- Carry Potential: ${playerStats.carryPotential}% (High kill participation games)
- Consistency Score: ${playerStats.consistencyScore}/100 (Performance stability)
- Adaptability: ${playerStats.roleFlexibility || 'Moderate'} (Multi-role capability)

 GROWTH & TRENDS:
- Peak Performance: ${playerStats.peakMonth} (Best month)
- Season Growth: ${playerStats.improvement > 0 ? '+' : ''}${playerStats.improvement}% (Early vs Late season)
- Best Streak: ${playerStats.bestStreak || 0} wins
- Worst Streak: ${playerStats.worstStreak || 0} losses
- Current Streak: ${playerStats.currentStreak || 0} games

 PLAYSTYLE INDICATORS:
- Primary Role: ${playerStats.mainRole || 'Flex'}
- Aggression Level: ${playerStats.aggressionScore || 'Balanced'} (Based on KDA pattern)
- Team Fight Presence: ${playerStats.teamfightScore || 'Moderate'}
- Objective Focus: ${playerStats.objectiveScore || 'Average'}

YOUR MISSION:
Write a compelling, data-driven 2024 League of Legends recap in 4 distinct sections. Each section should be separated by "|||" and formatted as: TITLE|||CONTENT

Return ONLY the 4 sections separated by "|||" with NO markdown, NO asterisks, NO bold text, NO emojis. Write naturally as if a human analyst wrote it.

Format: SECTION_TITLE|||Section content here.

SECTION 1 - YOUR SIGNATURE PLAYSTYLE (2-3 sentences):
Identify their unique playstyle based on ALL metrics above. Use specific numbers. Be direct and conversational.
Example: "YOUR SIGNATURE PLAYSTYLE|||With a 67% clutch factor, you're a pressure player who thrives in comeback scenarios. Combined with 45% carry potential and a 3.5 KDA, you're the person teams want when games get tight. Your Ahri mastery at 58% win rate across 45 games shows commitment to perfection."

SECTION 2 - THE YEAR IN REVIEW (2-3 sentences):
Tell the story of their year using growth metrics, streaks, and peak performance. Make it narrative and engaging.
Example: "THE YEAR IN REVIEW|||You peaked in October, crushing a 7-game win streak that defined your best month. The season had ups and downs, but your 8% late-season improvement shows you finished stronger than you started. From 120 total games, you carved out a 54% win rate through sheer consistency."

SECTION 3 - HIDDEN STRENGTHS & BLIND SPOTS (2-3 sentences):
Reveal something they might not know using advanced metrics. Be insightful and honest.
Example: "HIDDEN STRENGTHS & BLIND SPOTS|||Your 72 out of 100 consistency score reveals some volatility. Some games you hard carry with 15 kills, others you struggle to find your footing. While your Ahri is clearly your strongest pick, spreading your champion pool to 8 unique champions might be diluting your impact."

SECTION 4 - YOUR 2025 IMPROVEMENT ROADMAP (2-3 sentences):
Give SPECIFIC, actionable advice based on their exact metrics. Be a coach, not a motivational speaker.
Example: "YOUR 2025 IMPROVEMENT ROADMAP|||Focus on bringing that 67% clutch factor even higher by reviewing your close games and identifying decision patterns. Your 4-loss streak suggests mental reset issues, so implement a rule to take breaks after 2 consecutive losses. Dedicate 70% of your practice time to your main champion to push that win rate from 58% to 65%."

CRITICAL RULES:
- Use ACTUAL numbers extensively
- Write in plain text, NO markdown formatting whatsoever
- NO asterisks, NO bold (**), NO emojis, NO bullet points
- Separate each section with "|||"
- Format: TITLE|||Content
- Be direct, analytical, and conversational
- Sound like a human analyst, not an AI
- Reference specific metrics and numbers
- Give actionable advice, not platitudes

Write it now:`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}
