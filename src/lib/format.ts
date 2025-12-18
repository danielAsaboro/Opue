/**
 * Utility functions for the Xandeum pNode Analytics Platform
 */

/**
 * Format bytes to human-readable storage size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | Date | string): string {
    let date: Date;
    if (typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        date = timestamp;
    }

    // Validate date
    if (isNaN(date.getTime())) {
        return 'Unknown';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: number | Date | string): string {
    let date: Date;
    if (typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        date = timestamp;
    }

    if (isNaN(date.getTime())) {
        return 'Unknown';
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format percentage with specified decimals
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format utilization percentage with smart handling of very small values
 * Handles the case where storage utilization is extremely small (e.g., 34 bytes / 15 TB)
 */
export function formatUtilization(value: number): string {
    if (value === 0) return '0%';
    if (value >= 0.01) return `${value.toFixed(2)}%`;
    if (value >= 0.0001) return `${value.toFixed(4)}%`;
    // For very small non-zero values, show "< 0.0001%"
    return '< 0.0001%';
}

/**
 * Format duration in seconds to human-readable string (e.g., "3d 9h")
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.floor(seconds)}s`;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Truncate a public key for display
 */
export function truncatePublicKey(publicKey: string, startChars: number = 4, endChars: number = 4): string {
    if (publicKey.length <= startChars + endChars) return publicKey;
    return `${publicKey.slice(0, startChars)}...${publicKey.slice(-endChars)}`;
}

/**
 * Get status color class based on pNode status
 */
export function getStatusColor(status: 'online' | 'offline' | 'delinquent'): string {
    switch (status) {
        case 'online':
            return 'text-green-600 dark:text-green-400';
        case 'offline':
            return 'text-red-600 dark:text-red-400';
        case 'delinquent':
            return 'text-amber-600 dark:text-amber-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

/**
 * Get performance score color based on value
 */
export function getPerformanceColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
