<div align="center">
  <img src="./public/logo.jpg" alt="Ligature Logo" width="120" />
  <h1>Ligature</h1>
  <p><b>Stateless, edge-rendered SVG widgets for your GitHub and GitLab READMEs.</b></p>
</div>

<br />

One directory. Infinite themes. 

Ligature is a dynamic SVG generation engine built on Next.js. It allows you to customize and embed dynamic widgets directly into markdown files without requiring any persistent databases or heavy infrastructure.

---

## 🚀 Live Embeddings

Ligature is designed to be embedded directly into your `README.md` to showcase your stats, repositories, and even interactive games! Here is what they look like in action.

*(Note: Replace `https://ligatures.netlify.app` with your actual hosted Ligature URL if you deploy your own instance)*

### 📊 GitHub Stats
Get a beautiful overview of a user's GitHub activity.

```markdown
![GitHub Stats](https://ligatures.netlify.app/api/github?user=iKislay&theme=geist)
```
<div align="center">
  <img src="https://ligatures.netlify.app/api/github?user=iKislay&theme=geist" alt="GitHub Stats Example" width="800" />
</div>

### 📈 Star History
Visualize the growth trajectory of any repository.

```markdown
![Star History](https://ligatures.netlify.app/api/star-history?repo=iKislay/Ligature&theme=cyberpunk)
```
<div align="center">
  <img src="https://ligatures.netlify.app/api/star-history?repo=iKislay/Ligature&theme=cyberpunk" alt="Star History Example" width="840" />
</div>

### 🧊 3D Contribution Graph
A stunning 3D isometric projection of your GitHub contribution grid.

```markdown
![3D Contribution Graph](https://ligatures.netlify.app/api/isometric?user=iKislay&theme=geist_dark&animate=true)
```
<div align="center">
  <img src="https://ligatures.netlify.app/api/isometric?user=iKislay&theme=geist_dark&animate=true" alt="3D Contribution Graph Example" width="800" />
</div>

### 🕹️ Arcade Games (Pac-Man)
Embed playable widgets like Pac-Man into your profile.

```markdown
![Pac-Man](https://ligatures.netlify.app/api/games?user=iKislay&game=pacman&theme=minimal)
```
<div align="center">
  <img src="https://ligatures.netlify.app/api/games?user=iKislay&game=pacman&theme=minimal" alt="Arcade Games Example" width="800" />
</div>

---

## 💡 How to Use

Using Ligature is incredibly simple. You don't need to install any packages or write any code to use the widgets—you just add a Markdown image link to your `README.md`!

### 1. Find Your Widget
Browse through the available widgets on your deployed Ligature platform (or localhost). You can customize themes, usernames, games, and other parameters directly in the URL query string.

### 2. Copy the Markdown
Copy the generated Markdown snippet for the widget you want to use.

### 3. Paste into your README
Paste the snippet into your GitHub or GitLab `README.md` file. Every time someone visits your profile or repository, the SVG image will be dynamically generated and served with the latest data!

---

## ✨ Features

- **GitHub Stats**: Dynamically fetch and display a user's commits, PRs, issues, and stars.
- **Profile Overview**: A responsive layout showing contribution history, total repositories, and top projects.
- **Star History**: A beautiful, auto-scaling line chart visualizing the growth trajectory of any repository.
- **3D Isometric Graph**: A stunning isometric projection of a user's GitHub contribution grid.
- **Arcade Games**: Embed playable widgets like Pac-Man, Bomberman, Minesweeper, and more right into your profile.

---

## 🛠 Getting Started

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
MONGODB_URI=your_mongodb_connection_string
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_APP_ID=your_github_app_id
GITHUB_TOKEN=your_personal_access_token
```

---

## 🚀 Deployment

The easiest way to deploy Ligature is on the [Vercel Platform](https://vercel.com/new) or [Netlify](https://netlify.com). Ensure you set your environment variables in the dashboard of your hosting provider.
