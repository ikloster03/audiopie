import * as React from "react"
import { cn } from "@/lib/utils"

type AlertVariant = "default" | "destructive"

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant
}

function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  // Build BEM class names
  const bemClasses = cn(
    "alert",
    `alert--${variant}`,
    className
  )

  return (
    <div
      data-slot="alert"
      role="alert"
      className={bemClasses}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("alert__title", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("alert__description", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
export type { AlertProps, AlertVariant }
