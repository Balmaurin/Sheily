"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

// Componente Tooltip nativo simplificado para evitar problemas de compilación
const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => (
  <div className="relative inline-block">{children}</div>
);

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number;
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ className, sideOffset = 4, side = "top", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
      "absolute",
      side === "top" && "bottom-full left-1/2 -translate-x-1/2",
      side === "bottom" && "top-full left-1/2 -translate-x-1/2",
      side === "left" && "right-full top-1/2 -translate-y-1/2",
      side === "right" && "left-full top-1/2 -translate-y-1/2",
      className
    )}
    style={{
      marginBottom: side === "top" ? sideOffset : undefined,
      marginTop: side === "bottom" ? sideOffset : undefined,
      marginRight: side === "left" ? sideOffset : undefined,
      marginLeft: side === "right" ? sideOffset : undefined,
    }}
    {...props}
  >
    {children}
  </div>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
