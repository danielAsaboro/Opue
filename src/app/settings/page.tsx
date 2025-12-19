'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { ClusterUiSelect } from '@/components/cluster/cluster-ui'
import {
  Settings,
  Bell,
  Palette,
  Globe,
  Database,
  Keyboard,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Trash2,
  Check,
  Code,
  Zap,
  Link,
  Volume2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface NotificationSettings {
  email: boolean
  browser: boolean
  sound: boolean
  statusChanges: boolean
  performanceDrops: boolean
  newNodes: boolean
  frequency: 'realtime' | 'hourly' | 'daily'
}

interface DataSettings {
  autoRefresh: boolean
  refreshInterval: number
  cacheEnabled: boolean
}

interface DisplaySettings {
  animations: boolean
  compactMode: boolean
  showTooltips: boolean
}

interface AdvancedSettings {
  developerMode: boolean
  customEndpoint: string
  useCustomEndpoint: boolean
  debugLogs: boolean
}

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', '/'], description: 'Toggle AI chat' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['⌘', 'D'], description: 'Toggle dark mode' },
  { keys: ['R'], description: 'Refresh data' },
  { keys: ['Esc'], description: 'Close dialogs' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: false,
    browser: true,
    sound: true,
    statusChanges: true,
    performanceDrops: true,
    newNodes: false,
    frequency: 'realtime',
  })

  const [dataSettings, setDataSettings] = useState<DataSettings>({
    autoRefresh: true,
    refreshInterval: 30,
    cacheEnabled: true,
  })

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    animations: true,
    compactMode: false,
    showTooltips: true,
  })

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    developerMode: false,
    customEndpoint: '',
    useCustomEndpoint: false,
    debugLogs: false,
  })

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage
    const savedNotifications = localStorage.getItem('notification-settings')
    const savedDataSettings = localStorage.getItem('data-settings')
    const savedDisplaySettings = localStorage.getItem('display-settings')
    const savedAdvancedSettings = localStorage.getItem('advanced-settings')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch {}
    }
    if (savedDataSettings) {
      try {
        setDataSettings(JSON.parse(savedDataSettings))
      } catch {}
    }
    if (savedDisplaySettings) {
      try {
        setDisplaySettings(JSON.parse(savedDisplaySettings))
      } catch {}
    }
    if (savedAdvancedSettings) {
      try {
        setAdvancedSettings(JSON.parse(savedAdvancedSettings))
      } catch {}
    }
  }, [])

  const saveSettings = () => {
    setSaving(true)
    localStorage.setItem('notification-settings', JSON.stringify(notifications))
    localStorage.setItem('data-settings', JSON.stringify(dataSettings))
    localStorage.setItem('display-settings', JSON.stringify(displaySettings))
    localStorage.setItem('advanced-settings', JSON.stringify(advancedSettings))
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings saved successfully')
    }, 500)
  }

  const clearCache = () => {
    localStorage.removeItem('xandeum-favorites')
    localStorage.removeItem('xandeum-watchlist')
    localStorage.removeItem('xandeum-recent-searches')
    toast.success('Cache cleared')
  }

  const resetSettings = () => {
    setNotifications({
      email: false,
      browser: true,
      sound: true,
      statusChanges: true,
      performanceDrops: true,
      newNodes: false,
      frequency: 'realtime',
    })
    setDataSettings({
      autoRefresh: true,
      refreshInterval: 30,
      cacheEnabled: true,
    })
    setDisplaySettings({
      animations: true,
      compactMode: false,
      showTooltips: true,
    })
    setAdvancedSettings({
      developerMode: false,
      customEndpoint: '',
      useCustomEndpoint: false,
      debugLogs: false,
    })
    toast.success('Settings reset to defaults')
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your preferences and application settings.
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display & Animations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Display
          </CardTitle>
          <CardDescription>Configure visual preferences and animations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Real-time Animations</Label>
              <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
            </div>
            <Switch
              checked={displaySettings.animations}
              onCheckedChange={(checked) =>
                setDisplaySettings({ ...displaySettings, animations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing for denser information display</p>
            </div>
            <Switch
              checked={displaySettings.compactMode}
              onCheckedChange={(checked) =>
                setDisplaySettings({ ...displaySettings, compactMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Tooltips</Label>
              <p className="text-sm text-muted-foreground">Display helpful tooltips on hover</p>
            </div>
            <Switch
              checked={displaySettings.showTooltips}
              onCheckedChange={(checked) =>
                setDisplaySettings({ ...displaySettings, showTooltips: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
              </div>
              <Switch
                checked={notifications.browser}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, browser: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sound Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
              </div>
              <Switch
                checked={notifications.sound}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sound: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-sm font-medium">Notify me about</Label>

            <div className="flex items-center justify-between">
              <Label className="font-normal">pNode status changes</Label>
              <Switch
                checked={notifications.statusChanges}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, statusChanges: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-normal">Performance drops</Label>
              <Switch
                checked={notifications.performanceDrops}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, performanceDrops: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-normal">New pNodes joining network</Label>
              <Switch
                checked={notifications.newNodes}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newNodes: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notification Frequency</Label>
              <p className="text-sm text-muted-foreground">How often to send batched notifications</p>
            </div>
            <Select
              value={notifications.frequency}
              onValueChange={(value: 'realtime' | 'hourly' | 'daily') =>
                setNotifications({ ...notifications, frequency: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Realtime</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Network
          </CardTitle>
          <CardDescription>Configure network and RPC settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cluster / RPC Endpoint</Label>
              <p className="text-sm text-muted-foreground">Select the Xandeum network to connect to</p>
            </div>
            <ClusterUiSelect />
          </div>
        </CardContent>
      </Card>

      {/* Data & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Cache
          </CardTitle>
          <CardDescription>Manage data fetching and caching preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">Automatically refresh data periodically</p>
            </div>
            <Switch
              checked={dataSettings.autoRefresh}
              onCheckedChange={(checked) =>
                setDataSettings({ ...dataSettings, autoRefresh: checked })
              }
            />
          </div>

          {dataSettings.autoRefresh && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Refresh Interval</Label>
                <p className="text-sm text-muted-foreground">How often to refresh data (seconds)</p>
              </div>
              <Select
                value={dataSettings.refreshInterval.toString()}
                onValueChange={(value) =>
                  setDataSettings({ ...dataSettings, refreshInterval: parseInt(value) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Caching</Label>
              <p className="text-sm text-muted-foreground">Cache data locally for faster loading</p>
            </div>
            <Switch
              checked={dataSettings.cacheEnabled}
              onCheckedChange={(checked) =>
                setDataSettings({ ...dataSettings, cacheEnabled: checked })
              }
            />
          </div>

          <Separator />

          <Button variant="outline" onClick={clearCache} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* Advanced / Developer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Advanced
          </CardTitle>
          <CardDescription>Developer options and custom configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                Developer Mode
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">Enable advanced features and debug information</p>
            </div>
            <Switch
              checked={advancedSettings.developerMode}
              onCheckedChange={(checked) =>
                setAdvancedSettings({ ...advancedSettings, developerMode: checked })
              }
            />
          </div>

          {advancedSettings.developerMode && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Logs</Label>
                  <p className="text-sm text-muted-foreground">Show detailed logs in console</p>
                </div>
                <Switch
                  checked={advancedSettings.debugLogs}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, debugLogs: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Custom RPC Endpoint
                  </Label>
                  <p className="text-sm text-muted-foreground">Use a custom RPC endpoint instead of default</p>
                </div>
                <Switch
                  checked={advancedSettings.useCustomEndpoint}
                  onCheckedChange={(checked) =>
                    setAdvancedSettings({ ...advancedSettings, useCustomEndpoint: checked })
                  }
                />
              </div>

              {advancedSettings.useCustomEndpoint && (
                <div className="space-y-2">
                  <Label>Primary Endpoint URL</Label>
                  <Input
                    type="url"
                    placeholder="https://your-rpc-endpoint.com"
                    value={advancedSettings.customEndpoint}
                    onChange={(e) =>
                      setAdvancedSettings({ ...advancedSettings, customEndpoint: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid Xandeum RPC endpoint URL
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>Quick access keyboard commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <Badge key={keyIndex} variant="secondary" className="font-mono text-xs px-2">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={resetSettings} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  )
}
