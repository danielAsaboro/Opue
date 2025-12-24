import { NextResponse } from 'next/server'
import { pnodeService } from '@/services/pnode.service'

export async function GET() {
  try {
    const stats = await pnodeService.fetchNetworkStats()
    return NextResponse.json(stats)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch network stats'
    console.error('[API] Failed to fetch network stats:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
