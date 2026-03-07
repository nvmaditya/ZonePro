# ZonePro Transformation - Task Tracker

## Phase 1: Rename to ZonePro + Dead Code Cleanup
- [x] Rename package.json name to "zonepro"
- [x] Update layout.tsx title/description
- [x] Rename component to ZoneProApp
- [x] Change localStorage key to "zonepro-data" with migration
- [x] Update header and subtitle
- [x] Rename .env key to NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] Create .env.example
- [x] Create lib/constants.ts
- [x] Move YouTubePlaylistExtractor to utils/
- [x] Remove dead onAddMusicTrack prop
- [x] Delete duplicate files (styles/globals.css, use-mobile, use-toast, etc.)
- [x] Remove console.log statements

## Phase 2: Bug Fixes
- [x] Fix localStorage race condition with isLoaded guard
- [x] Fix Music ENDED state handling (before PAUSED)
- [x] Fix autoMusicPause setting being ignored
- [x] Remove dead defaultWorkTime/breakTime from settings
- [x] Fix Date deserialization on localStorage load
- [x] Fix Pomodoro never stopping at session limit
- [x] Delete dead getPlayerState function
- [x] Add proper YTPlayer/YTPlayerEvent types (replace `any`)
- [x] Add delete confirmation dialog for courses
- [x] Fix music volume initializing at 0 (set to 50)
- [x] Implement shuffle in playNextTrack/playPreviousTrack
- [x] Fix music useEffect reinit on volume change

## Phase 3: Codebase Restructure
- [x] Extract hooks/use-courses.ts
- [x] Extract hooks/use-pomodoro.ts
- [x] Extract hooks/use-music-player.ts
- [x] Extract hooks/use-session-persistence.ts
- [x] Extract hooks/use-youtube-api.ts
- [x] Reduce page.tsx from ~540 to ~200 lines

## Phase 4: Dark Mode
- [x] Wire ThemeProvider in layout.tsx
- [x] Create theme-toggle.tsx component
- [x] Add ThemeToggle to header
- [x] Replace ~55+ hardcoded color classes with semantic tokens
- [x] Files updated: page.tsx, course-player, course-list, music-player, pomodoro-timer, youtube-playlist, settings-sheet, add-course-dialog

## Phase 5: Supabase Setup + Authentication
- [x] Install @supabase/supabase-js and @supabase/ssr
- [x] Create lib/supabase/client.ts (browser client)
- [x] Create lib/supabase/server.ts (server client)
- [x] Create lib/supabase/middleware.ts (session refresh)
- [x] Create middleware.ts (redirect unauthenticated users)
- [x] Create app/login/page.tsx (email/password login)
- [x] Create app/signup/page.tsx (email/password signup)
- [x] Create app/auth/callback/route.ts (auth code exchange)
- [x] Create components/user-menu.tsx (user dropdown with logout)
- [x] Wire UserMenu into page.tsx header

## Phase 6: Supabase Database + Cross-Device Sync
- [x] Create lib/supabase/sync.ts (CRUD functions for courses, settings, music)
- [x] Create hooks/use-cloud-sync.ts (bidirectional sync with debouncing)
- [x] Create components/sync-status.tsx (sync indicator)
- [x] Wire useCloudSync into page.tsx
- [x] Fix setCourses type to accept updater functions

## Phase 7: Final Polish + Verification
- [x] TypeScript check passes clean
- [x] Next.js production build succeeds
- [x] Create tasks/todo.md
- [x] Create tasks/lessons.md

## Supabase Tables Required (manual setup)
Create these tables in the Supabase dashboard with RLS enabled (`auth.uid() = user_id`):

### courses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, default gen_random_uuid() |
| user_id | uuid | References auth.users(id) |
| local_id | text | Local app ID |
| title | text | |
| url | text | |
| video_id | text | |
| current_time | float | |
| duration | float | |
| completed | boolean | |
| last_watched | timestamptz | |
| playlist_id | text | nullable |
| playlist_index | int | default 0 |
| playlist_progress | jsonb | default '{}' |
| playlist_metadata | jsonb | nullable |
| notes | jsonb | default '[]' |
| **Unique constraint** | | (user_id, local_id) |

### user_settings
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users(id), UNIQUE |
| pomodoro_work_time | int | default 25 |
| pomodoro_break_time | int | default 5 |
| pomodoro_total_sessions | int | default 4 |
| auto_music_pause | boolean | default true |

### music_tracks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users(id) |
| local_id | text | Local app ID |
| title | text | |
| video_id | text | |
| duration | float | |
| sort_order | int | |
| **Unique constraint** | | (user_id, local_id) |
