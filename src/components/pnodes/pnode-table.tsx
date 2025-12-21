'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes, formatRelativeTime, truncatePublicKey, formatPercentage } from '@/lib/format';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PNode } from '@/types/pnode';

type SortField = 'id' | 'status' | 'storage' | 'utilization' | 'performance' | 'uptime' | 'location' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

function getStatusBadgeVariant(status: string): 'success' | 'danger' | 'warning' {
    switch (status) {
        case 'online':
            return 'success';
        case 'offline':
            return 'danger';
        case 'delinquent':
            return 'warning';
        default:
            return 'warning';
    }
}

function getPerformanceBadgeVariant(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
}

// Helper to get status priority for sorting
function getStatusPriority(status: string): number {
    switch (status) {
        case 'online': return 0;
        case 'delinquent': return 1;
        case 'offline': return 2;
        default: return 3;
    }
}

interface PNodeTableProps {
    pnodes: PNode[];
    isLoading?: boolean;
    onSelectPNode?: (id: string) => void;
}

interface SortableHeaderProps {
    field: SortField;
    currentSort: SortField;
    currentDirection: SortDirection;
    onSort: (field: SortField) => void;
    children: React.ReactNode;
}

function SortableHeader({ field, currentSort, currentDirection, onSort, children }: SortableHeaderProps) {
    const isActive = currentSort === field;

    return (
        <TableHead
            className="cursor-pointer select-none hover:bg-accent/50 transition-colors"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                {isActive ? (
                    currentDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-30" />
                )}
            </div>
        </TableHead>
    );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function PNodeTable({ pnodes, isLoading, onSelectPNode }: PNodeTableProps) {
    const [sortField, setSortField] = useState<SortField>('performance');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to desc for numeric fields, asc for text
            setSortField(field);
            setSortDirection(['id', 'location', 'status'].includes(field) ? 'asc' : 'desc');
        }
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value, 10));
        setCurrentPage(1);
    };

    const sortedPNodes = useMemo(() => {
        if (!pnodes) return [];

        return [...pnodes].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'id':
                    comparison = a.id.localeCompare(b.id);
                    break;
                case 'status':
                    comparison = getStatusPriority(a.status) - getStatusPriority(b.status);
                    break;
                case 'storage':
                    comparison = a.storage.capacityBytes - b.storage.capacityBytes;
                    break;
                case 'utilization':
                    comparison = a.storage.utilization - b.storage.utilization;
                    break;
                case 'performance':
                    comparison = a.performanceScore - b.performanceScore;
                    break;
                case 'uptime':
                    comparison = a.performance.uptime - b.performance.uptime;
                    break;
                case 'location':
                    comparison = (a.location || 'Unknown').localeCompare(b.location || 'Unknown');
                    break;
                case 'lastSeen':
                    comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [pnodes, sortField, sortDirection]);

    // Pagination calculations
    const totalItems = sortedPNodes.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedPNodes = useMemo(() =>
        sortedPNodes.slice(startIndex, endIndex),
        [sortedPNodes, startIndex, endIndex]
    );

    // Ensure current page is valid when data changes
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    if (isLoading) {
        return (
            <div className="border rounded-lg">
                <div className="p-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 py-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!pnodes || pnodes.length === 0) {
        return (
            <div className="border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No pNodes found</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHeader field="id" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            pNode ID
                        </SortableHeader>
                        <SortableHeader field="status" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Status
                        </SortableHeader>
                        <SortableHeader field="storage" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Storage
                        </SortableHeader>
                        <SortableHeader field="utilization" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Utilization
                        </SortableHeader>
                        <SortableHeader field="performance" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Performance
                        </SortableHeader>
                        <SortableHeader field="uptime" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Uptime
                        </SortableHeader>
                        <SortableHeader field="location" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Location
                        </SortableHeader>
                        <SortableHeader field="lastSeen" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort}>
                            Last Seen
                        </SortableHeader>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPNodes.map((pnode: PNode) => (
                        <TableRow
                            key={pnode.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => onSelectPNode?.(pnode.id)}
                        >
                            <TableCell className="font-mono text-sm">
                                {truncatePublicKey(pnode.id, 6, 6)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant={getStatusBadgeVariant(pnode.status)}>
                                        {pnode.status}
                                    </Badge>
                                    {pnode.isPublic && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            Public
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {pnode.storage.isEstimated ? (
                                    <span className="text-muted-foreground">--</span>
                                ) : (
                                    <div className="flex flex-col">
                                        <span>{formatBytes(pnode.storage.capacityBytes)}</span>
                                        {pnode.storage.usedBytes > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {formatBytes(pnode.storage.usedBytes)} used
                                            </span>
                                        )}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {pnode.storage.isEstimated ? (
                                    <span className="text-muted-foreground">--</span>
                                ) : (
                                    <span className={pnode.storage.utilization > 80 ? 'text-amber-600' : ''}>
                                        {formatPercentage(pnode.storage.utilization, 4)}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <span>{pnode.performanceScore}/100</span>
                                    <Badge variant={getPerformanceBadgeVariant(pnode.performanceScore)}>
                                        {pnode.performanceScore >= 80
                                            ? 'High'
                                            : pnode.performanceScore >= 60
                                                ? 'Med'
                                                : 'Low'}
                                    </Badge>
                                    {pnode.performance.isEstimated && (
                                        <span className="text-xs text-muted-foreground" title="Estimated value">*</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {formatPercentage(pnode.performance.uptime)}
                                {pnode.performance.isEstimated && (
                                    <span className="text-xs text-muted-foreground" title="Estimated value">*</span>
                                )}
                            </TableCell>
                            <TableCell>{pnode.location || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatRelativeTime(pnode.lastSeen)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing {startIndex + 1}-{endIndex} of {totalItems} pNodes</span>
                    {pnodes.some(p => p.performance.isEstimated || p.storage.isEstimated) && (
                        <span className="ml-4">* Estimated values</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
