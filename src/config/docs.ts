import { NavItem, NavItemWithChildren } from "@/types"

interface DocsConfig {
  mainNav: NavItem[]
  sidebarNav: NavItemWithChildren[]
}

export interface DocNavLink {
  url: string
  name: string
}

function flattenSidebarItems(
  items: NavItemWithChildren[],
  acc: DocNavLink[] = []
): DocNavLink[] {
  for (const item of items) {
    if (item.href) {
      acc.push({ url: item.href, name: item.title })
    }
    if (item.items?.length) {
      flattenSidebarItems(item.items, acc)
    }
  }
  return acc
}

function getFlattenedDocsNav(): DocNavLink[] {
  const result: DocNavLink[] = []
  for (const section of docsConfig.sidebarNav) {
    if (section.items?.length) {
      flattenSidebarItems(section.items, result)
    }
  }
  return result
}

export function getNeighboursFromConfig(currentUrl: string): {
  previous?: DocNavLink
  next?: DocNavLink
} {
  const nav = getFlattenedDocsNav()
  const normalized = currentUrl.replace(/\/$/, "") || "/"
  const index = nav.findIndex((item) => {
    const itemNorm = item.url.replace(/\/$/, "") || "/"
    return itemNorm === normalized
  })
  if (index < 0) return {}
  return {
    previous: index > 0 ? nav.at(index - 1) : undefined,
    next: index < nav.length - 1 ? nav.at(index + 1) : undefined,
  }
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Docs",
      href: "/docs",
    },
    {
      title: "Widgets",
      href: "/docs/github-stats",
    },
    {
      title: "GitHub",
      href: "https://github.com/iKislay/Ligature",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
          items: [],
        },
        {
          title: "Quick Start",
          href: "/docs/quick-start",
          items: [],
        },
        {
          title: "Themes",
          href: "/docs/themes",
          items: [],
        },
      ],
    },
    {
      title: "Widgets",
      items: [
        {
          title: "GitHub Stats",
          href: "/docs/github-stats",
          items: [],
        },
        {
          title: "GitHub Profile Overview",
          href: "/docs/github-profile",
          items: [],
        },
        {
          title: "Isometric Graph",
          href: "/docs/isometric",
          items: [],
        },
        {
          title: "GitHub Summary Cards",
          href: "/docs/github-summary-cards",
          items: [],
        },
      ],
    },
    {
      title: "Arcade Games",
      items: [
        {
          title: "Pac-Man",
          href: "/docs/pacman",
          items: [],
        },
        {
          title: "Breakout",
          href: "/docs/breakout",
          items: [],
        },
        {
          title: "Galaga",
          href: "/docs/galaga",
          items: [],
        },
        {
          title: "Bomberman",
          href: "/docs/bomberman",
          items: [],
        },
        {
          title: "Puzzle Bobble",
          href: "/docs/puzzle-bobble",
          items: [],
        },
        {
          title: "Minesweeper",
          href: "/docs/minesweeper",
          items: [],
        },
      ],
    },
    {
      title: "API Reference",
      items: [
        {
          title: "REST API",
          href: "/docs/api",
          items: [],
        },
        {
          title: "Edge Runtime",
          href: "/docs/edge",
          items: [],
        },
      ],
    },
  ],
}