import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface DotRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
  iconClassName?: string;
  activeClassName?: string;
  variant?: "mythic" | "tech";
  readOnly?: boolean;
}

export function DotRating({
  value,
  max = 5,
  onChange,
  className,
  iconClassName,
  activeClassName,
  variant = "mythic",
  readOnly = false,
}: DotRatingProps) {
  const dots = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={cn("flex gap-1.5 items-center flex-wrap", className)}>
      {dots.map((dot) => (
        <button
          key={dot}
          onClick={() => !readOnly && onChange?.(dot === value ? 0 : dot)}
          className={cn(
            "rounded-[1px] transition-all duration-300 relative focus:outline-none",
            iconClassName || "w-3 h-3 md:w-4 md:h-4"
          )}
          type="button"
          tabIndex={readOnly ? -1 : 0}
        >
          {/* Box Style */}
          <div
            className={cn(
              "absolute inset-0 border transition-all duration-200",
              dot <= value
                ? activeClassName || "bg-primary border-primary shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                : "bg-transparent border-muted-foreground/30 hover:border-primary/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}
