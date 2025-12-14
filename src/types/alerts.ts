export interface AlertRule {
  id: string
  name: string
  description: string
  type: AlertType
  enabled: boolean
  severity: AlertSeverity
  conditions: AlertCondition[]
  cooldownMinutes: number // Prevent spam
  lastTriggered?: Date
  notificationMethods: NotificationMethod[]
}

export type AlertType =
  | 'pnode_offline'
  | 'pnode_performance_drop'
  | 'pnode_storage_full'
  | 'network_decentralization'
  | 'network_storage_low'
  | 'new_pnode_joined'
  | 'pnode_version_outdated'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type NotificationMethod = 'browser' | 'email' | 'webhook'

export interface AlertCondition {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'not_contains'
  value: number | string | boolean
  duration?: number // minutes - sustained condition
}

export interface Alert {
  id: string
  ruleId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  pnodeId?: string
  metadata: Record<string, unknown>
  timestamp: Date
  acknowledged: boolean
  acknowledgedAt?: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface AlertStats {
  total: number
  active: number
  critical: number
  acknowledged: number
  byType: Record<AlertType, number>
}

// Default alert rules
export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id'>[] = [
  {
    name: 'pNode Goes Offline',
    description: 'Alert when a pNode becomes unreachable',
    type: 'pnode_offline',
    enabled: true,
    severity: 'high',
    conditions: [{ field: 'status', operator: 'eq', value: 'offline', duration: 5 }],
    cooldownMinutes: 60,
    notificationMethods: ['browser'],
  },
  {
    name: 'Performance Score Drop',
    description: 'Alert when pNode performance drops significantly',
    type: 'pnode_performance_drop',
    enabled: true,
    severity: 'medium',
    conditions: [{ field: 'performanceScore', operator: 'lt', value: 60, duration: 10 }],
    cooldownMinutes: 30,
    notificationMethods: ['browser'],
  },
  {
    name: 'Storage Nearly Full',
    description: 'Alert when pNode storage utilization exceeds 90%',
    type: 'pnode_storage_full',
    enabled: true,
    severity: 'high',
    conditions: [{ field: 'storageUtilization', operator: 'gt', value: 90, duration: 15 }],
    cooldownMinutes: 120,
    notificationMethods: ['browser'],
  },
  {
    name: 'Network Decentralization Risk',
    description: 'Alert when network decentralization score drops below 70%',
    type: 'network_decentralization',
    enabled: true,
    severity: 'critical',
    conditions: [{ field: 'decentralizationScore', operator: 'lt', value: 0.7, duration: 30 }],
    cooldownMinutes: 240,
    notificationMethods: ['browser'],
  },
  {
    name: 'New pNode Joined',
    description: 'Notify when new storage providers join the network',
    type: 'new_pnode_joined',
    enabled: false,
    severity: 'low',
    conditions: [{ field: 'isNew', operator: 'eq', value: true }],
    cooldownMinutes: 0,
    notificationMethods: ['browser'],
  },
  {
    name: 'Outdated Software Version',
    description: 'Alert when pNodes are running outdated software',
    type: 'pnode_version_outdated',
    enabled: true,
    severity: 'medium',
    conditions: [
      { field: 'versionOutdated', operator: 'eq', value: true, duration: 1440 }, // 24 hours
    ],
    cooldownMinutes: 1440,
    notificationMethods: ['browser'],
  },
]


