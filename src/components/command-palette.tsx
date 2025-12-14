'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  Home,
  Database,
  BarChart2,
  Map,
  TrendingUp,
  Moon,
  Sun,
  Bell,
  Download,
  Target,
  Clock,
  ChevronRight,
  Hash,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePNodes } from '@/hooks/usePNodes'
import { formatBytes } from '@/lib/format'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  action: () => void
  category: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const { setTheme } = useTheme()
  const { data: pnodes } = usePNodes()

  // Recent searches (stored in localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('command-palette-recent')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  const addToRecent = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('command-palette-recent', JSON.stringify(updated))
  }

  // Toggle with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open])

  const navigate = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router],
  )

  const executeAction = useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  // Generate dynamic command items
  const commandItems = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: 'home',
        title: 'Home Dashboard',
        description: 'Overview of network health and top performers',
        icon: Home,
        shortcut: '⌘H',
        category: 'Navigation',
        action: () => navigate('/'),
        keywords: ['dashboard', 'overview', 'main', 'start'],
      },
      {
        id: 'pnodes',
        title: 'pNode Explorer',
        description: 'Browse and analyze all storage providers',
        icon: Database,
        shortcut: '⌘P',
        category: 'Navigation',
        action: () => navigate('/pnodes'),
        keywords: ['nodes', 'storage', 'providers', 'list', 'table'],
      },
      {
        id: 'network',
        title: 'Network Analytics',
        description: 'Geographic distribution and network health',
        icon: BarChart2,
        shortcut: '⌘N',
        category: 'Navigation',
        action: () => navigate('/network'),
        keywords: ['analytics', 'charts', 'maps', 'geography', 'health'],
      },
      {
        id: 'analytics',
        title: 'Advanced Analytics',
        description: 'AI-powered insights and predictions',
        icon: TrendingUp,
        shortcut: '⌘A',
        category: 'Navigation',
        action: () => navigate('/analytics'),
        keywords: ['advanced', 'ai', 'insights', 'predictions', 'anomalies'],
      },
      {
        id: 'alerts',
        title: 'Alert Center',
        description: 'Monitor network events and performance',
        icon: Bell,
        shortcut: '⌘L',
        category: 'Navigation',
        action: () => navigate('/alerts'),
        keywords: ['alerts', 'notifications', 'events', 'monitoring'],
      },
      {
        id: 'compare',
        title: 'Compare pNodes',
        description: 'Side-by-side pNode comparison',
        icon: Target,
        shortcut: '⌘C',
        category: 'Navigation',
        action: () => navigate('/compare'),
        keywords: ['compare', 'comparison', 'side-by-side', 'analysis'],
      },

      // Views & Actions
      {
        id: 'table-view',
        title: 'Table View',
        description: 'Detailed table of all pNodes',
        icon: Database,
        category: 'Views',
        action: () => navigate('/pnodes?view=table'),
        keywords: ['table', 'list', 'detailed', 'data'],
      },
      {
        id: 'map-view',
        title: 'Map View',
        description: 'Geographic distribution of pNodes',
        icon: Map,
        category: 'Views',
        action: () => navigate('/pnodes?view=map'),
        keywords: ['map', 'geographic', 'location', 'distribution'],
      },
      {
        id: 'grid-view',
        title: 'Grid View',
        description: 'Card-based pNode overview',
        icon: Database,
        category: 'Views',
        action: () => navigate('/pnodes?view=grid'),
        keywords: ['grid', 'cards', 'overview', 'visual'],
      },

      // Theme
      {
        id: 'light-theme',
        title: 'Light Mode',
        description: 'Switch to light theme',
        icon: Sun,
        category: 'Theme',
        action: () => executeAction(() => setTheme('light')),
        keywords: ['light', 'theme', 'bright', 'day'],
      },
      {
        id: 'dark-theme',
        title: 'Dark Mode',
        description: 'Switch to dark theme',
        icon: Moon,
        category: 'Theme',
        action: () => executeAction(() => setTheme('dark')),
        keywords: ['dark', 'theme', 'night', 'dim'],
      },

      // Actions
      {
        id: 'export-data',
        title: 'Export Data',
        description: 'Download pNode data as CSV',
        icon: Download,
        category: 'Actions',
        action: () => {
          // This would trigger a download
          const csv =
            'ID,Status,Storage,Performance,Uptime,Location\n' +
            (pnodes || [])
              .slice(0, 10)
              .map(
                (p) =>
                  `${p.id},${p.status},${formatBytes(p.storage.capacityBytes)},${p.performanceScore},${Math.round(p.performance.uptime)}%,${p.location || 'Unknown'}`,
              )
              .join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'xandeum-pnodes.csv'
          a.click()
        },
        keywords: ['export', 'download', 'csv', 'data'],
      },
    ]

    // Add dynamic pNode search results
    if (pnodes && searchValue.length > 2) {
      const matchingPNodes = pnodes
        .filter(
          (pnode) =>
            pnode.id.toLowerCase().includes(searchValue.toLowerCase()) ||
            (pnode.location || '').toLowerCase().includes(searchValue.toLowerCase()),
        )
        .slice(0, 5)

      matchingPNodes.forEach((pnode) => {
        items.push({
          id: `pnode-${pnode.id}`,
          title: `pNode ${pnode.id.slice(0, 8)}...`,
          description: `${pnode.location || 'Unknown'} • ${formatBytes(pnode.storage.capacityBytes)} • Score: ${pnode.performanceScore}`,
          icon: Hash,
          category: 'pNodes',
          action: () => navigate(`/pnodes/${encodeURIComponent(pnode.id)}`),
          keywords: [pnode.id, pnode.location || '', 'pnode', 'node'],
        })
      })
    }

    // Add recent searches
    if (recentSearches.length > 0 && !searchValue) {
      recentSearches.forEach((search, index) => {
        items.push({
          id: `recent-${index}`,
          title: search,
          description: 'Recent search',
          icon: Clock,
          category: 'Recent',
          action: () => setSearchValue(search),
          keywords: [search],
        })
      })
    }

    return items
  }, [pnodes, searchValue, recentSearches, navigate, executeAction, setTheme])

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchValue) return commandItems

    const query = searchValue.toLowerCase()
    return commandItems.filter((item) => {
      const searchableText = [item.title, item.description, item.category, ...(item.keywords || [])]
        .join(' ')
        .toLowerCase()

      // Simple fuzzy matching
      return searchableText.includes(query) || query.split('').every((char) => searchableText.includes(char))
    })
  }, [commandItems, searchValue])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <Command
          className="rounded-lg border bg-card shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          value={searchValue}
          onValueChange={(value) => {
            setSearchValue(value)
            if (value) addToRecent(value)
          }}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search pNodes, pages, or commands..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {searchValue ? `No results found for "${searchValue}"` : 'Start typing to search...'}
            </Command.Empty>

            {/* Group items by category */}
            {Object.entries(
              filteredItems.reduce(
                (groups, item) => {
                  if (!groups[item.category]) groups[item.category] = []
                  groups[item.category].push(item)
                  return groups
                },
                {} as Record<string, CommandItem[]>,
              ),
            ).map(([category, items]) => (
              <Command.Group key={category} heading={category}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Command.Item
                      key={item.id}
                      onSelect={item.action}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.shortcut && (
                            <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}

            {filteredItems.length > 0 && <Command.Separator className="my-2 h-px bg-border" />}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> to navigate
              </span>
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> to select
              </span>
            </div>
            <span>
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> to close
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
