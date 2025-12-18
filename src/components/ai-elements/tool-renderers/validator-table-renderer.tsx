'use client'

import { Users, Coins, Percent, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidatorData {
  nodePubkey: string
  votePubkey: string
  stakeSOL: string
  commission: string
}

interface ValidatorsResponse {
  totalActive: number
  totalDelinquent: number
  topValidators: ValidatorData[]
}

function truncateKey(key: string): string {
  if (key.length <= 12) return key
  return `${key.slice(0, 6)}...${key.slice(-4)}`
}

function StakeBar({ stake, maxStake }: { stake: number; maxStake: number }) {
  const percentage = Math.min((stake / maxStake) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium">{stake.toLocaleString()}</span>
    </div>
  )
}

function CommissionBadge({ commission }: { commission: string }) {
  const commissionNum = parseFloat(commission)
  const color = commissionNum <= 5 ? 'text-emerald-500 bg-emerald-500/10' :
                commissionNum <= 10 ? 'text-amber-500 bg-amber-500/10' :
                'text-red-500 bg-red-500/10'

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', color)}>
      {commission}
    </span>
  )
}

export function ValidatorTableRenderer({ data }: { data: unknown }) {
  const response = data as ValidatorsResponse

  // Calculate max stake for relative bar sizing
  const stakes = response.topValidators.map(v => parseFloat(v.stakeSOL))
  const maxStake = Math.max(...stakes, 1)

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <Users className="w-4 h-4 text-primary" />
          Validators
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-emerald-500">
            <CheckCircle2 className="w-3 h-3" />
            {response.totalActive} active
          </span>
          {response.totalDelinquent > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="w-3 h-3" />
              {response.totalDelinquent} delinquent
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 font-medium">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Node
                </span>
              </th>
              <th className="text-left p-2 font-medium">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  Stake (SOL)
                </span>
              </th>
              <th className="text-left p-2 font-medium">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Commission
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {response.topValidators.map((validator, i) => (
              <tr key={validator.votePubkey} className={cn('border-t border-muted/50', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                <td className="p-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px]">{truncateKey(validator.nodePubkey)}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{truncateKey(validator.votePubkey)}</span>
                  </div>
                </td>
                <td className="p-2">
                  <StakeBar stake={parseFloat(validator.stakeSOL)} maxStake={maxStake} />
                </td>
                <td className="p-2">
                  <CommissionBadge commission={validator.commission} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/20">
        Top {response.topValidators.length} validators by stake
      </div>
    </div>
  )
}
