import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm transition-all duration-200 text-card-foreground",
  {
    variants: {
      tone: {
        default: "",
        emphasis: "bg-white/[0.07] border-white/15",
        accent: "border-amberGold/30 bg-amberGold/5",
      },
      interactive: {
        true: "hover:bg-white/[0.08] hover:-translate-y-px hover:shadow-lg cursor-pointer",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      tone: "default",
      interactive: false,
      padding: "md",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, tone, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ tone, interactive, padding }), className)}
      {...props}
    />
  )
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
