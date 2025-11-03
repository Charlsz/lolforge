# LOL Forge

A modern League of Legends performance recap application with a minimalist glass-effect design.

## Features

- **Player Search**: Look up any player by Game Name and Tag Line
- **Performance Analytics**: Detailed statistics including:
  - Overall win rate and KDA
  - Top 5 most played champions with individual stats
  - Role distribution and performance
  - Win/loss streak tracking
  - Match history analysis (last 20 games)

- **Beautiful UI**: Minimalist design with glass morphism effects inspired by Apple's design language

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Riot Games API key (get it from [Riot Developer Portal](https://developer.riotgames.com/))

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd lolforge
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
RIOT_API_KEY=your_riot_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### `/api/player`
Get player account information by Game Name and Tag Line.

**Query Parameters:**
- `gameName` (required)
- `tagLine` (required)

### `/api/matches`
Get match history for a player.

**Query Parameters:**
- `puuid` (required)
- `count` (optional, default: 20)

### `/api/match-details`
Get detailed information about a specific match.

**Query Parameters:**
- `matchId` (required)

### `/api/recap`
Get complete player recap with analyzed statistics.

**Query Parameters:**
- `gameName` (required)
- `tagLine` (required)
- `count` (optional, default: 20)

## Project Structure

```
lolforge/
├── app/
│   ├── api/
│   │   ├── player/route.ts          # Player lookup endpoint
│   │   ├── matches/route.ts         # Match history endpoint
│   │   ├── match-details/route.ts   # Match details endpoint
│   │   └── recap/route.ts           # Complete recap endpoint
│   ├── recap/[puuid]/page.tsx       # Recap results page
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── StatsCard.tsx                # Stats display card
│   ├── ChampionCard.tsx             # Champion statistics card
│   └── WinRateChart.tsx             # Win rate visualization
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   └── analyzer.ts                  # Data analysis logic
└── public/                          # Static assets
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **API**: Riot Games API
- **Design**: Glass morphism with backdrop blur effects

## Rate Limits

Be aware of Riot API rate limits when using this application:
- Personal API keys have lower rate limits
- Production keys have higher limits
- The app fetches up to 20 matches by default

## Contributing

Feel free to open issues or submit pull requests for improvements.

## Acknowledgments

- Data provided by Riot Games API
- Design inspired by Apple's design language

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
