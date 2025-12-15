'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Bell,
  MoreHorizontal,
  TrendingUp,
  Lightbulb,
  Star,
  GitCompare,
  Wallet,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const primaryNavItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/pnodes', icon: Database, label: 'pNodes' },
  { href: '/network', icon: BarChart3, label: 'Network' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
]

const moreNavItems = [
  {
    title: 'Analytics',
    items: [
      { href: '/analytics', icon: TrendingUp, label: 'Historical' },
      { href: '/insights', icon: Lightbulb, label: 'Insights' },
      { href: '/watchlist', icon: Star, label: 'Watchlist' },
      { href: '/compare', icon: GitCompare, label: 'Compare' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/account', icon: Wallet, label: 'Wallet' },
    ],
  },
  {
    title: 'App',
    items: [
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/help', icon: HelpCircle, label: 'Help' },
    ],
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [dialogOpen, setDialogOpen] = useState(false)

  const isActive = (path: string) => {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  // Check if any "more" item is active
  const isMoreActive = moreNavItems.some((section) =>
    section.items.some((item) => isActive(item.href))
  )

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around py-2">
        {primaryNavItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[56px] rounded-lg transition-colors',
              isActive(href)
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* More button with Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[56px] rounded-lg transition-colors',
                isMoreActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Navigation</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {moreNavItems.map((section) => (
                  <div key={section.title}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {section.title}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {section.items.map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDialogOpen(false)}
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors',
                            isActive(href)
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-xs font-medium">{label}</span>
                        </Link>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}

                {/* Quick access shortcuts */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Quick Actions
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span>Command Palette</span>
                      <kbd className="px-2 py-0.5 bg-background rounded text-xs font-mono">⌘K</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span>AI Chat</span>
                      <kbd className="px-2 py-0.5 bg-background rounded text-xs font-mono">⌘/</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span>Search</span>
                      <kbd className="px-2 py-0.5 bg-background rounded text-xs font-mono">/</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  )
}
