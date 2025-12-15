'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import React from 'react'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 md:ml-60">
          <AppHeader />
          <main className="flex-grow p-4 md:p-6">
            <ClusterChecker>
              <AccountChecker />
            </ClusterChecker>
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
