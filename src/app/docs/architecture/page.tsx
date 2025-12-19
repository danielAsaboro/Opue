'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Blocks,
  ArrowRight,
  Database,
  Globe,
  Server,
  Layers,
  Cpu,
  Code,
  Zap,
  Cloud,
  HardDrive,
  GitBranch,
} from 'lucide-react'

const techStack = [
  { category: 'Framework', items: ['Next.js 15 (App Router)', 'React 19'], icon: Code },
  { category: 'Language', items: ['TypeScript 5.9'], icon: Cpu },
  { category: 'Styling', items: ['Tailwind CSS 4', 'shadcn/ui', 'Radix UI'], icon: Layers },
  { category: 'AI', items: ['Vercel AI SDK v5', 'OpenAI GPT-4o'], icon: Zap },
  { category: 'Data Fetching', items: ['TanStack React Query'], icon: Cloud },
  { category: 'State', items: ['Jotai'], icon: GitBranch },
  { category: 'Charts', items: ['Recharts'], icon: Database },
  { category: 'Maps', items: ['Leaflet', 'React-Leaflet'], icon: Globe },
  { category: 'Database', items: ['PostgreSQL', 'Prisma ORM'], icon: HardDrive },
  { category: 'Blockchain', items: ['@solana/web3.js', 'Wallet Adapter'], icon: Server },
]

const folderStructure = `src/
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
│   ├── docs/                 # In-app documentation
│   └── api/                  # API routes
│       ├── chat/             # AI chat endpoint
│       ├── prpc/             # pRPC proxy
│       ├── pnodes/           # pNode endpoints
│       ├── alerts/           # Alert endpoints
│       └── analytics/        # Analytics endpoints
├── components/
│   ├── app-sidebar.tsx       # Left sidebar navigation
│   ├── app-header.tsx        # Top header with controls
│   ├── mobile-nav.tsx        # Mobile bottom navigation
│   ├── ai-chat.tsx           # AI chat component
│   ├── rewards-tracking.tsx  # Rewards & epoch tracking
│   ├── network-topology.tsx  # Network visualization
│   ├── pnodes/               # pNode-specific components
│   ├── alerts/               # Alert components
│   └── ui/                   # shadcn/ui components
├── services/
│   ├── pnode.service.ts      # pNode data fetching
│   ├── analytics.service.ts  # Analytics & predictions
│   ├── alert.service.ts      # Alert management
│   ├── geoip.service.ts      # GeoIP lookup
│   └── websocket.service.ts  # Real-time updates
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Utility functions
└── types/                    # TypeScript definitions`

const services = [
  {
    name: 'PNodeService',
    file: 'pnode.service.ts',
    description: 'Core service for fetching pNode data from Xandeum network',
    methods: ['getPNodes()', 'getPNodeDetails(id)', 'getNetworkStats()', 'getEpochInfo()'],
  },
  {
    name: 'AnalyticsService',
    file: 'analytics.service.ts',
    description: 'Historical data, predictions, and quantitative analysis',
    methods: ['getHistory()', 'getPredictions()', 'getAnomalies()', 'getLeaderboard()'],
  },
  {
    name: 'AlertService',
    file: 'alert.service.ts',
    description: 'Alert creation, management, and notification delivery',
    methods: ['createAlert()', 'getAlerts()', 'updateRule()', 'dismissAlert()'],
  },
  {
    name: 'WebSocketService',
    file: 'websocket.service.ts',
    description: 'Real-time updates via WebSocket with polling fallback',
    methods: ['connect()', 'subscribe()', 'disconnect()', 'onMessage()'],
  },
  {
    name: 'GeoIPService',
    file: 'geoip.service.ts',
    description: 'Geographic location lookup for pNode IP addresses',
    methods: ['lookupGeoIP(ip)', 'getLocationForIP(ip)', 'batchLookup()'],
  },
]

const dataFlowSteps = [
  { label: 'User Action', desc: 'Click, navigate, or request data' },
  { label: 'React Query', desc: 'Check cache, decide to fetch' },
  { label: 'API Route', desc: 'Next.js serverless function' },
  { label: 'Service Layer', desc: 'PNodeService, AnalyticsService, etc.' },
  { label: 'External API', desc: 'pnRPC (6000), Xandeum RPC (8899)' },
  { label: 'Transform', desc: 'Normalize data, add GeoIP' },
  { label: 'Response', desc: 'Return JSON to client' },
  { label: 'UI Update', desc: 'React renders new state' },
]

const dbSchema = [
  { table: 'NetworkSnapshot', desc: 'Historical network state at each index run', fields: ['timestamp', 'totalPNodes', 'onlinePNodes', 'totalStorage', 'avgPerformance'] },
  { table: 'PNodeSnapshot', desc: 'Per-pNode historical metrics', fields: ['pubkey', 'timestamp', 'status', 'storage', 'performance', 'uptime'] },
  { table: 'Alert', desc: 'Generated alerts', fields: ['type', 'severity', 'pnodeId', 'message', 'status', 'createdAt'] },
  { table: 'AlertRule', desc: 'User-configured alert rules', fields: ['type', 'threshold', 'enabled', 'notifications'] },
]

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Docs
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <Blocks className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Architecture</h1>
              <Badge variant="secondary">Technical</Badge>
            </div>
            <p className="text-muted-foreground">
              System design, services, and data flow
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tech Stack</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {techStack.map((tech) => (
            <Card key={tech.category} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <tech.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{tech.category}</span>
                </div>
                <div className="space-y-1">
                  {tech.items.map((item) => (
                    <p key={item} className="text-xs">{item}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Folder Structure */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Project Structure</h2>
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre">
              {folderStructure}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Service Layer */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Service Layer
        </h2>
        <p className="text-muted-foreground">
          The application uses a service layer pattern to encapsulate business logic and external API calls.
        </p>
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{service.name}</CardTitle>
                  <code className="text-xs text-muted-foreground">{service.file}</code>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.methods.map((method) => (
                    <code key={method} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {method}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Data Flow
        </h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {dataFlowSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-xs font-medium mt-1">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center max-w-20">{step.desc}</span>
                  </div>
                  {i < dataFlowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Schema */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Database Schema
        </h2>
        <p className="text-muted-foreground">
          PostgreSQL with Prisma ORM for analytics persistence and alert management.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {dbSchema.map((table) => (
            <Card key={table.table}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono">{table.table}</CardTitle>
                <CardDescription className="text-xs">{table.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {table.fields.map((field) => (
                    <code key={field} className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      {field}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Real-time Updates */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-time Updates
          </CardTitle>
          <CardDescription>
            How the platform maintains live data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="font-medium text-sm">Primary: WebSocket</p>
              <p className="text-xs text-muted-foreground">
                Streaming connection for instant updates when available
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="font-medium text-sm">Fallback: Polling</p>
              <p className="text-xs text-muted-foreground">
                Configurable interval (15s, 30s, 1min, 5min) via settings
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            React Query handles caching with a 30-second stale time to reduce redundant network requests.
          </p>
        </CardContent>
      </Card>

      {/* Key Design Decisions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Key Design Decisions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'API Route Proxy', desc: 'All pRPC calls go through /api/prpc to avoid browser CORS restrictions' },
            { title: 'Service Abstraction', desc: 'Business logic isolated in service classes for testability and reuse' },
            { title: 'Incremental Static Regeneration', desc: 'Static pages with ISR for optimal performance' },
            { title: 'Dynamic Imports', desc: 'Heavy components (maps, charts, globe) loaded on demand' },
            { title: 'Jotai State', desc: 'Atomic state management for settings, watchlist, and UI preferences' },
            { title: 'React Query Caching', desc: '30s stale time balances freshness with performance' },
          ].map((item) => (
            <Card key={item.title} className="bg-muted/30">
              <CardContent className="p-4">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/docs/api">
            &larr; API Reference
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/docs">
            Back to Docs Hub
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
