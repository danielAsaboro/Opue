'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatBadgeGroup } from '@/components/ui/stat-badge'
import { Info, TrendingUp, TrendingDown, Target } from 'lucide-react'
import type { RegressionInsight, TrendForecast, StatisticalBadge } from '@/types/quant'
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Area,
  Legend,
} from 'recharts'

interface RegressionChartProps {
  insight: RegressionInsight
  dataPoints?: Array<{ x: number; y: number; label?: string }>
  className?: string
}

function formatMetricName(metric: string): string {
  return metric
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace('_', ' ')
}

export function RegressionChart({ insight, dataPoints = [], className }: RegressionChartProps) {
  const rSquaredInterpretation = useMemo(() => {
    if (insight.rSquared >= 0.7) return { label: 'Strong fit', color: 'text-green-600' }
    if (insight.rSquared >= 0.4) return { label: 'Moderate fit', color: 'text-blue-600' }
    if (insight.rSquared >= 0.2) return { label: 'Weak fit', color: 'text-yellow-600' }
    return { label: 'Poor fit', color: 'text-red-600' }
  }, [insight.rSquared])

  // Create regression line data
  const regressionLineData = useMemo(() => {
    if (dataPoints.length === 0) {
      // Use predictions from insight, mapping to consistent format
      return insight.predictions.map(p => ({
        x: p.x,
        y: p.y,
        lower: p.lower,
        upper: p.upper,
      }))
    }

    const xValues = dataPoints.map(p => p.x)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const step = (maxX - minX) / 50

    const lineData: Array<{ x: number; y: number; lower: number; upper: number }> = []
    for (let x = minX; x <= maxX; x += step) {
      const y = insight.slope * x + insight.intercept
      lineData.push({ x, y, lower: y - y * 0.1, upper: y + y * 0.1 }) // Simplified CI
    }
    return lineData
  }, [dataPoints, insight])

  // Combine scatter and line data for composed chart
  const chartData = useMemo(() => {
    const combined: Array<{ x: number; scatter?: number; line?: number; lower?: number; upper?: number }> = []

    // Add data points
    dataPoints.forEach(p => {
      combined.push({ x: p.x, scatter: p.y })
    })

    // Add regression line points
    regressionLineData.forEach(p => {
      const existing = combined.find(c => Math.abs(c.x - p.x) < 0.001)
      if (existing) {
        existing.line = p.y
        existing.lower = p.lower
        existing.upper = p.upper
      } else {
        combined.push({ x: p.x, line: p.y, lower: p.lower, upper: p.upper })
      }
    })

    return combined.sort((a, b) => a.x - b.x)
  }, [dataPoints, regressionLineData])

  const badges: StatisticalBadge[] = [
    {
      metric: 'R²',
      value: insight.rSquared,
      pValue: insight.pValue,
      significance: insight.rSquared >= 0.7 ? 'strong' : insight.rSquared >= 0.4 ? 'moderate' : 'weak',
      stars: insight.significant ? (insight.rSquared >= 0.7 ? 3 : insight.rSquared >= 0.4 ? 2 : 1) : 0,
      confidence: insight.confidenceLevel / 100,
      tooltip: `${(insight.rSquared * 100).toFixed(1)}% of variance explained`,
    },
    {
      metric: 'Slope',
      value: insight.slope,
      significance: Math.abs(insight.slope) > 1 ? 'strong' : Math.abs(insight.slope) > 0.5 ? 'moderate' : 'weak',
      stars: 0,
      confidence: insight.confidenceLevel / 100,
      tooltip: `For each unit increase in ${formatMetricName(insight.independent)}, ${formatMetricName(insight.dependent)} changes by ${insight.slope.toFixed(3)}`,
    },
  ]

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Regression Analysis
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Shows how {formatMetricName(insight.independent)} predicts {formatMetricName(insight.dependent)}.</p>
                  <p className="text-xs mt-1 opacity-80">The shaded area shows the confidence interval.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="mt-1">
              {formatMetricName(insight.independent)} → {formatMetricName(insight.dependent)}
            </CardDescription>
          </div>
          <Badge variant={insight.significant ? 'default' : 'outline'}>
            {insight.significant ? 'Significant' : 'Not Significant'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Equation Display */}
        <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm text-center">
          {insight.equation}
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['auto', 'auto']}
                className="text-xs"
                label={{ value: formatMetricName(insight.independent), position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="number"
                domain={['auto', 'auto']}
                className="text-xs"
                label={{ value: formatMetricName(insight.dependent), angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : String(value),
                  name === 'scatter' ? 'Actual' : name === 'line' ? 'Predicted' : name,
                ]}
              />
              <Legend />

              {/* Confidence interval area */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.1}
                name="Upper CI"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name="Lower CI"
              />

              {/* Regression line */}
              <Line
                type="monotone"
                dataKey="line"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Predicted"
              />

              {/* Data points */}
              <Scatter
                dataKey="scatter"
                fill="#8b5cf6"
                name="Actual"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Model Statistics</h4>
          <StatBadgeGroup badges={badges} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">R² (Fit)</div>
              <div className={cn('font-medium', rSquaredInterpretation.color)}>
                {(insight.rSquared * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">{rSquaredInterpretation.label}</div>
            </div>

            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">P-Value</div>
              <div className={cn('font-medium', insight.pValue < 0.05 ? 'text-green-600' : 'text-muted-foreground')}>
                {insight.pValue < 0.001 ? '<0.001' : insight.pValue.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.pValue < 0.05 ? 'Significant' : 'Not significant'}
              </div>
            </div>

            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Slope</div>
              <div className="font-medium flex items-center gap-1">
                {insight.slope > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {insight.slope.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.slope > 0 ? 'Positive' : 'Negative'} effect
              </div>
            </div>

            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Intercept</div>
              <div className="font-medium">{insight.intercept.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Baseline value</div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 dark:text-blue-200">{insight.interpretation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ForecastChartProps {
  forecast: TrendForecast
  historicalData?: number[]
  className?: string
}

export function ForecastChart({ forecast, historicalData = [], className }: ForecastChartProps) {
  const chartData = useMemo(() => {
    const data: Array<{
      date: string
      actual?: number
      predicted?: number
      lower?: number
      upper?: number
    }> = []

    // Add historical data
    historicalData.forEach((value, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (historicalData.length - index))
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: value,
      })
    })

    // Add forecast predictions
    forecast.predictions.forEach((pred) => {
      data.push({
        date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        predicted: pred.value,
        lower: pred.lower,
        upper: pred.upper,
      })
    })

    return data
  }, [forecast, historicalData])

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {formatMetricName(forecast.metric)} Forecast
            </CardTitle>
            <CardDescription>
              {forecast.confidence.toFixed(0)}% confidence forecast
            </CardDescription>
          </div>
          <Badge
            variant={
              forecast.expectedChange > 5
                ? 'success'
                : forecast.expectedChange < -5
                  ? 'danger'
                  : 'outline'
            }
          >
            {forecast.expectedChange > 0 ? '+' : ''}
            {forecast.expectedChange.toFixed(1)}% expected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Current Value & Trend */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Current Value</div>
            <div className="text-2xl font-bold">{forecast.currentValue.toFixed(2)}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Trend</div>
            <div className="flex items-center gap-2">
              {forecast.trend.direction === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : forecast.trend.direction === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <span className="h-5 w-5 text-muted-foreground">→</span>
              )}
              <span className="font-medium capitalize">{forecast.trend.direction}</span>
              {forecast.trend.significance && (
                <Badge variant="outline" className="text-xs">Significant</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />

              {/* Confidence interval */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.2}
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name="Lower Bound"
              />

              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Actual"
              />

              {/* Prediction line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Forecast Details</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium">Date</div>
            <div className="font-medium">Predicted</div>
            <div className="font-medium">Range</div>
            <div className="font-medium">Confidence</div>
            {forecast.predictions.slice(0, 5).map((pred, i) => (
              <>
                <div key={`date-${i}`} className="text-muted-foreground">
                  {new Date(pred.date).toLocaleDateString()}
                </div>
                <div key={`val-${i}`}>{pred.value.toFixed(2)}</div>
                <div key={`range-${i}`} className="text-muted-foreground">
                  {pred.lower.toFixed(1)} - {pred.upper.toFixed(1)}
                </div>
                <div key={`conf-${i}`}>{(pred.confidence * 100).toFixed(0)}%</div>
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
