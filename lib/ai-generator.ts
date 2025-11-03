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
  const prompt = `You are a fun League of Legends analyst. Based on this player's year stats, write a short, engaging 3-paragraph recap:

- Games played: ${playerStats.totalGames}
- Win rate: ${playerStats.winRate}%
- Top champion: ${playerStats.topChampion} (${playerStats.topChampionWR}% WR)
- Average KDA: ${playerStats.kda}

Make it funny, personal, and motivational. Use emojis!`;

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
