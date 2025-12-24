import type { PNode } from '@/types/pnode'
import { formatPercentage } from '@/lib/format'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface AutoTableOptions {
  startY?: number
  head?: string[][]
  body?: (string | number)[][]
  theme?: 'striped' | 'grid' | 'plain'
  headStyles?: { fillColor?: number[] }
  styles?: { fontSize?: number }
  columnStyles?: Record<number, { cellWidth?: number }>
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
    previousAutoTable: { finalY: number }
  }
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  includeCharts?: boolean
  includeMetadata?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: {
    minPerformance?: number
    maxPerformance?: number
    status?: string[]
    location?: string[]
  }
}

interface NetworkStats {
  totalPNodes: number
  onlinePNodes: number
  offlinePNodes: number
  totalStorage: number
  averagePerformance: number
  averageUptime: number
  locations: number
}

export interface ExportData {
  pnodes: PNode[]
  networkStats: NetworkStats
  exportMetadata: {
    timestamp: Date
    totalRecords: number
    filters: ExportOptions['filters']
    version: string
  }
}

export class ExportService {
  /**
   * Export pNode data in the specified format
   */
  async exportPNodes(pnodes: PNode[], options: ExportOptions): Promise<void> {
    const filteredPNodes = this.applyFilters(pnodes, options.filters)
    const exportData: ExportData = {
      pnodes: filteredPNodes,
      networkStats: this.calculateNetworkStats(filteredPNodes),
      exportMetadata: {
        timestamp: new Date(),
        totalRecords: filteredPNodes.length,
        filters: options.filters,
        version: '1.0.0',
      },
    }

    switch (options.format) {
      case 'csv':
        this.downloadCSV(exportData)
        break
      case 'json':
        this.downloadJSON(exportData)
        break
      case 'pdf':
        await this.downloadPDF(exportData, options)
        break
    }
  }

  /**
   * Apply filters to pNode data
   */
  private applyFilters(pnodes: PNode[], filters?: ExportOptions['filters']): PNode[] {
    if (!filters) return pnodes

    return pnodes.filter((pnode) => {
      if (filters.minPerformance && pnode.performanceScore < filters.minPerformance) return false
      if (filters.maxPerformance && pnode.performanceScore > filters.maxPerformance) return false
      if (filters.status && filters.status.length > 0 && !filters.status.includes(pnode.status)) return false
      if (filters.location && filters.location.length > 0 && !filters.location.includes(pnode.location || ''))
        return false
      return true
    })
  }

  /**
   * Calculate network statistics for export
   */
  private calculateNetworkStats(pnodes: PNode[]) {
    const totalStorage = pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0)
    const avgPerformance = pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length || 0
    const onlineCount = pnodes.filter((p) => p.status === 'online').length

    return {
      totalPNodes: pnodes.length,
      onlinePNodes: onlineCount,
      offlinePNodes: pnodes.length - onlineCount,
      totalStorage,
      averagePerformance: Math.round(avgPerformance * 100) / 100,
      averageUptime: Math.round(pnodes.reduce((sum, p) => sum + p.performance.uptime, 0) / pnodes.length) || 0,
      locations: [...new Set(pnodes.map((p) => p.location).filter(Boolean))].length,
    }
  }

  /**
   * Download data as CSV
   */
  private downloadCSV(data: ExportData): void {
    const headers = [
      'ID',
      'Status',
      'Performance Score',
      'Storage Capacity (TB)',
      'Storage Used (TB)',
      'Storage Utilization (%)',
      'Uptime (%)',
      'Location',
      'Version',
      'Last Seen',
      'Gossip Endpoint',
      'RPC Endpoint',
    ]

    const rows = data.pnodes.map((pnode) => [
      pnode.id,
      pnode.status,
      pnode.performanceScore,
      (pnode.storage.capacityBytes / 1024 ** 4).toFixed(2), // TB
      (pnode.storage.usedBytes / 1024 ** 4).toFixed(2), // TB
      formatPercentage(pnode.storage.utilization),
      Math.round(pnode.performance.uptime),
      pnode.location || 'Unknown',
      pnode.version,
      pnode.lastSeen.toISOString(),
      pnode.gossipEndpoint,
      pnode.rpcEndpoint || 'N/A',
    ])

    // Add network stats as summary
    rows.unshift([])
    rows.unshift(['NETWORK SUMMARY'])
    rows.unshift(['Total pNodes', data.networkStats.totalPNodes])
    rows.unshift(['Online pNodes', data.networkStats.onlinePNodes])
    rows.unshift(['Total Storage (TB)', (data.networkStats.totalStorage / 1024 ** 4).toFixed(2)])
    rows.unshift(['Average Performance', data.networkStats.averagePerformance])
    rows.unshift(['Average Uptime (%)', data.networkStats.averageUptime])
    rows.unshift(['Unique Locations', data.networkStats.locations])
    rows.unshift([])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(',')).join('\n')

    this.downloadFile(csvContent, 'xandeum-pnodes-export.csv', 'text/csv')
  }

  /**
   * Download data as JSON
   */
  private downloadJSON(data: ExportData): void {
    const jsonContent = JSON.stringify(data, null, 2)
    this.downloadFile(jsonContent, 'xandeum-pnodes-export.json', 'application/json')
  }

  /**
   * Download data as PDF report
   */
  private async downloadPDF(data: ExportData, options: ExportOptions): Promise<void> {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.text('Xandeum pNode Analytics Report', 20, 20)

    // Metadata
    doc.setFontSize(10)
    doc.text(`Generated: ${data.exportMetadata.timestamp.toLocaleString()}`, 20, 35)
    doc.text(`Total Records: ${data.exportMetadata.totalRecords}`, 20, 42)
    doc.text(`Version: ${data.exportMetadata.version}`, 20, 49)

    // Network Summary
    doc.setFontSize(14)
    doc.text('Network Summary', 20, 65)

    const summaryData = [
      ['Total pNodes', data.networkStats.totalPNodes.toString()],
      ['Online pNodes', data.networkStats.onlinePNodes.toString()],
      ['Offline pNodes', data.networkStats.offlinePNodes.toString()],
      ['Total Storage', `${(data.networkStats.totalStorage / 1024 ** 4).toFixed(2)} TB`],
      ['Average Performance', data.networkStats.averagePerformance.toString()],
      ['Average Uptime', `${data.networkStats.averageUptime}%`],
      ['Unique Locations', data.networkStats.locations.toString()],
    ]

    doc.autoTable({
      startY: 70,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    })

    // pNode Details Table
    if (doc.previousAutoTable.finalY + 20 > doc.internal.pageSize.height - 60) {
      doc.addPage()
    }

    doc.setFontSize(14)
    doc.text('pNode Details', 20, doc.previousAutoTable.finalY + 20)

    const tableData = data.pnodes.map((pnode) => [
      pnode.id.slice(0, 8) + '...',
      pnode.status,
      pnode.performanceScore.toString(),
      `${(pnode.storage.capacityBytes / 1024 ** 4).toFixed(2)} TB`,
      `${formatPercentage(pnode.storage.utilization)}`,
      `${Math.round(pnode.performance.uptime)}%`,
      pnode.location || 'Unknown',
    ])

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 25,
      head: [['ID', 'Status', 'Score', 'Capacity', 'Utilization', 'Uptime', 'Location']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15 },
        6: { cellWidth: 25 },
      },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Xandeum pNode Analytics - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
    }

    doc.save('xandeum-pnodes-report.pdf')
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Export network analytics report
   */
  async exportNetworkReport(networkData: Record<string, unknown>, options: ExportOptions): Promise<void> {
    const reportData = {
      networkAnalytics: networkData,
      exportMetadata: {
        timestamp: new Date(),
        reportType: 'network-analytics',
        version: '1.0.0',
      },
    }

    switch (options.format) {
      case 'json':
        this.downloadFile(JSON.stringify(reportData, null, 2), 'xandeum-network-analytics.json', 'application/json')
        break
      case 'pdf':
        await this.createNetworkPDFReport(reportData)
        break
    }
  }

  /**
   * Create detailed network PDF report
   */
  private async createNetworkPDFReport(_data: Record<string, unknown>): Promise<void> {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Xandeum Network Analytics Report', 20, 20)

    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35)

    // Add more detailed network analytics content here
    doc.save('xandeum-network-analytics-report.pdf')
  }

  /**
   * Get available export formats
   */
  getSupportedFormats(): { value: ExportOptions['format']; label: string; description: string }[] {
    return [
      {
        value: 'csv',
        label: 'CSV',
        description: 'Comma-separated values for spreadsheet analysis',
      },
      {
        value: 'json',
        label: 'JSON',
        description: 'Structured data for API integration and developers',
      },
      {
        value: 'pdf',
        label: 'PDF Report',
        description: 'Formatted report with charts and summaries',
      },
    ]
  }
}

// Singleton instance
let exportService: ExportService | null = null

export function getExportService(): ExportService {
  if (!exportService) {
    exportService = new ExportService()
  }
  return exportService
}











