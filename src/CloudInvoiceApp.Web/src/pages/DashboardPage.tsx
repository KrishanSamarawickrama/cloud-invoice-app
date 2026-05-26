import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiService, type InvoiceListItem } from "@/services/ApiService";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  index: number;
}

function StatCard({ label, value, icon: Icon, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </p>
        <div className="rounded-xl bg-[var(--color-accent-light)] p-2.5">
          <Icon className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
        <div className="h-9 w-9 animate-pulse rounded-xl bg-[var(--color-border)]/60" />
      </div>
      <div className="mt-2 h-8 w-32 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
    </div>
  );
}

export function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  useEffect(() => {
    ApiService.getInvoiceList()
      .then((data) => setInvoices(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const yearBounds = useMemo(() => {
    if (invoices.length === 0) {
      return { min: currentYear, max: currentYear };
    }
    const years = invoices.map((i) => new Date(i.invoiceDate).getFullYear());
    return { min: Math.min(...years), max: currentYear };
  }, [invoices, currentYear]);

  const yearInvoices = useMemo(
    () =>
      invoices.filter(
        (i) => new Date(i.invoiceDate).getFullYear() === selectedYear
      ),
    [invoices, selectedYear]
  );

  const stats = useMemo(() => {
    const totalRevenue = yearInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvoices = yearInvoices.length;
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const monthlyAverage = totalRevenue / 12;
    return { totalRevenue, totalInvoices, averageInvoice, monthlyAverage };
  }, [yearInvoices]);

  const recentInvoices = useMemo(() => {
    return [...yearInvoices]
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      )
      .slice(0, 5);
  }, [yearInvoices]);

  const canGoPrev = selectedYear > yearBounds.min;
  const canGoNext = selectedYear < yearBounds.max;

  return (
    <>
      {/* Page header with year navigator */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Overview of your invoicing activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedYear((y) => y - 1)}
            disabled={!canGoPrev}
            title="Previous year"
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span
            aria-live="polite"
            className="min-w-[4ch] text-center text-lg font-semibold text-[var(--color-text)]"
          >
            {selectedYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedYear((y) => y + 1)}
            disabled={!canGoNext}
            title="Next year"
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
              index={0}
            />
            <StatCard
              label="Total Invoices"
              value={String(stats.totalInvoices)}
              icon={FileText}
              index={1}
            />
            <StatCard
              label="Average Invoice"
              value={formatCurrency(stats.averageInvoice)}
              icon={TrendingUp}
              index={2}
            />
            <StatCard
              label="Monthly Average"
              value={formatCurrency(stats.monthlyAverage)}
              icon={Calendar}
              index={3}
            />
          </>
        )}
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Recent Invoices · {selectedYear}
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
                <div className="h-4 w-28 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
                <div className="h-4 w-24 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
                <div className="h-4 w-20 animate-pulse rounded-lg bg-[var(--color-border)]/60" />
              </div>
            ))}
          </div>
        ) : recentInvoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
            No invoices in {selectedYear}.
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
                <tr key={inv.id} className="text-sm transition-colors hover:bg-[var(--color-accent-light)]/50">
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
