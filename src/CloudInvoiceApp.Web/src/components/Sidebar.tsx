import { NavLink } from "react-router-dom";
import { FileText, LayoutDashboard, Users, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  invoiceCount?: number;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText, showBadge: true },
  { to: "/clients", label: "Clients", icon: Users },
];

export function Sidebar({ invoiceCount }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <FileText className="h-6 w-6 text-[var(--color-accent)]" />
        <span className="text-lg font-semibold text-[var(--color-text)]">
          CloudInvoice
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          General
        </p>
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, showBadge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-1">{label}</span>
                {showBadge && invoiceCount !== undefined && (
                  <Badge>{invoiceCount}</Badge>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t border-[var(--color-border)] p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-medium text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--color-destructive)]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
