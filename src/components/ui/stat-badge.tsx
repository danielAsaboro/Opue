'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Star } from 'lucide-react'
import type { StatisticalBadge } from '@/types/quant'

interface StatBadgeProps {
  metric: string
  value: number
  pValue?: number
  confidence?: number
  significance?: StatisticalBadge['significance']
  stars?: StatisticalBadge['stars']
  tooltip?: string
  formatter?: (value: number) => string
  showStars?: boolean
  showPValue?: boolean
  className?: string
}

function getSignificanceColor(significance: StatisticalBadge['significance']) {
  switch (significance) {
    case 'strong':
      return 'text-green-600 dark:text-green-400'
    case 'moderate':
      return 'text-blue-600 dark:text-blue-400'
    case 'weak':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'none':
    default:
      return 'text-muted-foreground'
  }
}

function getSignificanceBg(significance: StatisticalBadge['significance']) {
  switch (significance) {
    case 'strong':
      return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
    case 'moderate':
      return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    case 'weak':
      return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
    case 'none':
    default:
      return 'bg-muted border-border'
  }
}

function formatPValue(pValue: number): string {
  if (pValue < 0.001) return 'p < 0.001'
  if (pValue < 0.01) return `p < 0.01`
  if (pValue < 0.05) return `p < 0.05`
  return `p = ${pValue.toFixed(3)}`
}

export function StatBadge({
  metric,
  value,
  pValue,
  confidence,
  significance = 'none',
  stars = 0,
  tooltip,
  formatter = (v) => v.toFixed(2),
  showStars = true,
  showPValue = true,
  className,
}: StatBadgeProps) {
  const formattedValue = formatter(value)

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-medium transition-colors',
        getSignificanceBg(significance),
        className
      )}
    >
      <span className="text-xs text-muted-foreground">{metric}</span>
      <span className={cn('font-semibold', getSignificanceColor(significance))}>
        {formattedValue}
      </span>
      {showStars && stars > 0 && (
        <span className="flex items-center gap-px ml-0.5">
          {[...Array(stars)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3 fill-current',
                significance === 'strong'
                  ? 'text-green-500'
                  : significance === 'moderate'
                    ? 'text-blue-500'
                    : 'text-yellow-500'
              )}
            />
          ))}
        </span>
      )}
    </span>
  )

  if (tooltip || pValue !== undefined || confidence !== undefined) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1 text-left">
            {tooltip && <p>{tooltip}</p>}
            {showPValue && pValue !== undefined && (
              <p className="text-xs opacity-80">
                {formatPValue(pValue)}
                {pValue < 0.05 ? ' (statistically significant)' : ' (not significant)'}
              </p>
            )}
            {confidence !== undefined && (
              <p className="text-xs opacity-80">
                Confidence: {(confidence * 100).toFixed(1)}%
              </p>
            )}
            {stars > 0 && (
              <p className="text-xs opacity-80">
                {stars === 3
                  ? 'Very strong evidence'
                  : stars === 2
                    ? 'Strong evidence'
                    : 'Some evidence'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return badge
}

interface StatBadgeGroupProps {
  badges: StatisticalBadge[]
  className?: string
}

export function StatBadgeGroup({ badges, className }: StatBadgeGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map((badge, index) => (
        <StatBadge
          key={index}
          metric={badge.metric}
          value={badge.value}
          pValue={badge.pValue}
          significance={badge.significance}
          stars={badge.stars}
          confidence={badge.confidence}
          tooltip={badge.tooltip}
        />
      ))}
    </div>
  )
}
