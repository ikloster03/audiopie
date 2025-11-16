import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  // Build BEM class names
  const bemClasses = cn(
    "button",
    `button--${variant}`,
    size === "default" ? "button--default-size" : `button--${size}`,
    className
  )

  return (
    <Comp
      data-slot="button"
      className={bemClasses}
      {...props}
    />
  )
}

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
