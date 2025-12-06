'use client';

import { AppHero } from '@/components/app-hero';
import { NetworkStatsCards } from './network-stats-cards';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Database, BarChart2, Map } from 'lucide-react';

export function DashboardFeature() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <AppHero
        title="Xandeum pNode Analytics"
        subtitle="Real-time insights into the decentralized storage network"
      />

      {/* Network Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NetworkStatsCards />
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/pnodes" className="group">
            <div className="border rounded-lg p-6 hover:bg-accent transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Explore pNodes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                View detailed information about all pNodes in the network
              </p>
            </div>
          </Link>

          <Link href="/network" className="group">
            <div className="border rounded-lg p-6 hover:bg-accent transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Network Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Deep dive into network trends and performance metrics
              </p>
            </div>
          </Link>

          <Link href="/map" className="group">
            <div className="border rounded-lg p-6 hover:bg-accent transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Network Map</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Visualize geographic distribution of storage providers
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border rounded-lg p-6 bg-muted/30">
          <h2 className="text-xl font-semibold mb-3">About Xandeum</h2>
          <p className="text-muted-foreground mb-4">
            Xandeum is building a scalable storage layer for Solana dApps. Think of it as a second
            tier of Solana accounts that can grow to exabytes and beyond. This lives on its own
            network of storage provider nodes, which we call pNodes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href="https://xandeum.network" target="_blank" rel="noopener noreferrer">
                Learn More
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://xandeum.github.io/xandeum-web3.js"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

