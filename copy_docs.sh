#!/bin/bash
set -e

SOURCE_DIR="temp/magicui/apps/www"
TARGET_DIR="src"

# Directories
mkdir -p $TARGET_DIR/components/ui
mkdir -p $TARGET_DIR/config
mkdir -p $TARGET_DIR/lib
mkdir -p $TARGET_DIR/app/docs/[[...slug]]
mkdir -p $TARGET_DIR/types

# Copy Layout and Page
cp -r $SOURCE_DIR/app/\(docs\)/docs/layout.tsx $TARGET_DIR/app/docs/layout.tsx
cp -r $SOURCE_DIR/app/\(docs\)/docs/\[\[...slug\]\]/page.tsx $TARGET_DIR/app/docs/\[\[...slug\]\]/page.tsx

# Copy Components
cp $SOURCE_DIR/components/ui/sidebar.tsx $TARGET_DIR/components/ui/sidebar.tsx
cp $SOURCE_DIR/components/ui/button.tsx $TARGET_DIR/components/ui/button.tsx
cp $SOURCE_DIR/components/ui/tooltip.tsx $TARGET_DIR/components/ui/tooltip.tsx
cp $SOURCE_DIR/components/ui/sheet.tsx $TARGET_DIR/components/ui/sheet.tsx
cp $SOURCE_DIR/components/ui/input.tsx $TARGET_DIR/components/ui/input.tsx
cp $SOURCE_DIR/components/ui/separator.tsx $TARGET_DIR/components/ui/separator.tsx
cp $SOURCE_DIR/components/ui/skeleton.tsx $TARGET_DIR/components/ui/skeleton.tsx
cp $SOURCE_DIR/components/ui/scroll-area.tsx $TARGET_DIR/components/ui/scroll-area.tsx

cp $SOURCE_DIR/components/docs-sidebar.tsx $TARGET_DIR/components/docs-sidebar.tsx
cp $SOURCE_DIR/components/docs-toc.tsx $TARGET_DIR/components/docs-toc.tsx
cp $SOURCE_DIR/components/contribute.tsx $TARGET_DIR/components/contribute.tsx
cp $SOURCE_DIR/components/docs-copy-page.tsx $TARGET_DIR/components/docs-copy-page.tsx
cp $SOURCE_DIR/components/sidebar-cta.tsx $TARGET_DIR/components/sidebar-cta.tsx
cp $SOURCE_DIR/components/icons.tsx $TARGET_DIR/components/icons.tsx

# Config and Libs
cp $SOURCE_DIR/config/docs.ts $TARGET_DIR/config/docs.ts
cp $SOURCE_DIR/config/site.ts $TARGET_DIR/config/site.ts
cp $SOURCE_DIR/lib/docs.ts $TARGET_DIR/lib/docs.ts
cp $SOURCE_DIR/lib/utils.ts $TARGET_DIR/lib/utils.ts
cp $SOURCE_DIR/lib/events.ts $TARGET_DIR/lib/events.ts || echo "No events.ts"

# Types
cp $SOURCE_DIR/types/index.d.ts $TARGET_DIR/types/index.d.ts || echo "No index.d.ts"
cp -r $SOURCE_DIR/types/* $TARGET_DIR/types/ || true

# We also need a simplified mdx-components.tsx
echo "Creating mdx-components..."
cat << 'EOF' > $TARGET_DIR/mdx-components.tsx
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
EOF

echo "Done."
