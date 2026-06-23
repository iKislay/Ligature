// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"api.mdx": () => import("../content/docs/api.mdx?collection=docs"), "bomberman.mdx": () => import("../content/docs/bomberman.mdx?collection=docs"), "breakout.mdx": () => import("../content/docs/breakout.mdx?collection=docs"), "edge.mdx": () => import("../content/docs/edge.mdx?collection=docs"), "galaga.mdx": () => import("../content/docs/galaga.mdx?collection=docs"), "github-profile.mdx": () => import("../content/docs/github-profile.mdx?collection=docs"), "github-stats.mdx": () => import("../content/docs/github-stats.mdx?collection=docs"), "github-trends.mdx": () => import("../content/docs/github-trends.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "isometric.mdx": () => import("../content/docs/isometric.mdx?collection=docs"), "minesweeper.mdx": () => import("../content/docs/minesweeper.mdx?collection=docs"), "pacman.mdx": () => import("../content/docs/pacman.mdx?collection=docs"), "puzzle-bobble.mdx": () => import("../content/docs/puzzle-bobble.mdx?collection=docs"), "quick-start.mdx": () => import("../content/docs/quick-start.mdx?collection=docs"), "star-history.mdx": () => import("../content/docs/star-history.mdx?collection=docs"), "themes.mdx": () => import("../content/docs/themes.mdx?collection=docs"), }),
};
export default browserCollections;