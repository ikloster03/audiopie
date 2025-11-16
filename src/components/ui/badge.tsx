import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant
  asChild?: boolean
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  // Build BEM class names
  const bemClasses = cn(
    "badge",
    `badge--${variant}`,
    className
  )

  return (
    <Comp
      data-slot="badge"
      className={bemClasses}
      {...props}
    />
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
