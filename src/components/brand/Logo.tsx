import Image from "next/image";
import { cn } from "@/lib/utils";

// One logo size everywhere (header, footer, menu, age gate).
export function Logo({ variant = "dark", className, priority }: { variant?: "dark" | "light"; className?: string; priority?: boolean }) {
  return (
    <Image
      src={variant === "dark" ? "/images/brand/logo.png" : "/images/brand/logo-white.png"}
      alt="SOLO Research"
      width={449}
      height={186}
      priority={priority}
      className={cn("h-auto w-[170px]", className)}
    />
  );
}
