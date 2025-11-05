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
  const period = playerStats.period || 'career';
  const periodCapitalized = playerStats.yearFilter === 'all' ? 'Career' : playerStats.yearFilter;
  
  const prompt = `Create a fun League of Legends "Wrapped" recap with EXACTLY 4 short cards. Keep it punchy and shareable.

PLAYER DATA (${period}):
- ${playerStats.totalGames} games | ${playerStats.winRate}% WR | ${playerStats.kda} KDA
- Main: ${playerStats.topChampion} (${playerStats.topChampionWR}% WR in ${playerStats.topChampionGames} games)
- Champions: ${playerStats.uniqueChampions} different
- Best streak: ${playerStats.bestStreak}W | Worst: ${playerStats.worstStreak}L
- Clutch: ${playerStats.clutchFactor}% | Carry: ${playerStats.carryPotential}%

Create EXACTLY 4 cards. Format: TITLE|||CONTENT

Each card MUST be 1-2 SHORT sentences max. Use their actual stats.

CARD 1 - PLAYSTYLE|||[1-2 sentences about their playstyle with stats]
CARD 2 - HIGHLIGHTS|||[1-2 sentences about their best moments]
CARD 3 - REALITY CHECK|||[1-2 sentences with honest feedback]
CARD 4 - NEXT LEVEL|||[1-2 sentences with one specific tip]

RULES:
- EXACTLY 4 cards, no more, no less
- MAX 2 sentences per card
- Use actual numbers
- Be fun and witty
- NO emojis, NO markdown
- Separate with "|||"
- Keep it SHORT

Example output:
PLAYSTYLE|||You're clutch with 67% comeback wins. That 3.5 KDA shows you know when to fight.
HIGHLIGHTS|||Your 7-game win streak was legendary. Finished at 54% WR across 120 games.
REALITY CHECK|||Your Ahri is strong at 58% WR, but 8 different champs? Pick a lane and dominate it.
NEXT LEVEL|||Push that Ahri to 65% WR by playing her 70% of the time. Take breaks after 2 losses.

Write EXACTLY 4 cards now:`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 600, // Enough for 4 short cards
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
