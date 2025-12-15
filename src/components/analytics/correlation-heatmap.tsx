'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatBadge } from '@/components/ui/stat-badge'
import { Button } from '@/components/ui/button'
import { Info, ArrowUpRight, ArrowDownRight, Minus, Eye, EyeOff } from 'lucide-react'
import type { CorrelationMatrixData, CorrelationInsight, CorrelationResult } from '@/types/quant'

interface CorrelationHeatmapProps {
  data: CorrelationMatrixData
  className?: string
}

function getCorrelationColor(coefficient: number): string {
  // Convert correlation (-1 to 1) to color
  const intensity = Math.abs(coefficient)
  if (coefficient > 0) {
    // Positive correlations: blue gradient
    if (intensity > 0.7) return 'bg-blue-600 text-white'
    if (intensity > 0.5) return 'bg-blue-500 text-white'
    if (intensity > 0.3) return 'bg-blue-400 text-white'
    if (intensity > 0.1) return 'bg-blue-200 text-blue-900'
    return 'bg-blue-50 text-blue-900'
  } else {
    // Negative correlations: red gradient
    if (intensity > 0.7) return 'bg-red-600 text-white'
    if (intensity > 0.5) return 'bg-red-500 text-white'
    if (intensity > 0.3) return 'bg-red-400 text-white'
    if (intensity > 0.1) return 'bg-red-200 text-red-900'
    return 'bg-red-50 text-red-900'
  }
}

function getStrengthBadge(strength: CorrelationResult['strength']) {
  switch (strength) {
    case 'strong':
      return <Badge variant="default" className="text-xs">Strong</Badge>
    case 'moderate':
      return <Badge variant="secondary" className="text-xs">Moderate</Badge>
    case 'weak':
      return <Badge variant="outline" className="text-xs">Weak</Badge>
    case 'none':
    default:
      return <Badge variant="outline" className="text-xs opacity-50">None</Badge>
  }
}

function getDirectionIcon(direction: CorrelationResult['direction']) {
  switch (direction) {
    case 'positive':
      return <ArrowUpRight className="h-4 w-4 text-blue-500" />
    case 'negative':
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    case 'none':
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

function formatMetricName(metric: string): string {
  return metric
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace('_', ' ')
}

export function CorrelationHeatmap({ data, className }: CorrelationHeatmapProps) {
  const [showSignificantOnly, setShowSignificantOnly] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    metric1: string
    metric2: string
    result: CorrelationResult
  } | null>(null)

  const { matrix, metrics, significantPairs } = data

  const displayMetrics = useMemo(() => {
    return metrics.map(formatMetricName)
  }, [metrics])

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Correlation Matrix
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Shows relationships between metrics. Blue = positive, Red = negative.</p>
                  <p className="text-xs mt-1 opacity-80">Click cells for details. Stars indicate statistical significance.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              {significantPairs.length} significant correlations found
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSignificantOnly(!showSignificantOnly)}
            className="gap-2"
          >
            {showSignificantOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showSignificantOnly ? 'Show All' : 'Significant Only'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header row */}
            <div className="flex">
              <div className="w-32 flex-shrink-0" /> {/* Empty corner */}
              {metrics.map((metric, i) => (
                <div
                  key={metric}
                  className="w-16 h-24 flex items-end justify-center pb-2 text-xs font-medium text-muted-foreground"
                >
                  <span className="transform -rotate-45 origin-left whitespace-nowrap">
                    {displayMetrics[i]}
                  </span>
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {metrics.map((metric1, i) => (
              <div key={metric1} className="flex">
                {/* Row label */}
                <div className="w-32 flex-shrink-0 flex items-center justify-end pr-2 text-xs font-medium text-muted-foreground">
                  {displayMetrics[i]}
                </div>

                {/* Correlation cells */}
                {metrics.map((metric2, j) => {
                  const result = matrix[metric1]?.[metric2]
                  const isSignificant = result?.significant
                  const coefficient = result?.coefficient ?? 0
                  const isDiagonal = i === j

                  if (showSignificantOnly && !isSignificant && !isDiagonal) {
                    return (
                      <div key={metric2} className="w-16 h-10 flex items-center justify-center">
                        <div className="w-12 h-8 rounded bg-muted/30" />
                      </div>
                    )
                  }

                  return (
                    <Tooltip key={metric2}>
                      <TooltipTrigger asChild>
                        <button
                          className="w-16 h-10 flex items-center justify-center"
                          onClick={() => !isDiagonal && result && setSelectedCell({ metric1, metric2, result })}
                          disabled={isDiagonal}
                        >
                          <div
                            className={cn(
                              'w-12 h-8 rounded flex items-center justify-center text-xs font-medium transition-all',
                              isDiagonal
                                ? 'bg-muted text-muted-foreground'
                                : getCorrelationColor(coefficient),
                              !isDiagonal && 'hover:ring-2 hover:ring-ring cursor-pointer',
                              isSignificant && !isDiagonal && 'ring-1 ring-primary/50'
                            )}
                          >
                            {isDiagonal ? '1.00' : coefficient.toFixed(2)}
                          </div>
                        </button>
                      </TooltipTrigger>
                      {!isDiagonal && result && (
                        <TooltipContent side="right">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {formatMetricName(metric1)} × {formatMetricName(metric2)}
                            </p>
                            <p className="text-xs">
                              r = {coefficient.toFixed(3)}{' '}
                              {isSignificant && <span className="text-green-500">(p {'<'} 0.05)</span>}
                            </p>
                            <p className="text-xs opacity-80">
                              {result.strength} {result.direction} correlation
                            </p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-4 h-3 rounded bg-red-600" />
            <span className="text-muted-foreground">-1</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-4 h-3 rounded bg-red-300" />
            <span className="text-muted-foreground">-0.5</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-4 h-3 rounded bg-muted" />
            <span className="text-muted-foreground">0</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-4 h-3 rounded bg-blue-300" />
            <span className="text-muted-foreground">0.5</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-4 h-3 rounded bg-blue-600" />
            <span className="text-muted-foreground">1</span>
          </div>
        </div>

        {/* Selected Cell Details */}
        {selectedCell && (
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {formatMetricName(selectedCell.metric1)} × {formatMetricName(selectedCell.metric2)}
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                ×
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Correlation</span>
                <div className="flex items-center gap-2 mt-1">
                  <StatBadge
                    metric="r"
                    value={selectedCell.result.coefficient}
                    significance={
                      selectedCell.result.strength === 'strong'
                        ? 'strong'
                        : selectedCell.result.strength === 'moderate'
                          ? 'moderate'
                          : selectedCell.result.strength === 'weak'
                            ? 'weak'
                            : 'none'
                    }
                    pValue={selectedCell.result.pValue}
                  />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Strength</span>
                <div className="mt-1">{getStrengthBadge(selectedCell.result.strength)}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Direction</span>
                <div className="flex items-center gap-1 mt-1">
                  {getDirectionIcon(selectedCell.result.direction)}
                  <span className="capitalize">{selectedCell.result.direction}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Sample Size</span>
                <div className="mt-1 font-medium">{selectedCell.result.sampleSize}</div>
              </div>
            </div>

            {selectedCell.result.significant && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="font-medium">★</span>
                Statistically significant (p {'<'} 0.05)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CorrelationInsightListProps {
  insights: CorrelationInsight[]
  title?: string
  showRecommendations?: boolean
  className?: string
}

export function CorrelationInsightList({
  insights,
  title = 'Key Correlations',
  showRecommendations = true,
  className,
}: CorrelationInsightListProps) {
  if (insights.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        No significant correlations found
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-medium text-sm">{title}</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {getDirectionIcon(insight.direction)}
                <div>
                  <p className="font-medium text-sm">
                    {formatMetricName(insight.metric1)} × {formatMetricName(insight.metric2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.interpretation}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <StatBadge
                  metric="r"
                  value={insight.correlation}
                  pValue={insight.pValue}
                  significance={
                    insight.strength === 'strong'
                      ? 'strong'
                      : insight.strength === 'moderate'
                        ? 'moderate'
                        : 'weak'
                  }
                  stars={insight.significant ? (Math.abs(insight.correlation) > 0.7 ? 3 : Math.abs(insight.correlation) > 0.5 ? 2 : 1) : 0}
                />
              </div>
            </div>

            {showRecommendations && insight.recommendation && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 {insight.recommendation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface TopCorrelationsProps {
  positive: CorrelationInsight[]
  negative: CorrelationInsight[]
  className?: string
}

export function TopCorrelations({ positive, negative, className }: TopCorrelationsProps) {
  return (
    <div className={cn('grid md:grid-cols-2 gap-6', className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
            Top Positive Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CorrelationInsightList insights={positive.slice(0, 5)} showRecommendations={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            Top Negative Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CorrelationInsightList insights={negative.slice(0, 5)} showRecommendations={false} />
        </CardContent>
      </Card>
    </div>
  )
}
