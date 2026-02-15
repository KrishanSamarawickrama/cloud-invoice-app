import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
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
          ref={ref}
          id={inputId}
          className={cn(
            "h-9 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm",
            "placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
