'use client'

import { Button } from '@/components/ui/button'
import { ThemeSelect } from '@/components/theme-select'
import { ConnectionStatus } from '@/components/connection-status'
import { GlobalSearch } from '@/components/global-search'
import { ClusterUiSelect } from '@/components/cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function AppHeader() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <header className="sticky top-0 z-30 px-4 py-3 glass border-b border-border/50">
      <div className="flex justify-between items-center gap-4">
        {/* Left side - spacer for mobile menu button + search */}
        <div className="flex items-center gap-4">
          <div className="w-10 md:w-0" />
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
        </div>

        {/* Right side - controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <ConnectionStatus />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <div className="hidden sm:block">
            <WalletButton />
          </div>

          <div className="hidden md:block">
            <ClusterUiSelect />
          </div>

          <ThemeSelect />

          <Button variant="ghost" size="sm" asChild className="gap-2">
            <a
              href="https://www.youtube.com/watch?v=7Uffvfz2w-U&list=PLeERy8YL4mpRu9ehrJE4BSW6Zk7gLEMud"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hidden md:inline">Docs</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
