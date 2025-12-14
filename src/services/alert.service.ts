import type { Alert, AlertRule, AlertStats, AlertType, AlertSeverity } from '@/types/alerts'
import { DEFAULT_ALERT_RULES } from '@/types/alerts'
import type { PNode } from '@/types/pnode'
import { getWebSocketService } from './websocket.service'

export class AlertService {
  private rules: Map<string, AlertRule> = new Map()
  private alerts: Alert[] = []
  private alertListeners: ((alert: Alert) => void)[] = []
  private wsService = getWebSocketService()

  constructor() {
    this.initializeDefaultRules()
    this.setupWebSocketListeners()
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    DEFAULT_ALERT_RULES.forEach((ruleData, index) => {
      const rule: AlertRule = {
        ...ruleData,
        id: `default-${index}`,
      }
      this.rules.set(rule.id, rule)
    })
  }

  /**
   * Set up WebSocket listeners for real-time alert detection
   */
  private setupWebSocketListeners(): void {
    this.wsService.addEventListener('pnode_update', (event) => {
      if (event.data.pnodes) {
        this.checkAlerts(event.data.pnodes)
      }
    })
  }

  /**
   * Check all active rules against current pNode data
   */
  async checkAlerts(pnodes: PNode[]): Promise<void> {
    const networkStats = this.calculateNetworkStats(pnodes)

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      try {
        const triggeredAlerts = this.evaluateRule(rule, pnodes, networkStats)
        for (const alert of triggeredAlerts) {
          await this.createAlert(alert)
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error)
      }
    }
  }

  /**
   * Evaluate a single rule against current data
   */
  private evaluateRule(rule: AlertRule, pnodes: PNode[], networkStats: any): Partial<Alert>[] {
    const alerts: Partial<Alert>[] = []

    switch (rule.type) {
      case 'pnode_offline':
        pnodes
          .filter((pnode) => this.checkConditions(rule.conditions, pnode))
          .forEach((pnode) => {
            alerts.push({
              ruleId: rule.id,
              type: rule.type,
              severity: rule.severity,
              title: `pNode Offline: ${pnode.id.slice(0, 8)}...`,
              message: `${pnode.location || 'Unknown location'} pNode has gone offline`,
              pnodeId: pnode.id,
              metadata: { pnode, previousStatus: 'online' },
            })
          })
        break

      case 'pnode_performance_drop':
        pnodes
          .filter((pnode) => this.checkConditions(rule.conditions, pnode))
          .forEach((pnode) => {
            alerts.push({
              ruleId: rule.id,
              type: rule.type,
              severity: rule.severity,
              title: `Performance Drop: ${pnode.id.slice(0, 8)}...`,
              message: `Performance score dropped to ${pnode.performanceScore}/100`,
              pnodeId: pnode.id,
              metadata: { pnode, score: pnode.performanceScore },
            })
          })
        break

      case 'pnode_storage_full':
        pnodes
          .filter((pnode) => this.checkConditions(rule.conditions, pnode))
          .forEach((pnode) => {
            alerts.push({
              ruleId: rule.id,
              type: rule.type,
              severity: rule.severity,
              title: `Storage Full: ${pnode.id.slice(0, 8)}...`,
              message: `Storage utilization at ${(pnode.storage.utilization * 100).toFixed(1)}%`,
              pnodeId: pnode.id,
              metadata: { pnode, utilization: pnode.storage.utilization },
            })
          })
        break

      case 'network_decentralization':
        if (this.checkNetworkConditions(rule.conditions, networkStats)) {
          alerts.push({
            ruleId: rule.id,
            type: rule.type,
            severity: rule.severity,
            title: 'Network Decentralization Risk',
            message: `Decentralization score dropped to ${(networkStats.decentralization * 100).toFixed(1)}%`,
            metadata: { networkStats, score: networkStats.decentralization },
          })
        }
        break

      case 'new_pnode_joined':
        pnodes
          .filter((pnode) => this.checkConditions(rule.conditions, pnode))
          .forEach((pnode) => {
            alerts.push({
              ruleId: rule.id,
              type: rule.type,
              severity: rule.severity,
              title: `New pNode Joined: ${pnode.id.slice(0, 8)}...`,
              message: `New storage provider joined from ${pnode.location || 'unknown location'}`,
              pnodeId: pnode.id,
              metadata: { pnode, isNew: true },
            })
          })
        break

      case 'pnode_version_outdated':
        // This would require version comparison logic
        pnodes
          .filter((pnode) => this.checkConditions(rule.conditions, { ...pnode, versionOutdated: false })) // Placeholder
          .forEach((pnode) => {
            alerts.push({
              ruleId: rule.id,
              type: rule.type,
              severity: rule.severity,
              title: `Outdated Version: ${pnode.id.slice(0, 8)}...`,
              message: `Running ${pnode.version} - update recommended`,
              pnodeId: pnode.id,
              metadata: { pnode, version: pnode.version },
            })
          })
        break
    }

    return alerts
  }

  /**
   * Check if conditions are met for a pNode
   */
  private checkConditions(conditions: any[], data: any): boolean {
    return conditions.every((condition) => {
      const value = this.getNestedValue(data, condition.field)
      return this.evaluateCondition(value, condition.operator, condition.value)
    })
  }

  /**
   * Check network-level conditions
   */
  private checkNetworkConditions(conditions: any[], networkStats: any): boolean {
    return conditions.every((condition) => {
      const value = networkStats[condition.field]
      return this.evaluateCondition(value, condition.operator, condition.value)
    })
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'gt':
        return actualValue > expectedValue
      case 'lt':
        return actualValue < expectedValue
      case 'eq':
        return actualValue === expectedValue
      case 'ne':
        return actualValue !== expectedValue
      case 'contains':
        return String(actualValue).includes(String(expectedValue))
      case 'not_contains':
        return !String(actualValue).includes(String(expectedValue))
      default:
        return false
    }
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Calculate network-level statistics
   */
  private calculateNetworkStats(pnodes: PNode[]): any {
    const totalStorage = pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0)
    const locations = new Set(pnodes.map((p) => p.location).filter(Boolean))

    // Simple decentralization score based on location distribution
    const decentralization = locations.size / Math.max(pnodes.length * 0.5, 1)

    return {
      totalPNodes: pnodes.length,
      totalStorage,
      decentralization: Math.min(decentralization, 1),
      avgPerformance: pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length || 0,
    }
  }

  /**
   * Create and store a new alert
   */
  private async createAlert(alertData: Partial<Alert>): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
    } as Alert

    // Check cooldown period
    const rule = this.rules.get(alert.ruleId)
    if (rule?.lastTriggered) {
      const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime()
      const cooldownMs = (rule.cooldownMinutes || 0) * 60 * 1000
      if (timeSinceLastTrigger < cooldownMs) {
        return // Skip due to cooldown
      }
    }

    // Update rule's last triggered time
    if (rule) {
      rule.lastTriggered = new Date()
      this.rules.set(rule.id, rule)
    }

    this.alerts.unshift(alert) // Add to beginning for chronological order

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000)
    }

    // Notify listeners
    this.alertListeners.forEach((listener) => {
      try {
        listener(alert)
      } catch (error) {
        console.error('Error in alert listener:', error)
      }
    })

    // Send notifications
    await this.sendNotifications(alert)

    console.log('Alert created:', alert.title)
  }

  /**
   * Send notifications based on alert rule
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    const rule = this.rules.get(alert.ruleId)
    if (!rule) return

    for (const method of rule.notificationMethods) {
      try {
        switch (method) {
          case 'browser':
            this.sendBrowserNotification(alert)
            break
          case 'email':
            // Email implementation would go here
            break
          case 'webhook':
            // Webhook implementation would go here
            break
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error)
      }
    }
  }

  /**
   * Send browser notification
   */
  private sendBrowserNotification(alert: Alert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: `xandeum-alert-${alert.id}`,
      })
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
    return [...this.alerts]
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved)
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): AlertStats {
    const active = this.getActiveAlerts()
    const byType: Record<AlertType, number> = {
      pnode_offline: 0,
      pnode_performance_drop: 0,
      pnode_storage_full: 0,
      network_decentralization: 0,
      network_storage_low: 0,
      new_pnode_joined: 0,
      pnode_version_outdated: 0,
    }

    active.forEach((alert) => {
      byType[alert.type]++
    })

    return {
      total: this.alerts.length,
      active: active.length,
      critical: active.filter((a) => a.severity === 'critical').length,
      acknowledged: active.filter((a) => a.acknowledged).length,
      byType,
    }
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date()
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
    }
  }

  /**
   * Add alert listener
   */
  addAlertListener(callback: (alert: Alert) => void): void {
    this.alertListeners.push(callback)
  }

  /**
   * Remove alert listener
   */
  removeAlertListener(callback: (alert: Alert) => void): void {
    const index = this.alertListeners.indexOf(callback)
    if (index > -1) {
      this.alertListeners.splice(index, 1)
    }
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Update an alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates })
    }
  }

  /**
   * Enable/disable a rule
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    this.updateRule(ruleId, { enabled })
  }
}

// Singleton instance
let alertService: AlertService | null = null

export function getAlertService(): AlertService {
  if (!alertService) {
    alertService = new AlertService()
  }
  return alertService
}
