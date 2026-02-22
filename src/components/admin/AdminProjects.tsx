import { useState } from "react";
import { useAdminStats } from "@/hooks/useAdminStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const AdminProjects = () => {
  const { data, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load projects: {error.message}
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    draft: "text-muted-foreground",
    building: "text-yellow-400",
    ready: "text-green-400",
    archived: "text-muted-foreground/60",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 surface-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (data?.recentProjects || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.owner_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${statusColor[p.status] || ""}`}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {p.framework}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.projects.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-border/50 p-4 surface-elevated">
              <p className="text-xs text-muted-foreground capitalize">{status}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
