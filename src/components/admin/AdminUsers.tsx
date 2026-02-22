import { useState, useCallback } from "react";
import { useAdminUsers, useManageRole } from "@/hooks/useAdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const ROLES = ["user", "moderator", "admin"] as const;

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingRole, setPendingRole] = useState<{
    userId: string;
    userName: string;
    action: "assign" | "revoke";
    role: string;
  } | null>(null);

  const { data, isLoading, error } = useAdminUsers(debouncedSearch, page);
  const manageRole = useManageRole();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
      // Simple debounce using setTimeout
      const timer = setTimeout(() => setDebouncedSearch(value), 300);
      return () => clearTimeout(timer);
    },
    []
  );

  const handleRoleChange = (
    userId: string,
    userName: string,
    currentRoles: string[],
    newRole: string
  ) => {
    // If the user already has this role, do nothing
    if (currentRoles.includes(newRole)) return;

    setPendingRole({
      userId,
      userName: userName || "this user",
      action: "assign",
      role: newRole,
    });
  };

  const confirmRoleChange = async () => {
    if (!pendingRole) return;

    try {
      await manageRole.mutateAsync({
        action: pendingRole.action,
        user_id: pendingRole.userId,
        role: pendingRole.role,
      });
      toast({
        title: "Role updated",
        description: `Successfully ${pendingRole.action === "assign" ? "assigned" : "revoked"} ${pendingRole.role} role.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setPendingRole(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load users: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 surface-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
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
              : (data?.users || []).map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const primaryRole = u.roles.includes("admin")
                    ? "admin"
                    : u.roles.includes("moderator")
                      ? "moderator"
                      : "user";

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.display_name || "—"}
                        {isSelf && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {u.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={primaryRole}
                          onValueChange={(val) =>
                            handleRoleChange(u.id, u.display_name || "", u.roles, val)
                          }
                          disabled={isSelf}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r} className="text-xs capitalize">
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} users · Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!pendingRole}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title="Change User Role"
        description={
          pendingRole
            ? `Are you sure you want to ${pendingRole.action} the "${pendingRole.role}" role ${pendingRole.action === "assign" ? "to" : "from"} ${pendingRole.userName}?`
            : ""
        }
        onConfirm={confirmRoleChange}
      />
    </div>
  );
};

export default AdminUsers;
