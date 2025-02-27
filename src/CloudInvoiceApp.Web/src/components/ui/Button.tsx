import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", children, className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-all";

  const variantStyles = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]",
    secondary: "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-accent)]",
    outline: "border border-[var(--color-muted)] text-[var(--color-muted)] hover:bg-[var(--color-background)]",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
