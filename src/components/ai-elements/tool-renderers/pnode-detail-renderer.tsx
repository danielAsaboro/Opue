'use client'

import { Server, MapPin, Gauge, HardDrive, Clock, Wifi, Activity, CheckCircle2, XCircle, AlertTriangle, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PNodeDetailsData {
  id: string
  status: 'online' | 'offline' | 'delinquent'
  version: string
  location: string
  performanceScore: number
  uptime: string
  latency: string
  successRate: string
  storageTB: string
  usedTB: string
  utilization: string
  fileSystems: number
  network?: {
    ip?: string
    port?: number
  }
}

function truncateId(id: string): string {
  if (id.length <= 16) return id
  return `${id.slice(0, 8)}...${id.slice(-6)}`
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    online: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Online' },
    offline: { icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Offline' },
    delinquent: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Delinquent' },
  }[status] || { icon: Server, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: status }

  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border', config.color)}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, subValue }: { icon: React.ElementType; label: string; value: string; subValue?: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  )
}

function StorageBar({ used, total, utilization }: { used: string; total: string; utilization: string }) {
  const utilizationNum = parseFloat(utilization)

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HardDrive className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Storage</span>
        </div>
        <span className="text-xs font-medium">{utilization}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            utilizationNum > 80 ? 'bg-red-500' : utilizationNum > 50 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(utilizationNum, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used} TB used</span>
        <span>{total} TB total</span>
      </div>
    </div>
  )
}

export function PNodeDetailRenderer({ data }: { data: unknown }) {
  const details = data as PNodeDetailsData

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm font-semibold">{truncateId(details.id)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {details.location}
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                v{details.version}
              </span>
            </div>
          </div>
          <StatusBadge status={details.status} />
        </div>
      </div>

      {/* Performance Score */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Performance Score</span>
          <span className={cn(
            'text-2xl font-bold',
            details.performanceScore >= 80 ? 'text-emerald-500' : details.performanceScore >= 60 ? 'text-amber-500' : 'text-red-500'
          )}>
            {details.performanceScore}/100
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              details.performanceScore >= 80 ? 'bg-emerald-500' : details.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${details.performanceScore}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <MetricCard icon={Clock} label="Uptime" value={details.uptime} />
        <MetricCard icon={Activity} label="Latency" value={details.latency} />
        <MetricCard icon={Gauge} label="Success" value={details.successRate} />
      </div>

      {/* Storage */}
      <div className="px-4 pb-4">
        <StorageBar
          used={details.usedTB}
          total={details.storageTB}
          utilization={details.utilization}
        />
      </div>

      {/* Network Info */}
      {details.network && (details.network.ip || details.network.port) && (
        <div className="px-4 pb-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wide">Network</span>
            </div>
            <div className="font-mono text-xs">
              {details.network.ip && <span>{details.network.ip}</span>}
              {details.network.ip && details.network.port && <span>:</span>}
              {details.network.port && <span>{details.network.port}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
