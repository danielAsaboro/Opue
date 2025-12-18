'use client'

import { Server, MapPin, Gauge, HardDrive, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PNodeData {
  id: string
  status: 'online' | 'offline' | 'delinquent'
  performanceScore: number
  location: string
  storageTB?: string
  uptime?: string
}

interface PNodesResponse {
  total: number
  online: number
  offline: number
  delinquent: number
  pnodes: PNodeData[]
}

interface SearchResponse {
  totalMatches: number
  returned: number
  filters: {
    status?: string
    location?: string
    minPerformance?: number
  }
  pnodes: PNodeData[]
}

function truncateId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 6)}...${id.slice(-4)}`
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    online: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10', label: 'Online' },
    offline: { icon: XCircle, color: 'text-red-500 bg-red-500/10', label: 'Offline' },
    delinquent: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10', label: 'Delinquent' },
  }[status] || { icon: Server, color: 'text-gray-500 bg-gray-500/10', label: status }

  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function PerformanceIndicator({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'
  const bgColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', bgColor)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn('text-xs font-medium', color)}>{score}</span>
    </div>
  )
}

function SummaryHeader({ total, online, offline, delinquent }: { total: number; online: number; offline: number; delinquent?: number }) {
  return (
    <div className="flex items-center gap-4 text-xs mb-3">
      <span className="font-semibold">{total} pNodes</span>
      <span className="text-emerald-500">{online} online</span>
      {offline > 0 && <span className="text-red-500">{offline} offline</span>}
      {delinquent && delinquent > 0 && <span className="text-amber-500">{delinquent} delinquent</span>}
    </div>
  )
}

export function PNodeTableRenderer({ data }: { data: unknown }) {
  const response = data as PNodesResponse

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Server className="w-4 h-4 text-primary" />
          pNode List
        </div>
        <SummaryHeader
          total={response.total}
          online={response.online}
          offline={response.offline}
          delinquent={response.delinquent}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">ID</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-left p-2 font-medium">Score</th>
              <th className="text-left p-2 font-medium">Location</th>
              {response.pnodes[0]?.storageTB && <th className="text-left p-2 font-medium">Storage</th>}
            </tr>
          </thead>
          <tbody>
            {response.pnodes.map((pnode, i) => (
              <tr key={pnode.id} className={cn('border-t border-muted/50', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                <td className="p-2 font-mono text-[10px]">{truncateId(pnode.id)}</td>
                <td className="p-2"><StatusBadge status={pnode.status} /></td>
                <td className="p-2"><PerformanceIndicator score={pnode.performanceScore} /></td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {pnode.location}
                  </span>
                </td>
                {pnode.storageTB && (
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-muted-foreground" />
                      {pnode.storageTB} TB
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {response.total > response.pnodes.length && (
        <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/20">
          Showing {response.pnodes.length} of {response.total} pNodes
        </div>
      )}
    </div>
  )
}

export function SearchResultsRenderer({ data }: { data: unknown }) {
  const response = data as SearchResponse

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Server className="w-4 h-4 text-primary" />
          Search Results
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="font-medium">{response.totalMatches} matches</span>
          {response.filters.status && (
            <span className="px-2 py-0.5 bg-muted rounded-full">status: {response.filters.status}</span>
          )}
          {response.filters.location && (
            <span className="px-2 py-0.5 bg-muted rounded-full">location: {response.filters.location}</span>
          )}
          {response.filters.minPerformance !== undefined && (
            <span className="px-2 py-0.5 bg-muted rounded-full">min score: {response.filters.minPerformance}</span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">ID</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-left p-2 font-medium">Score</th>
              <th className="text-left p-2 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {response.pnodes.map((pnode, i) => (
              <tr key={pnode.id} className={cn('border-t border-muted/50', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                <td className="p-2 font-mono text-[10px]">{truncateId(pnode.id)}</td>
                <td className="p-2"><StatusBadge status={pnode.status} /></td>
                <td className="p-2"><PerformanceIndicator score={pnode.performanceScore} /></td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {pnode.location}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {response.totalMatches > response.returned && (
        <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/20">
          Showing {response.returned} of {response.totalMatches} matches
        </div>
      )}
    </div>
  )
}
