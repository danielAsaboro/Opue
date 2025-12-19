'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Rocket,
  Wallet,
  Globe,
  LayoutDashboard,
  Bell,
  Sparkles,
  ArrowRight,
  Check,
  Keyboard,
  Monitor,
  Chrome,
} from 'lucide-react'

const prerequisites = [
  {
    title: 'Modern Browser',
    description: 'Chrome 90+, Firefox 90+, Safari 14+, or Edge 90+',
    icon: Chrome,
  },
  {
    title: 'Solana Wallet',
    description: 'Phantom, Solflare, or any Solana-compatible wallet (optional)',
    icon: Wallet,
  },
  {
    title: 'Internet Connection',
    description: 'Stable connection for real-time data streaming',
    icon: Globe,
  },
]

const quickStartSteps = [
  {
    step: 1,
    title: 'Visit the Platform',
    description: 'Open the Xandeum pNode Analytics Platform in your browser',
    action: 'Go to https://opue.vercel.app/',
    details: 'The platform loads with real-time data from the Xandeum network automatically.',
  },
  {
    step: 2,
    title: 'Explore the Dashboard',
    description: 'Get an overview of network health and top performers',
    action: 'View key metrics at a glance',
    details: 'The dashboard shows network health score, total storage, active pNodes, and highlights the top performers.',
  },
  {
    step: 3,
    title: 'Browse pNodes',
    description: 'Explore all storage nodes in the network',
    action: 'Navigate to pNodes page',
    details: 'Switch between Table, Grid, and Map views. Use filters to find specific nodes by status, location, or performance.',
  },
  {
    step: 4,
    title: 'Connect Your Wallet (Optional)',
    description: 'Link your Solana wallet for personalized features',
    action: 'Click "Connect Wallet" in the header',
    details: 'Connecting enables watchlist syncing, personalized alerts, and viewing your staking rewards.',
  },
  {
    step: 5,
    title: 'Set Up Alerts',
    description: 'Get notified about important network events',
    action: 'Visit the Alerts page',
    details: 'Create custom alert rules for node status changes, performance drops, or storage warnings.',
  },
]

const shortcuts = [
  { keys: ['Cmd/Ctrl', 'K'], action: 'Open command palette', description: 'Quick access to all pages and actions' },
  { keys: ['Cmd/Ctrl', '/'], action: 'Toggle AI chat', description: 'Ask questions about the network' },
  { keys: ['/'], action: 'Focus search', description: 'Start searching from anywhere' },
  { keys: ['Cmd/Ctrl', 'D'], action: 'Toggle dark mode', description: 'Switch between light and dark themes' },
  { keys: ['R'], action: 'Refresh data', description: 'Manually refresh network data' },
  { keys: ['?'], action: 'Show shortcuts', description: 'View all keyboard shortcuts' },
]

const firstActions = [
  {
    title: 'Ask the AI Assistant',
    description: 'Press Cmd/Ctrl + / and ask "Show me the network health"',
    icon: Sparkles,
    href: '/',
  },
  {
    title: 'View Network Stats',
    description: 'See detailed analytics with 5 different tabs',
    icon: LayoutDashboard,
    href: '/network',
  },
  {
    title: 'Create an Alert',
    description: 'Get notified when a pNode goes offline',
    icon: Bell,
    href: '/alerts',
  },
]

export default function GettingStartedPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Docs
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
            <p className="text-muted-foreground">
              Get up and running with the Xandeum pNode Analytics Platform in minutes
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Prerequisites
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {prerequisites.map((prereq) => (
            <Card key={prereq.title} className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <prereq.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{prereq.title}</h3>
                    <p className="text-sm text-muted-foreground">{prereq.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Start Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Start Guide</h2>
        <div className="space-y-4">
          {quickStartSteps.map((item, index) => (
            <Card key={item.step} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-chart-2" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">{item.action}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                </div>
                {index < quickStartSteps.length - 1 && (
                  <div className="absolute bottom-0 left-[19px] w-px h-4 bg-border translate-y-full" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Try These First */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Try These First</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {firstActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          Keyboard Shortcuts
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.action} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{key}</kbd>
                          {i < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                        </span>
                      ))}
                    </div>
                    <span className="font-medium">{shortcut.action}</span>
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connection Details */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connecting Your Wallet
          </CardTitle>
          <CardDescription>
            While optional, connecting a wallet unlocks additional features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <span className="font-medium">Watchlist Sync</span>
                <p className="text-sm text-muted-foreground">Your tracked pNodes are saved to your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <span className="font-medium">Personalized Alerts</span>
                <p className="text-sm text-muted-foreground">Receive notifications tailored to your tracked nodes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <span className="font-medium">Staking Rewards</span>
                <p className="text-sm text-muted-foreground">View your personal staking rewards and projections</p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Supported: Phantom, Solflare, Backpack, and more
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild className="flex-1">
          <Link href="/docs/features">
            Next: Explore Features
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/docs/prpc">
            Technical: pRPC Integration
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
