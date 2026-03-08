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

---

# Feature Expansion (Phase 0–7)

## Phase 0: Navigation Shell + Types Foundation

- [x] Add TypeScript interfaces: Task, FocusSession, Habit, HabitLog, Note, Goal, Milestone, DailyPriority, TimeBlock, AppSettings
- [x] Create hooks/use-local-storage.ts (generic localStorage hook with debounced save)
- [x] Create lib/date-utils.ts (getToday, getStreak, formatDate, daysBetween, etc.)
- [x] Create components/app-sidebar.tsx (7-item sidebar navigation)
- [x] Create components/app-header.tsx (top bar with SidebarTrigger, title, theme, user)
- [x] Create components/sections/learn-section.tsx (extracted from page.tsx)
- [x] Create 6 stub section components (tasks, focus, habits, notes, dashboard, plan)
- [x] Rewrite app/page.tsx as thin shell (~60 lines) with SidebarProvider + section switching
- [x] Build passes, committed as 3f071d5

## Phase 1: Task Management

- [x] Create hooks/use-tasks.ts (CRUD, filtering, sorting, subtasks, quick add)
- [x] Create components/tasks/ — 6 files: quick-add, item, list-view, kanban-view, calendar-view, detail-sheet
- [x] Replace tasks-section.tsx stub with full Tabs (List/Kanban/Calendar) implementation
- [x] Build passes, committed as 50d1cfc

## Phase 2: Focus & Time Tracking

- [x] Create hooks/use-focus-sessions.ts (session CRUD, daily aggregation)
- [x] Create components/focus/ — 4 files: timer, stopwatch, session-log, daily-budget
- [x] Replace focus-section.tsx stub with full implementation

## Phase 3: Habits

- [x] Create hooks/use-habits.ts (habit CRUD, log completion, streak calc, completion rate)
- [x] Create components/habits/ — 4 files: list, dot-grid, detail-dialog, stats
- [x] Replace habits-section.tsx stub with full implementation
- [x] Phases 2+3 build pass, committed together as 659e671

## Phase 4: Notes

- [x] Create hooks/use-notes.ts (note CRUD, search, pin/archive)
- [x] Create components/notes/ — 2 files: note-list, note-editor
- [x] Replace notes-section.tsx with ResizablePanelGroup layout

## Phase 5: Dashboard & Analytics

- [x] Create components/dashboard/ — 4 files: task-stats, focus-heatmap, habit-overview, productivity-score
- [x] Create lib/export-utils.ts (CSV export)
- [x] Replace dashboard-section.tsx stub with widget grid
- [x] Phases 4+5 build pass, committed together as ce3e4b7

## Phase 6: Planning

- [x] Create hooks/use-planning.ts (goals, daily priorities, time blocks CRUD)
- [x] Create components/plan/ — 3 files: daily-top3, goals, weekly-review
- [x] Replace plan-section.tsx stub with Today/Goals/Weekly Review tabs

## Phase 7: Power Features

- [x] Create hooks/use-keyboard-shortcuts.ts (Ctrl+K, Ctrl+N, 1-7 section nav)
- [x] Create components/command-palette.tsx (CommandDialog with navigation + actions)
- [x] Wire command palette and keyboard shortcuts into app/page.tsx
- [x] Phases 6+7 build pass, committed together as 70fb1da

## Remaining (not yet implemented)

- [ ] Supabase cloud sync extensions for new domains (tasks, focus sessions, habits, notes, goals, etc.)
- [ ] Supabase database tables for new domains (append to schema.sql)
- [ ] Time blocking UI component (plan-time-blocks.tsx)
- [ ] Recurring task creation UI
- [ ] Task dependency UI
- [ ] CSV/JSON export buttons in settings or dashboard
- [ ] Customizable dashboard widgets
- [ ] Unify or connect Pomodoro timer and Focus timer
- [ ] Cross-feature deep navigation (click task in Dashboard to jump to Tasks)
- [ ] Browser notifications for pomodoro completion and due date reminders
- [ ] Drag-and-drop task reordering in list view

---

## Phase 9: Architecture Fixes (Completed)

Addressed all 16 issues from `docs/ZonePro-Architecture-Review.md`:

### Phase 1 -- Shared Data Context (Issues #1, #2, #3, #4, #5, #8)
- [x] Create `contexts/app-data-context.tsx` with `useTasks`, `useFocusSessions`, `useHabits`
- [x] Wrap app in `AppDataProvider` in `app/page.tsx`
- [x] Migrate `DashboardSection` from 4x `useLocalStorage` to context (#1 Critical)
- [x] Migrate `FocusSection` from `useLocalStorage` to context (#2, #8)
- [x] Migrate `PlanSection` from 3x `useLocalStorage` to context (#3)
- [x] Migrate `TasksSection` to context + add `registerQuickAddRef` (#4)
- [x] Wire `CommandPalette` `focusQuickAdd()` via context (#4)
- [x] Migrate `HabitsSection` to context

### Phase 2 -- Settings & Persistence (Issues #6, #7, #9, #10)
- [x] Expand settings to full `AppSettings` type in `page.tsx` and types (#10)
- [x] Fix dual persistence: export/import now covers all per-domain keys (#7)
- [x] Fix `clearAllData` to remove all storage keys
- [x] Fix hardcoded daily budget (480) to use `settings.dailyTimeBudgetMinutes` (#6)
- [x] Add missing settings UI: Default View, Task Default View, Daily Focus Budget, Week Starts On, Auto Music Pause (#9)

### Phase 3 -- Feature Completeness (Issues #5, #14)
- [x] Note editor linked tasks UI: add/remove linked tasks via dropdown (#5)
- [x] Milestone linked tasks display in PlanGoals (#14)

### Phase 4 -- Refactoring & Polish (Issues #11, #12, #13, #15, #16)
- [x] Extract `PomodoroMode` standalone type (#15)
- [x] Add `onToggle`/`onDelete` to `TaskCalendarView` (#12)
- [x] Document `HabitStats` scope as per-habit via JSDoc (#13)
- [x] Extract `MobileNav` to `components/mobile-nav.tsx` + shared `lib/nav-items.ts` (#16)
- [x] Reduce `LearnSection` prop drilling via `LearnContext` (#11)

### Phase 5 -- Verification
- [x] TypeScript check passes clean (`tsc --noEmit`)
- [x] Next.js production build succeeds (`next build`)
- [x] Wire up cross-feature link fields (linkedTaskIds in Notes and Milestones)

---

## Phase 8: UI Overhaul (Completed)

- [x] Fix task name not updating while editing in detail sheet (stale selectedTask bug)
- [x] Lift music/pomodoro/courses/persistence state from LearnSection to app root
- [x] Extract music player engine into hooks/use-music-player-engine.ts
- [x] Create mini music player widget for header (persistent across all sections)
- [x] Create mini pomodoro widget for header (persistent across all sections)
- [x] Replace left sidebar with floating glassmorphed bottom navigation bar
- [x] Add mobile hamburger nav (bottom sheet with glassmorphism)
- [x] Change settings icon from hamburger (Menu) to gear (Settings)
- [x] Move settings trigger from LearnSection to floating nav bar
- [x] Refactor AppHeader (remove SidebarTrigger, add mobile nav slot)
- [x] Refactor MusicPlayer component to pure UI (engine logic in hook)
- [x] Refactor LearnSection to accept all state via props
- [x] Create docs/USER_GUIDE.md with feature guide, interlinking analysis, and improvement suggestions
- [x] Build passes

---

## Supabase Tables Required (manual setup)

Create these tables in the Supabase dashboard with RLS enabled (`auth.uid() = user_id`):

### courses

| Column                | Type        | Notes                                  |
| --------------------- | ----------- | -------------------------------------- |
| id                    | uuid        | Primary key, default gen_random_uuid() |
| user_id               | uuid        | References auth.users(id)              |
| local_id              | text        | Local app ID                           |
| title                 | text        |                                        |
| url                   | text        |                                        |
| video_id              | text        |                                        |
| current_time          | float       |                                        |
| duration              | float       |                                        |
| completed             | boolean     |                                        |
| last_watched          | timestamptz |                                        |
| playlist_id           | text        | nullable                               |
| playlist_index        | int         | default 0                              |
| playlist_progress     | jsonb       | default '{}'                           |
| playlist_metadata     | jsonb       | nullable                               |
| notes                 | jsonb       | default '[]'                           |
| **Unique constraint** |             | (user_id, local_id)                    |

### user_settings

| Column                  | Type    | Notes                             |
| ----------------------- | ------- | --------------------------------- |
| id                      | uuid    | Primary key                       |
| user_id                 | uuid    | References auth.users(id), UNIQUE |
| pomodoro_work_time      | int     | default 25                        |
| pomodoro_break_time     | int     | default 5                         |
| pomodoro_total_sessions | int     | default 4                         |
| auto_music_pause        | boolean | default true                      |

### music_tracks

| Column                | Type  | Notes                     |
| --------------------- | ----- | ------------------------- |
| id                    | uuid  | Primary key               |
| user_id               | uuid  | References auth.users(id) |
| local_id              | text  | Local app ID              |
| title                 | text  |                           |
| video_id              | text  |                           |
| duration              | float |                           |
| sort_order            | int   |                           |
| **Unique constraint** |       | (user_id, local_id)       |
