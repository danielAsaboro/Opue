'use client'

import { Activity, Server, HardDrive, Gauge, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkStatsData {
  totalPNodes: number
  onlinePNodes: number
  offlinePNodes: number
  healthScore: number
  averagePerformance: number
  totalCapacityTB: string
  totalUsedTB: string
  utilizationPercent: string
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  colorClass?: string
}

function StatCard({ icon, label, value, subValue, colorClass = 'text-primary' }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg min-w-[80px]">
      <div className={cn('mb-1', colorClass)}>{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      {subValue && <div className="text-[9px] text-muted-foreground mt-0.5">{subValue}</div>}
    </div>
  )
}

function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function NetworkStatsRenderer({ data }: { data: unknown }) {
  const stats = data as NetworkStatsData

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Activity className="w-4 h-4 text-primary" />
        Network Overview
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Server className="w-4 h-4" />}
          label="pNodes"
          value={stats.totalPNodes}
          subValue={`${stats.onlinePNodes} online`}
          colorClass="text-blue-500"
        />
        <StatCard
          icon={<Gauge className="w-4 h-4" />}
          label="Health"
          value={`${stats.healthScore}%`}
          colorClass={stats.healthScore >= 90 ? 'text-emerald-500' : 'text-amber-500'}
        />
        <StatCard
          icon={<HardDrive className="w-4 h-4" />}
          label="Capacity"
          value={stats.totalCapacityTB}
          subValue="TB total"
          colorClass="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Perf"
          value={`${stats.averagePerformance}%`}
          colorClass="text-cyan-500"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Used"
          value={stats.totalUsedTB}
          subValue="TB"
          colorClass="text-orange-500"
        />
      </div>

      <ProgressBar
        value={parseFloat(stats.utilizationPercent)}
        label="Storage Utilization"
      />
    </div>
  )
}
