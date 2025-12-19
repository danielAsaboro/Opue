'use client'

import { Globe, MapPin, HardDrive, TrendingUp, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegionData {
  region: string
  totalPNodes: number
  online: number
  offline: number
  delinquent: number
  totalStorageTB: string
  avgPerformance: string
}

interface GeographicStatsResponse {
  totalPNodes: number
  totalRegions: number
  regions: RegionData[]
}

function RegionBar({ count, maxCount }: { count: number; maxCount: number }) {
  const percentage = (count / maxCount) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold min-w-[2rem]">{count}</span>
    </div>
  )
}

function StatusBreakdown({ online, offline, delinquent }: { online: number; offline: number; delinquent: number }) {
  const total = online + offline + delinquent

  return (
    <div className="flex items-center gap-1.5">
      {online > 0 && (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500">
          <CheckCircle2 className="w-3 h-3" />
          {online}
        </span>
      )}
      {offline > 0 && (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500">
          <XCircle className="w-3 h-3" />
          {offline}
        </span>
      )}
      {delinquent > 0 && (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500">
          <AlertTriangle className="w-3 h-3" />
          {delinquent}
        </span>
      )}
      {total === 0 && <span className="text-[10px] text-muted-foreground">-</span>}
    </div>
  )
}

function PerformanceScore({ score }: { score: string }) {
  const numScore = parseFloat(score)
  const color = numScore >= 80 ? 'text-emerald-500' : numScore >= 60 ? 'text-amber-500' : 'text-red-500'

  return (
    <span className={cn('text-xs font-medium', color)}>
      {score}%
    </span>
  )
}

export function GeographicStatsRenderer({ data }: { data: unknown }) {
  // Safely cast and validate data
  const response = data as GeographicStatsResponse | null | undefined

  // Handle error or missing data
  if (!response || !response.regions || response.regions.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Globe className="w-4 h-4 text-primary" />
          Geographic Distribution
        </div>
        <p className="text-xs text-muted-foreground">
          {(response as { error?: string })?.error || 'No geographic data available'}
        </p>
      </div>
    )
  }

  const maxPNodes = Math.max(...response.regions.map((r) => r.totalPNodes), 1)

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Globe className="w-4 h-4 text-primary" />
          Geographic Distribution
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="font-medium">{response.totalPNodes} pNodes</span>
          <span className="text-muted-foreground">across {response.totalRegions} regions</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">Region</th>
              <th className="text-left p-2 font-medium">pNodes</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-left p-2 font-medium">Storage</th>
              <th className="text-left p-2 font-medium">Avg Perf</th>
            </tr>
          </thead>
          <tbody>
            {response.regions.map((region, i) => (
              <tr key={region.region} className={cn('border-t border-muted/50', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {region.region}
                  </span>
                </td>
                <td className="p-2">
                  <RegionBar count={region.totalPNodes} maxCount={maxPNodes} />
                </td>
                <td className="p-2">
                  <StatusBreakdown
                    online={region.online}
                    offline={region.offline}
                    delinquent={region.delinquent}
                  />
                </td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-muted-foreground" />
                    {region.totalStorageTB} TB
                  </span>
                </td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <PerformanceScore score={region.avgPerformance} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 text-center text-[10px] text-muted-foreground border-t bg-muted/20">
        Sorted by pNode count (highest first)
      </div>
    </div>
  )
}
