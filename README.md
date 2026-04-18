# ZonePro

ZonePro is an all-in-one productivity workspace that combines learning, task management, focus tools, habit tracking, note-taking, analytics, and planning in a single connected experience. It’s built with Next.js, React, TypeScript, and Tailwind CSS, and stores data locally with optional cloud sync via Supabase.

## Table of Contents

1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Core Sections](#core-sections)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Tech Stack](#tech-stack)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Scripts](#scripts)
9. [Project Structure](#project-structure)
10. [Data and Sync](#data-and-sync)
11. [Architecture Notes](#architecture-notes)
12. [Documentation](#documentation)
13. [Deployment](#deployment)
14. [Contributing](#contributing)
15. [License](#license)
16. [Acknowledgments](#acknowledgments)

## Overview

ZonePro brings together seven productivity modules (Learn, Tasks, Focus, Habits, Notes, Dashboard, Plan) with shared navigation, a persistent header, a music player, and global shortcuts. The UI is designed for fast keyboard-first navigation, and the app supports both light and dark themes.

## Feature Highlights

- YouTube-based course tracking with timestamps and per-video progress
- Multi-view task management (list, kanban, calendar) with priorities, labels, and dependencies
- Pomodoro timer, countdown timer, and stopwatch with session logging
- Habit streak tracking with 30-day dot grids and completion stats
- Markdown notes with tags, search, pin, and archive
- Analytics dashboard with focus heatmap, productivity score, and recent activity
- Weekly review, goals with milestones, and daily “Top 3” planning
- Command palette, global keyboard shortcuts, and responsive layout
- Local-first data with optional Supabase cloud sync
- Session export/import for local backups

## Core Sections

### 🎓 Learn

- Add YouTube videos or playlists as courses
- Track progress per video and overall completion
- Take timestamped notes and jump back to exact moments
- Sidebar pomodoro timer for study sessions

### ✅ Tasks

- List, kanban, and calendar views
- Priorities, due dates, labels, subtasks, and dependencies
- Quick add and detail sheet for full editing

### 🎯 Focus

- Pomodoro timer, countdown timer, and stopwatch modes
- Link sessions to tasks and track focus time
- Daily focus budget and session log

### 🌱 Habits

- Daily habit tracking with streaks and completion rates
- Color-coded dot grid history per habit

### 📝 Notes

- Two-panel Markdown editor with write/preview modes
- Tags, search, pin, and archive

### 📊 Dashboard

- Task completion stats and productivity score
- Focus time heatmap and habit overview

### 📅 Plan

- Daily top 3 priorities
- Goals with milestones and progress
- Weekly review workflow

### 🎵 Music Player

- Persistent header player with queue, shuffle, and repeat
- YouTube audio playback with auto-pause rules
- Default queue starts with a lofi stream, and you can add custom YouTube URLs

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + N` | Quick add task |
| `1` | Learn |
| `2` | Tasks |
| `3` | Focus |
| `4` | Habits |
| `5` | Notes |
| `6` | Dashboard |
| `7` | Plan |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, Radix UI, shadcn/ui
- **Backend:** Supabase (Auth + Database)
- **State:** React Context + custom hooks
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Markdown:** react-markdown + remark-gfm

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- pnpm (recommended) or npm/yarn
- YouTube Data API v3 key
- Supabase account (for cloud sync)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ZonePro
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000).

### Getting API Keys

#### YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Create an API key in **Credentials**
5. Add it to your `.env`

#### Supabase

1. Create a project at [Supabase](https://supabase.com/)
2. Go to **Settings → API**
3. Copy the `URL` and `anon/public` key into your `.env`
4. Configure auth providers (email/password enabled by default)

## Environment Variables

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

All variables are prefixed with `NEXT_PUBLIC_` because they are used client-side. Never commit real keys.

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Run production server |
| `lint` | `next lint` | ESLint checks |

## Project Structure

```
ZonePro/
├── app/                    # Next.js App Router pages
│   ├── auth/              # OAuth callback route
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout (fonts, theme, toaster)
│   └── page.tsx           # Main SPA orchestrator
├── components/            # React components
│   ├── sections/          # Learn, Tasks, Focus, Habits, Notes, Dashboard, Plan
│   ├── ui/               # shadcn/ui primitives
│   └── ...               # Shared components (header, nav, player)
├── contexts/             # React Context providers
├── hooks/                # Custom hooks (YT API, pomodoro, cloud sync)
├── lib/                  # Utilities and constants
├── types/                # TypeScript types
├── utils/                # Helper utilities
├── docs/                 # Architecture + user guide + Supabase schema
└── supabase/             # Supabase config
```

## Data and Sync

ZonePro is local-first. All data is stored in `localStorage` by default. When you sign in, data can sync to Supabase for cross-device access. Settings includes export/import tools for local backups and a “clear all data” action for a full reset.

## Architecture Notes

- The app is a single-page client component (`app/page.tsx`) that conditionally renders sections by `activeSection`.
- A hidden YouTube player is mounted off-screen to keep music playback persistent.
- Shared, persistent UI (header, music player, command palette, floating nav) stays mounted while sections switch.

For detailed component breakdowns and data flow, see the architecture guide linked below.

## Documentation

- [User Guide](docs/USER_GUIDE.md)
- [Architecture Reference](docs/ARCHITECTURE.md)
- [Supabase Schema](docs/supabase-setup.sql)

## Deployment

```bash
pnpm build
pnpm start
```

ZonePro is a standard Next.js app and deploys cleanly on platforms like Vercel or any Node.js host.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

[MIT License](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Backend powered by [Supabase](https://supabase.com/)
