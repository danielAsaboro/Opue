'use client';

import { Sparklines, SparklinesLine } from 'react-sparklines';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineCardProps {
    title: string;
    value: string;
    change: number;
    data: number[];
    icon?: React.ReactNode;
    color?: string;
}

export function SparklineCard({ title, value, change, data, icon, color = '#3b82f6' }: SparklineCardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                            <span
                                className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}
                            >
                                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {Math.abs(change)}%
                            </span>
                        </div>
                    </div>
                    {icon && (
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                    )}
                </div>
                <div className="h-12">
                    <Sparklines data={data} width={200} height={48}>
                        <SparklinesLine color={color} style={{ strokeWidth: 2, fill: 'none' }} />
                    </Sparklines>
                </div>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
    );
}
