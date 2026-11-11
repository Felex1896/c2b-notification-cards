import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** All-caps caption. Size comes from the overline token; look is the same in both skins. */
export function Overline({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-(length:--overline-size) font-medium tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}
