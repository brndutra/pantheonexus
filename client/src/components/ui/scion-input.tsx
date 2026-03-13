import React from "react";
import { cn } from "@/lib/utils";

interface ScionInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "mythic" | "tech";
  textarea?: boolean;
  viewMode?: boolean;
}

export const ScionInput = React.forwardRef<HTMLInputElement, ScionInputProps>(
  ({ className, label, variant = "mythic", textarea, viewMode, value, ...props }, ref) => {
    
    if (viewMode) {
      return (
        <div className="relative group w-full mb-4">
          {label && (
             <label className="block text-[9px] uppercase tracking-[0.2em] mb-1 font-display text-primary/40">
               {label}
             </label>
          )}
          <div className={cn(
             "w-full text-sm font-code text-foreground/90 py-1 border-b border-transparent min-h-[2rem]",
             className
          )}>
            {value || <span className="text-muted-foreground/20 italic text-[10px]">EMPTY DATA</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="relative group w-full mb-4">
        {label && (
          <label
            className={cn(
              "block text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 transition-colors font-display text-primary/70"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {textarea ? (
             <textarea
                className={cn(
                  "w-full bg-transparent border-b border-muted-foreground/30 px-0 py-2 outline-none transition-all duration-300 font-code text-foreground text-sm placeholder:text-muted-foreground/20 resize-none block",
                  "focus:border-primary focus:bg-primary/5",
                  className
                )}
                value={value as string}
                onChange={props.onChange as any}
                {...(props as any)}
             />
          ) : (
            <input
              ref={ref}
              className={cn(
                "w-full bg-transparent border-b border-muted-foreground/30 px-0 py-2 outline-none transition-all duration-300 font-code text-foreground text-lg placeholder:text-muted-foreground/20",
                "focus:border-primary focus:bg-primary/5",
                className
              )}
              value={value}
              {...props}
            />
          )}
        </div>
      </div>
    );
  }
);

ScionInput.displayName = "ScionInput";
