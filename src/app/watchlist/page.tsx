'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePNodes } from '@/hooks/usePNodes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Star,
  Bell,
  Trash2,
  Settings,
  Mail,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  Edit2,
  X,
  Check,
} from 'lucide-react'
import {
  getWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
  getNotificationSettings,
  saveNotificationSettings,
  mockSendVerificationEmail,
  mockVerifyEmailCode,
  requestNotificationPermission,
  type WatchlistItem,
  type NotificationSettings,
} from '@/lib/watchlist'
import { formatBytes } from '@/lib/format'

export default function WatchlistPage() {
  const { data: allPNodes, isLoading } = usePNodes()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editingNickname, setEditingNickname] = useState<string | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')

  // Email verification state
  const [emailInput, setEmailInput] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')

  useEffect(() => {
    setWatchlist(getWatchlist())
    setSettings(getNotificationSettings())
  }, [])

  const watchedPNodes = allPNodes?.filter((p) => watchlist.some((w) => w.pnodeId === p.id)) || []

  const handleRemove = (pnodeId: string) => {
    removeFromWatchlist(pnodeId)
    setWatchlist(getWatchlist())
  }

  const handleUpdateItem = (pnodeId: string, updates: Partial<WatchlistItem>) => {
    updateWatchlistItem(pnodeId, updates)
    setWatchlist(getWatchlist())
  }

  const handleSaveSettings = (updates: Partial<NotificationSettings>) => {
    saveNotificationSettings(updates)
    setSettings(getNotificationSettings())
  }

  const handleSendVerification = async () => {
    setIsVerifying(true)
    setVerificationMessage('')
    const result = await mockSendVerificationEmail(emailInput)
    setVerificationMessage(result.message)
    setVerificationSent(result.success)
    setIsVerifying(false)
  }

  const handleVerifyCode = async () => {
    setIsVerifying(true)
    const result = await mockVerifyEmailCode(verificationCode)
    setVerificationMessage(result.message)
    if (result.success) {
      handleSaveSettings({ email: emailInput, emailVerified: true })
      setVerificationSent(false)
      setVerificationCode('')
    }
    setIsVerifying(false)
  }

  const handleEnableBrowserNotifications = async () => {
    const granted = await requestNotificationPermission()
    handleSaveSettings({ enableBrowserNotifications: granted })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-red-500'
      case 'delinquent':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getWatchlistItemForPNode = (pnodeId: string) => {
    return watchlist.find((w) => w.pnodeId === pnodeId)
  }

  const startEditNickname = (pnodeId: string, currentNickname?: string) => {
    setEditingNickname(pnodeId)
    setNicknameInput(currentNickname || '')
  }

  const saveNickname = (pnodeId: string) => {
    handleUpdateItem(pnodeId, { nickname: nicknameInput || undefined })
    setEditingNickname(null)
    setNicknameInput('')
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your favorite pNodes and get notified of changes
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </Button>
      </div>

      {/* Notification Settings Panel */}
      {showSettings && settings && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how you want to be notified about your watched pNodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </h3>

              {settings.emailVerified ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Email verified: <strong>{settings.email}</strong></span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveSettings({ email: '', emailVerified: false })}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <Button onClick={handleSendVerification} disabled={isVerifying || !emailInput}>
                      {isVerifying ? 'Sending...' : 'Verify Email'}
                    </Button>
                  </div>

                  {verificationSent && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button onClick={handleVerifyCode} disabled={isVerifying || verificationCode.length !== 6}>
                        Confirm
                      </Button>
                    </div>
                  )}

                  {verificationMessage && (
                    <p className={`text-sm ${verificationMessage.includes('success') || verificationMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationMessage}
                    </p>
                  )}
                </div>
              )}

              {settings.emailVerified && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex items-center gap-2">
                    Enable email notifications
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleSaveSettings({ enableEmailNotifications: checked })}
                  />
                </div>
              )}
            </div>

            {/* Browser Notifications */}
            <div className="space-y-3">
              <h3 className="font-semibold">Browser Notifications</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications">Enable browser notifications</Label>
                <Switch
                  id="browser-notifications"
                  checked={settings.enableBrowserNotifications}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleEnableBrowserNotifications()
                    } else {
                      handleSaveSettings({ enableBrowserNotifications: false })
                    }
                  }}
                />
              </div>
            </div>

            {/* Global Notification Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold">Additional Alerts</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-pnode">Notify when new pNodes join the network</Label>
                <Switch
                  id="new-pnode"
                  checked={settings.notifyOnNewPNode}
                  onCheckedChange={(checked) => handleSaveSettings({ notifyOnNewPNode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="network-issues">Notify on network-wide issues</Label>
                <Switch
                  id="network-issues"
                  checked={settings.notifyOnNetworkIssues}
                  onCheckedChange={(checked) => handleSaveSettings({ notifyOnNetworkIssues: checked })}
                />
              </div>
            </div>

            {/* Digest Frequency */}
            <div className="space-y-3">
              <h3 className="font-semibold">Notification Frequency</h3>
              <div className="flex flex-wrap gap-2">
                {(['realtime', 'hourly', 'daily', 'weekly'] as const).map((freq) => (
                  <Button
                    key={freq}
                    variant={settings.digestFrequency === freq ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSaveSettings({ digestFrequency: freq })}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {watchlist.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add pNodes to your watchlist to track their status and performance
            </p>
            <Button asChild>
              <Link href="/pnodes">Browse pNodes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Items */}
      <div className="space-y-4">
        {watchedPNodes.map((pnode) => {
          const watchItem = getWatchlistItemForPNode(pnode.id)
          if (!watchItem) return null

          return (
            <Card key={pnode.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* pNode Info */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {editingNickname === pnode.id ? (
                        <div className="flex items-center gap-2 mb-1">
                          <Input
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            placeholder="Enter nickname"
                            className="h-8 w-48"
                          />
                          <Button size="sm" variant="ghost" onClick={() => saveNickname(pnode.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNickname(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {watchItem.nickname || 'Unnamed pNode'}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditNickname(pnode.id, watchItem.nickname)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <p className="text-sm font-mono text-muted-foreground truncate max-w-md">
                        {pnode.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(pnode.status)} text-white`}>
                        {pnode.status}
                      </Badge>
                      <Link href={`/pnodes/${encodeURIComponent(pnode.id)}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Performance</span>
                      <p className="font-semibold text-lg">{pnode.performanceScore}/100</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage</span>
                      <p className="font-semibold">{formatBytes(pnode.storage.capacityBytes)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime</span>
                      <p className="font-semibold">{pnode.performance.uptime.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <p className="font-semibold">{pnode.location || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Notification Settings for this pNode */}
                <div className="md:w-72 bg-muted/30 p-6 border-t md:border-t-0 md:border-l">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Alert Settings
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`status-${pnode.id}`} className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Status changes
                      </Label>
                      <Switch
                        id={`status-${pnode.id}`}
                        checked={watchItem.notifyOnStatusChange}
                        onCheckedChange={(checked) =>
                          handleUpdateItem(pnode.id, { notifyOnStatusChange: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`perf-${pnode.id}`} className="text-sm flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Performance drop
                      </Label>
                      <Switch
                        id={`perf-${pnode.id}`}
                        checked={watchItem.notifyOnPerformanceDrop}
                        onCheckedChange={(checked) =>
                          handleUpdateItem(pnode.id, { notifyOnPerformanceDrop: checked })
                        }
                      />
                    </div>

                    {watchItem.notifyOnPerformanceDrop && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">Alert below:</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={watchItem.performanceThreshold}
                          onChange={(e) =>
                            handleUpdateItem(pnode.id, { performanceThreshold: Number(e.target.value) })
                          }
                          className="w-20 h-8"
                        />
                      </div>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleRemove(pnode.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove from Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      {watchlist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Watchlist Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{watchedPNodes.length}</p>
                <p className="text-sm text-muted-foreground">Watching</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {watchedPNodes.filter((p) => p.status === 'online').length}
                </p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {watchedPNodes.filter((p) => p.status === 'offline').length}
                </p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {watchedPNodes.length > 0
                    ? Math.round(watchedPNodes.reduce((sum, p) => sum + p.performanceScore, 0) / watchedPNodes.length)
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
