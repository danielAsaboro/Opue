'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Search,
    Home,
    Database,
    BarChart2,
    Map,
    Star,
    TrendingUp,
    Settings,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { setTheme, theme } = useTheme();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const navigate = useCallback(
        (path: string) => {
            setOpen(false);
            router.push(path);
        },
        [router]
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
                <Command className="rounded-lg border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Search or jump to..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[400px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation">
                            <Command.Item onSelect={() => navigate('/')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Home className="h-4 w-4" />
                                <span>Home</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘H</kbd>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/pnodes')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Database className="h-4 w-4" />
                                <span>pNode Explorer</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘P</kbd>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/network')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <BarChart2 className="h-4 w-4" />
                                <span>Network Analytics</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘N</kbd>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/insights')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <TrendingUp className="h-4 w-4" />
                                <span>Insights & Activity</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘I</kbd>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/compare')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Settings className="h-4 w-4" />
                                <span>Compare pNodes</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘C</kbd>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="my-2 h-px bg-border" />

                        <Command.Group heading="Views">
                            <Command.Item onSelect={() => navigate('/pnodes?view=table')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <span>Table View</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/pnodes?view=grid')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <span>Grid View</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigate('/pnodes?view=map')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Map className="h-4 w-4" />
                                <span>Map View</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="my-2 h-px bg-border" />

                        <Command.Group heading="Theme">
                            <Command.Item onSelect={() => setTheme('light')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Sun className="h-4 w-4" />
                                <span>Light Mode</span>
                            </Command.Item>
                            <Command.Item onSelect={() => setTheme('dark')} className="flex items-center gap-2 px-2 py-1.5 rounded-sm">
                                <Moon className="h-4 w-4" />
                                <span>Dark Mode</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                    <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                        Press <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> to close
                    </div>
                </Command>
            </div>
        </div>
    );
}
