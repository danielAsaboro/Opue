# Xandeum pNode Analytics Platform

Real-time analytics and insights for the Xandeum storage network.

## 🌟 Features

- **Network Dashboard**: Overview of network health, total storage, and pNode statistics
- **pNode Explorer**: Detailed table of all storage provider nodes with filtering and sorting
- **pNode Details**: Comprehensive metrics, performance history, and technical information
- **Network Analytics**: Interactive charts showing network trends, distributions, and growth
- **Real-time Updates**: Auto-refreshing data every 30 seconds using React Query
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices

## 🏗️ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS 4 with custom dark mode
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack React Query + Jotai
- **Charts**: Recharts for data visualization
- **Blockchain**: @solana/web3.js + @xandeum/web3.js
- **TypeScript**: Full type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or pnpm
- PostgreSQL (for analytics features)

### Installation

1. Clone the repository:
\`\`\`bash
cd xandeum/opue
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
# Create .env.local file
NEXT_PUBLIC_XANDEUM_RPC_URL=https://apis.devnet.xandeum.com
NEXT_PUBLIC_XANDEUM_WS_URL=wss://apis.devnet.xandeum.com
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
DATABASE_URL=postgresql://user:password@localhost:5432/xandeum_analytics
\`\`\`

4. Set up the database (optional, for analytics features):
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database or open Prisma Studio
npx prisma studio
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage
│   ├── pnodes/             # pNode pages
│   │   ├── page.tsx        # pNode list
│   │   └── [id]/page.tsx   # pNode detail
│   └── network/page.tsx    # Network analytics
├── components/             # React components
│   ├── dashboard/          # Dashboard components
│   ├── pnodes/             # pNode-specific components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
│   └── usePNodes.ts        # Data fetching hooks
├── lib/                    # Utility functions
│   ├── format.ts           # Formatting helpers
│   └── utils.ts            # General utilities
├── services/               # API services
│   └── pnode.service.ts    # pNode data service
└── types/                  # TypeScript types
    └── pnode.ts            # pNode data structures
\`\`\`

## 🎨 Key Components

### Network Stats Cards
Displays key metrics: total pNodes, storage capacity, network health, and average performance.

### pNode Table
Comprehensive table showing all pNodes with:
- Status indicators (online/offline/delinquent)
- Storage capacity and utilization
- Performance scores
- Uptime percentages
- Location information

### Network Analytics
Interactive charts including:
- Network growth over time
- Status distribution (pie chart)
- Software version distribution
- Geographic distribution

### pNode Detail Page
Deep dive into individual pNodes:
- Performance score history
- Storage utilization trends
- Technical specifications
- Network information

## 🔌 API Integration

### Xandeum RPC Integration
The application fetches real network data from the **Xandeum RPC API**. The integration is implemented in `src/services/pnode.service.ts` and `src/app/api/prpc/route.ts`.

#### How It Works
1. **API Route Proxy**: Client-side requests go through `/api/prpc` to avoid CORS issues
2. **getClusterNodes Method**: Uses the Solana-compatible `getClusterNodes` RPC method to retrieve all nodes from the network
3. **Data Transformation**: The response is transformed to match the pNode data format expected by the UI
4. **Error Handling**: If the RPC endpoints are unavailable, the app displays a clear error message with retry option

#### RPC Endpoint Details
- **Primary Endpoint**: `https://api.devnet.xandeum.com:8899`
- **Fallback**: `https://rpc.xandeum.network`
- **Protocol**: JSON-RPC 2.0 over HTTP POST
- **Key Method**: `getClusterNodes` - Returns list of cluster nodes with:
  - `pubkey`: Node's public key (used as unique ID)
  - `gossip`: IP:port for gossip protocol
  - `rpc`: RPC endpoint URL (if available)
  - `version`: Software version

#### Environment Variables
```bash
NEXT_PUBLIC_XANDEUM_RPC_URL=https://api.devnet.xandeum.com:8899
```


## 🎯 Performance Score Calculation

The performance score (0-100) is calculated using the following weighted components:

- **Uptime (30%)**: Percentage of time pNode is online
- **Storage Capacity (20%)**: Amount of storage contributed
- **Response Time (25%)**: Average latency for operations
- **Reliability (15%)**: Success rate of operations
- **Software Version (10%)**: Running latest version

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

The platform is optimized for Vercel with automatic deployments and preview environments for pull requests.

### Build for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## 📊 Data Refresh Strategy

- **pNode List**: Auto-refreshes every 30 seconds
- **Network Stats**: Auto-refreshes every 30 seconds
- **pNode Details**: Cached for 1 minute
- **Charts**: Updates on data refresh

## 🎨 Customization

### Color Scheme
The application uses a sophisticated, shadcn/ui-inspired color palette defined in `src/app/globals.css`. Colors are defined using OKLCH for better color consistency across light and dark modes.

### Adding New Charts
To add new visualizations:
1. Install Recharts (already included)
2. Create chart component
3. Fetch data using React Query hooks
4. Add to dashboard or analytics page

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Error Handling
The application displays clear error messages when the pRPC API is unavailable, with:
- Detailed error information
- Retry functionality
- Links to Xandeum Discord for support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is built for the Xandeum pNode Analytics bounty.

## 🔗 Links

- [Xandeum Website](https://xandeum.network)
- [Xandeum Documentation](https://xandeum.github.io/xandeum-web3.js)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Product Requirements Document](./resources/PRD.md)

## 🙏 Acknowledgments

- Xandeum Labs for building innovative storage solutions on Solana
- shadcn/ui for the excellent component library
- The Solana developer community

---

Built with ❤️ for the Xandeum ecosystem
