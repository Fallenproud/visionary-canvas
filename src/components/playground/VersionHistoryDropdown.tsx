import { History, RotateCcw, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Snapshot } from "@/hooks/useSnapshots";

interface VersionHistoryDropdownProps {
  snapshots: Snapshot[];
  isReverting: boolean;
  onRevert: (snapshot: Snapshot) => void;
}

export function VersionHistoryDropdown({
  snapshots,
  isReverting,
  onRevert,
}: VersionHistoryDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          disabled={isReverting}
        >
          <History className="w-3.5 h-3.5" />
          <span>Versions</span>
          {snapshots.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">
              {snapshots.length}
            </span>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover border-border z-50">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Version History
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {snapshots.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No versions yet. AIKO will auto-save versions when making changes.
          </div>
        ) : (
          snapshots.map((snap) => (
            <DropdownMenuItem
              key={snap.id}
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => onRevert(snap)}
              disabled={isReverting}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  v{snap.version}
                  {snap.label && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      — {snap.label}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(snap.created_at), "MMM d, h:mm a")}
                </span>
              </div>
              <RotateCcw className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
