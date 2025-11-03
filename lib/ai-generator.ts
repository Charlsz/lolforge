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
  const prompt = `You are an expert League of Legends analyst providing deep insights that go BEYOND basic stats.

PLAYER DATA:
Basic Stats:
- Games played: ${playerStats.totalGames}
- Win rate: ${playerStats.winRate}%
- Main champion: ${playerStats.topChampion} with ${playerStats.topChampionStats?.wr || '0'}% WR
- Average KDA: ${playerStats.kda}

🚀 ADVANCED METRICS (These make us unique!):
- Clutch Factor: ${playerStats.clutchFactor}% (Comeback win rate when behind)
- Carry Potential: ${playerStats.carryPotential}% (Games with >60% kill participation)
- Consistency Score: ${playerStats.consistencyScore}/100 (Performance stability)
- Peak Month: ${playerStats.peakMonth} (Best performing period)
- Improvement: ${playerStats.improvement > 0 ? '+' : ''}${playerStats.improvement}% (Late season vs early season)

YOUR JOB:
Write 3 unique, analytical paragraphs that use these ADVANCED metrics:

PARAGRAPH 1 - DEEP PERFORMANCE ANALYSIS:
Go beyond win rate. Analyze their clutch factor, consistency, and carry potential.
Example: "Your 35% clutch factor shows you thrive under pressure, winning comebacks..."

PARAGRAPH 2 - GROWTH TRAJECTORY:
Use the improvement stat and peak month to tell their story.
Are they improving? Declining? Plateauing?
Example: "You peaked in ${playerStats.peakMonth} but showed ${playerStats.improvement > 0 ? 'positive growth' : 'some decline'} late season..."

PARAGRAPH 3 - UNIQUE ACTIONABLE ADVICE:
Based on their specific advanced metrics, give targeted improvement tips.
Example: "Your low consistency score (${playerStats.consistencyScore}/100) suggests focusing on..."

TONE: Analytical, specific, data-driven. Reference the advanced metrics explicitly.

CRITICAL RULES:
- Do NOT write "Here's", "In summary", or any preamble
- Start directly with the content
- Use emojis sparingly (max 3-4 total)
- Reference ADVANCED metrics (clutch factor, consistency, etc.)
- Make it feel like premium analysis, not generic feedback`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 500,
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
