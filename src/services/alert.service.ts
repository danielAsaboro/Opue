/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Prisma client types need to be regenerated with database connection
import { prisma } from '@/lib/prisma';

/**
 * AlertService - User-configurable alerting and notification system
 * 
 * Features:
 * - Custom alert rules
 * - Threshold-based alerting
 * - Cooldown management
 * - Email/webhook notifications (TODO: implement)
 */
export class AlertService {
    /**
     * Create a new alert rule
     */
    async createRule(rule: {
        name: string;
        description?: string;
        metric: string;
        operator: '<' | '>' | '==' | '<=' | '>=';
        threshold: number;
        scope?: 'NETWORK' | 'PNODE';
        pnodeFilter?: string;
        notifyEmail?: string;
        notifyWebhook?: string;
        cooldownMinutes?: number;
    }) {
        return prisma.alertRule.create({
            data: {
                name: rule.name,
                description: rule.description,
                metric: rule.metric,
                operator: rule.operator,
                threshold: rule.threshold,
                scope: rule.scope || 'NETWORK',
                pnodeFilter: rule.pnodeFilter,
                notifyEmail: rule.notifyEmail,
                notifyWebhook: rule.notifyWebhook,
                cooldownMinutes: rule.cooldownMinutes || 15,
            },
        });
    }

    /**
     * Get all alert rules
     */
    async getRules(includeDisabled: boolean = false) {
        return prisma.alertRule.findMany({
            where: includeDisabled ? {} : { enabled: true },
            include: {
                alerts: {
                    orderBy: { timestamp: 'desc' },
                    take: 5,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Update an alert rule
     */
    async updateRule(
        id: string,
        updates: {
            name?: string;
            description?: string;
            enabled?: boolean;
            metric?: string;
            operator?: string;
            threshold?: number;
            cooldownMinutes?: number;
            notifyEmail?: string;
            notifyWebhook?: string;
        }
    ) {
        return prisma.alertRule.update({
            where: { id },
            data: updates,
        });
    }

    /**
     * Delete an alert rule
     */
    async deleteRule(id: string) {
        return prisma.alertRule.delete({
            where: { id },
        });
    }

    /**
     * Evaluate all active rules against current metrics
     */
    async evaluateRules(metrics: {
        network: {
            totalPNodes: number;
            onlinePNodes: number;
            healthScore: number;
            avgLatency: number;
            avgUptime: number;
            avgUtilization: number;
        };
        pnodes?: Array<{
            pubkey: string;
            performanceScore: number;
            uptime: number;
            latency: number;
            utilization: number;
        }>;
    }) {
        const rules = await prisma.alertRule.findMany({
            where: { enabled: true },
        });

        const triggeredAlerts: Array<{
            rule: typeof rules[0];
            value: number;
            pnodePubkey?: string;
        }> = [];

        for (const rule of rules) {
            // Check cooldown
            if (rule.lastTriggered) {
                const cooldownMs = rule.cooldownMinutes * 60 * 1000;
                if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
                    continue;
                }
            }

            if (rule.scope === 'NETWORK') {
                // Evaluate network-level rule
                const value = this.getNetworkMetricValue(rule.metric, metrics.network);
                if (value !== null && this.evaluateCondition(value, rule.operator, rule.threshold)) {
                    triggeredAlerts.push({ rule, value });
                }
            } else if (rule.scope === 'PNODE' && metrics.pnodes) {
                // Evaluate per-pNode rule
                for (const pnode of metrics.pnodes) {
                    // Apply filter if specified
                    if (rule.pnodeFilter && pnode.pubkey !== rule.pnodeFilter) {
                        continue;
                    }

                    const value = this.getPNodeMetricValue(rule.metric, pnode);
                    if (value !== null && this.evaluateCondition(value, rule.operator, rule.threshold)) {
                        triggeredAlerts.push({ rule, value, pnodePubkey: pnode.pubkey });
                    }
                }
            }
        }

        // Create alerts and update rules
        for (const { rule, value, pnodePubkey } of triggeredAlerts) {
            await this.triggerAlert(rule, value, pnodePubkey);
        }

        return triggeredAlerts.length;
    }

    /**
     * Trigger an alert for a rule
     */
    private async triggerAlert(
        rule: { id: string; name: string; metric: string; operator: string; threshold: number; notifyEmail?: string | null; notifyWebhook?: string | null },
        value: number,
        pnodePubkey?: string
    ) {
        const severity = this.determineSeverity(rule.metric, value, rule.threshold);
        const message = this.formatAlertMessage(rule, value, pnodePubkey);

        let pnodeId: string | undefined;
        if (pnodePubkey) {
            const pnode = await prisma.pNode.findUnique({ where: { pubkey: pnodePubkey } });
            pnodeId = pnode?.id;
        }

        // Create alert record
        await prisma.alert.create({
            data: {
                ruleId: rule.id,
                severity,
                message,
                value,
                threshold: rule.threshold,
                pnodeId,
            },
        });

        // Update rule's last triggered time
        await prisma.alertRule.update({
            where: { id: rule.id },
            data: { lastTriggered: new Date() },
        });

        // Send notifications (TODO: implement actual sending)
        if (rule.notifyEmail) {
            console.log(`[Alert] Would send email to ${rule.notifyEmail}: ${message}`);
        }
        if (rule.notifyWebhook) {
            console.log(`[Alert] Would call webhook ${rule.notifyWebhook}`);
            // In production: await this.callWebhook(rule.notifyWebhook, { message, value, severity });
        }
    }

    /**
     * Get recent alerts
     */
    async getAlerts(options: {
        limit?: number;
        unresolved?: boolean;
        severity?: Severity;
        ruleId?: string;
    } = {}) {
        return prisma.alert.findMany({
            where: {
                ...(options.unresolved !== undefined && { resolved: !options.unresolved }),
                ...(options.severity && { severity: options.severity }),
                ...(options.ruleId && { ruleId: options.ruleId }),
            },
            include: {
                rule: {
                    select: { name: true, metric: true },
                },
                pnode: {
                    select: { pubkey: true, location: true },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: options.limit || 50,
        });
    }

    /**
     * Resolve an alert
     */
    async resolveAlert(id: string) {
        return prisma.alert.update({
            where: { id },
            data: { resolved: true, resolvedAt: new Date() },
        });
    }

    /**
     * Resolve all alerts for a rule
     */
    async resolveAllForRule(ruleId: string) {
        return prisma.alert.updateMany({
            where: { ruleId, resolved: false },
            data: { resolved: true, resolvedAt: new Date() },
        });
    }

    // Helper methods
    private getNetworkMetricValue(
        metric: string,
        data: { totalPNodes: number; onlinePNodes: number; healthScore: number; avgLatency: number; avgUptime: number; avgUtilization: number }
    ): number | null {
        const metricMap: Record<string, number> = {
            totalPNodes: data.totalPNodes,
            onlinePNodes: data.onlinePNodes,
            offlinePercent: ((data.totalPNodes - data.onlinePNodes) / data.totalPNodes) * 100,
            healthScore: data.healthScore,
            avgLatency: data.avgLatency,
            avgUptime: data.avgUptime,
            avgUtilization: data.avgUtilization,
        };
        return metricMap[metric] ?? null;
    }

    private getPNodeMetricValue(
        metric: string,
        pnode: { performanceScore: number; uptime: number; latency: number; utilization: number }
    ): number | null {
        const metricMap: Record<string, number> = {
            performanceScore: pnode.performanceScore,
            uptime: pnode.uptime,
            latency: pnode.latency,
            utilization: pnode.utilization,
        };
        return metricMap[metric] ?? null;
    }

    private evaluateCondition(value: number, operator: string, threshold: number): boolean {
        switch (operator) {
            case '<':
                return value < threshold;
            case '>':
                return value > threshold;
            case '==':
                return value === threshold;
            case '<=':
                return value <= threshold;
            case '>=':
                return value >= threshold;
            default:
                return false;
        }
    }

    private determineSeverity(metric: string, value: number, threshold: number): Severity {
        const ratio = Math.abs(value - threshold) / threshold;

        // Critical metrics
        if (['healthScore', 'uptime', 'onlinePNodes'].includes(metric) && value < threshold * 0.5) {
            return 'CRITICAL';
        }
        if (['latency'].includes(metric) && value > threshold * 2) {
            return 'CRITICAL';
        }

        // Warning threshold
        if (ratio > 0.2) {
            return 'WARNING';
        }

        return 'INFO';
    }

    private formatAlertMessage(
        rule: { name: string; metric: string; operator: string; threshold: number },
        value: number,
        pnodePubkey?: string
    ): string {
        const target = pnodePubkey ? `pNode ${pnodePubkey.slice(0, 8)}...` : 'Network';
        return `${rule.name}: ${target} ${rule.metric} is ${value.toFixed(2)} (threshold: ${rule.operator} ${rule.threshold})`;
    }
}

// Export singleton
export const alertService = new AlertService();
