'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Code,
  Server,
  ArrowRight,
  Database,
  Globe,
  Zap,
  CheckCircle2,
  AlertCircle,
  Network,
  FileJson,
} from 'lucide-react'

const seedNodes = [
  { ip: '192.190.136.28', port: 6000, status: 'Primary' },
  { ip: '173.212.220.65', port: 6000, status: 'Fallback' },
  { ip: '192.190.136.37', port: 6000, status: 'Fallback' },
]

const rpcMethods = [
  {
    name: 'get-pods-with-stats',
    port: 6000,
    description: 'Primary data source - Returns all pNodes with storage, uptime, and performance metrics',
    source: 'pnRPC Seed Nodes',
    critical: true,
    response: `{
  "jsonrpc": "2.0",
  "result": {
    "pods": [{
      "address": "192.190.136.28",
      "is_public": true,
      "pubkey": "6cXp...",
      "rpc_port": 8899,
      "storage_committed": 107374182400,
      "storage_usage_percent": 0.0000467,
      "storage_used": 5013504,
      "uptime": 1234567,
      "version": "2.0.15"
    }]
  },
  "id": 1
}`,
  },
  {
    name: 'get-stats',
    port: 6000,
    description: 'Detailed metrics for a specific node - CPU, RAM, network packets, streams',
    source: 'pnRPC Seed Nodes',
    critical: false,
    response: `{
  "jsonrpc": "2.0",
  "result": {
    "active_streams": 0,
    "cpu_percent": 12.5,
    "current_index": 0,
    "file_size": 107374182400,
    "last_updated": 1703000000,
    "packets_received": 1500000,
    "packets_sent": 1200000,
    "ram_total": 8589934592,
    "ram_used": 4294967296,
    "total_bytes": 5013504,
    "total_pages": 1024,
    "uptime": 1234567
  },
  "id": 1
}`,
  },
  {
    name: 'getClusterNodes',
    port: 8899,
    description: 'Standard Solana RPC - Returns all cluster nodes with gossip, TPU, and RPC endpoints',
    source: 'Xandeum RPC',
    critical: false,
    response: `{
  "jsonrpc": "2.0",
  "result": [{
    "pubkey": "6cXp...",
    "gossip": "192.190.136.28:8001",
    "tpu": "192.190.136.28:8003",
    "rpc": "192.190.136.28:8899",
    "version": "2.0.15",
    "featureSet": 123456789,
    "shredVersion": 1234
  }],
  "id": 1
}`,
  },
  {
    name: 'getEpochInfo',
    port: 8899,
    description: 'Current epoch information - slot index, slots in epoch, transaction count',
    source: 'Xandeum RPC',
    critical: false,
    response: `{
  "jsonrpc": "2.0",
  "result": {
    "absoluteSlot": 166598,
    "blockHeight": 166500,
    "epoch": 27,
    "slotIndex": 8598,
    "slotsInEpoch": 8192,
    "transactionCount": 22661093
  },
  "id": 1
}`,
  },
]

const dataFlow = [
  { step: 1, from: 'Client Browser', to: '/api/prpc', description: 'Request pNode data' },
  { step: 2, from: '/api/prpc', to: 'pnRPC Seed Nodes', description: 'Forward to port 6000' },
  { step: 3, from: 'Seed Node', to: '/api/prpc', description: 'Return pod list with stats' },
  { step: 4, from: '/api/prpc', to: 'GeoIP Service', description: 'Enrich with location data' },
  { step: 5, from: '/api/prpc', to: 'Client Browser', description: 'Return formatted pNodes' },
]

export default function PRPCPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Docs
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary via-chart-2 to-chart-1 flex items-center justify-center shadow-lg shadow-primary/20">
            <Code className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">pRPC Integration</h1>
              <Badge variant="secondary">Technical</Badge>
            </div>
            <p className="text-muted-foreground">
              How we connect to real Xandeum pNodes via pnRPC
            </p>
          </div>
        </div>
      </div>

      {/* Key Point Banner */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">Real Data Integration</p>
              <p className="text-sm text-muted-foreground">
                This platform connects to <strong>real Xandeum pnRPC endpoints</strong> on port 6000,
                not mock data. All storage metrics, uptime values, and performance data come directly
                from the Xandeum network.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          The Xandeum network provides pNode data through a specialized RPC interface called <strong>pnRPC</strong>,
          which runs on port <code className="px-1.5 py-0.5 bg-muted rounded text-sm">6000</code> (distinct from the
          standard Solana RPC port 8899). This platform queries multiple seed nodes to retrieve live network data.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Server className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Seed Nodes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Network className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">6000</p>
                <p className="text-sm text-muted-foreground">pnRPC Port</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">RPC Methods</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seed Nodes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Seed Nodes
        </h2>
        <p className="text-muted-foreground">
          We query these known pNodes in order until one responds successfully:
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {seedNodes.map((node, i) => (
                <div key={node.ip} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <code className="font-mono text-sm">{node.ip}:{node.port}</code>
                  </div>
                  <Badge variant={node.status === 'Primary' ? 'default' : 'outline'}>
                    {node.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            <strong>Implementation:</strong> See{' '}
            <code className="px-1 py-0.5 bg-background rounded text-xs">src/services/pnode.service.ts</code>{' '}
            lines 250-257 for the seed node configuration and fallback logic.
          </p>
        </div>
      </div>

      {/* RPC Methods */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          RPC Methods
        </h2>
        <div className="space-y-4">
          {rpcMethods.map((method) => (
            <Card key={method.name} className={method.critical ? 'border-primary/50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-mono text-base">{method.name}</CardTitle>
                      {method.critical && <Badge>Primary</Badge>}
                    </div>
                    <CardDescription className="mt-1">{method.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Port {method.port}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Source:</span>
                    <span>{method.source}</span>
                  </div>
                  <details className="group">
                    <summary className="text-sm text-primary cursor-pointer hover:underline">
                      View example response
                    </summary>
                    <pre className="mt-2 p-3 rounded-lg bg-muted overflow-x-auto text-xs font-mono">
                      {method.response}
                    </pre>
                  </details>
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
            <div className="space-y-3">
              {dataFlow.map((step, i) => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {step.step}
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{step.from}</code>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{step.to}</code>
                    <span className="text-muted-foreground">— {step.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Data Retrieved */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Real Data Retrieved
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { field: 'pubkey', desc: 'Node public key for identification' },
            { field: 'address', desc: 'IP address of the pNode' },
            { field: 'version', desc: 'Software version running' },
            { field: 'storage_committed', desc: 'Total storage capacity in bytes' },
            { field: 'storage_used', desc: 'Used storage in bytes' },
            { field: 'storage_usage_percent', desc: 'Utilization percentage' },
            { field: 'uptime', desc: 'Uptime in seconds (real value)' },
            { field: 'cpu_percent', desc: 'CPU utilization percentage' },
            { field: 'ram_used / ram_total', desc: 'Memory usage' },
            { field: 'packets_sent / received', desc: 'Network traffic' },
          ].map((item) => (
            <div key={item.field} className="flex items-start gap-2 p-2 rounded bg-muted/30">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <code className="text-xs font-mono text-primary">{item.field}</code>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Handling */}
      <Card className="bg-yellow-500/5 border-yellow-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Error Handling & Fallbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>Seed nodes are tried in order - if one fails, the next is attempted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>5-second timeout for <code className="px-1 py-0.5 bg-muted rounded text-xs">get-pods</code>,
                10-second for <code className="px-1 py-0.5 bg-muted rounded text-xs">get-pods-with-stats</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>Browser requests are proxied through <code className="px-1 py-0.5 bg-muted rounded text-xs">/api/prpc</code> to avoid CORS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>React Query provides 30-second caching to reduce redundant requests</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Code Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Code Reference</CardTitle>
          <CardDescription>Key files implementing pRPC integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { file: 'src/services/pnode.service.ts', desc: 'Main pNode service with pnRPC calls' },
              { file: 'src/app/api/prpc/route.ts', desc: 'API proxy for CORS avoidance' },
              { file: 'src/services/geoip.service.ts', desc: 'GeoIP enrichment for node locations' },
            ].map((item) => (
              <div key={item.file} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <code className="text-xs font-mono">{item.file}</code>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/docs/features">
            &larr; Feature Guide
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/docs/api">
            API Reference
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
