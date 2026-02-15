import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { ApiService, type InvoiceListItem } from "@/services/ApiService";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </p>
        <div className="rounded-md bg-[var(--color-accent-light)] p-2">
          <Icon className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200" />
      </div>
      <div className="mt-2 h-7 w-32 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ApiService.getInvoiceList()
      .then((data) => setInvoices(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvoices = invoices.length;
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    const now = new Date();
    const thisMonthRevenue = invoices
      .filter((inv) => {
        const d = new Date(inv.invoiceDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    return { totalRevenue, totalInvoices, averageInvoice, thisMonthRevenue };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Overview of your invoicing activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
            />
            <StatCard
              label="Total Invoices"
              value={String(stats.totalInvoices)}
              icon={FileText}
            />
            <StatCard
              label="Average Invoice"
              value={formatCurrency(stats.averageInvoice)}
              icon={TrendingUp}
            />
            <StatCard
              label="This Month"
              value={formatCurrency(stats.thisMonthRevenue)}
              icon={Calendar}
            />
          </>
        )}
      </div>

      {/* Recent invoices */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Recent Invoices
          </h2>
          <Link
            to="/invoices"
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : recentInvoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
            No invoices yet. Create your first invoice to get started.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="text-sm">
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">
                    {formatDate(inv.invoiceDate)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-[var(--color-text)]">
                    {formatCurrency(inv.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
