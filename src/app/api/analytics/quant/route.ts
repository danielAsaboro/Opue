import { NextRequest, NextResponse } from 'next/server'
import { getQuantAnalyticsService } from '@/services/quant-analytics.service'
import { pnodeService } from '@/services/pnode.service'

/**
 * GET /api/analytics/quant
 * Get network-wide quantitative analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const quantService = getQuantAnalyticsService()
    const searchParams = request.nextUrl.searchParams

    // Fetch all pNodes for analysis
    const pnodes = await pnodeService.fetchAllPNodes()

    if (pnodes.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient data for quantitative analysis (need at least 3 pNodes)',
      }, { status: 400 })
    }

    // Check which type of analysis is requested
    const type = searchParams.get('type') || 'summary'

    let data: unknown

    switch (type) {
      case 'summary':
        data = quantService.generateNetworkQuantSummary(pnodes)
        break

      case 'correlations':
        data = quantService.generateCorrelationMatrix(pnodes)
        break

      case 'risk':
        data = quantService.calculateNetworkRiskDistribution(pnodes)
        break

      case 'regression': {
        const dependent = searchParams.get('dependent') || 'performanceScore'
        const independent = searchParams.get('independent') || 'storageUtilization'
        data = quantService.performNetworkRegression(pnodes, dependent, independent)
        break
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown analysis type: ${type}. Supported types: summary, correlations, risk, regression`,
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      data,
      meta: {
        pnodeCount: pnodes.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[API] Quant analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate quantitative analytics' },
      { status: 500 }
    )
  }
}
