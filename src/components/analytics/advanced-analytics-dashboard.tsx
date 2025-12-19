'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Brain, Target, Zap, Shield } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import type { PNode } from '@/types/pnode'
import type {
  AnomalyDetection,
  PredictiveInsight,
  NetworkHealthScore,
  AnalyticsMetrics,
} from '@/services/analytics.service'
import { getAnalyticsService } from '@/services/analytics.service'

interface AdvancedAnalyticsDashboardProps {
  pnodes: PNode[]
  className?: string
}

export function AdvancedAnalyticsDashboard({ pnodes, className = '' }: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState<{
    anomalies: AnomalyDetection[]
    predictions: PredictiveInsight[]
    healthScore: NetworkHealthScore
    metrics: AnalyticsMetrics
  } | null>(null)

  const analyticsService = getAnalyticsService()

  useEffect(() => {
    async function loadAnalytics() {
      if (pnodes.length > 0) {
        const anomalies = analyticsService.detectAnomalies(pnodes)
        const predictions = analyticsService.generatePredictions(pnodes)
        const healthScore = analyticsService.calculateNetworkHealth(pnodes)
        const metrics = await analyticsService.getAnalyticsMetrics(pnodes)

        setAnalytics({ anomalies, predictions, healthScore, metrics })
      }
    }
    loadAnalytics()
  }, [pnodes, analyticsService])

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Analyzing Network Data</h3>
            <p className="text-sm text-muted-foreground">Generating advanced insights...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { anomalies, predictions, healthScore, metrics } = analytics

  // Prepare chart data
  const growthData = metrics.networkGrowth.timestamps.map((timestamp, i) => ({
    date: timestamp.toLocaleDateString(),
    pnodes: metrics.networkGrowth.pnodeCount[i],
    storage: metrics.networkGrowth.storageCapacity[i] / 1024 ** 4, // TB
    performance: metrics.networkGrowth.performance[i],
  }))

  const healthComponents = [
    { name: 'Decentralization', value: healthScore.components.decentralization, color: '#3b82f6' },
    { name: 'Performance', value: healthScore.components.performance, color: '#10b981' },
    { name: 'Reliability', value: healthScore.components.reliability, color: '#f59e0b' },
    { name: 'Growth', value: healthScore.components.growth, color: '#8b5cf6' },
    { name: 'Stability', value: healthScore.components.stability, color: '#ef4444' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">AI-powered insights and predictive analytics for network optimization</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          Live Analysis
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies ({anomalies.length})</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="health">Health Score</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Network Health Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{healthScore.overall}/100</p>
                    <p className="text-sm text-muted-foreground">Network Health</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={healthScore.overall} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{anomalies.length}</p>
                    <p className="text-sm text-muted-foreground">Active Anomalies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{predictions.length}</p>
                    <p className="text-sm text-muted-foreground">Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(metrics.decentralization.geographicSpread * 100)}%</p>
                    <p className="text-sm text-muted-foreground">Decentralized</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Network Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="pnodes"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Anomalies & Predictions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Anomalies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 ${
                        anomaly.severity === 'critical'
                          ? 'text-red-500'
                          : anomaly.severity === 'high'
                            ? 'text-orange-500'
                            : 'text-yellow-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {anomaly.affectedPNodes.length} pNode{anomaly.affectedPNodes.length !== 1 ? 's' : ''} affected
                      </p>
                    </div>
                  </div>
                ))}
                {anomalies.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Predictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Target className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{prediction.title}</p>
                      <p className="text-xs text-muted-foreground">{prediction.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="grid gap-4">
            {anomalies.map((anomaly, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        anomaly.severity === 'critical'
                          ? 'bg-red-100 dark:bg-red-900'
                          : anomaly.severity === 'high'
                            ? 'bg-orange-100 dark:bg-orange-900'
                            : anomaly.severity === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900'
                              : 'bg-blue-100 dark:bg-blue-900'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          anomaly.severity === 'critical'
                            ? 'text-red-600'
                            : anomaly.severity === 'high'
                              ? 'text-orange-600'
                              : anomaly.severity === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            anomaly.severity === 'critical'
                              ? 'danger'
                              : anomaly.severity === 'high'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{anomaly.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(anomaly.confidence * 100)}% confidence
                        </span>
                      </div>

                      <h4 className="font-medium mb-1">{anomaly.description}</h4>

                      {anomaly.affectedPNodes.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Affected pNodes: {anomaly.affectedPNodes.slice(0, 3).join(', ')}
                          {anomaly.affectedPNodes.length > 3 && ` +${anomaly.affectedPNodes.length - 3} more`}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      {anomaly.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {anomalies.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-medium mb-2">Network Operating Normally</h3>
                  <p className="text-sm text-muted-foreground">No anomalies detected in current network state</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        prediction.impact === 'high'
                          ? 'bg-red-100 dark:bg-red-900'
                          : prediction.impact === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                      }`}
                    >
                      {prediction.type === 'forecast' ? (
                        <TrendingUp
                          className={`h-5 w-5 ${
                            prediction.impact === 'high'
                              ? 'text-red-600'
                              : prediction.impact === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                          }`}
                        />
                      ) : prediction.type === 'trend' ? (
                        <Activity
                          className={`h-5 w-5 ${
                            prediction.impact === 'high'
                              ? 'text-red-600'
                              : prediction.impact === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                          }`}
                        />
                      ) : (
                        <Target
                          className={`h-5 w-5 ${
                            prediction.impact === 'high'
                              ? 'text-red-600'
                              : prediction.impact === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {prediction.type}
                        </Badge>
                        <Badge
                          variant={
                            prediction.impact === 'high'
                              ? 'danger'
                              : prediction.impact === 'medium'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {prediction.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </div>

                      <h4 className="font-medium mb-1">{prediction.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{prediction.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Timeframe: {prediction.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Network Health Score: {healthScore.overall}/100
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={healthScore.overall} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    {healthScore.trends.direction === 'improving' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : healthScore.trends.direction === 'declining' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-sm">
                      {healthScore.trends.direction} ({healthScore.trends.rate > 0 ? '+' : ''}
                      {healthScore.trends.rate}%)
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {healthComponents.map((component) => (
                    <div key={component.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{component.name}</span>
                        <span className="font-medium">{Math.round(component.value)}/100</span>
                      </div>
                      <Progress value={component.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Components Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Health Components Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={healthComponents}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  {healthComponents.map((component) => (
                    <Bar key={component.name} dataKey="value" fill={component.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {healthScore.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {healthScore.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Target className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}






