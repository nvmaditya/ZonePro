"use client";

import { Cloud, CloudOff, Loader2, Check } from "lucide-react";
import type { SyncStatus } from "@/hooks/use-cloud-sync";

interface SyncStatusIndicatorProps {
    status: SyncStatus;
}

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
    if (status === "idle") return null;

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {status === "syncing" && (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="hidden sm:inline">Syncing...</span>
                </>
            )}
            {status === "synced" && (
                <>
                    <Check className="h-3 w-3 text-green-500" />
                    <Cloud className="h-3 w-3" />
                </>
            )}
            {status === "error" && (
                <>
                    <CloudOff className="h-3 w-3 text-destructive" />
                    <span className="hidden sm:inline">Sync error</span>
                </>
            )}
        </div>
    );
}
