'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Clock, Bell, Settings } from 'lucide-react'
import type { Alert, AlertStats } from '@/types/alerts'
import { getAlertService } from '@/services/alert.service'
import { formatDistanceToNow } from 'date-fns'

interface AlertDashboardProps {
  compact?: boolean
  className?: string
}

export function AlertDashboard({ compact = false, className = '' }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const alertService = getAlertService()

  useEffect(() => {
    // Initial load
    const doUpdate = () => {
      setAlerts(alertService.getAlerts())
      setStats(alertService.getAlertStats())
    }
    doUpdate()

    // Set up real-time updates
    const handleNewAlert = () => {
      doUpdate()
    }

    alertService.addAlertListener(handleNewAlert)

    return () => {
      alertService.removeAlertListener(handleNewAlert)
    }
  }, [alertService])

  const updateAlerts = () => {
    setAlerts(alertService.getAlerts())
    setStats(alertService.getAlertStats())
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Clock className="h-4 w-4" />
      case 'low':
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.resolved)
  const resolvedAlerts = alerts.filter((alert) => alert.resolved)

  const handleAcknowledge = (alertId: string) => {
    alertService.acknowledgeAlert(alertId)
    updateAlerts()
  }

  const handleResolve = (alertId: string) => {
    alertService.resolveAlert(alertId)
    updateAlerts()
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts
            </CardTitle>
            {stats && stats.active > 0 && (
              <Badge variant="danger" className="text-xs">
                {stats.active}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`p-1 rounded ${getSeverityColor(alert.severity)}`}>{getSeverityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alert Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats?.critical || 0}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats?.active || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats?.acknowledged || 0}</p>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Management
            </CardTitle>
            <Button variant="outline" size="sm">
              Configure Rules
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'history')}>
            <TabsList>
              <TabsTrigger value="active" className="flex items-center gap-2">
                Active Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="danger" className="text-xs ml-1">
                    {activeAlerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Alert History</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'history')}>
            <TabsContent value="active" className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">All Clear</h3>
                  <p className="text-sm">No active alerts at this time</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                            {alert.pnodeId && <span>pNode: {alert.pnodeId.slice(0, 8)}...</span>}
                            <Badge variant="outline" className="text-xs">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!alert.acknowledged && (
                            <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                              Acknowledge
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No alert history yet</p>
                </div>
              ) : (
                resolvedAlerts.slice(0, 20).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border opacity-75">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Resolved {formatDistanceToNow(alert.resolvedAt || alert.timestamp, { addSuffix: true })}
                        </span>
                        {alert.pnodeId && <span>pNode: {alert.pnodeId.slice(0, 8)}...</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}






