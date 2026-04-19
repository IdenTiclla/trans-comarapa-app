import * as React from "react"

import { cn } from "@/lib/utils"

type ClickableCardProps = Omit<React.ComponentProps<"button">, "type"> & {
  ariaLabel: string
}

function ClickableCard({
  className,
  ariaLabel,
  children,
  ...props
}: ClickableCardProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-slot="clickable-card"
      className={cn(
        "flex w-full flex-col gap-6 rounded-xl border bg-card py-6 text-left text-card-foreground shadow-sm transition-colors",
        "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ClickableCard }
