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
              "block text-xs uppercase tracking-wider mb-1 transition-colors",
              variant === "mythic" 
                ? "font-mythic text-primary/80 group-focus-within:text-primary group-focus-within:text-shadow-glow" 
                : "font-code text-secondary/80 group-focus-within:text-secondary group-focus-within:text-shadow-tech"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full bg-black/20 border-b-2 border-muted px-2 py-1 outline-none transition-all duration-300 font-tech text-foreground",
              variant === "mythic"
                ? "focus:border-primary focus:bg-primary/5"
                : "focus:border-secondary focus:bg-secondary/5",
              className
            )}
            {...props}
          />
          {/* Corner accents */}
          <div className={cn(
            "absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-500",
            variant === "mythic" ? "bg-primary shadow-[0_0_10px_gold]" : "bg-secondary shadow-[0_0_10px_cyan]",
            "group-focus-within:w-full"
          )} />
        </div>
      </div>
    );
  }
);

ScionInput.displayName = "ScionInput";
