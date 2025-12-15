'use client';

import { usePNodeDetails } from '@/hooks/usePNodes';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { truncatePublicKey, copyToClipboard } from '@/lib/format';
import { Copy, ExternalLink, Globe, MapPin, Building, Clock, Cpu, Network } from 'lucide-react';
import { toast } from 'sonner';

interface PNodeDetailPanelProps {
    pnodeId: string | null;
    open: boolean;
    onClose: () => void;
}

// Country code to flag emoji
function getFlagEmoji(countryCode?: string): string {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function getStatusColor(status: string): { bg: string; text: string; dot: string } {
    switch (status) {
        case 'online':
            return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
        case 'offline':
            return { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
        case 'delinquent':
            return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
        default:
            return { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500' };
    }
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 flex-1">
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
        </div>
    );
}

export function PNodeDetailPanel({ pnodeId, open, onClose }: PNodeDetailPanelProps) {
    const { data: pnode, isLoading, error } = usePNodeDetails(pnodeId || '');

    const handleViewFullDetails = () => {
        if (pnodeId) {
            window.open(`/pnodes/${pnodeId}`, '_blank');
        }
    };

    const handleExportHTML = async () => {
        if (!pnode) return;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>pNode ${truncatePublicKey(pnode.id, 8, 8)}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { font-size: 1.5rem; font-family: monospace; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .online { background: #22c55e20; color: #22c55e; }
        .offline { background: #ef444420; color: #ef4444; }
        .section { margin: 24px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        code { font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>${pnode.id}</h1>
    <span class="badge ${pnode.status}">${pnode.status}</span>

    <div class="section">
        <h2>Basic Info</h2>
        <div class="row"><span class="label">Version</span><span>${pnode.version}</span></div>
        <div class="row"><span class="label">Location</span><span>${pnode.network?.city || 'Unknown'}, ${pnode.network?.country || 'Unknown'}</span></div>
        <div class="row"><span class="label">Performance Score</span><span>${pnode.performanceScore}/100</span></div>
    </div>

    <div class="section">
        <h2>Endpoints</h2>
        <div class="row"><span class="label">Gossip</span><code>${pnode.gossipEndpoint}</code></div>
        <div class="row"><span class="label">RPC</span><code>${pnode.rpcEndpoint || 'N/A'}</code></div>
    </div>

    <div class="section">
        <h2>Network</h2>
        <div class="row"><span class="label">IP:Port</span><span>${pnode.network?.ip || 'Unknown'}:${pnode.network?.port || 'Unknown'}</span></div>
        <div class="row"><span class="label">Region</span><span>${pnode.network?.region || 'Unknown'}</span></div>
        <div class="row"><span class="label">ASN</span><span>${pnode.network?.asn || 'Unknown'}</span></div>
    </div>

    <p style="color: #999; font-size: 12px; margin-top: 40px;">Exported from Xandeum pNode Analytics on ${new Date().toLocaleString()}</p>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pnode-${truncatePublicKey(pnode.id, 6, 6)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Exported as HTML');
    };

    const statusColors = pnode ? getStatusColor(pnode.status) : getStatusColor('unknown');
    const flagEmoji = pnode?.network?.countryCode ? getFlagEmoji(pnode.network.countryCode) : '';

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                side="right"
                className="w-[500px] sm:max-w-[500px] flex flex-col p-0 gap-0"
            >
                {isLoading || !pnode ? (
                    <div className="p-6">
                        <LoadingSkeleton />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center flex-1 flex flex-col justify-center">
                        <p className="text-destructive font-medium">Failed to load pNode details</p>
                        <p className="text-sm text-muted-foreground mt-1">Please try again</p>
                        <Button variant="outline" className="mt-4 mx-auto" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Header with colored status bar */}
                        <div className={`px-6 py-4 border-b ${statusColors.bg}`}>
                            <SheetHeader className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${statusColors.dot} animate-pulse`} />
                                        <SheetTitle className="font-mono text-base">
                                            pNode {truncatePublicKey(pnode.id, 6, 6)}
                                        </SheetTitle>
                                    </div>
                                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${statusColors.bg} ${statusColors.text}`}>
                                        {pnode.status}
                                    </span>
                                </div>
                                <SheetDescription className="font-mono text-xs truncate pr-4">
                                    {pnode.id}
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Stats Cards Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Version</div>
                                    <div className="text-sm font-semibold mt-1 truncate">{pnode.version}</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Shred</div>
                                    <div className="text-sm font-semibold mt-1">{pnode.shredVersion || '--'}</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Score</div>
                                    <div className="text-sm font-semibold mt-1">{pnode.performanceScore}/100</div>
                                </div>
                            </div>

                            {/* Endpoints Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Globe className="h-3.5 w-3.5" />
                                    Endpoints
                                </div>
                                <div className="bg-muted/30 rounded-lg divide-y divide-border/50">
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-xs text-muted-foreground w-14">Gossip</span>
                                        <code className="text-xs font-mono flex-1 truncate px-2">{pnode.gossipEndpoint}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-background"
                                            onClick={() => copyToClipboard(pnode.gossipEndpoint).then(s => s && toast.success('Copied'))}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    {pnode.rpcEndpoint && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-xs text-muted-foreground w-14">RPC</span>
                                            <code className="text-xs font-mono flex-1 truncate px-2">{pnode.rpcEndpoint}</code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-background"
                                                onClick={() => copyToClipboard(pnode.rpcEndpoint!).then(s => s && toast.success('Copied'))}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {(pnode.network?.tpu || pnode.tpuEndpoint) && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-xs text-muted-foreground w-14">TPU</span>
                                            <code className="text-xs font-mono flex-1 truncate px-2">{pnode.network?.tpu || pnode.tpuEndpoint}</code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-background"
                                                onClick={() => copyToClipboard(pnode.network?.tpu || pnode.tpuEndpoint || '').then(s => s && toast.success('Copied'))}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Location
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                    {/* Country & City Row */}
                                    <div className="flex items-center gap-3">
                                        {flagEmoji && <span className="text-2xl">{flagEmoji}</span>}
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">
                                                {pnode.network?.country || 'Unknown Country'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {pnode.network?.city || 'Unknown City'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Region & ASN */}
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground">Region</div>
                                            <div className="text-xs font-medium truncate">{pnode.network?.region || pnode.location || '--'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground">ASN</div>
                                            <div className="text-xs font-medium truncate">{pnode.network?.asn || '--'}</div>
                                        </div>
                                    </div>

                                    {/* Organization */}
                                    {pnode.network?.org && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                            <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="text-xs truncate">{pnode.network.org}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Network Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Network className="h-3.5 w-3.5" />
                                    Network
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground">IP Address</div>
                                            <div className="text-xs font-mono font-medium">{pnode.network?.ip || '--'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground">Port</div>
                                            <div className="text-xs font-mono font-medium">{pnode.network?.port || '--'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Seen */}
                            <div className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    Last Seen
                                </span>
                                <span className="font-medium">
                                    {pnode.lastSeen ? new Date(pnode.lastSeen).toLocaleString() : 'Unknown'}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-4 border-t bg-muted/20">
                            <Button
                                onClick={handleViewFullDetails}
                                className="flex-1"
                                size="sm"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                Full Details
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExportHTML}
                                className="flex-1"
                                size="sm"
                            >
                                Export HTML
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
