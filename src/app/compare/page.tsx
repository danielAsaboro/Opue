'use client';

import { useState } from 'react';
import { usePNodes } from '@/hooks/usePNodes';
import type { PNode } from '@/types/pnode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatBytes, formatPercentage, truncatePublicKey } from '@/lib/format';

export default function ComparePage() {
    const { data: pnodes } = usePNodes();
    const [selectedPNodes, setSelectedPNodes] = useState<PNode[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPNodes = pnodes?.filter((p) =>
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const addPNode = (pnode: PNode) => {
        if (selectedPNodes.length < 4 && !selectedPNodes.find((p) => p.id === pnode.id)) {
            setSelectedPNodes([...selectedPNodes, pnode]);
        }
    };

    const removePNode = (id: string) => {
        setSelectedPNodes(selectedPNodes.filter((p) => p.id !== id));
    };

    const metrics = [
        { key: 'performanceScore', label: 'Performance Score', format: (v: number) => `${v}/100` },
        { key: 'storage.capacityBytes', label: 'Storage Capacity', format: formatBytes },
        { key: 'storage.utilization', label: 'Utilization', format: formatPercentage },
        { key: 'performance.uptime', label: 'Uptime', format: formatPercentage },
        { key: 'performance.avgResponseTime', label: 'Avg Response Time', format: (v: number) => `${v}ms` },
        { key: 'performance.successRate', label: 'Success Rate', format: formatPercentage },
    ];

    const getValue = (pnode: PNode, key: string): number => {
        const keys = key.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = pnode;
        for (const k of keys) {
            value = value[k];
        }
        return value as number;
    };

    const getComparison = (values: number[], index: number) => {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const current = values[index];

        if (current === max && max !== min) return 'best';
        if (current === min && max !== min) return 'worst';
        return 'neutral';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Compare pNodes</h1>
                <p className="text-muted-foreground mt-2">
                    Select up to 4 pNodes to compare side-by-side
                </p>
            </div>

            {/* Search and Add */}
            {selectedPNodes.length < 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Add pNodes to Compare</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Search by ID or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                            {filteredPNodes?.slice(0, 10).map((pnode) => (
                                <div
                                    key={pnode.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-mono text-sm font-medium">
                                            {truncatePublicKey(pnode.id, 8, 8)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {pnode.location || 'Unknown'} • Performance: {pnode.performanceScore}/100
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => addPNode(pnode)}
                                        disabled={selectedPNodes.find((p) => p.id === pnode.id) !== undefined}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Table */}
            {selectedPNodes.length > 0 && (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Metric</th>
                                        {selectedPNodes.map((pnode) => (
                                            <th key={pnode.id} className="p-4 min-w-[200px]">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-mono text-sm font-medium mb-1">
                                                            {truncatePublicKey(pnode.id, 6, 6)}
                                                        </p>
                                                        <Badge variant={pnode.status === 'online' ? 'success' : 'danger'}>
                                                            {pnode.status}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removePNode(pnode.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric) => {
                                        const values = selectedPNodes.map((p) => getValue(p, metric.key));
                                        return (
                                            <tr key={metric.key} className="border-b hover:bg-accent/50">
                                                <td className="p-4 font-medium text-sm">{metric.label}</td>
                                                {selectedPNodes.map((pnode, index) => {
                                                    const value = getValue(pnode, metric.key);
                                                    const comparison = getComparison(values, index);
                                                    return (
                                                        <td key={pnode.id} className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-sm">
                                                                    {metric.format(value)}
                                                                </span>
                                                                {comparison === 'best' && (
                                                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                )}
                                                                {comparison === 'worst' && (
                                                                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                )}
                                                                {comparison === 'neutral' && values.length > 1 && (
                                                                    <Minus className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedPNodes.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">
                            No pNodes selected. Search and add pNodes above to start comparing.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
