'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Database, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePNodes } from '@/hooks/usePNodes'
import { formatBytes } from '@/lib/format'
import Link from 'next/link'

export function GlobalSearch() {
  const router = useRouter()
  const { data: pnodes } = usePNodes()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NonNullable<typeof pnodes>>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter results
  useEffect(() => {
    if (!search || !pnodes) {
      setResults([])
      return
    }

    const query = search.toLowerCase()
    const filtered = pnodes
      .filter(
        (p) =>
          p.id.toLowerCase().includes(query) ||
          p.gossipEndpoint.toLowerCase().includes(query) ||
          (p.location && p.location.toLowerCase().includes(query))
      )
      .slice(0, 5) // Limit to 5 results

    setResults(filtered)
  }, [search, pnodes])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Focus search on "/" key
      if (event.key === '/' && !isOpen) {
        event.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      // Close on escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (pnodeId: string) => {
    setIsOpen(false)
    setSearch('')
    router.push(`/pnodes/${encodeURIComponent(pnodeId)}`)
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

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed State - Just an icon button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-muted-foreground text-xs">Search pNodes</span>
          <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </Button>
      )}

      {/* Expanded State - Search input */}
      {isOpen && (
        <div className="relative">
          <div className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by pubkey, IP, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 sm:w-80 pl-9 pr-8"
                autoFocus
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false)
                setSearch('')
              }}
              className="ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-2 text-xs text-muted-foreground border-b">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((pnode) => (
                  <button
                    key={pnode.id}
                    onClick={() => handleSelect(pnode.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(pnode.status)}`} />
                    <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate">{pnode.id}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{pnode.location || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatBytes(pnode.storage.capacityBytes)}</span>
                        <span>•</span>
                        <span>Score: {pnode.performanceScore}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {pnode.status}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
              <div className="p-2 border-t">
                <Link
                  href={`/pnodes?search=${encodeURIComponent(search)}`}
                  onClick={() => {
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all results in pNode Explorer
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* No Results */}
          {search && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 p-4 text-center">
              <p className="text-sm text-muted-foreground">No pNodes found for &quot;{search}&quot;</p>
              <Link
                href="/pnodes"
                onClick={() => {
                  setIsOpen(false)
                  setSearch('')
                }}
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Browse all pNodes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
