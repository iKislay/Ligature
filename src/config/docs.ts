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
      title: "Widgets",
      href: "/widgets",
    },
    {
      title: "Showcase",
      href: "/showcase",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/widgets",
          items: [],
        },
        {
          title: "Installation & Usage",
          href: "/widgets/installation",
          items: [],
        },
      ],
    },
    {
      title: "GitHub Stats",
      items: [
        {
          title: "Profile Stats Card",
          href: "/widgets/github/stats-card",
          items: [],
          label: "Popular",
        },
        {
          title: "Top Languages",
          href: "/widgets/github/top-languages",
          items: [],
        },
        {
          title: "Star History Chart",
          href: "/widgets/github/star-history",
          items: [],
          label: "New",
        },
        {
          title: "Pinned Repo Card",
          href: "/widgets/github/repo-card",
          items: [],
        },
        {
          title: "GitHub Trophies",
          href: "/widgets/github/trophies",
          items: [],
        },
        {
          title: "Visitor Badge",
          href: "/widgets/github/visitor-badge",
          items: [],
        },
      ],
    },
    {
      title: "Contributions (Creative)",
      items: [
        {
          title: "3D Isometric Graph",
          href: "/widgets/github/isometric-contrib",
          items: [],
          label: "Live",
        },
        {
          title: "Contribution Snake",
          href: "/widgets/github/contrib-snake",
          items: [],
          label: "Fun",
        },
        {
          title: "Pacman Arcade",
          href: "/widgets/github/contrib-pacman",
          items: [],
          label: "Fun",
        },
        {
          title: "Activity Streak",
          href: "/widgets/github/activity-streak",
          items: [],
        },
      ],
    },
    {
      title: "Coding Time",
      items: [
        {
          title: "WakaTime Stats",
          href: "/widgets/wakatime/stats",
          items: [],
        },
        {
          title: "isTime Stats (Coming Soon)",
          href: "/widgets/istime/stats",
          items: [],
          label: "Soon",
        },
      ],
    },
    {
      title: "Social Platforms (Phase 2)",
      items: [
        {
          title: "Forg.to Profile",
          href: "/widgets/social/forg",
          items: [],
          label: "Planned",
        },
        {
          title: "Twitter Latest Tweet",
          href: "/widgets/social/twitter",
          items: [],
          label: "Planned",
        },
        {
          title: "YouTube Subscribers",
          href: "/widgets/social/youtube",
          items: [],
          label: "Planned",
        },
      ],
    },
  ],
}
