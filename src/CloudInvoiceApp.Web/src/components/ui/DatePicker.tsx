import React from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  className,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={formatDate(value)}
        onChange={(e) => onChange(new Date(e.target.value).toISOString())}
        className={cn(
          "h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1",
          className
        )}
      />
    </div>
  );
};
