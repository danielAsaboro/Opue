'use client'

import { NetworkStatsRenderer } from './stats-card-renderer'
import { PNodeTableRenderer, SearchResultsRenderer } from './data-table-renderer'
import { PNodeDetailRenderer } from './pnode-detail-renderer'
import { EpochProgressRenderer } from './epoch-renderer'
import { ValidatorTableRenderer } from './validator-table-renderer'
import { GeographicStatsRenderer } from './geographic-renderer'

/**
 * Registry mapping tool names to their visual renderers
 * Tools without a custom renderer will fall back to JSON display
 */
const toolRenderers: Record<string, React.FC<{ data: unknown }>> = {
  // Network stats - shows visual cards with metrics
  'get_network_stats': NetworkStatsRenderer,

  // pNode lists - shows sortable tables with status badges
  'get_pnodes': PNodeTableRenderer,
  'search_pnodes': SearchResultsRenderer,

  // Single pNode - shows detailed card with storage/performance
  'get_pnode_details': PNodeDetailRenderer,

  // Epoch info - shows circular progress and slot info
  'get_epoch_info': EpochProgressRenderer,

  // Validators - shows stake table with commission badges
  'get_validators': ValidatorTableRenderer,

  // Geographic distribution - shows regions table with pNode counts
  'get_geographic_stats': GeographicStatsRenderer,
}

/**
 * Check if a tool has a custom renderer
 */
export function hasCustomRenderer(toolName: string): boolean {
  return toolName in toolRenderers
}

/**
 * Get the renderer component for a tool
 */
export function getToolRenderer(toolName: string): React.FC<{ data: unknown }> | null {
  return toolRenderers[toolName] || null
}

/**
 * Render tool output with the appropriate renderer
 * Falls back to null if no custom renderer exists (caller should handle fallback)
 */
export function renderToolOutput(toolName: string, data: unknown): React.ReactNode | null {
  const Renderer = toolRenderers[toolName]
  if (!Renderer) return null

  try {
    return <Renderer data={data} />
  } catch (error) {
    console.error(`Error rendering tool ${toolName}:`, error)
    return null
  }
}

// Re-export individual renderers for direct use
export {
  NetworkStatsRenderer,
  PNodeTableRenderer,
  SearchResultsRenderer,
  PNodeDetailRenderer,
  EpochProgressRenderer,
  ValidatorTableRenderer,
  GeographicStatsRenderer,
}
