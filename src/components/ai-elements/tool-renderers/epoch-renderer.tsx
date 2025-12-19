'use client'

import { Clock, Layers, Hash, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EpochInfoData {
  epoch: number
  absoluteSlot: number
  blockHeight: number
  slotIndex: number
  slotsInEpoch: number
  progress: string
  transactionCount?: number
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

function CircularProgress({ progress, size = 80 }: { progress: number; size?: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{progress.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-mono text-sm font-medium">{typeof value === 'number' ? formatNumber(value) : value}</span>
    </div>
  )
}

export function EpochProgressRenderer({ data }: { data: unknown }) {
  const epoch = data as EpochInfoData
  const progressNum = parseFloat(epoch.progress)

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header with Epoch */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Epoch</div>
            <div className="text-3xl font-bold text-primary">{epoch.epoch}</div>
          </div>
          <CircularProgress progress={progressNum} />
        </div>
      </div>

      {/* Slot Progress Bar */}
      <div className="px-4 py-3 border-b">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">Slot Progress</span>
          <span className="font-medium">{formatNumber(epoch.slotIndex)} / {formatNumber(epoch.slotsInEpoch)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressNum}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 divide-y divide-muted/50">
        <InfoRow icon={Hash} label="Absolute Slot" value={epoch.absoluteSlot} />
        <InfoRow icon={Layers} label="Block Height" value={epoch.blockHeight} />
        {epoch.transactionCount !== undefined && (
          <InfoRow icon={Zap} label="Transactions" value={epoch.transactionCount} />
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        'px-4 py-2 text-xs text-center border-t',
        progressNum > 90 ? 'bg-amber-500/10 text-amber-600' : 'bg-muted/30 text-muted-foreground'
      )}>
        {progressNum > 90 ? (
          <span className="flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Epoch ending soon
          </span>
        ) : (
          <span>{(100 - progressNum).toFixed(1)}% remaining in epoch</span>
        )}
      </div>
    </div>
  )
}
