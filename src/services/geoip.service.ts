/**
 * GeoIP Service - Lookup geographic location from IP address
 * Uses ip-api.com (free, 45 requests/minute, no API key required)
 */

interface GeoIPResult {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
    org: string;
    as: string;
    location: string; // Simplified region like "US-East"
    error?: string;
}

// Cache to avoid hitting rate limits
const geoipCache: Map<string, GeoIPResult> = new Map();

// Track request timestamps for rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 50; // 50ms between requests (allows ~20 req/sec, well under 45/min limit)

/**
 * Map country/region to simplified location string
 */
function mapToSimpleLocation(country: string, countryCode: string, region: string): string {
    // US regions
    if (countryCode === 'US') {
        const eastStates = ['NY', 'VA', 'FL', 'GA', 'NC', 'SC', 'NJ', 'PA', 'MD', 'MA', 'CT', 'NH', 'ME', 'VT', 'RI', 'DE'];
        const westStates = ['CA', 'WA', 'OR', 'NV', 'AZ', 'CO', 'UT', 'ID', 'MT', 'WY', 'NM', 'HI', 'AK'];
        
        if (eastStates.includes(region)) return 'US-East';
        if (westStates.includes(region)) return 'US-West';
        return 'US-Central';
    }

    // Europe
    const euCountries = ['DE', 'FR', 'NL', 'BE', 'LU', 'AT', 'CH', 'PL', 'CZ', 'SK', 'HU'];
    const euWestCountries = ['GB', 'IE', 'PT', 'ES'];
    const euNorthCountries = ['SE', 'NO', 'FI', 'DK', 'IS', 'EE', 'LV', 'LT'];
    
    if (euCountries.includes(countryCode)) return 'EU-Central';
    if (euWestCountries.includes(countryCode)) return 'EU-West';
    if (euNorthCountries.includes(countryCode)) return 'EU-North';

    // Asia Pacific
    const asiaCountries = ['JP', 'KR', 'SG', 'HK', 'TW', 'MY', 'TH', 'VN', 'PH', 'ID', 'IN', 'AU', 'NZ'];
    if (asiaCountries.includes(countryCode)) return 'Asia-Pacific';

    // South America
    const saCountries = ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UY', 'PY'];
    if (saCountries.includes(countryCode)) return 'South-America';

    // Middle East
    const meCountries = ['AE', 'SA', 'IL', 'TR', 'QA', 'KW', 'BH', 'OM'];
    if (meCountries.includes(countryCode)) return 'Middle-East';

    // Africa
    const afCountries = ['ZA', 'NG', 'EG', 'KE', 'MA'];
    if (afCountries.includes(countryCode)) return 'Africa';

    // Default based on rough country grouping
    return country || 'Unknown';
}

/**
 * Wait for rate limit if needed
 */
async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
}

/**
 * Lookup geographic location for an IP address
 */
export async function lookupGeoIP(ip: string): Promise<GeoIPResult> {
    // Check cache first
    const cached = geoipCache.get(ip);
    if (cached) {
        return cached;
    }

    // Handle private/local IPs
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.') || ip === '127.0.0.1' || ip === 'localhost') {
        const result: GeoIPResult = {
            ip,
            country: 'Private',
            countryCode: 'XX',
            region: '',
            city: 'Local Network',
            lat: 0,
            lon: 0,
            isp: 'Private Network',
            org: 'Private Network',
            as: '',
            location: 'Private',
        };
        geoipCache.set(ip, result);
        return result;
    }

    try {
        // Rate limit
        await waitForRateLimit();

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as`, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'fail') {
            const result: GeoIPResult = {
                ip,
                country: 'Unknown',
                countryCode: 'XX',
                region: '',
                city: '',
                lat: 0,
                lon: 0,
                isp: '',
                org: '',
                as: '',
                location: 'Unknown',
                error: data.message,
            };
            geoipCache.set(ip, result);
            return result;
        }

        const location = mapToSimpleLocation(data.country, data.countryCode, data.region);

        const result: GeoIPResult = {
            ip,
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'XX',
            region: data.region || '',
            city: data.city || '',
            lat: data.lat || 0,
            lon: data.lon || 0,
            isp: data.isp || '',
            org: data.org || '',
            as: data.as || '',
            location,
        };

        // Cache the result
        geoipCache.set(ip, result);

        return result;
    } catch (error) {
        // On error, return a fallback based on IP heuristics
        const result: GeoIPResult = {
            ip,
            country: 'Unknown',
            countryCode: 'XX',
            region: '',
            city: '',
            lat: 0,
            lon: 0,
            isp: '',
            org: '',
            as: '',
            location: fallbackLocationFromIP(ip),
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        // Cache even errors to avoid repeated failures
        geoipCache.set(ip, result);
        return result;
    }
}

/**
 * Fallback location estimation based on IP ranges (when API fails)
 */
function fallbackLocationFromIP(ip: string): string {
    const firstOctet = parseInt(ip.split('.')[0] || '0');

    // Very rough estimation based on IP allocation patterns
    // This is not accurate but provides a fallback
    if (firstOctet >= 1 && firstOctet <= 126) return 'US-East';
    if (firstOctet >= 128 && firstOctet <= 191) return 'EU-Central';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Asia-Pacific';
    return 'Unknown';
}

/**
 * Batch lookup multiple IPs (with rate limiting)
 */
export async function batchLookupGeoIP(ips: string[]): Promise<Map<string, GeoIPResult>> {
    const results = new Map<string, GeoIPResult>();
    
    for (const ip of ips) {
        const result = await lookupGeoIP(ip);
        results.set(ip, result);
    }
    
    return results;
}

/**
 * Get simplified location string for an IP
 */
export async function getLocationForIP(ip: string): Promise<string> {
    const result = await lookupGeoIP(ip);
    return result.location;
}

/**
 * Clear the GeoIP cache (useful for testing)
 */
export function clearGeoIPCache(): void {
    geoipCache.clear();
}

export type { GeoIPResult };













