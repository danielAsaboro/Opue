'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react'
import type { PNode } from '@/types/pnode'
import { getExportService } from '@/services/export.service'
import type { ExportOptions } from '@/services/export.service'

interface ExportDialogProps {
  pnodes: PNode[]
  trigger?: React.ReactNode
  className?: string
}

export function ExportDialog({ pnodes, trigger, className = '' }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeMetadata: true,
    filters: {},
  })

  const exportService = getExportService()
  const supportedFormats = exportService.getSupportedFormats()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportService.exportPNodes(pnodes, options)
      setOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      // Could show error toast here
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'json':
        return <FileJson className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const selectedFormat = supportedFormats.find((f) => f.value === options.format)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export pNode Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportOptions['format']) => setOptions((prev) => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(format.value)}
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFormat && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {getFormatIcon(selectedFormat.value)}
                  <span className="font-medium">{selectedFormat.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedFormat.description}</p>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Filters (Optional)</Label>

            {/* Performance Score Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Performance Score Range</Label>
              <Slider
                value={[options.filters?.minPerformance || 0, options.filters?.maxPerformance || 100]}
                onValueChange={([min, max]) =>
                  setOptions((prev) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      minPerformance: min,
                      maxPerformance: max,
                    },
                  }))
                }
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{options.filters?.minPerformance || 0}</span>
                <span>{options.filters?.maxPerformance || 100}</span>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Status Filter</Label>
              <div className="flex gap-2">
                {['online', 'offline', 'delinquent'].map((status) => (
                  <label key={status} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={options.filters?.status?.includes(status) || false}
                      onCheckedChange={(checked) => {
                        const currentStatus = options.filters?.status || []
                        const newStatus = checked
                          ? [...currentStatus, status]
                          : currentStatus.filter((s) => s !== status)
                        setOptions((prev) => ({
                          ...prev,
                          filters: { ...prev.filters, status: newStatus },
                        }))
                      }}
                    />
                    <Badge variant="outline" className="capitalize">
                      {status}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Options</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeMetadata: checked as boolean }))}
              />
              <Label htmlFor="include-metadata" className="text-sm">
                Include export metadata (timestamp, filters, etc.)
              </Label>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="text-sm space-y-1">
              <div>
                Format: <Badge variant="secondary">{options.format.toUpperCase()}</Badge>
              </div>
              <div>
                Records: <span className="font-medium">{pnodes.length}</span> pNodes
              </div>
              {options.filters?.minPerformance && (
                <div>
                  Min Performance: <span className="font-medium">{options.filters.minPerformance}</span>
                </div>
              )}
              {options.filters?.status && options.filters.status.length > 0 && (
                <div>
                  Status Filter: <span className="font-medium">{options.filters.status.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {pnodes.length} Records
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


