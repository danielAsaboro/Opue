'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  LayoutDashboard,
  Database,
  MapPin,
  Bell,
  Star,
  GitCompare,
  TrendingUp,
  Lightbulb,
  Settings,
  ArrowRight,
  Table,
  Grid3X3,
  Globe,
  BarChart3,
  Brain,
  Zap,
  Filter,
  Download,
  Moon,
  Keyboard,
} from 'lucide-react'

const features = [
  {
    id: 'dashboard',
    title: 'Network Dashboard',
    icon: LayoutDashboard,
    description: 'Your central hub for network health and quick insights',
    highlights: [
      'Network health score with real-time updates',
      'Total storage capacity and utilization',
      'Active pNode count and online percentage',
      'Top performers by uptime and performance',
      'Quick actions for common tasks',
    ],
    path: '/',
  },
  {
    id: 'pnodes',
    title: 'pNode Explorer',
    icon: Database,
    description: 'Browse and filter all storage nodes in the network',
    highlights: [
      'Table view with sortable columns',
      'Grid view with visual cards',
      'Map view showing geographic distribution',
      'Advanced filtering by status, location, performance',
      'Search by pubkey, address, or name',
      'Click any node to see detailed stats',
    ],
    badge: 'Most Used',
    path: '/pnodes',
  },
  {
    id: 'geographic',
    title: 'Geographic Heatmap',
    icon: MapPin,
    description: 'Interactive map showing global pNode distribution',
    highlights: [
      'Cluster markers for node density',
      'Storage and performance overlays',
      'Click clusters to zoom and explore',
      'Hover for quick node stats',
      'Region-based filtering',
    ],
    path: '/network',
  },
  {
    id: 'analytics',
    title: 'Historical Analytics',
    icon: TrendingUp,
    description: 'Track network growth and trends over time',
    highlights: [
      '30-day historical data',
      'Storage capacity trends',
      'Network growth visualization',
      'Performance metrics over time',
      'Export data for analysis',
    ],
    path: '/analytics',
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    icon: Brain,
    description: 'Ask questions about the network in natural language',
    highlights: [
      'GPT-4o powered responses',
      'Query pNode status and metrics',
      'Get network health summaries',
      'Search for specific nodes',
      'Understand epoch and staking info',
    ],
    badge: 'AI Powered',
    path: '/',
  },
  {
    id: 'alerts',
    title: 'Alert System',
    icon: Bell,
    description: 'Get notified about important network events',
    highlights: [
      '7 alert types (offline, performance, storage, etc.)',
      'Browser push notifications',
      'Email digest options',
      'Custom threshold configuration',
      'Alert history and management',
    ],
    path: '/alerts',
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    icon: Star,
    description: 'Track your favorite pNodes',
    highlights: [
      'Add custom nicknames',
      'Quick status overview',
      'Personalized notifications',
      'Sync across devices (with wallet)',
      'Easy comparison access',
    ],
    path: '/watchlist',
  },
  {
    id: 'compare',
    title: 'Compare Tool',
    icon: GitCompare,
    description: 'Side-by-side comparison of multiple pNodes',
    highlights: [
      'Compare up to 4 nodes simultaneously',
      '6+ comparison metrics',
      'Visual bar charts',
      'Highlight best performers',
      'Quick add from search',
    ],
    path: '/compare',
  },
  {
    id: 'insights',
    title: 'AI Insights',
    icon: Lightbulb,
    description: 'Automated anomaly detection and predictions',
    highlights: [
      'Performance drop detection',
      'Storage anomaly alerts',
      'Concentration risk warnings',
      '7-day and 30-day forecasts',
      'Smart recommendations',
    ],
    badge: 'AI Powered',
    path: '/insights',
  },
]

const viewModes = [
  { icon: Table, label: 'Table', description: 'Detailed sortable columns' },
  { icon: Grid3X3, label: 'Grid', description: 'Visual card layout' },
  { icon: Globe, label: 'Map', description: 'Geographic distribution' },
]

const uxFeatures = [
  { icon: Moon, title: 'Dark Mode', description: 'Full dark mode with system detection' },
  { icon: Keyboard, title: 'Keyboard Shortcuts', description: 'Navigate faster with hotkeys' },
  { icon: Zap, title: 'Real-time Updates', description: 'WebSocket streaming for live data' },
  { icon: Filter, title: 'Advanced Filters', description: 'Find exactly what you need' },
  { icon: Download, title: 'Export Data', description: 'Download as CSV or JSON' },
  { icon: Settings, title: 'Customization', description: 'Configure your experience' },
]

export default function FeaturesPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Docs
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Guide</h1>
            <p className="text-muted-foreground">
              Explore all the capabilities of the Xandeum pNode Analytics Platform
            </p>
          </div>
        </div>
      </div>

      {/* View Modes Highlight */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Multiple View Modes
          </CardTitle>
          <CardDescription>
            Browse pNodes in the way that works best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {viewModes.map((mode) => (
              <div key={mode.label} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <mode.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{mode.label}</p>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Features Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Core Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.id} href={feature.path}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {feature.highlights.slice(0, 3).map((highlight, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {highlight}
                      </li>
                    ))}
                    {feature.highlights.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{feature.highlights.length - 3} more
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* User Experience Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">User Experience</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {uxFeatures.map((feature) => (
            <Card key={feature.title} className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Network Stats Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Network Stats Tabs
          </CardTitle>
          <CardDescription>
            The Network page features 5 specialized tabs for deep analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: 'Overview', desc: 'Core metrics and live charts' },
              { name: 'Rewards', desc: 'Epoch progress and staking' },
              { name: 'Topology', desc: 'Network visualization' },
              { name: 'Quant Analysis', desc: 'Statistical analysis' },
              { name: 'Geographic', desc: 'Location heatmap' },
            ].map((tab) => (
              <div key={tab.name} className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">{tab.name}</p>
                <p className="text-xs text-muted-foreground">{tab.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Types
          </CardTitle>
          <CardDescription>
            7 different alert types to keep you informed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { type: 'pnode_offline', desc: 'When a node goes offline' },
              { type: 'pnode_performance_drop', desc: 'Performance below threshold' },
              { type: 'pnode_storage_full', desc: 'Storage utilization > 90%' },
              { type: 'network_decentralization', desc: 'Geographic concentration risk' },
              { type: 'new_pnode_joined', desc: 'New provider joins network' },
              { type: 'pnode_version_outdated', desc: 'Deprecated software version' },
              { type: 'network_storage_low', desc: 'Network-wide storage warning' },
            ].map((alert) => (
              <div key={alert.type} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Badge variant="outline" className="text-xs font-mono shrink-0">{alert.type}</Badge>
                <span className="text-sm text-muted-foreground">{alert.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/docs/getting-started">
            &larr; Getting Started
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/docs/prpc">
            Technical: pRPC Integration
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
