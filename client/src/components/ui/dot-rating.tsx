import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DotRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
  variant?: "mythic" | "tech";
  readOnly?: boolean;
}

export function DotRating({
  value,
  max = 5,
  onChange,
  className,
  variant = "mythic",
  readOnly = false,
}: DotRatingProps) {
  const dots = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={cn("flex gap-1 items-center", className)}>
      {dots.map((dot) => (
        <motion.button
          key={dot}
          whileHover={!readOnly ? { scale: 1.2 } : {}}
          whileTap={!readOnly ? { scale: 0.9 } : {}}
          onClick={() => !readOnly && onChange?.(dot === value ? 0 : dot)}
          className={cn(
            "rounded-full transition-all duration-300 relative focus:outline-none",
            variant === "mythic" ? "w-4 h-4" : "w-3 h-3" // Tech dots are smaller
          )}
          type="button"
          tabIndex={readOnly ? -1 : 0}
        >
          {/* Outer Ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-full border transition-colors",
              dot <= value
                ? variant === "mythic"
                  ? "border-primary bg-primary/20 shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                  : "border-secondary bg-secondary/20 shadow-[0_0_5px_rgba(0,255,255,0.6)]"
                : "border-muted-foreground/30 bg-transparent"
            )}
          />
          
          {/* Inner Fill */}
          <div
            className={cn(
              "absolute inset-[3px] rounded-full transition-all duration-300",
              dot <= value
                ? variant === "mythic"
                  ? "bg-primary"
                  : "bg-secondary"
                : "bg-transparent"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}
