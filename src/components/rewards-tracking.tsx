'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Coins,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Zap,
  Target,
  AlertCircle,
  Info,
} from 'lucide-react'
import type { EpochInfo, StakingInfo } from '@/types/pnode'
import { pnodeService } from '@/services/pnode.service'

function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  return `${hours}h ${minutes}m`
}

export function RewardsTracking() {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch real epoch info from Solana RPC
        const rawEpochInfo = await pnodeService.fetchEpochInfo()

        // Calculate progress and time remaining
        const progress = (rawEpochInfo.slotIndex / rawEpochInfo.slotsInEpoch) * 100
        const slotsRemaining = rawEpochInfo.slotsInEpoch - rawEpochInfo.slotIndex
        const avgSlotTime = 0.4 // ~400ms per slot on Solana
        const timeRemaining = Math.floor(slotsRemaining * avgSlotTime)

        const epochData: EpochInfo = {
          epoch: rawEpochInfo.epoch,
          slotIndex: rawEpochInfo.slotIndex,
          slotsInEpoch: rawEpochInfo.slotsInEpoch,
          absoluteSlot: rawEpochInfo.absoluteSlot,
          blockHeight: rawEpochInfo.blockHeight,
          transactionCount: rawEpochInfo.transactionCount,
          timeRemaining,
          progress,
        }
        setEpochInfo(epochData)

        // Fetch real inflation rate to calculate APY
        try {
          const inflationRate = await pnodeService.fetchInflationRate()

          // Staking info from inflation data
          // Note: Personal staking data would require a connected wallet
          // This shows network-wide estimates
          const stakingData: StakingInfo = {
            totalStaked: 0, // Would need user's wallet to show personal stake
            activeStake: 0,
            inactiveStake: 0,
            apy: parseFloat((inflationRate.validator * 100).toFixed(2)), // Real APY from inflation
            projectedDaily: 0,
            projectedMonthly: 0,
            projectedYearly: 0,
            recentRewards: [], // Would need user's wallet for personal rewards
          }
          setStakingInfo(stakingData)
        } catch (inflationError) {
          // Inflation fetch failed, set null
          console.warn('Failed to fetch inflation rate:', inflationError)
          setStakingInfo(null)
        }

      } catch (err) {
        console.error('Failed to fetch epoch info:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load epoch data: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Epoch Progress - Real Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Epoch Progress
              </CardTitle>
              <CardDescription>Current epoch and time remaining (live data from Solana RPC)</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg font-mono">
              Epoch {epochInfo?.epoch}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{epochInfo?.progress.toFixed(1)}%</span>
            </div>
            <Progress value={epochInfo?.progress || 0} className="h-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Time Remaining</p>
              <p className="font-semibold text-lg">{formatTimeRemaining(epochInfo?.timeRemaining || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Slot Index</p>
              <p className="font-semibold font-mono">{epochInfo?.slotIndex.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Block Height</p>
              <p className="font-semibold font-mono">{epochInfo?.blockHeight.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transactions</p>
              <p className="font-semibold font-mono">{epochInfo?.transactionCount?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Overview - Network Data */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Staking APY shown is the network-wide validator inflation rate.
          Connect a wallet to view personal staking information and rewards.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Your Stake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <p className="text-xs text-muted-foreground mt-1">Connect wallet to view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Network Staking APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stakingInfo?.apy ? `${stakingInfo.apy}%` : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stakingInfo?.apy ? 'From Solana inflation rate' : 'Unable to fetch'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Projected Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily</span>
                <span className="font-medium text-muted-foreground">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly</span>
                <span className="font-medium text-muted-foreground">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Yearly</span>
                <span className="font-medium text-muted-foreground">--</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Connect wallet to calculate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rewards - Requires Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Rewards
          </CardTitle>
          <CardDescription>Staking rewards from the last 5 epochs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ArrowUpRight className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Connect your wallet to view staking rewards</p>
            <p className="text-xs text-muted-foreground mt-1">
              Personal reward history requires wallet connection
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
