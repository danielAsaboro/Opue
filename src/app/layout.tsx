import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import { CommandPalette } from '@/components/command-palette'
import { AiChat } from '@/components/ai-chat'
import { MobileNav } from '@/components/mobile-nav'
import { OnboardingModal } from '@/components/onboarding-modal'
import React from 'react'

export const metadata: Metadata = {
  title: 'Xandeum pNode Analytics',
  description: 'Real-time analytics and insights for the Xandeum storage network',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <CommandPalette />
          <AiChat />
          <OnboardingModal />
          <AppLayout>
            <div className="pb-16 md:pb-0">{children}</div>
          </AppLayout>
          <MobileNav />
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
