import { NextRequest, NextResponse } from 'next/server'
import { getQuantAnalyticsService } from '@/services/quant-analytics.service'
import { pnodeService } from '@/services/pnode.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/analytics/quant/pnode/[id]
 * Get quantitative analytics for a specific pNode
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const quantService = getQuantAnalyticsService()
    const searchParams = request.nextUrl.searchParams

    // Fetch all pNodes and find the specific one
    const allPNodes = await pnodeService.fetchAllPNodes()
    const pnode = allPNodes.find((p) => p.id === id)

    if (!pnode) {
      return NextResponse.json({
        success: false,
        error: `pNode not found: ${id}`,
      }, { status: 404 })
    }

    // Check which type of analysis is requested
    const type = searchParams.get('type') || 'all'

    // Optionally fetch detailed data with history
    let pnodeHistory: {
      performanceScores: { timestamp: number; value: number }[]
      storageUtilization: { timestamp: number; value: number }[]
      uptimeHistory: { timestamp: number; value: number }[]
    } | undefined
    try {
      const details = await pnodeService.fetchPNodeDetails(id)
      pnodeHistory = details.history
    } catch {
      // Continue with basic pnode data if details fetch fails
      console.warn(`[API] Could not fetch detailed history for pNode ${id}`)
    }

    const pnodeWithHistory = { ...pnode, history: pnodeHistory }
    const history = pnodeHistory?.performanceScores || []

    const data: Record<string, unknown> = {}

    if (type === 'all' || type === 'risk') {
      data.riskProfile = quantService.calculateRiskProfile(pnodeWithHistory, history, allPNodes)
    }

    if (type === 'all' || type === 'benchmark') {
      data.benchmark = quantService.benchmarkPNode(pnodeWithHistory, allPNodes)
    }

    if (type === 'all' || type === 'forecast') {
      const metric = searchParams.get('metric') || 'performanceScore'
      if (history.length >= 3) {
        data.forecast = quantService.generateTrendForecast(history, 7, metric)
      } else {
        data.forecast = null
      }
    }

    return NextResponse.json({
      success: true,
      pnodeId: id,
      type,
      data,
      meta: {
        hasHistory: !!pnodeHistory,
        networkSize: allPNodes.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[API] pNode quant analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate pNode quantitative analytics' },
      { status: 500 }
    )
  }
}
