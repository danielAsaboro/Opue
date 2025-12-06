'use client';

import { AlertCircle, RefreshCw, ExternalLink, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ErrorDisplayProps {
    title?: string;
    error: Error;
    onRetry?: () => void;
}

export function ErrorDisplay({ title = 'Connection Error', error, onRetry }: ErrorDisplayProps) {
    const isPRPCError = error.message.includes('pRPC') || error.message.includes('endpoint');

    return (
        <Card className="border-red-500/50 bg-red-50/5">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-500/10">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <CardTitle className="text-red-500">{title}</CardTitle>
                        <CardDescription className="text-red-400/80">
                            Unable to fetch pNode data from the network
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-sm font-mono text-red-400 break-all">
                        {error.message}
                    </p>
                </div>

                {isPRPCError && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            The Xandeum pRPC endpoints are currently unreachable. This could be due to:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <Server className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>pNode network endpoints are temporarily unavailable</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Network connectivity issues</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>API endpoints may have changed</span>
                            </li>
                        </ul>
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    {onRetry && (
                        <Button onClick={onRetry} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry Connection
                        </Button>
                    )}
                    <Button variant="ghost" asChild>
                        <a href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Xandeum Discord
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface FullPageErrorProps {
    error: Error;
    onRetry?: () => void;
}

export function FullPageError({ error, onRetry }: FullPageErrorProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <ErrorDisplay
                    title="Failed to Connect to Xandeum Network"
                    error={error}
                    onRetry={onRetry}
                />
            </div>
        </div>
    );
}
