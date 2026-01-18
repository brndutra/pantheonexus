import React from "react";
import { cn } from "@/lib/utils";

interface ScionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "mythic" | "tech";
}

export const ScionInput = React.forwardRef<HTMLInputElement, ScionInputProps>(
  ({ className, label, variant = "mythic", ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {label && (
          <label
            className={cn(
              "block text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 transition-colors font-mythic text-primary/70"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent border-b border-muted-foreground/30 px-0 py-2 outline-none transition-all duration-300 font-tech text-foreground text-lg placeholder:text-muted-foreground/20",
              "focus:border-primary focus:bg-primary/5",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

ScionInput.displayName = "ScionInput";
