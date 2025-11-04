# LoLForge - Rift Rewind Hackathon 2025

> **League of Legends Year-End Recap** powered by AWS Bedrock AI  
> *Built for the AWS + Riot Games Rift Rewind Hackathon*

A modern, AI-powered League of Legends performance recap application that analyzes your gameplay and provides personalized insights using AWS Bedrock Claude AI.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange)](https://aws.amazon.com/bedrock/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## Features

### Comprehensive Analytics
- **Overall Statistics**: Win rate, KDA, total games, champion pool
- **Ranked Status**: Solo/Duo and Flex queue rankings with tier emblems
- **Champion Mastery**: Top 5 mastered champions with levels and points (auto-updating from Data Dragon)
- **Role Distribution**: Performance breakdown by position
- **Match History**: Last 20 games with detailed statistics
- **Timeline Analysis**: Performance trends over the season

### AI-Powered Insights (AWS Bedrock Claude)
- **Playstyle Analysis**: AI-generated personality profile with primary/secondary traits
- **Advanced Metrics**: Clutch factor, carry potential, consistency scores
- **Highlight Moments**: Best performances and memorable games
- **Fun Achievements**: Personalized accomplishments and milestones

### Interactive Features
- **Live Game Detection**: Real-time notification if player is in-game
- **Social Comparison**: Compare stats with friends
- **Shareable Recap**: Generate and share your year-end wrapped
- **Responsive Design**: Beautiful 3-column layout (mobile-friendly)

### Modern UI/UX
- Dark theme with glass morphism effects
- Clean, minimalist design inspired by modern gaming aesthetics
- Smooth animations and transitions
- User-friendly data visualization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Riot Games API key from [Riot Developer Portal](https://developer.riotgames.com/)
- AWS Account with Bedrock access (Claude Haiku model)
- AWS credentials configured

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Charlsz/lolforge.git
cd lolforge
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```bash
# Riot Games API
RIOT_API_KEY=your_riot_api_key_here

# AWS Bedrock (for AI insights)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lolforge/
├── app/
│   ├── api/
│   │   ├── player/route.ts          # Player account lookup
│   │   ├── matches/route.ts         # Match history
│   │   ├── match-details/route.ts   # Individual match details
│   │   ├── recap/route.ts           # Complete player recap
│   │   ├── ranked/route.ts          # Ranked status
│   │   ├── mastery/route.ts         # Champion mastery
│   │   ├── live-game/route.ts       # Live game detection
│   │   └── ai-insights/route.ts     # AWS Bedrock AI generation
│   ├── recap/[puuid]/page.tsx       # Main recap page (3-column layout)
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── StatsCard.tsx                # Stats display cards
│   ├── ChampionCard.tsx             # Champion statistics
│   ├── WinRateChart.tsx             # Win rate visualization
│   ├── AdvancedMetricsCard.tsx      # AI-powered metrics
│   ├── PlaystyleCard.tsx            # AI playstyle analysis
│   ├── ChampionMasteryCard.tsx      # Mastery display (auto-updating)
│   ├── HighlightMoments.tsx         # Best performances
│   ├── FunAchievements.tsx          # Player achievements
│   ├── SocialComparison.tsx         # Friend comparison
│   ├── LiveGameBadge.tsx            # Live game indicator
│   ├── MatchHistory.tsx             # Match history list
│   ├── TimelineChart.tsx            # Performance timeline
│   ├── ShareButton.tsx              # Share functionality
│   └── ShareableRecap.tsx           # Shareable cards
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── analyzer.ts                  # Data analysis logic
│   ├── ai-generator.ts              # AWS Bedrock integration
│   └── utils.ts                     # Utility functions
└── public/
    └── riot.txt                     # Riot verification file
```

## API Endpoints

### Player Data
- `GET /api/player` - Lookup player by GameName#TAG
- `GET /api/matches` - Get match history (PUUID)
- `GET /api/match-details` - Get match details (matchId)
- `GET /api/recap` - Get complete recap with analytics

### Advanced Features
- `GET /api/ranked` - Get ranked status (Solo + Flex)
- `GET /api/mastery` - Get top 5 champion masteries
- `GET /api/live-game` - Check if player is in-game
- `POST /api/ai-insights` - Generate AI insights (AWS Bedrock)

## AI Integration (AWS Bedrock)

This project uses **AWS Bedrock with Claude Haiku** to generate:

1. **Playstyle Analysis**
   - Primary and secondary playstyle identification
   - Trait breakdown (Aggression, Teamwork, Consistency, etc.)
   - Personalized descriptions with reasoning

2. **Advanced Metrics**
   - Clutch factor calculations
   - Carry potential assessment
   - Consistency scoring
   - Performance trends

3. **Contextual Insights**
   - Peak performance identification
   - Improvement suggestions
   - Comparative analysis

The AI analyzes your match data and provides human-readable insights in real-time (~5-10 seconds).

## Design Philosophy

- **3-Column Layout**: Left sidebar (stats, mastery), Center (match history), Right sidebar (AI insights, social)
- **Always-Visible Components**: All sections show loading/empty states instead of hiding
- **Color Scheme**: 
  - `#FFFAFA` - White text
  - `#23262A` - Dark background
  - `#1C1E22` - Card backgrounds
  - `#E0EDFF` - Light blue accents
  - `#6366F1` - Indigo buttons/highlights
- **User-Friendly**: Text descriptions over raw numbers, intuitive navigation

## Key Technical Highlights

### Dynamic Champion Data
- Champions are loaded from Data Dragon API (no hardcoded lists)
- Automatic support for new champions
- Smart caching to minimize API calls

### Regional Support
- Auto-detects region from match IDs
- Supports all Riot regions (NA, EUW, KR, etc.)
- Proper platform routing

### Performance Optimizations
- React Server Components for better performance
- Efficient data fetching with parallel requests
- Cached champion data globally

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0 |
| **AI** | AWS Bedrock (Claude Haiku) |
| **APIs** | Riot Games API, Data Dragon |
| **Deployment** | AWS Amplify |
| **Icons** | Community Dragon, Data Dragon |

## Rate Limits & Best Practices

**Riot API Rate Limits:**
- Development keys: 20 requests/second, 100 requests/2 minutes
- Production keys: Higher limits available
- Use caching when possible

**AWS Bedrock:**
- Claude Haiku: Fast and cost-effective
- Token limit: 800 tokens per request
- Response time: ~5-10 seconds

## Hackathon Details

**Rift Rewind Hackathon 2025**
- **Theme**: Year-End League of Legends Recap
- **Challenge**: Build creative data visualizations with AI insights
- **Tech**: AWS Bedrock integration required
- **Sponsors**: AWS + Riot Games

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Riot Games** for the comprehensive API and Data Dragon
- **AWS** for Bedrock AI capabilities
- **Community Dragon** for rank emblems and additional assets
- Inspired by Spotify Wrapped and OP.GG design patterns

## Links

- [Live Demo](#) *(Coming soon)*
- [Riot Developer Portal](https://developer.riotgames.com/)
- [AWS Bedrock Documentation](https://aws.amazon.com/bedrock/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built with care for the League of Legends community**
