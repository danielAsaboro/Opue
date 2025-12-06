/**
 * Favorites/Watchlist management using localStorage
 */

const FAVORITES_KEY = 'xandeum-favorites';

export function getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveFavorites(favorites: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(pnodeId: string): boolean {
    const favorites = getFavorites();
    const index = favorites.indexOf(pnodeId);

    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites(favorites);
        return false;
    } else {
        favorites.push(pnodeId);
        saveFavorites(favorites);
        return true;
    }
}

export function isFavorite(pnodeId: string): boolean {
    return getFavorites().includes(pnodeId);
}
