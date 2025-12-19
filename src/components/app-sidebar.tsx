'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Database,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Star,
  Bell,
  GitCompare,
  Wallet,
  Settings,
  HelpCircle,
  Menu,
  X,
  BookOpen,
  Rocket,
  Sparkles,
  Code,
  FileCode,
  Blocks,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'pNodes', path: '/pnodes', icon: Database },
      { label: 'Network Stats', path: '/network', icon: BarChart3 },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Historical', path: '/analytics', icon: TrendingUp },
      { label: 'Insights', path: '/insights', icon: Lightbulb },
      { label: 'Watchlist', path: '/watchlist', icon: Star },
      { label: 'Alerts', path: '/alerts', icon: Bell },
      { label: 'Compare', path: '/compare', icon: GitCompare },
    ],
  },
  {
    title: 'DOCUMENTATION',
    items: [
      { label: 'Docs', path: '/docs', icon: BookOpen },
      { label: 'Getting Started', path: '/docs/getting-started', icon: Rocket },
      { label: 'Features', path: '/docs/features', icon: Sparkles },
      { label: 'pRPC Integration', path: '/docs/prpc', icon: Code },
      { label: 'API Reference', path: '/docs/api', icon: FileCode },
      { label: 'Architecture', path: '/docs/architecture', icon: Blocks },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Wallet', path: '/account', icon: Wallet },
    ],
  },
]

const bottomItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: '/help', icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path)
    return (
      <Link
        href={item.path}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-chart-2 to-chart-1 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
            X
          </div>
          <div>
            <div className="font-semibold text-foreground">Xandeum</div>
            <div className="text-xs text-muted-foreground">pNode Analytics</div>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Items */}
      <div className="p-4 border-t border-border/50 space-y-1">
        {bottomItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">⌘K</kbd> Commands
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">⌘/</kbd> AI Chat
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-background border border-border shadow-sm"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-60 flex flex-col transition-transform duration-300',
          'glass-card border-r border-border/50',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
