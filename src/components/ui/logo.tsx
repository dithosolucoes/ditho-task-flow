
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
};

export function Logo({ className, size = "md", variant = "dark" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };
  
  const variantClasses = {
    light: "text-ditho-beige",
    dark: "text-ditho-navy",
  };

  return (
    <div className={cn("font-bold", sizeClasses[size], variantClasses[variant], className)}>
      <span>Ditho</span>
      <span className="text-ditho-navy dark:text-ditho-beige font-light">Task</span>
    </div>
  );
}
