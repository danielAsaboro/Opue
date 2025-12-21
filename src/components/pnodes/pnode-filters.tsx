'use client';

import { useState, useMemo, useEffect } from 'react';
import type { PNode } from '@/types/pnode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface PNodeFiltersProps {
    pnodes: PNode[];
    onFilterChange: (filtered: PNode[]) => void;
}

export function PNodeFilters({ pnodes, onFilterChange }: PNodeFiltersProps) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [minPerformance, setMinPerformance] = useState<number>(0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Extract unique values for filters
    const statusOptions = [
        { label: 'Online', value: 'online' },
        { label: 'Offline', value: 'offline' },
        { label: 'Delinquent', value: 'delinquent' },
    ];

    const locationOptions = useMemo(() => {
        const locations = Array.from(new Set(pnodes.map((p) => p.location || 'Unknown')));
        return locations.map((loc) => ({ label: loc, value: loc }));
    }, [pnodes]);

    const versionOptions = useMemo(() => {
        const versions = Array.from(new Set(pnodes.map((p) => p.version)));
        return versions.map((ver) => ({ label: ver, value: ver }));
    }, [pnodes]);

    // Apply filters
    useEffect(() => {
        let filtered = pnodes;

        // Search filter
        if (search) {
            filtered = filtered.filter(
                (p) =>
                    p.id.toLowerCase().includes(search.toLowerCase()) ||
                    p.gossipEndpoint.toLowerCase().includes(search.toLowerCase()) ||
                    (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Status filter
        if (selectedStatus.length > 0) {
            filtered = filtered.filter((p) => selectedStatus.includes(p.status));
        }

        // Location filter
        if (selectedLocations.length > 0) {
            filtered = filtered.filter((p) => selectedLocations.includes(p.location || 'Unknown'));
        }

        // Version filter
        if (selectedVersions.length > 0) {
            filtered = filtered.filter((p) => selectedVersions.includes(p.version));
        }

        // Performance filter
        if (minPerformance > 0) {
            filtered = filtered.filter((p) => p.performanceScore >= minPerformance);
        }

        onFilterChange(filtered);
    }, [search, selectedStatus, selectedLocations, selectedVersions, minPerformance, pnodes, onFilterChange]);

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus([]);
        setSelectedLocations([]);
        setSelectedVersions([]);
        setMinPerformance(0);
    };

    const hasActiveFilters =
        search ||
        selectedStatus.length > 0 ||
        selectedLocations.length > 0 ||
        selectedVersions.length > 0 ||
        minPerformance > 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, location, or endpoint..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={showAdvanced ? 'bg-accent' : ''}
                >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                </Button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-muted/30">
                    <MultiSelect
                        title="Status"
                        options={statusOptions}
                        selected={selectedStatus}
                        onChange={setSelectedStatus}
                    />
                    <MultiSelect
                        title="Location"
                        options={locationOptions}
                        selected={selectedLocations}
                        onChange={setSelectedLocations}
                    />
                    <MultiSelect
                        title="Version"
                        options={versionOptions}
                        selected={selectedVersions}
                        onChange={setSelectedVersions}
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Min Performance:</label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={minPerformance}
                            onChange={(e) => setMinPerformance(Number(e.target.value))}
                            className="w-20"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
