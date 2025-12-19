'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Keyboard,
  Rocket,
  Sparkles,
  Database,
  BarChart3,
  Star,
  Bell,
  GitCompare,
  Map,
  Bot,
  Command,
  Github,
  Layout,
  Grid3X3,
  List,
  PlayCircle,
  Settings,
  Wallet,
  Network,
  Coins,
  CheckCircle2,
} from 'lucide-react'

const howToUseSteps = [
  {
    step: 1,
    title: 'Connect Your Wallet',
    description: 'Click the "Connect Wallet" button in the header to link your Solana wallet. This enables personalized features like tracking your owned pNodes and viewing your staking rewards.',
    icon: Wallet,
  },
  {
    step: 2,
    title: 'Select Your Network',
    description: 'Use the cluster selector to choose between Mainnet, Devnet, or Testnet. Each network has different pNodes and data.',
    icon: Network,
  },
  {
    step: 3,
    title: 'Explore the Dashboard',
    description: 'The Dashboard provides a quick overview of network health, top performers, and key metrics. Use the quick action buttons to navigate to detailed views.',
    icon: Layout,
  },
  {
    step: 4,
    title: 'Monitor pNodes',
    description: 'Visit the pNodes page to browse all nodes. Switch between Table, Grid, and Map views. Click any pNode for detailed information.',
    icon: Database,
  },
  {
    step: 5,
    title: 'Track Rewards',
    description: 'Check the Network Stats page to view staking APY, epoch progress, and projected earnings. Monitor your rewards in real-time.',
    icon: Coins,
  },
  {
    step: 6,
    title: 'Set Up Alerts',
    description: 'Create custom alerts to be notified when pNodes go offline, performance drops, or new nodes join. Configure notification preferences in Settings.',
    icon: Bell,
  },
  {
    step: 7,
    title: 'Use the AI Assistant',
    description: 'Press ⌘/ to open the AI chat. Ask questions about the network, get insights, or request help with any feature.',
    icon: Bot,
  },
  {
    step: 8,
    title: 'Customize Settings',
    description: 'Visit Settings to configure your primary endpoint, enable real-time animations, set up browser notifications, and toggle developer mode.',
    icon: Settings,
  },
]

const keyboardShortcuts = [
  { keys: ['⌘', 'K'], windowsKeys: ['Ctrl', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['⌘', '/'], windowsKeys: ['Ctrl', '/'], description: 'Toggle AI chat assistant', category: 'AI' },
  { keys: ['/'], windowsKeys: ['/'], description: 'Focus global search', category: 'Navigation' },
  { keys: ['⌘', 'D'], windowsKeys: ['Ctrl', 'D'], description: 'Toggle dark/light mode', category: 'Display' },
  { keys: ['R'], windowsKeys: ['R'], description: 'Refresh data', category: 'Data' },
  { keys: ['Esc'], windowsKeys: ['Esc'], description: 'Close dialogs and modals', category: 'Navigation' },
  { keys: ['⌘', 'B'], windowsKeys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Display' },
  { keys: ['?'], windowsKeys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
]

const features = [
  {
    icon: Layout,
    title: 'Dashboard Overview',
    description: 'Get a bird\'s-eye view of the entire pNode network with real-time stats, status badges, and top performers.',
  },
  {
    icon: Database,
    title: 'pNode Explorer',
    description: 'Browse all pNodes with multiple view options: table view for detailed data, grid view for visual overview, and map view for geographic distribution.',
  },
  {
    icon: BarChart3,
    title: 'Network Analytics',
    description: 'Deep dive into network-wide statistics including total storage capacity, average uptime, version distribution, and performance metrics.',
  },
  {
    icon: Star,
    title: 'Watchlist',
    description: 'Save your favorite pNodes to a personal watchlist for quick access and monitoring. Track the nodes you care about most.',
  },
  {
    icon: Bell,
    title: 'Alerts System',
    description: 'Set up custom alerts for pNode status changes, performance drops, or new nodes joining the network.',
  },
  {
    icon: GitCompare,
    title: 'Compare Mode',
    description: 'Compare multiple pNodes side-by-side to analyze their performance, storage, uptime, and other metrics.',
  },
  {
    icon: Map,
    title: 'Geographic View',
    description: 'Visualize pNode distribution across the globe with an interactive map showing node locations and statuses.',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Get intelligent insights and answers about the pNode network using our AI-powered chat assistant. Press ⌘/ to start.',
  },
]

const faqs = [
  {
    question: 'What is a pNode?',
    answer: 'A pNode (storage provider node) is part of Xandeum\'s decentralized storage network. These nodes provide scalable, reliable storage for Solana dApps, enabling applications to store and retrieve data efficiently on-chain.',
  },
  {
    question: 'How is data fetched?',
    answer: 'Data is fetched in real-time directly from the Xandeum network using the official pRPC API. We connect to the selected cluster (mainnet, devnet, or testnet) and query node information, storage metrics, and network statistics.',
  },
  {
    question: 'How often is data updated?',
    answer: 'By default, analytics data refreshes every 30 seconds. You can customize this interval in Settings, manually refresh using the Refresh button in the header, or press R on your keyboard.',
  },
  {
    question: 'How do I set up alerts?',
    answer: 'Navigate to the Alerts page from the sidebar. You can create custom alerts for specific pNodes or network-wide events. Choose your notification preferences (browser, email) and set thresholds for performance metrics.',
  },
  {
    question: 'Can I track specific pNodes?',
    answer: 'Yes! Use the Watchlist feature to save pNodes you want to monitor. Click the star icon on any pNode to add it to your watchlist. Access your saved nodes quickly from the Watchlist page.',
  },
  {
    question: 'What does the AI Assistant do?',
    answer: 'The AI Assistant can answer questions about the pNode network, explain metrics, help you find specific nodes, and provide insights about network health. Press ⌘/ to open the chat.',
  },
  {
    question: 'How do I connect my wallet?',
    answer: 'Click the "Connect Wallet" button in the header. We support popular Solana wallets including Phantom, Solflare, and Backpack. Connecting your wallet enables additional features like viewing your owned pNodes.',
  },
  {
    question: 'What are the different view modes?',
    answer: 'The pNodes page offers three view modes: Table view for detailed data with sorting and filtering, Grid view for a visual card-based layout, and Map view to see geographic distribution of nodes.',
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <HelpCircle className="h-8 w-8" />
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about Xandeum pNode Analytics.
        </p>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Getting Started
          </CardTitle>
          <CardDescription>New to Xandeum pNode Analytics? Start here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Xandeum pNode Analytics is your comprehensive dashboard for monitoring and analyzing the
            Xandeum decentralized storage network. Track pNode performance, explore network statistics,
            and get AI-powered insights about the ecosystem.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">1. Explore the Dashboard</div>
              <p className="text-sm text-muted-foreground">
                Start with the Dashboard for an overview of network health and top performers.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">2. Browse pNodes</div>
              <p className="text-sm text-muted-foreground">
                Visit the pNodes page to explore individual nodes, their stats, and locations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">3. Use AI Assistant</div>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">⌘/</kbd> to ask questions and get insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use - Step by Step Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            How to Use
          </CardTitle>
          <CardDescription>Step-by-step guide to get the most out of pNode Analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {howToUseSteps.map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Step {item.step}</Badge>
                    <h4 className="font-medium">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                {index < howToUseSteps.length - 1 && (
                  <div className="hidden sm:flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts - Prominent Display */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>Master these shortcuts to navigate like a pro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {keyboardShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-background border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <Badge key={keyIndex} variant="secondary" className="font-mono text-xs px-2">
                        {key}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm">{shortcut.description}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {shortcut.category}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Windows/Linux users: Replace ⌘ with Ctrl
          </p>
        </CardContent>
      </Card>

      {/* Features Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Features Guide
          </CardTitle>
          <CardDescription>Discover everything you can do with pNode Analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{feature.title}</div>
                  <p className="text-sm text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Modes Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            pNode View Modes
          </CardTitle>
          <CardDescription>Different ways to explore the pNode network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <List className="h-4 w-4 text-primary" />
                <span className="font-medium">Table View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed data in rows and columns. Sort by any metric, filter by status, and export data.
                Best for data analysis and comparisons.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Grid3X3 className="h-4 w-4 text-primary" />
                <span className="font-medium">Grid View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Visual card-based layout showing key metrics at a glance. Great for quick scanning
                and identifying top performers.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Map className="h-4 w-4 text-primary" />
                <span className="font-medium">Map View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Interactive world map showing pNode locations. Visualize geographic distribution
                and network decentralization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command Palette & AI Chat */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Command Palette
            </CardTitle>
            <CardDescription>Quick access to any action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> to
              open the command palette. From here you can:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Navigate to any page instantly</li>
              <li>Search for specific pNodes</li>
              <li>Toggle theme and settings</li>
              <li>Access recent items and favorites</li>
              <li>Run quick actions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <CardDescription>Intelligent insights at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘/</kbd> to
              open the AI chat. Ask questions like:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>&ldquo;What&apos;s the current network health?&rdquo;</li>
              <li>&ldquo;Show me the top performing pNodes&rdquo;</li>
              <li>&ldquo;Explain what uptime percentage means&rdquo;</li>
              <li>&ldquo;Which pNodes are in North America?&rdquo;</li>
              <li>&ldquo;Summarize storage trends this week&rdquo;</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about pNode Analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h4 className="font-medium">{faq.question}</h4>
              <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
              {index < faqs.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>Technical docs and API reference</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <a
                href="https://xandeum.github.io/xandeum-web3.js"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Docs
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Community
            </CardTitle>
            <CardDescription>Join the Xandeum Discord</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <a
                href="https://discord.gg/uqRSmmM5m"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Source Code
            </CardTitle>
            <CardDescription>View on GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <a
                href="https://github.com/xandeum"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Need More Help */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Can&apos;t find what you&apos;re looking for? Reach out to our community or use the AI assistant.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <a href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask on Discord
                </a>
              </Button>
              <Button>
                <Bot className="h-4 w-4 mr-2" />
                Open AI Chat (⌘/)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
