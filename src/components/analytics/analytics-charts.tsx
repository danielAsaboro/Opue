'use client';

import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    HardDrive,
    AlertTriangle,
    Award,
    Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types - using Record for flexible chart data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartDataPoint = Record<string, any>;

interface TrendCardProps {
    title: string;
    current: number;
    predicted: number;
    trend: 'growing' | 'shrinking' | 'stable' | 'improving' | 'declining';
    unit?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'emerald' | 'blue' | 'purple' | 'amber';
}

interface LeaderboardEntry {
    rank: number;
    pubkey: string;
    location: string | null;
    performanceScore: number;
    uptime: number;
    capacityTB: number;
}

// Color palettes
const CHART_COLORS = {
    primary: '#8b5cf6',    // Purple
    secondary: '#06b6d4',  // Cyan
    tertiary: '#f59e0b',   // Amber
    success: '#10b981',    // Emerald
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    info: '#3b82f6',       // Blue
};

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

// Gradient definitions for charts
const GradientDefs = () => (
    <defs>
        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
        </linearGradient>
    </defs>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-sm">
            <p className="mb-2 text-xs text-gray-400">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                    {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </p>
            ))}
        </div>
    );
};

/**
 * Network Growth Chart
 */
export function NetworkGrowthChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex h-80 items-center justify-center text-gray-500">
                No historical data available yet
            </div>
        );
    }

    const formattedData = data.map((d) => ({
        ...d,
        date: d.date ? format(new Date(d.date), 'MMM d') : '',
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <GradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="pnodes"
                    name="pNodes"
                    stroke={CHART_COLORS.primary}
                    fill="url(#colorPrimary)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="healthScore"
                    name="Health Score"
                    stroke={CHART_COLORS.success}
                    fill="url(#colorSuccess)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

/**
 * Performance Timeline Chart
 */
export function PerformanceTimelineChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex h-80 items-center justify-center text-gray-500">
                No performance data available yet
            </div>
        );
    }

    const formattedData = data.map((d) => ({
        ...d,
        time: d.timestamp ? format(new Date(d.timestamp), 'HH:mm') : '',
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="avgPNodes"
                    name="pNodes"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: CHART_COLORS.primary }}
                />
                <Line
                    type="monotone"
                    dataKey="avgHealthScore"
                    name="Health"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: CHART_COLORS.success }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

/**
 * Storage Capacity Chart
 */
export function StorageCapacityChart({ data, loading }: { data?: ChartDataPoint[]; loading?: boolean }) {
    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex h-80 items-center justify-center text-gray-500">
                No storage data available yet
            </div>
        );
    }

    const formattedData = data.map((d) => ({
        ...d,
        date: d.date ? format(new Date(d.date), 'MMM d') : '',
        capacityPB: (Number(d.capacityTB) || 0) / 1024,
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacityTB" name="Capacity (TB)" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

/**
 * Geographic Distribution Chart
 */
export function GeoDistributionChart({
    data,
    loading,
}: {
    data?: { region: string; count: number; change: number }[];
    loading?: boolean;
}) {
    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex h-80 items-center justify-center text-gray-500">
                No geographic data available yet
            </div>
        );
    }

    return (
        <div className="flex h-80">
            <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        dataKey="count"
                        nameKey="region"
                    >
                        {data.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-1 flex-col justify-center space-y-2 pr-4">
                {data.slice(0, 5).map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="text-sm text-gray-300">{region.region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{region.count}</span>
                            {region.change !== 0 && (
                                <span className={cn('text-xs', region.change > 0 ? 'text-emerald-400' : 'text-red-400')}>
                                    {region.change > 0 ? '+' : ''}{region.change}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Trend Prediction Card
 */
export function TrendCard({ title, current, predicted, trend, unit = '', icon: Icon, color }: TrendCardProps) {
    const colorClasses = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    };

    const iconColors = {
        emerald: 'text-emerald-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400',
        amber: 'text-amber-400',
    };

    const isPositive = trend === 'growing' || trend === 'improving';
    const isNegative = trend === 'shrinking' || trend === 'declining';
    const change = predicted - current;
    const changePercent = current > 0 ? ((change / current) * 100).toFixed(1) : '0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm',
                colorClasses[color]
            )}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className={cn('rounded-lg bg-black/30 p-2', iconColors[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                    {isPositive && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                    {isNegative && <TrendingDown className="h-4 w-4 text-red-400" />}
                    <span className={cn('text-sm font-medium', isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400')}>
                        {changePercent}%
                    </span>
                </div>
            </div>

            <div className="mb-1 text-sm text-gray-400">{title}</div>
            <div className="mb-3 text-2xl font-bold">
                {current.toLocaleString()}{unit}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs text-gray-500">7-day prediction</span>
                <span className="text-sm font-medium text-gray-300">
                    {predicted.toLocaleString()}{unit}
                </span>
            </div>
        </motion.div>
    );
}

/**
 * Leaderboard Component
 */
export function Leaderboard({ data, loading, metric }: { data?: LeaderboardEntry[]; loading?: boolean; metric: string }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
                ))}
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex h-48 items-center justify-center text-gray-500">
                No leaderboard data yet
            </div>
        );
    }

    const getMetricValue = (entry: LeaderboardEntry) => {
        switch (metric) {
            case 'performance':
                return `${entry.performanceScore}`;
            case 'uptime':
                return `${entry.uptime.toFixed(1)}%`;
            case 'capacity':
                return `${entry.capacityTB.toFixed(2)} TB`;
            default:
                return entry.performanceScore;
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'from-amber-400 to-yellow-500';
        if (rank === 2) return 'from-gray-300 to-gray-400';
        if (rank === 3) return 'from-orange-400 to-orange-500';
        return 'from-gray-500 to-gray-600';
    };

    return (
        <div className="space-y-2">
            {data.slice(0, 10).map((entry, index) => (
                <motion.div
                    key={entry.pubkey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                        'flex items-center gap-4 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10',
                        entry.rank <= 3 && 'border-amber-500/20'
                    )}
                >
                    {/* Rank */}
                    <div
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold',
                            getRankColor(entry.rank)
                        )}
                    >
                        {entry.rank <= 3 ? (
                            <Award className="h-4 w-4 text-black" />
                        ) : (
                            <span className="text-white">{entry.rank}</span>
                        )}
                    </div>

                    {/* Node Info */}
                    <div className="flex-1 min-w-0">
                        <div className="truncate font-mono text-sm text-gray-200">
                            {entry.pubkey.slice(0, 8)}...{entry.pubkey.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {entry.location || 'Unknown'}
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                        <div className="font-semibold text-purple-400">
                            {getMetricValue(entry)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{metric}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/**
 * AI Insights Card
 */
export function AIInsightsCard({
    predictions,
    anomalies,
    loading,
}: {
    predictions?: { network?: boolean; pnodes?: { trend: string; predicted7d: number }; capacity?: { trend: string } };
    anomalies?: Array<{ metric: string; severity: string; description: string }>;
    loading?: boolean;
}) {
    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 rounded bg-white/10" />
                <div className="h-20 rounded bg-white/5" />
                <div className="h-20 rounded bg-white/5" />
            </div>
        );
    }

    const insights: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; description: string; type: 'success' | 'warning' | 'info' }> = [];

    // Generate insights from predictions
    if (predictions?.pnodes?.trend === 'growing') {
        insights.push({
            icon: TrendingUp,
            title: 'Network Expansion',
            description: `Network is on track to reach ${predictions.pnodes.predicted7d} pNodes within 7 days`,
            type: 'success',
        });
    }

    if (predictions?.capacity?.trend === 'growing') {
        insights.push({
            icon: HardDrive,
            title: 'Storage Growth',
            description: 'Storage capacity continues to expand at a healthy rate',
            type: 'success',
        });
    }

    // Add anomaly insights
    if (anomalies?.length) {
        const critical = anomalies.filter((a) => a.severity === 'critical');
        if (critical.length > 0) {
            insights.push({
                icon: AlertTriangle,
                title: 'Attention Required',
                description: `${critical.length} critical anomal${critical.length > 1 ? 'ies' : 'y'} detected in network metrics`,
                type: 'warning',
            });
        }
    }

    if (insights.length === 0) {
        insights.push({
            icon: Activity,
            title: 'All Systems Normal',
            description: 'Network is operating within expected parameters',
            type: 'info',
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-gray-200">AI-Powered Insights</h3>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'flex items-start gap-3 rounded-lg border p-4',
                                insight.type === 'success' && 'border-emerald-500/20 bg-emerald-500/5',
                                insight.type === 'warning' && 'border-amber-500/20 bg-amber-500/5',
                                insight.type === 'info' && 'border-blue-500/20 bg-blue-500/5'
                            )}
                        >
                            <div
                                className={cn(
                                    'rounded-full p-2',
                                    insight.type === 'success' && 'bg-emerald-500/20 text-emerald-400',
                                    insight.type === 'warning' && 'bg-amber-500/20 text-amber-400',
                                    insight.type === 'info' && 'bg-blue-500/20 text-blue-400'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-200">{insight.title}</h4>
                                <p className="text-sm text-gray-400">{insight.description}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Section Header
 */
export function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    action,
}: {
    title: string;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-bold text-gray-100">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}

/**
 * Chart Card Wrapper
 */
export function ChartCard({
    title,
    subtitle,
    children,
    className,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 backdrop-blur-sm',
                className
            )}
        >
            <div className="mb-4">
                <h3 className="font-semibold text-gray-200">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    );
}
