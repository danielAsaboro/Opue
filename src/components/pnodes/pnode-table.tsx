'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes, formatRelativeTime, truncatePublicKey, formatPercentage } from '@/lib/format';
import Link from 'next/link';
import type { PNode } from '@/types/pnode';

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

interface PNodeTableProps {
    pnodes: PNode[];
    isLoading?: boolean;
}

export function PNodeTable({ pnodes, isLoading }: PNodeTableProps) {
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
                        <TableHead>pNode ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Storage Capacity</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Uptime</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Last Seen</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pnodes.map((pnode: PNode) => (
                        <TableRow key={pnode.id} className="hover:bg-accent/50 cursor-pointer">
                            <TableCell className="font-mono text-sm">
                                <Link href={`/pnodes/${pnode.id}`} className="hover:underline">
                                    {truncatePublicKey(pnode.id, 6, 6)}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(pnode.status)}>
                                    {pnode.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatBytes(pnode.storage.capacityBytes)}</TableCell>
                            <TableCell>{formatPercentage(pnode.storage.utilization)}</TableCell>
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
                                </div>
                            </TableCell>
                            <TableCell>{formatPercentage(pnode.performance.uptime)}</TableCell>
                            <TableCell>{pnode.location || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatRelativeTime(pnode.lastSeen)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
