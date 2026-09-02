"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | null>(null);

export function Sheet({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </SheetContext.Provider>
  );
}

export function SheetHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-2 text-left mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function SheetTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-stone-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function SheetDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-stone-500", className)} {...props}>
      {children}
    </p>
  );
}

export function SheetFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-stone-100", className)} {...props}>
      {children}
    </div>
  );
}

export function SheetClose({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  const ctx = React.useContext(SheetContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        ctx?.onOpenChange(false);
      }}
      className={cn(
        "absolute right-4 top-4 rounded-md p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400",
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
