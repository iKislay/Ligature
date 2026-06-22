import * as React from "react"
import { cn } from "@/lib/utils"

export const mdxComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("font-heading mt-2 scroll-m-28 text-3xl font-bold tracking-tight", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("font-heading mt-8 scroll-m-28 text-xl font-medium tracking-tight first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("leading-relaxed not-first:mt-6", className)} {...props} />
  ),
  // Add more as needed based on the source
}
