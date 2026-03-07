# ZonePro

A focused learning application built with Next.js, React, and Tailwind CSS. Track YouTube courses, use a Pomodoro timer, and play background music while you learn.

## Features

- YouTube course tracking with progress and timestamped notes
- Playlist support with per-video progress tracking
- Pomodoro timer with configurable work/break intervals
- Background music player with queue management
- Session export/import for backup
- Supabase integration for cross-device sync

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

- `NEXT_PUBLIC_YOUTUBE_API_KEY` - YouTube Data API v3 key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
