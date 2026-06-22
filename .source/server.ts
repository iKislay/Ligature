// @ts-nocheck
import * as __fd_glob_15 from "../content/docs/themes.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/quick-start.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/puzzle-bobble.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/pacman.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/minesweeper.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/isometric.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/github-trends.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/github-stats.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/github-profile.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/gh-skyline.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/galaga.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/edge.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/breakout.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/bomberman.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/api.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"api.mdx": __fd_glob_0, "bomberman.mdx": __fd_glob_1, "breakout.mdx": __fd_glob_2, "edge.mdx": __fd_glob_3, "galaga.mdx": __fd_glob_4, "gh-skyline.mdx": __fd_glob_5, "github-profile.mdx": __fd_glob_6, "github-stats.mdx": __fd_glob_7, "github-trends.mdx": __fd_glob_8, "index.mdx": __fd_glob_9, "isometric.mdx": __fd_glob_10, "minesweeper.mdx": __fd_glob_11, "pacman.mdx": __fd_glob_12, "puzzle-bobble.mdx": __fd_glob_13, "quick-start.mdx": __fd_glob_14, "themes.mdx": __fd_glob_15, });