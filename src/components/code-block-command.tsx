"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function CodeBlockCommand({
  __npm__,
  __yarn__,
  __pnpm__,
  __bun__,
}: {
  __npm__?: string
  __yarn__?: string
  __pnpm__?: string
  __bun__?: string
}) {
  const [packageManager, setPackageManager] = React.useState("pnpm")
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("ligature-package-manager")
    if (stored) setPackageManager(stored)
  }, [])

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const tabs = { pnpm: __pnpm__, npm: __npm__, yarn: __yarn__, bun: __bun__ }

  return (
    <div className="relative overflow-x-auto">
      <Tabs
        value={packageManager}
        className="gap-0"
        onValueChange={(value) => {
          setPackageManager(value)
          localStorage.setItem("ligature-package-manager", value)
        }}
      >
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-1">
          <TabsList className="rounded-none bg-transparent p-0">
            {Object.entries(tabs).map(([key]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-accent data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(tabs).map(([key, value]) => (
            <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
              <pre>
                <code
                  className="relative font-mono text-sm leading-none"
                  data-language="bash"
                >
                  {value}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="copy-button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
            onClick={() => {
              const command = tabs[packageManager as keyof typeof tabs]
              if (command) {
                navigator.clipboard.writeText(command)
                setHasCopied(true)
              }
            }}
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72604C11.7558 3.9151 11.8369 4.30308 11.6478 4.59198L7.39781 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58939 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7909 3.61902 11.1789 3.53798 11.4669 3.72604Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasCopied ? "Copied" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}