'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { VolatilityIndicator } from './volatility-indicator'
import { StatBadge } from '@/components/ui/stat-badge'
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Target,
  Info,
} from 'lucide-react'
import type { RiskProfile } from '@/types/quant'

interface RiskProfileCardProps {
  profile: RiskProfile
  className?: string
}

function getRiskLevelConfig(level: RiskProfile['overallRiskLevel']) {
  switch (level) {
    case 'low':
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        icon: Shield,
        label: 'Low Risk',
        description: 'This pNode demonstrates stable, predictable performance',
      }
    case 'medium':
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Activity,
        label: 'Medium Risk',
        description: 'Moderate volatility within acceptable parameters',
      }
    case 'high':
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: AlertTriangle,
        label: 'High Risk',
        description: 'Elevated volatility - monitor closely',
      }
    case 'very_high':
      return {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertTriangle,
        label: 'Very High Risk',
        description: 'Significant instability detected',
      }
  }
}

function getReliabilityConfig(reliability: RiskProfile['consistency']['reliability']) {
  switch (reliability) {
    case 'very_high':
      return { color: 'text-green-600', label: 'Very High' }
    case 'high':
      return { color: 'text-blue-600', label: 'High' }
    case 'medium':
      return { color: 'text-yellow-600', label: 'Medium' }
    case 'low':
      return { color: 'text-red-600', label: 'Low' }
  }
}

function getSharpeInterpretation(interpretation: string) {
  switch (interpretation) {
    case 'excellent':
      return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' }
    case 'good':
      return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' }
    case 'average':
      return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' }
    case 'below_average':
    case 'poor':
      return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' }
    default:
      return { color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

export function RiskProfileCard({ profile, className }: RiskProfileCardProps) {
  const riskConfig = getRiskLevelConfig(profile.overallRiskLevel)
  const reliabilityConfig = getReliabilityConfig(profile.consistency.reliability)
  const sharpeConfig = getSharpeInterpretation(profile.riskAdjustedPerformance.interpretation)
  const RiskIcon = riskConfig.icon

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className={cn('pb-3', riskConfig.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon className={cn('h-5 w-5', riskConfig.color)} />
            <div>
              <CardTitle className="text-lg">{riskConfig.label}</CardTitle>
              <CardDescription className="text-xs">{riskConfig.description}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', riskConfig.color)}>
              {profile.riskScore.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Volatility Section */}
        <div>
          <VolatilityIndicator volatility={profile.volatility} showChart />
        </div>

        {/* Consistency Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Consistency</span>
            <div className="flex items-center gap-2">
              <span className={cn('font-bold', reliabilityConfig.color)}>
                {profile.consistency.score.toFixed(0)}/100
              </span>
              <Badge variant="outline" className="text-xs">
                {reliabilityConfig.label}
              </Badge>
            </div>
          </div>
          <Progress value={profile.consistency.score} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{profile.consistency.streakDays} day streak</span>
            <span>{profile.consistency.reliability} reliability</span>
          </div>
        </div>

        {/* Sharpe Ratio Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">Sharpe Ratio</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Risk-adjusted performance measure. Higher is better.</p>
                  <p className="text-xs mt-1 opacity-80">
                    {'>'}2: Excellent, 1-2: Good, 0-1: Acceptable, {'<'}0: Poor
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <StatBadge
              metric=""
              value={profile.riskAdjustedPerformance.sharpeRatio}
              significance={
                profile.riskAdjustedPerformance.interpretation === 'excellent'
                  ? 'strong'
                  : profile.riskAdjustedPerformance.interpretation === 'good'
                    ? 'moderate'
                    : profile.riskAdjustedPerformance.interpretation === 'average'
                      ? 'weak'
                      : 'none'
              }
              tooltip={`Ranked #${profile.riskAdjustedPerformance.networkRank} in network`}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('px-1.5 py-0.5 rounded capitalize', sharpeConfig.bg, sharpeConfig.color)}>
              {profile.riskAdjustedPerformance.interpretation}
            </span>
            <span>|</span>
            <span>Top {profile.riskAdjustedPerformance.percentile.toFixed(0)}%</span>
          </div>
        </div>

        {/* Drawdown Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-muted-foreground">Drawdown Analysis</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Measures performance drops from peak levels.</p>
                  <p className="text-xs mt-1 opacity-80">Lower drawdown indicates more stable performance.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingDown className="h-3 w-3" />
                Max Drawdown
              </div>
              <div className={cn(
                'text-sm font-bold',
                profile.drawdown.maxDrawdown > 30 ? 'text-red-600' :
                profile.drawdown.maxDrawdown > 15 ? 'text-yellow-600' : 'text-green-600'
              )}>
                -{profile.drawdown.maxDrawdown.toFixed(1)}%
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Activity className="h-3 w-3" />
                Current
              </div>
              <div className={cn(
                'text-sm font-bold',
                profile.drawdown.currentDrawdown > 20 ? 'text-red-600' :
                profile.drawdown.currentDrawdown > 10 ? 'text-yellow-600' : 'text-green-600'
              )}>
                -{profile.drawdown.currentDrawdown.toFixed(1)}%
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Target className="h-3 w-3" />
                Recovery Factor
              </div>
              <div className="text-sm font-bold">
                {profile.drawdown.recoveryFactor.toFixed(2)}x
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                Days in DD
              </div>
              <div className="text-sm font-bold">
                {profile.drawdown.daysInDrawdown}
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right pt-2 border-t">
          Last updated: {new Date(profile.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

interface RiskProfileCompactProps {
  profile: RiskProfile
  className?: string
}

export function RiskProfileCompact({ profile, className }: RiskProfileCompactProps) {
  const riskConfig = getRiskLevelConfig(profile.overallRiskLevel)
  const RiskIcon = riskConfig.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
            riskConfig.bg,
            riskConfig.border,
            className
          )}
        >
          <RiskIcon className={cn('h-4 w-4', riskConfig.color)} />
          <span className={cn('text-sm font-medium', riskConfig.color)}>
            {profile.riskScore.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">Risk</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="w-64">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{riskConfig.label}</span>
            <span className={cn('font-bold', riskConfig.color)}>{profile.riskScore.toFixed(0)}/100</span>
          </div>
          <p className="text-xs opacity-80">{riskConfig.description}</p>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="opacity-70">Volatility:</span>
              <span>{profile.volatility.score.toFixed(0)}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Sharpe Ratio:</span>
              <span>{profile.riskAdjustedPerformance.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Max Drawdown:</span>
              <span>-{profile.drawdown.maxDrawdown.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
