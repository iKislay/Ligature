import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Info, AlertTriangle, Lightbulb } from "lucide-react"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&_svg]:absolute [&_svg]:left-4 [&_svg]:top-4 [&_svg+&]:pl-10",
  {
    variants: {
      variant: {
        default: "bg-surface text-surface-foreground",
        note: "bg-surface text-surface-foreground",
        tip: "bg-surface text-surface-foreground",
        warning:
          "bg-destructive/10 text-foreground border-destructive/30 [&_svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CalloutProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof calloutVariants> {}

export function Callout({ className, variant, ...props }: CalloutProps) {
  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    />
  )
}

function CalloutTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="callout-title"
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function CalloutDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="callout-description"
      className={cn("text-muted-foreground [&_p]:leading-normal", className)}
      {...props}
    />
  )
}

export { CalloutTitle, CalloutDescription }