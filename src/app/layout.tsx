import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { CommandPalette } from '@/components/command-palette'
import React from 'react'

export const metadata: Metadata = {
  title: 'Xandeum pNode Analytics',
  description: 'Real-time analytics and insights for the Xandeum storage network',
}

const links: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'pNodes', path: '/pnodes' },
  { label: 'Network', path: '/network' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Watchlist', path: '/watchlist' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Compare', path: '/compare' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <CommandPalette />
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
