# Xandeum pNode Analytics Platform (Opue)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://opue.vercel.app/)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/danielAsaboro/Opue)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

A comprehensive real-time analytics dashboard for monitoring and managing the Xandeum decentralized storage network. Built for the [Xandeum pNode Analytics Bounty](https://xandeum.network).

## Live Demo

**[https://opue.vercel.app/](https://opue.vercel.app/)**

## Quick Start

```bash
# Clone and install
git clone https://github.com/danielAsaboro/Opue.git
cd Opue
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Core Analytics

| Feature | Description |
|---------|-------------|
| **Network Dashboard** | Real-time overview of network health, storage capacity, and pNode statistics |
| **pNode Explorer** | Browse all storage nodes with filtering, sorting, and multiple view modes (table/grid/map) |
| **Geographic Heatmap** | Interactive map showing global pNode distribution |
| **Historical Analytics** | 30-day trends for network growth, performance, and storage capacity |
| **Compare pNodes** | Side-by-side comparison of up to 4 pNodes across 6+ metrics |
| **Network Topology** | Interactive visualization of network node connections and relationships |

### Rewards & Staking

| Feature | Description |
|---------|-------------|
| **Epoch Progress** | Real-time epoch tracking with progress bar and time remaining |
| **Staking APY** | Current annual percentage yield display |
| **Projected Earnings** | Daily, monthly, and yearly earning projections |
| **Rewards History** | Recent staking rewards from the last 5 epochs |
| **Longest Running Node** | Highlighted display of the most reliable pNode by uptime |

### Network Metrics

| Feature | Description |
|---------|-------------|
| **Average Latency** | Network-wide response time monitoring |
| **Active Peers** | Live peer connection count |
| **24h Volume** | Storage transaction volume over 24 hours |
| **Health Score** | Overall network health indicator |

### AI-Powered Features

| Feature | Description |
|---------|-------------|
| **AI Chat Assistant** | GPT-4o powered assistant for natural language queries about network data |
| **Anomaly Detection** | Automatic detection of performance drops, concentration risks, and storage anomalies |
| **Predictive Insights** | 7-day and 30-day predictions for network growth and performance |
| **Smart Recommendations** | AI-generated insights for network health improvement |

### Monitoring & Alerts

| Feature | Description |
|---------|-------------|
| **Alert System** | 7 alert types including offline detection, performance drops, storage warnings |
| **Watchlist** | Track favorite pNodes with custom nicknames and personalized notifications |
| **Real-time Updates** | WebSocket-based live data streaming with fallback to polling |
| **Browser Notifications** | Configurable push notifications with sound options |
| **Email Notifications** | Configurable digest frequency (real-time, hourly, daily, weekly) |

### User Experience

| Feature | Description |
|---------|-------------|
| **Left Sidebar Navigation** | Organized navigation with sections: Overview, Analytics, Account |
| **Command Palette** | `Cmd/Ctrl + K` for quick navigation and search |
| **AI Chat Shortcut** | `Cmd/Ctrl + /` to toggle the AI assistant |
| **Global Search** | `/` to focus search from anywhere |
| **Dark Mode** | Full dark mode support with system preference detection |
| **Real-time Animations** | Smooth transitions and live data updates (configurable) |
| **Export Data** | Export to CSV/JSON formats |
| **Responsive Design** | Mobile-first design with bottom navigation on mobile |
| **How to Use Guide** | Step-by-step onboarding guide in Help section |

### Settings & Customization

| Setting | Description |
|---------|-------------|
| **Theme Selection** | Light, Dark, or System preference |
| **Real-time Animations** | Toggle smooth animations and transitions |
| **Compact Mode** | Denser information display |
| **Notification Sound** | Audio alerts for notifications |
| **Developer Mode** | Advanced features and debug information |
| **Custom RPC Endpoint** | Configure your own primary endpoint |
| **Auto-refresh Interval** | 15s, 30s, 1min, or 5min options |
| **Cache Management** | Enable/disable local caching, clear cache |

## Pages & Navigation

### Overview Section
- **Dashboard** (`/`) - Network overview with quick stats, top performers, and quick actions
- **pNodes** (`/pnodes`) - Full pNode explorer with table/grid/map views
- **Network Stats** (`/network`) - Detailed network analytics with 5 tabs:
  - Overview - Core metrics and charts
  - Rewards - Epoch progress and staking info
  - Topology - Network visualization
  - Quant Analysis - Statistical analysis
  - Geographic - Location heatmap

### Analytics Section
- **Historical** (`/analytics`) - 30-day trend analysis
- **Insights** (`/insights`) - AI-powered insights and recommendations
- **Watchlist** (`/watchlist`) - Tracked pNodes
- **Alerts** (`/alerts`) - Alert management
- **Compare** (`/compare`) - Side-by-side pNode comparison

### Account Section
- **Wallet** (`/account`) - Wallet connection and account details

### App Section
- **Settings** (`/settings`) - All app preferences
- **Help** (`/help`) - Documentation, shortcuts, and how-to guide

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + /` | Toggle AI chat |
| `/` | Focus global search |
| `Cmd/Ctrl + D` | Toggle dark mode |
| `R` | Refresh data |
| `Esc` | Close dialogs |
| `?` | Show keyboard shortcuts |

## Architecture

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Homepage dashboard
│   ├── pnodes/               # pNode explorer & detail pages
│   ├── network/              # Network analytics (5 tabs)
│   ├── analytics/            # Historical analytics
│   ├── insights/             # AI insights
│   ├── alerts/               # Alert management
│   ├── compare/              # pNode comparison
│   ├── watchlist/            # User watchlist
│   ├── settings/             # App settings
│   ├── help/                 # Help & documentation
│   └── api/                  # API routes
│       ├── chat/             # AI chat endpoint
│       ├── prpc/             # pRPC proxy
│       └── analytics/        # Analytics endpoints
├── components/
│   ├── app-sidebar.tsx       # Left sidebar navigation
│   ├── app-header.tsx        # Top header with controls
│   ├── mobile-nav.tsx        # Mobile bottom navigation
│   ├── ai-chat.tsx           # AI chat component
│   ├── rewards-tracking.tsx  # Rewards & epoch tracking
│   ├── network-topology.tsx  # Network visualization
│   ├── enhanced-network-stats.tsx # Extended metrics
│   ├── pnodes/               # pNode components
│   ├── alerts/               # Alert components
│   └── ui/                   # shadcn/ui components
├── services/
│   ├── pnode.service.ts      # pNode data fetching
│   ├── analytics.service.ts  # Analytics & predictions
│   ├── alert.service.ts      # Alert management
│   └── websocket.service.ts  # Real-time updates
└── types/                    # TypeScript definitions
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Required - Xandeum Network
NEXT_PUBLIC_XANDEUM_RPC_URL=https://api.devnet.xandeum.com:8899
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Required for AI Chat - Get your key at https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Optional - Database (for analytics persistence)
DATABASE_URL=postgresql://user:password@localhost:5432/xandeum_analytics

# Optional - Indexer
INDEXER_ENABLED=true
ANOMALY_THRESHOLD_STDDEV=2.5
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui + Radix UI |
| **AI SDK** | Vercel AI SDK v5 + OpenAI GPT-4o |
| **Data Fetching** | TanStack React Query |
| **State Management** | Jotai |
| **Charts** | Recharts |
| **Maps** | Leaflet + React-Leaflet |
| **Database** | PostgreSQL + Prisma |
| **Blockchain** | @solana/web3.js, @solana/wallet-adapter |

## API Endpoints

### pRPC Proxy
```
POST /api/prpc
```
Proxies requests to Xandeum RPC to avoid CORS issues.

### AI Chat
```
POST /api/chat
GET /api/chat  # Health check
```
Streams AI responses with tool execution for network queries.

### Analytics
```
GET /api/analytics/history      # Historical network data
GET /api/analytics/anomalies    # Detected anomalies
GET /api/analytics/predictions  # Network predictions
GET /api/analytics/leaderboard  # Top performers
GET /api/analytics/pnode/:id    # Individual pNode analytics
```

### Alerts
```
GET/POST /api/alerts       # Manage alerts
GET/POST /api/alerts/rules # Manage alert rules
```

## AI Chat Tools

The AI assistant has access to these tools:

| Tool | Description |
|------|-------------|
| `get_pnodes` | List all pNodes with status and metrics |
| `get_network_stats` | Network-wide statistics |
| `get_pnode_details` | Detailed info for specific pNode |
| `search_pnodes` | Filter pNodes by status, location, performance |
| `get_epoch_info` | Current epoch and slot information |
| `get_validators` | Validator/vote account information |

Example queries:
- "Show me the network health"
- "List all online pNodes"
- "Find pNodes with performance above 90"
- "What's the current epoch?"

## Alert Types

| Type | Trigger |
|------|---------|
| `pnode_offline` | Node goes offline |
| `pnode_performance_drop` | Performance below threshold |
| `pnode_storage_full` | Storage utilization > 90% |
| `network_decentralization` | Geographic concentration risk |
| `new_pnode_joined` | New provider joins network |
| `pnode_version_outdated` | Deprecated software version |
| `network_storage_low` | Network-wide storage warning |

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run tests
npm test

# Lint code
npm run lint

# Database management
npx prisma studio
npx prisma migrate dev
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_XANDEUM_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (use Vercel Postgres or Neon)
4. Deploy!

### Docker

```bash
docker build -t xandeum-analytics .
docker run -p 3000:3000 --env-file .env.local xandeum-analytics
```

## How to Use

1. **Connect Your Wallet** - Click "Connect Wallet" in the header to link your Solana wallet
2. **Select Your Network** - Use the cluster selector to choose Mainnet, Devnet, or Testnet
3. **Explore the Dashboard** - View network health, top performers, and key metrics
4. **Monitor pNodes** - Browse all nodes in table, grid, or map view
5. **Track Rewards** - Check staking APY, epoch progress, and projected earnings
6. **Set Up Alerts** - Create custom alerts for status changes or performance drops
7. **Use AI Assistant** - Press `Cmd/Ctrl + /` to ask questions about the network
8. **Customize Settings** - Configure theme, notifications, and developer options

## Performance Optimizations

- **React Query caching** - 30-second stale time for network data
- **ISR** - Incremental Static Regeneration for static pages
- **Code splitting** - Dynamic imports for heavy components (maps, charts)
- **Image optimization** - Next.js Image component
- **WebSocket** - Real-time updates without polling overhead

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## pRPC Integration

This platform uses **real Xandeum pNode RPC (pnRPC)** calls to fetch live network data:

### Data Sources
| Source | Port | Methods |
|--------|------|---------|
| **pnRPC Seed Nodes** | 6000 | `get-pods-with-stats`, `get-stats` |
| **Xandeum RPC** | 8899 | `getClusterNodes`, `getEpochInfo` |
| **GeoIP Service** | - | Location data for nodes |

### Real Data Retrieved
- Node pubkeys, addresses, and versions
- Storage metrics: capacity, used bytes, utilization %
- Uptime (actual seconds from pnRPC)
- CPU, RAM, network packets
- Gossip/RPC/TPU endpoints

### Seed Nodes
```
192.190.136.28:6000
173.212.220.65:6000
192.190.136.37:6000
```

## Screenshots

### Dashboard
The main dashboard shows network health, top performers, and quick stats at a glance.

### pNode Explorer
Browse all storage nodes with table, grid, or map views. Advanced filtering by status, performance, location, and more.

### Geographic Heatmap
Interactive Leaflet map showing global pNode distribution with storage/performance overlays.

### AI Chat Assistant
GPT-4o powered assistant for natural language queries about network data.

### Quantitative Analytics
Correlation matrices, regression analysis, risk profiling, and 7-day forecasts.

## Links

- **Live Demo**: [https://opue.vercel.app/](https://opue.vercel.app/)
- **GitHub Repository**: [https://github.com/danielAsaboro/Opue](https://github.com/danielAsaboro/Opue)
- [Xandeum Website](https://xandeum.network)
- [Xandeum Documentation](https://xandeum.github.io/xandeum-web3.js)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [AI SDK Documentation](https://ai-sdk.dev)

## Bounty Submission

This project was built for the **Xandeum pNode Analytics Platform Bounty**.

### Judging Criteria Met

| Criteria | Status | Notes |
|----------|--------|-------|
| **Functionality** | ✅ | Real pRPC integration to Xandeum seed nodes |
| **Clarity** | ✅ | Clear metrics, status indicators, tooltips |
| **User Experience** | ✅ | Multiple views, filtering, keyboard shortcuts |
| **Innovation** | ✅ | AI chat, quant analytics, alerts, forecasting |

### Key Differentiators
- **AI-Powered**: GPT-4o integration for natural language network queries
- **Real-Time**: WebSocket streaming with polling fallback
- **Quantitative**: Statistical analysis, correlations, risk profiling
- **Predictive**: 7/30-day forecasts using regression analysis
- **Alerting**: 7 alert types with browser/email notifications

## License

MIT License - Built for the Xandeum pNode Analytics bounty.

---

Built with Next.js 15, React 19, Vercel AI SDK, and shadcn/ui by [Daniel Asaboro](https://github.com/danielAsaboro)
