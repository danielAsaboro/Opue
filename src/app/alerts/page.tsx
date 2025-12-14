'use client'

import { AlertDashboard } from '@/components/alerts/alert-dashboard'

export default function AlertsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Alert Center</h1>
        <p className="text-muted-foreground mt-2">Monitor network health and get notified about important events</p>
      </div>

      <AlertDashboard />
    </div>
  )
}
