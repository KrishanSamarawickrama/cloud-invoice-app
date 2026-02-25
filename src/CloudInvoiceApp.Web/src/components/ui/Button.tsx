import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)]",
  secondary:
    "bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] focus-visible:ring-[var(--color-accent)]",
  outline:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-accent)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-accent)]",
  destructive:
    "bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)] focus-visible:ring-[var(--color-destructive)]",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-base",
  icon: "h-8 w-8 p-0",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
