'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileCode,
  ArrowRight,
  Database,
  Bell,
  TrendingUp,
  MessageSquare,
  Network,
  Server,
} from 'lucide-react'

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE'
  path: string
  description: string
  params?: { name: string; type: string; description: string }[]
  body?: string
  response?: string
}

interface APISection {
  title: string
  icon: React.ElementType
  description: string
  endpoints: Endpoint[]
}

const apiSections: APISection[] = [
  {
    title: 'pNodes',
    icon: Database,
    description: 'Retrieve pNode data from the Xandeum network',
    endpoints: [
      {
        method: 'GET',
        path: '/api/pnodes',
        description: 'Get all pNodes with their current status and metrics',
        response: `{
  "pnodes": [{
    "id": "6cXp...",
    "pubkey": "6cXp...",
    "address": "192.190.136.28",
    "status": "online",
    "version": "2.0.15",
    "storage": { "total": 100, "used": 0.05, "available": 99.95 },
    "performance": { "uptime": 99.8, "latency": 45, "score": 95 },
    "location": { "city": "Frankfurt", "country": "Germany", "region": "Europe" }
  }],
  "total": 25
}`,
      },
      {
        method: 'GET',
        path: '/api/pnodes/[id]',
        description: 'Get detailed information for a specific pNode',
        params: [{ name: 'id', type: 'string', description: 'pNode pubkey or address' }],
        response: `{
  "id": "6cXp...",
  "pubkey": "6cXp...",
  "address": "192.190.136.28",
  "status": "online",
  "version": "2.0.15",
  "storage": { "total": 100, "used": 0.05, "available": 99.95, "unit": "GB" },
  "performance": { "uptime": 99.8, "latency": 45, "score": 95, "cpu": 12.5, "ram": 50 },
  "network": { "packetsIn": 1500000, "packetsOut": 1200000, "peers": 8 },
  "location": { "city": "Frankfurt", "country": "Germany", "lat": 50.11, "lon": 8.68 }
}`,
      },
    ],
  },
  {
    title: 'Network Stats',
    icon: Network,
    description: 'Network-wide statistics and metrics',
    endpoints: [
      {
        method: 'GET',
        path: '/api/network-stats',
        description: 'Get aggregated network statistics',
        response: `{
  "totalPNodes": 25,
  "onlinePNodes": 23,
  "totalStorage": 2500,
  "usedStorage": 125,
  "averagePerformance": 94.5,
  "averageLatency": 42,
  "networkHealth": 98,
  "epoch": { "current": 27, "slot": 8598, "progress": 0.85 }
}`,
      },
    ],
  },
  {
    title: 'pRPC Proxy',
    icon: Server,
    description: 'Proxy for Xandeum RPC calls (avoids CORS)',
    endpoints: [
      {
        method: 'POST',
        path: '/api/prpc',
        description: 'Forward RPC requests to Xandeum network',
        body: `{
  "method": "getClusterNodes" | "getEpochInfo" | "getVoteAccounts",
  "params": []
}`,
        response: `{
  "jsonrpc": "2.0",
  "result": {...},
  "id": 1
}`,
      },
    ],
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    description: 'Historical data, predictions, and analysis',
    endpoints: [
      {
        method: 'GET',
        path: '/api/analytics/history',
        description: 'Get 30-day historical network data',
        params: [{ name: 'days', type: 'number', description: 'Number of days (default: 30)' }],
        response: `{
  "history": [{
    "date": "2024-12-01",
    "totalPNodes": 20,
    "onlinePNodes": 18,
    "totalStorage": 2000,
    "avgPerformance": 92
  }]
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/anomalies',
        description: 'Get detected anomalies in the network',
        response: `{
  "anomalies": [{
    "id": "anom_123",
    "type": "performance_drop",
    "severity": "warning",
    "pnodeId": "6cXp...",
    "message": "Performance dropped 15% in last hour",
    "detectedAt": "2024-12-15T10:30:00Z"
  }]
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/predictions',
        description: 'Get 7-day and 30-day network predictions',
        response: `{
  "predictions": {
    "7day": { "pnodes": 28, "storage": 2800, "confidence": 0.85 },
    "30day": { "pnodes": 35, "storage": 3500, "confidence": 0.72 }
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/leaderboard',
        description: 'Get top performing pNodes',
        params: [{ name: 'limit', type: 'number', description: 'Number of results (default: 10)' }],
        response: `{
  "leaderboard": [{
    "rank": 1,
    "pnodeId": "6cXp...",
    "score": 98.5,
    "uptime": 99.9,
    "storage": 100
  }]
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/pnode/[pubkey]',
        description: 'Get historical analytics for a specific pNode',
        params: [{ name: 'pubkey', type: 'string', description: 'pNode public key' }],
      },
      {
        method: 'GET',
        path: '/api/analytics/quant',
        description: 'Get quantitative analysis (correlations, regressions)',
        response: `{
  "correlations": { "uptime_performance": 0.85, "storage_score": 0.62 },
  "regressions": { "growth_rate": 0.12, "r_squared": 0.78 }
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/events',
        description: 'Get recent network events',
      },
    ],
  },
  {
    title: 'Alerts',
    icon: Bell,
    description: 'Alert management and notification rules',
    endpoints: [
      {
        method: 'GET',
        path: '/api/alerts',
        description: 'Get all alerts',
        params: [
          { name: 'status', type: 'string', description: 'Filter by status: active, resolved, all' },
          { name: 'type', type: 'string', description: 'Filter by alert type' },
        ],
        response: `{
  "alerts": [{
    "id": "alert_123",
    "type": "pnode_offline",
    "severity": "critical",
    "pnodeId": "6cXp...",
    "message": "pNode went offline",
    "status": "active",
    "createdAt": "2024-12-15T10:30:00Z"
  }]
}`,
      },
      {
        method: 'POST',
        path: '/api/alerts',
        description: 'Create a new alert',
        body: `{
  "type": "pnode_offline" | "pnode_performance_drop" | "pnode_storage_full",
  "pnodeId": "6cXp...",
  "threshold": 90,
  "message": "Custom alert message"
}`,
      },
      {
        method: 'GET',
        path: '/api/alerts/rules',
        description: 'Get configured alert rules',
      },
      {
        method: 'POST',
        path: '/api/alerts/rules',
        description: 'Create or update alert rules',
        body: `{
  "type": "pnode_performance_drop",
  "threshold": 85,
  "enabled": true,
  "notification": { "browser": true, "email": false }
}`,
      },
    ],
  },
  {
    title: 'AI Chat',
    icon: MessageSquare,
    description: 'AI-powered chat for network queries',
    endpoints: [
      {
        method: 'GET',
        path: '/api/chat',
        description: 'Health check for chat endpoint',
        response: `{ "status": "ok", "model": "gpt-4o" }`,
      },
      {
        method: 'POST',
        path: '/api/chat',
        description: 'Send a message to the AI assistant (streaming response)',
        body: `{
  "messages": [
    { "role": "user", "content": "Show me the network health" }
  ]
}`,
        response: `Streaming text response with tool calls for:
- get_pnodes
- get_network_stats
- get_pnode_details
- search_pnodes
- get_epoch_info
- get_validators`,
      },
    ],
  },
]

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-600 dark:text-green-400',
  POST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export default function APIReferencePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Docs
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <FileCode className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
              <Badge variant="secondary">Technical</Badge>
            </div>
            <p className="text-muted-foreground">
              All available API endpoints with request/response examples
            </p>
          </div>
        </div>
      </div>

      {/* Base URL */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Base URL</p>
          <code className="text-lg font-mono">https://opue.vercel.app</code>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {apiSections.map((section) => (
              <a
                key={section.title}
                href={`#${section.title.toLowerCase().replace(' ', '-')}`}
                className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Sections */}
      {apiSections.map((section) => (
        <div key={section.title} id={section.title.toLowerCase().replace(' ', '-')} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            {section.endpoints.map((endpoint, i) => (
              <Card key={`${endpoint.path}-${i}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={`${methodColors[endpoint.method]} font-mono text-xs`}>
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm">{endpoint.path}</code>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {endpoint.params && endpoint.params.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Parameters</p>
                      <div className="space-y-1">
                        {endpoint.params.map((param) => (
                          <div key={param.name} className="flex items-center gap-2 text-sm">
                            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{param.name}</code>
                            <span className="text-muted-foreground text-xs">({param.type})</span>
                            <span className="text-xs">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {endpoint.body && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Request Body</p>
                      <pre className="p-2 rounded bg-muted overflow-x-auto text-xs font-mono">
                        {endpoint.body}
                      </pre>
                    </div>
                  )}

                  {endpoint.response && (
                    <details className="group">
                      <summary className="text-xs text-primary cursor-pointer hover:underline">
                        View example response
                      </summary>
                      <pre className="mt-2 p-2 rounded bg-muted overflow-x-auto text-xs font-mono">
                        {endpoint.response}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/docs/prpc">
            &larr; pRPC Integration
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/docs/architecture">
            Architecture
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
