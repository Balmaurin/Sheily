import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      default: "bg-primary text-bg hover:opacity-90 shadow-glow",
      ghost: "bg-transparent text-white/85 hover:bg-white/5 border border-border",
      outline: "bg-transparent text-white hover:bg-white/5 border border-white/20",
      destructive: "bg-red-500 text-white hover:bg-red-600"
    };
    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10 p-0"
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export function buttonVariants(params: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  const { 
    variant = "default", 
    size = "md", 
    className 
  } = params;

  const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-primary text-bg hover:opacity-90 shadow-glow",
    ghost: "bg-transparent text-white/85 hover:bg-white/5 border border-border",
    outline: "bg-transparent text-white hover:bg-white/5 border border-white/20",
    destructive: "bg-red-500 text-white hover:bg-red-600"
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10 p-0"
  };

  return cn(base, variants[variant], sizes[size], className);
}
