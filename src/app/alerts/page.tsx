'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    Info,
    AlertCircle,
    Plus,
    Settings,
    Activity,
    HardDrive,
    Clock,
    Zap,
    Filter,
    Check,
    X,
} from 'lucide-react';
import { useAlerts, useAlertRules, useCreateAlertRule, useResolveAlert } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Severity = 'all' | 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

const severityConfig = {
    CRITICAL: {
        icon: AlertCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'Critical',
    },
    WARNING: {
        icon: AlertTriangle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'Warning',
    },
    INFO: {
        icon: Info,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        label: 'Info',
    },
    SUCCESS: {
        icon: CheckCircle,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        label: 'Success',
    },
};

const metricOptions = [
    { value: 'healthScore', label: 'Health Score', icon: Activity },
    { value: 'totalPNodes', label: 'Total pNodes', icon: HardDrive },
    { value: 'avgLatency', label: 'Avg Latency', icon: Clock },
    { value: 'avgUptime', label: 'Avg Uptime', icon: Zap },
    { value: 'avgUtilization', label: 'Avg Utilization', icon: HardDrive },
    { value: 'offlinePercent', label: 'Offline %', icon: AlertTriangle },
];

const operatorOptions = [
    { value: '<', label: 'Less than' },
    { value: '>', label: 'Greater than' },
    { value: '<=', label: 'Less than or equal' },
    { value: '>=', label: 'Greater than or equal' },
    { value: '==', label: 'Equal to' },
];

export default function AlertsPage() {
    const [severityFilter, setSeverityFilter] = useState<Severity>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');

    const { data: alerts, isLoading: loadingAlerts } = useAlerts({
        limit: 100,
        unresolved: severityFilter !== 'all' ? undefined : false,
    });
    const { data: rules, isLoading: loadingRules } = useAlertRules();
    const resolveAlert = useResolveAlert();

    const filteredAlerts = alerts?.filter(
        (a) => severityFilter === 'all' || a.severity === severityFilter
    );

    const unresolvedCount = alerts?.filter((a) => !a.resolved).length || 0;
    const criticalCount = alerts?.filter((a) => a.severity === 'CRITICAL' && !a.resolved).length || 0;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 p-3 text-amber-400">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-white">
                                            Alerts & Monitoring
                                        </h1>
                                        <p className="text-gray-400">
                                            Real-time alerts and custom monitoring rules
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-600 hover:to-purple-700"
                            >
                                <Plus className="h-4 w-4" />
                                Create Alert Rule
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'rounded-xl border p-5',
                                criticalCount > 0
                                    ? 'border-red-500/30 bg-red-500/10'
                                    : 'border-white/10 bg-white/5'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <AlertCircle className={cn('h-5 w-5', criticalCount > 0 ? 'text-red-400' : 'text-gray-500')} />
                                <span className="text-xs text-gray-500">Critical</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-white">{criticalCount}</div>
                            <div className="text-sm text-gray-400">Unresolved</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-xl border border-white/10 bg-white/5 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <Bell className="h-5 w-5 text-amber-400" />
                                <span className="text-xs text-gray-500">Total</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-white">{unresolvedCount}</div>
                            <div className="text-sm text-gray-400">Active Alerts</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-xl border border-white/10 bg-white/5 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <Settings className="h-5 w-5 text-purple-400" />
                                <span className="text-xs text-gray-500">Config</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-white">{rules?.length || 0}</div>
                            <div className="text-sm text-gray-400">Alert Rules</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span className="text-xs text-gray-500">Resolved</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold text-white">
                                {(alerts?.length || 0) - unresolvedCount}
                            </div>
                            <div className="text-sm text-gray-400">Today</div>
                        </motion.div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex items-center gap-4 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={cn(
                                'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                                activeTab === 'alerts'
                                    ? 'border-purple-500 text-purple-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            )}
                        >
                            Alerts ({filteredAlerts?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={cn(
                                'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                                activeTab === 'rules'
                                    ? 'border-purple-500 text-purple-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            )}
                        >
                            Rules ({rules?.length || 0})
                        </button>
                    </div>

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <>
                            {/* Severity Filter */}
                            <div className="mb-6 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
                                    {(['all', 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'] as Severity[]).map((sev) => (
                                        <button
                                            key={sev}
                                            onClick={() => setSeverityFilter(sev)}
                                            className={cn(
                                                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                                                severityFilter === sev
                                                    ? sev === 'all'
                                                        ? 'bg-purple-500 text-white'
                                                        : `${severityConfig[sev as keyof typeof severityConfig].bg} ${severityConfig[sev as keyof typeof severityConfig].color}`
                                                    : 'text-gray-400 hover:text-white'
                                            )}
                                        >
                                            {sev === 'all' ? 'All' : severityConfig[sev as keyof typeof severityConfig].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alerts List */}
                            <div className="space-y-3">
                                {loadingAlerts ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
                                    ))
                                ) : filteredAlerts?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
                                        <CheckCircle className="mb-4 h-12 w-12 text-emerald-400" />
                                        <h3 className="text-lg font-medium text-gray-200">All Clear!</h3>
                                        <p className="text-gray-500">No alerts matching your filter</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {filteredAlerts?.map((alert) => {
                                            const config = severityConfig[alert.severity];
                                            const Icon = config.icon;

                                            return (
                                                <motion.div
                                                    key={alert.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    className={cn(
                                                        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                                                        alert.resolved
                                                            ? 'border-white/5 bg-white/[0.02] opacity-60'
                                                            : config.border,
                                                        config.bg
                                                    )}
                                                >
                                                    <div className={cn('rounded-lg p-2', config.bg)}>
                                                        <Icon className={cn('h-5 w-5', config.color)} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn('text-sm font-medium', config.color)}>
                                                                {config.label}
                                                            </span>
                                                            {alert.resolved && (
                                                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                                                                    Resolved
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-200">{alert.message}</p>
                                                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                            <span>{format(new Date(alert.timestamp), 'MMM d, HH:mm')}</span>
                                                            <span>Rule: {alert.rule.name}</span>
                                                            {alert.pnode && (
                                                                <span>pNode: {alert.pnode.pubkey.slice(0, 8)}...</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!alert.resolved && (
                                                        <button
                                                            onClick={() => resolveAlert.mutate(alert.id)}
                                                            disabled={resolveAlert.isPending}
                                                            className="rounded-lg bg-white/10 p-2 text-gray-400 transition-colors hover:bg-white/20 hover:text-white"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </>
                    )}

                    {/* Rules Tab */}
                    {activeTab === 'rules' && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {loadingRules ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="h-40 animate-pulse rounded-lg bg-white/5" />
                                ))
                            ) : rules?.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
                                    <Settings className="mb-4 h-12 w-12 text-gray-500" />
                                    <h3 className="text-lg font-medium text-gray-200">No Alert Rules</h3>
                                    <p className="mb-4 text-gray-500">Create your first alert rule to get started</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Rule
                                    </button>
                                </div>
                            ) : (
                                rules?.map((rule) => (
                                    <motion.div
                                        key={rule.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-xl border border-white/10 bg-white/5 p-5"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'h-2 w-2 rounded-full',
                                                        rule.enabled ? 'bg-emerald-400' : 'bg-gray-500'
                                                    )}
                                                />
                                                <h3 className="font-medium text-gray-200">{rule.name}</h3>
                                            </div>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-xs',
                                                    rule.scope === 'NETWORK'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-purple-500/20 text-purple-400'
                                                )}
                                            >
                                                {rule.scope}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-400">
                                            {rule.metric} {rule.operator} {rule.threshold}
                                        </p>

                                        {rule.description && (
                                            <p className="mt-1 text-xs text-gray-500">{rule.description}</p>
                                        )}

                                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                                            <span className="text-xs text-gray-500">
                                                {rule.alerts?.length || 0} triggered
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Rule Modal */}
            <CreateRuleModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
    );
}

function CreateRuleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [metric, setMetric] = useState('healthScore');
    const [operator, setOperator] = useState('<');
    const [threshold, setThreshold] = useState('70');

    const createRule = useCreateAlertRule();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createRule.mutateAsync({
                name,
                description: description || undefined,
                metric,
                operator: operator as '<' | '>' | '==' | '<=' | '>=',
                threshold: parseFloat(threshold),
            });
            onClose();
            setName('');
            setDescription('');
            setMetric('healthScore');
            setOperator('<');
            setThreshold('70');
        } catch (error) {
            console.error('Failed to create rule:', error);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Create Alert Rule</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">Rule Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Low Health Alert"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">Metric</label>
                            <select
                                value={metric}
                                onChange={(e) => setMetric(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                {metricOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">Condition</label>
                            <select
                                value={operator}
                                onChange={(e) => setOperator(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                                {operatorOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">Threshold</label>
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createRule.isPending}
                            className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
                        >
                            {createRule.isPending ? 'Creating...' : 'Create Rule'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
