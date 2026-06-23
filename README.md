<div align="center">
  <img src="./public/logo.jpg" alt="Ligature Logo" width="120" />
  <h1>Ligature</h1>
  <p><b>Stateless, edge-rendered SVG widgets for your GitHub and GitLab READMEs.</b></p>
</div>

<br />

One directory. Infinite themes. 

Ligature is a dynamic SVG generation engine built on Next.js. It allows you to customize and embed dynamic widgets directly into markdown files without requiring any persistent databases or heavy infrastructure.

## Features

- **GitHub Stats**: Dynamically fetch and display a user's commits, PRs, issues, and stars.
- **Profile Overview**: A responsive layout showing contribution history, total repositories, and top projects.
- **Star History**: A beautiful, auto-scaling line chart visualizing the growth trajectory of any repository.
- **3D Isometric Graph**: A stunning isometric projection of a user's GitHub contribution grid.
- **Arcade Games**: Embed playable widgets like Pac-Man, Bomberman, Minesweeper, and more right into your profile.

## Getting Started

Ligature is built with [Next.js](https://nextjs.org/) and Edge runtime APIs.

### Local Development

First, run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live preview customizer.

### Configuration

For the widgets to bypass GitHub's unauthenticated API rate limits (60 req/hr), you need to provide a `GITHUB_TOKEN` or `GITHUB_ID` / `GITHUB_SECRET` in your `.env.local` file:

```env
GITHUB_TOKEN=your_personal_access_token
```

## Deployment

The easiest way to deploy Ligature is on the [Vercel Platform](https://vercel.com/new) or [Netlify](https://netlify.com). Ensure you set your environment variables in the dashboard of your hosting provider.
