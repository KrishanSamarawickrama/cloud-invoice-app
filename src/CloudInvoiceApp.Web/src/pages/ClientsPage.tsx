import { Users } from "lucide-react";

export function ClientsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Clients
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your client directory
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20">
        <div className="rounded-full bg-[var(--color-accent-light)] p-4">
          <Users className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
          Coming Soon
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Client management is currently under development.
        </p>
      </div>
    </>
  );
}
