import React, { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Optionally, you can also remove this if you want to prevent Escape key
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div className={`p-4 rounded-lg shadow-lg w-full max-w-4xl min-w-[800px] ${className || ""}`} {...rest} />
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div className={`text-lg font-bold ${className || ""}`} {...rest} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...rest
}) => (
  <h2 className={`text-xl font-semibold ${className || ""}`} {...rest} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...rest
}) => (
  <p className={`text-[var(--color-muted)] ${className || ""}`} {...rest} />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div className={`flex justify-end gap-2 mt-4 ${className || ""}`} {...rest} />
);
