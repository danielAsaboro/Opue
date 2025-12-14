/**
 * Watchlist management with notification preferences
 * Persists to localStorage for client-side storage
 */

const WATCHLIST_KEY = 'xandeum-watchlist'
const NOTIFICATION_SETTINGS_KEY = 'xandeum-notification-settings'

export interface WatchlistItem {
  pnodeId: string
  addedAt: number
  nickname?: string
  notifyOnStatusChange: boolean
  notifyOnPerformanceDrop: boolean
  performanceThreshold: number
}

export interface NotificationSettings {
  email: string
  emailVerified: boolean
  enableEmailNotifications: boolean
  enableBrowserNotifications: boolean
  notifyOnNewPNode: boolean
  notifyOnNetworkIssues: boolean
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: '',
  emailVerified: false,
  enableEmailNotifications: false,
  enableBrowserNotifications: true,
  notifyOnNewPNode: false,
  notifyOnNetworkIssues: true,
  digestFrequency: 'realtime',
}

// Watchlist functions
export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(WATCHLIST_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveWatchlist(watchlist: WatchlistItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
}

export function addToWatchlist(
  pnodeId: string,
  options?: Partial<Omit<WatchlistItem, 'pnodeId' | 'addedAt'>>
): WatchlistItem {
  const watchlist = getWatchlist()
  const existing = watchlist.find((item) => item.pnodeId === pnodeId)

  if (existing) {
    return existing
  }

  const newItem: WatchlistItem = {
    pnodeId,
    addedAt: Date.now(),
    notifyOnStatusChange: true,
    notifyOnPerformanceDrop: true,
    performanceThreshold: 70,
    ...options,
  }

  watchlist.push(newItem)
  saveWatchlist(watchlist)
  return newItem
}

export function removeFromWatchlist(pnodeId: string): void {
  const watchlist = getWatchlist().filter((item) => item.pnodeId !== pnodeId)
  saveWatchlist(watchlist)
}

export function updateWatchlistItem(pnodeId: string, updates: Partial<WatchlistItem>): void {
  const watchlist = getWatchlist()
  const index = watchlist.findIndex((item) => item.pnodeId === pnodeId)

  if (index > -1) {
    watchlist[index] = { ...watchlist[index], ...updates }
    saveWatchlist(watchlist)
  }
}

export function isInWatchlist(pnodeId: string): boolean {
  return getWatchlist().some((item) => item.pnodeId === pnodeId)
}

export function getWatchlistItem(pnodeId: string): WatchlistItem | undefined {
  return getWatchlist().find((item) => item.pnodeId === pnodeId)
}

// Notification settings functions
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS
  const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY)
  return stored ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) } : DEFAULT_NOTIFICATION_SETTINGS
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  if (typeof window === 'undefined') return
  const current = getNotificationSettings()
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({ ...current, ...settings }))
}

// Browser notification helpers
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendBrowserNotification(title: string, body: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })
  }
}

// Mock email verification (in production, this would call an API)
export function mockSendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email && email.includes('@')) {
        resolve({
          success: true,
          message: `Verification email sent to ${email}. Check your inbox!`,
        })
      } else {
        resolve({
          success: false,
          message: 'Invalid email address',
        })
      }
    }, 1000)
  })
}

// Mock verify email code (in production, this would call an API)
export function mockVerifyEmailCode(code: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Accept any 6-digit code for demo purposes
      if (code.length === 6 && /^\d+$/.test(code)) {
        resolve({
          success: true,
          message: 'Email verified successfully!',
        })
      } else {
        resolve({
          success: false,
          message: 'Invalid verification code',
        })
      }
    }, 500)
  })
}
