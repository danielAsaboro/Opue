'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, AlertTriangle, XCircle, TrendingDown, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  type: 'online' | 'offline' | 'performance_drop' | 'recovered' | 'maintenance'
  timestamp: number
  description: string
  value?: number
}

interface PNodeTimelineProps {
  pnodeId: string
  performanceHistory: { timestamp: number; value: number }[]
  className?: string
}

// Generate events from performance history
function generateEventsFromHistory(history: { timestamp: number; value: number }[]): TimelineEvent[] {
  const events: TimelineEvent[] = []
  let lastStatus: 'good' | 'degraded' | 'critical' = 'good'

  history.forEach((point, index) => {
    const currentStatus = point.value >= 80 ? 'good' : point.value >= 60 ? 'degraded' : 'critical'

    if (index === 0) {
      lastStatus = currentStatus
      return
    }

    // Detect status changes
    if (currentStatus !== lastStatus) {
      if (currentStatus === 'critical') {
        events.push({
          id: `event-${index}`,
          type: 'offline',
          timestamp: point.timestamp,
          description: `Performance dropped to critical (${point.value}%)`,
          value: point.value,
        })
      } else if (currentStatus === 'degraded' && lastStatus === 'good') {
        events.push({
          id: `event-${index}`,
          type: 'performance_drop',
          timestamp: point.timestamp,
          description: `Performance degraded (${point.value}%)`,
          value: point.value,
        })
      } else if (currentStatus === 'good' && lastStatus !== 'good') {
        events.push({
          id: `event-${index}`,
          type: 'recovered',
          timestamp: point.timestamp,
          description: `Performance recovered (${point.value}%)`,
          value: point.value,
        })
      }
      lastStatus = currentStatus
    }
  })

  // Add current status event
  if (history.length > 0) {
    const latest = history[history.length - 1]
    events.unshift({
      id: 'current',
      type: latest.value >= 80 ? 'online' : latest.value >= 60 ? 'performance_drop' : 'offline',
      timestamp: latest.timestamp,
      description: `Current status: ${latest.value}% performance`,
      value: latest.value,
    })
  }

  return events.slice(0, 10) // Limit to 10 most recent events
}

const eventIcons = {
  online: CheckCircle,
  offline: XCircle,
  performance_drop: TrendingDown,
  recovered: CheckCircle,
  maintenance: Activity,
}

const eventColors = {
  online: 'text-green-500 bg-green-500/10 border-green-500/20',
  offline: 'text-red-500 bg-red-500/10 border-red-500/20',
  performance_drop: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  recovered: 'text-green-500 bg-green-500/10 border-green-500/20',
  maintenance: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
}

const eventLabels = {
  online: 'Online',
  offline: 'Critical',
  performance_drop: 'Degraded',
  recovered: 'Recovered',
  maintenance: 'Maintenance',
}

export function PNodeTimeline({ pnodeId, performanceHistory, className }: PNodeTimelineProps) {
  const events = useMemo(() => generateEventsFromHistory(performanceHistory), [performanceHistory])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Calculate uptime for last 7 days
  const last7DaysHistory = performanceHistory.filter(
    (p) => p.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
  )
  const avgPerformance =
    last7DaysHistory.length > 0
      ? last7DaysHistory.reduce((acc, p) => acc + p.value, 0) / last7DaysHistory.length
      : 0

  // Create 7-day visual bar
  const dayBars = useMemo(() => {
    const bars = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = Date.now() - (i + 1) * 24 * 60 * 60 * 1000
      const dayEnd = Date.now() - i * 24 * 60 * 60 * 1000
      const dayData = performanceHistory.filter(
        (p) => p.timestamp >= dayStart && p.timestamp < dayEnd
      )
      const avgValue = dayData.length > 0 ? dayData.reduce((acc, p) => acc + p.value, 0) / dayData.length : 100
      bars.push({
        day: new Date(dayEnd).toLocaleDateString('en-US', { weekday: 'short' }),
        value: avgValue,
        status: avgValue >= 80 ? 'good' : avgValue >= 60 ? 'degraded' : 'critical',
      })
    }
    return bars
  }, [performanceHistory])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Health Timeline
            </CardTitle>
            <CardDescription>7-day performance overview and recent events</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {avgPerformance.toFixed(0)}% avg
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 7-day visual bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Last 7 days</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Good
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Degraded
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Critical
              </span>
            </div>
          </div>
          <TooltipProvider>
            <div className="flex gap-1">
              {dayBars.map((bar, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex-1 h-8 rounded cursor-help transition-opacity hover:opacity-80',
                        bar.status === 'good' && 'bg-green-500',
                        bar.status === 'degraded' && 'bg-amber-500',
                        bar.status === 'critical' && 'bg-red-500'
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{bar.day}</p>
                      <p className="text-muted-foreground">{bar.value.toFixed(1)}% avg</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {dayBars.map((bar, i) => (
                <span key={i} className="text-[10px] text-muted-foreground text-center flex-1">
                  {bar.day}
                </span>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Event timeline */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Events</h4>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No events recorded</p>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => {
                const Icon = eventIcons[event.type]
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      eventColors[event.type]
                    )}
                  >
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {eventLabels[event.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {index === 0 ? 'Now' : formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
