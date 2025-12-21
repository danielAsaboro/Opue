'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Activity, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkHealthGaugeProps {
  healthScore: number
  previousScore?: number
  onlinePNodes: number
  totalPNodes: number
  avgPerformance: number
  className?: string
}

// Circular gauge component
function GaugeCircle({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  // Only show 270 degrees (3/4 of circle)
  const arcLength = circumference * 0.75
  const progress = (score / 100) * arcLength

  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#22c55e', text: 'text-green-500' } // green
    if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-500' } // amber
    if (score >= 40) return { stroke: '#f97316', text: 'text-orange-500' } // orange
    return { stroke: '#ef4444', text: 'text-red-500' } // red
  }

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Healthy'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Degraded'
    return 'Critical'
  }

  const colors = getScoreColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="text-muted/20"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', colors.text)}>{score}</span>
        <span className="text-xs text-muted-foreground mt-1">{getStatusText(score)}</span>
      </div>
    </div>
  )
}

export function NetworkHealthGauge({
  healthScore,
  previousScore,
  onlinePNodes,
  totalPNodes,
  avgPerformance,
  className,
}: NetworkHealthGaugeProps) {
  const trend = useMemo(() => {
    if (previousScore === undefined) return null
    const diff = healthScore - previousScore
    if (diff > 2) return { icon: TrendingUp, text: `+${diff.toFixed(1)}`, color: 'text-green-500' }
    if (diff < -2) return { icon: TrendingDown, text: diff.toFixed(1), color: 'text-red-500' }
    return { icon: Minus, text: 'Stable', color: 'text-muted-foreground' }
  }, [healthScore, previousScore])

  const onlinePercent = totalPNodes > 0 ? ((onlinePNodes / totalPNodes) * 100).toFixed(1) : '0'

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Network Health
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">
                  Network health is calculated from online ratio (40%), average performance (40%), and average uptime (20%).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <GaugeCircle score={healthScore} size={140} />

          {/* Trend indicator */}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trend.color)}>
              <trend.icon className="h-4 w-4" />
              <span>{trend.text}</span>
            </div>
          )}

          {/* Stats breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-4 w-full text-center">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{onlinePercent}%</p>
              <p className="text-xs text-muted-foreground">
                Online ({onlinePNodes}/{totalPNodes})
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{avgPerformance.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Avg Performance</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
