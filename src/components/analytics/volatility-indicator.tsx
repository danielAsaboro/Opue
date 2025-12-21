'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import type { RiskProfile } from '@/types/quant'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from 'recharts'

interface VolatilityIndicatorProps {
  volatility: RiskProfile['volatility']
  compact?: boolean
  showTrend?: boolean
  showChart?: boolean
  className?: string
}

function getVolatilityLevel(score: number): {
  level: 'low' | 'moderate' | 'high' | 'extreme'
  color: string
  bgColor: string
  description: string
} {
  if (score <= 25) {
    return {
      level: 'low',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Very stable performance',
    }
  }
  if (score <= 50) {
    return {
      level: 'moderate',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'Normal market conditions',
    }
  }
  if (score <= 75) {
    return {
      level: 'high',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      description: 'Elevated volatility',
    }
  }
  return {
    level: 'extreme',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
    description: 'High risk, unstable',
  }
}

function getTrendIcon(trend: RiskProfile['volatility']['trend']) {
  switch (trend) {
    case 'increasing':
      return <TrendingUp className="h-4 w-4 text-red-500" />
    case 'decreasing':
      return <TrendingDown className="h-4 w-4 text-green-500" />
    case 'stable':
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

export function VolatilityIndicator({
  volatility,
  compact = false,
  showTrend = true,
  showChart = true,
  className,
}: VolatilityIndicatorProps) {
  const { level, color, bgColor, description } = getVolatilityLevel(volatility.score)

  // Prepare chart data from rolling values
  const chartData = volatility.rollingValues.map((value, index) => ({
    day: index + 1,
    value,
  }))

  const avgValue =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
      : 0

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
              bgColor,
              color,
              className
            )}
          >
            {level === 'extreme' && <AlertTriangle className="h-3 w-3" />}
            <span className="capitalize">{level}</span>
            {showTrend && getTrendIcon(volatility.trend)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-left">
            <p className="font-medium">Volatility Score: {volatility.score.toFixed(1)}/100</p>
            <p className="text-xs opacity-80">{description}</p>
            <p className="text-xs opacity-80">
              Percentile: {volatility.percentile.toFixed(0)}th
            </p>
            <p className="text-xs opacity-80">
              Trend: {volatility.trend}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Volatility</span>
          {level === 'extreme' && <AlertTriangle className="h-4 w-4 text-red-500" />}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', color)}>{volatility.score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/100</span>
          {showTrend && getTrendIcon(volatility.trend)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            volatility.score <= 25
              ? 'bg-green-500'
              : volatility.score <= 50
                ? 'bg-blue-500'
                : volatility.score <= 75
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
          )}
          style={{ width: `${Math.min(volatility.score, 100)}%` }}
        />
        {/* Percentile marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/50"
          style={{ left: `${volatility.percentile}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span className={cn('font-medium capitalize', color)}>{level}</span>
        <span>High</span>
      </div>

      {/* Mini chart */}
      {showChart && chartData.length > 0 && (
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['auto', 'auto']} hide />
              <ReferenceLine y={avgValue} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  level === 'low'
                    ? '#10b981'
                    : level === 'moderate'
                      ? '#3b82f6'
                      : level === 'high'
                        ? '#f59e0b'
                        : '#ef4444'
                }
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

interface VolatilityComparisonProps {
  current: number
  networkAvg: number
  percentile: number
  className?: string
}

export function VolatilityComparison({
  current,
  networkAvg,
  percentile,
  className,
}: VolatilityComparisonProps) {
  const diff = ((current - networkAvg) / networkAvg) * 100
  const isLower = diff < 0

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">vs Network</span>
          <span
            className={cn(
              'font-medium',
              isLower ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isLower ? '' : '+'}
            {diff.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted relative">
          {/* Network average marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-muted-foreground/50 rounded-full"
            style={{ left: '50%' }}
          />
          {/* Current position */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full',
              isLower ? 'bg-green-500' : 'bg-red-500'
            )}
            style={{
              left: `${Math.max(0, Math.min(100, 50 + diff))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {percentile.toFixed(0)}th %ile
      </span>
    </div>
  )
}
