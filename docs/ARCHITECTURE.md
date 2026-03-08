# ZonePro Architecture & Component Reference

A detailed description of every page/section and every component in the ZonePro application.

---

## Table of Contents

1. [App Shell](#app-shell)
2. [Sections (Pages)](#sections)
    - [Learn](#learn-section)
    - [Tasks](#tasks-section)
    - [Focus](#focus-section)
    - [Habits](#habits-section)
    - [Notes](#notes-section)
    - [Dashboard](#dashboard-section)
    - [Plan](#plan-section)
3. [Persistent Header Components](#persistent-header-components)
4. [Navigation Components](#navigation-components)
5. [Shared / Utility Components](#shared-utility-components)
6. [Hooks](#hooks)
7. [Types](#types)
8. [Utilities & Libraries](#utilities-libraries)
9. [Data Flow](#data-flow)

---

## App Shell

### `app/layout.tsx` — Root Layout

The Next.js root layout. Sets up:

- **Poppins font** via `next/font/google` (weights 300-700), applied directly to `<body>` via `poppins.className`
- **ThemeProvider** from `next-themes` — supports `"system"`, `"light"`, and `"dark"` themes
- **Toaster** from `sonner` — toast notifications
- **Metadata** — title: "ZonePro", description: "Your Productivity Zone"

### `app/page.tsx` — Main SPA Page (`ZoneProApp`)

The entire application is a single `"use client"` component. There is no route-based navigation — sections are rendered conditionally based on `activeSection` state.

**State orchestration:**

| State / Hook              | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `activeSection`           | Controls which section is visible (7 values)        |
| `commandOpen`             | Controls command palette visibility                 |
| `useYouTubeAPI()`         | Loads YouTube IFrame API, returns `isYTReady`       |
| `useCourses()`            | Course CRUD, current course, add-course dialog      |
| `usePomodoro()`           | Timer state machine (3 modes), returns 10 methods   |
| `useMusicPlayer()`        | Playlist state, volume, shuffle, repeat             |
| `useMusicPlayerEngine()`  | Bridges state to actual YouTube player playback     |
| `useSessionPersistence()` | Auto-save to localStorage, export/import            |
| `useCloudSync()`          | Optional Supabase sync for logged-in users          |
| `useKeyboardShortcuts()`  | Ctrl+K, Ctrl+N, number key navigation               |
| `settings`                | App settings object (`{ autoMusicPause: boolean }`) |

**Layout structure:**

```
<div className="flex h-svh flex-col bg-background overflow-hidden">
  <!-- Hidden YouTube player (off-screen, never unmounts) -->
  <div style="position: absolute; left: -9999px; top: -9999px">
    <div id="music-player" />
  </div>

  <AppHeader>
    <MiniPomodoro />
    <MiniMusicPlayer />
  </AppHeader>

  <main className="flex-1 overflow-y-auto p-4 pb-24">
    {activeSection === "learn" && <LearnSection ... />}
    {activeSection === "tasks" && <TasksSection />}
    {activeSection === "focus" && <FocusSection />}
    {activeSection === "habits" && <HabitsSection />}
    {activeSection === "notes" && <NotesSection />}
    {activeSection === "dashboard" && <DashboardSection />}
    {activeSection === "plan" && <PlanSection />}
  </main>

  <FloatingNav />
  <CommandPalette />
</div>
```

**Key design decisions:**

- Page is locked to `h-svh` (viewport height) with `overflow-hidden`; scrolling happens inside `<main>`
- Music player `<div>` is positioned off-screen and never unmounts to maintain playback continuity
- `LearnSection` receives ~20 props from the orchestrator; all other sections are self-contained (use their own hooks internally)

### `app/login/page.tsx` — Login Page

Standalone login page with email/password form and GitHub OAuth button. Uses Supabase `signInWithPassword` and `signInWithOAuth`. Redirects to `/` on success.

### `app/signup/page.tsx` — Signup Page

Standalone signup page with email/password form. Uses Supabase `signUp`. Shows success message after registration.

### `app/auth/callback/route.ts` — OAuth Callback

Server-side route handler that exchanges OAuth codes for Supabase sessions. Redirects to `/` after.

---

## Sections

### Learn Section

**File:** `components/sections/learn-section.tsx`

The YouTube-based learning environment. Organizes courses, tracks video progress, and provides a study workspace with pomodoro timer.

**Layout:** 3-column grid (`lg:grid-cols-3`), with main content spanning 2 columns and a sidebar on the right.

**Components used:**

| Component             | Location       | Description                                                      |
| --------------------- | -------------- | ---------------------------------------------------------------- |
| `SyncStatusIndicator` | Top            | Shows cloud sync status (idle/syncing/synced/error)              |
| `CoursePlayer`        | Main (2 cols)  | YouTube video embed with progress tracking, notes, and auto-save |
| `CourseList`          | Main (2 cols)  | Grid of course cards with progress bars and delete buttons       |
| `YouTubePlaylist`     | Sidebar        | Video list for playlist courses with completion checkmarks       |
| `PomodoroTimer`       | Sidebar        | Full 3-mode timer (Pomodoro/Timer/Stopwatch)                     |
| `AddCourseDialog`     | Dialog overlay | Dialog to add a new course by YouTube URL                        |

**Props received from `page.tsx`:** `isYTReady`, all course state/methods, all pomodoro state/methods, `settings`, `handleMusicControl`, `musicWasPlaying`, `setMusicWasPlaying`, `syncStatus`.

#### `CoursePlayer` (`components/course-player.tsx`)

The main video player component. Creates and manages a YouTube IFrame player instance.

**Features:**

- Embeds YouTube video via IFrame API (not an `<iframe>` tag — uses the JS API for programmatic control)
- Auto-saves playback position every 5 seconds
- Progress bar showing watch completion
- Course notes with timestamp links (click a timestamp to seek)
- Auto-pauses background music when video starts playing (if `autoMusicPause` setting enabled)
- Shows "Add a Course" CTA when no course is selected

**Props:** `currentCourse`, `onCourseUpdate`, `onAddCourse`, `isYTReady`, `settings`, `onMusicControl`, `musicWasPlaying`, `setMusicWasPlaying`

#### `CourseList` (`components/course-list.tsx`)

Displays all courses as a grid of cards.

**Features:**

- Card per course: title, progress percentage bar, video count (for playlists), last watched date
- Click card to select/load the course
- Delete button (Trash2 icon) per card
- Empty state message when no courses exist

**Props:** `courses: CourseProgress[]`, `onSelectCourse`, `onDeleteCourse`

#### `YouTubePlaylist` (`components/youtube-playlist.tsx`)

Sidebar showing all videos in a YouTube playlist with progress tracking.

**Features:**

- Video list with thumbnails, titles, duration
- Completion checkmarks per video
- Current video highlighted
- Fetches playlist metadata from YouTube

**Props:** `playlistId`, `currentVideoIndex`, `playlistProgress`, `onPlaylistMetadata`, `onVideoSelect`

#### `PomodoroTimer` (`components/pomodoro-timer.tsx`)

Full-featured timer with three mode tabs.

**Tabs:**

1. **Pomodoro** — Work/break cycles with:
    - Circular timer display
    - Work phase (green) / Break phase (blue) indicator
    - Session counter (e.g., "Session 2 of 4")
    - Start, Pause, Reset buttons
    - "Skip to Break" and "Skip to Work" buttons

2. **Timer** — Standalone countdown with:
    - Preset duration buttons: 5m, 10m, 15m, 30m, 60m
    - Countdown display
    - Start, Pause, Reset buttons

3. **Stopwatch** — Counting-up timer with:
    - Elapsed time display
    - Start, Pause, Reset buttons

**Props:** `pomodoro`, `onStart`, `onPause`, `onReset`, `onSkipToBreak`, `onSkipToWork`, `onSetMode`, `onSetTimerDuration`

#### `AddCourseDialog` (`components/add-course-dialog.tsx`)

A dialog (shadcn `Dialog`) for adding a new course. Two input fields: course title and YouTube URL (video or playlist). Submit button to add.

**Props:** `open`, `onOpenChange`, `newCourseTitle`, `newCourseUrl`, `onTitleChange`, `onUrlChange`, `onAddCourse`

---

### Tasks Section

**File:** `components/sections/tasks-section.tsx`

Self-contained task management system. Uses `useTasks()` hook internally — does not receive props from `page.tsx`.

**Layout:** Quick add bar at top, search/sort controls, tabbed views below.

**State:**

- `selectedTaskId` — ID of task open in detail sheet
- `detailOpen` — controls detail sheet visibility
- `useTasks()` — full task CRUD, filtering, sorting

**Components used:**

| Component          | Location      | Description                                             |
| ------------------ | ------------- | ------------------------------------------------------- |
| `TaskQuickAdd`     | Top           | Inline text input; press Enter to create a task         |
| `TaskListView`     | Tab: List     | Collapsible sections by status (To Do/In Progress/Done) |
| `TaskKanbanView`   | Tab: Board    | Three-column card board with context menu actions       |
| `TaskCalendarView` | Tab: Calendar | Calendar grid + task list for selected date             |
| `TaskDetailSheet`  | Sheet overlay | Full task editor in a side sheet                        |

#### `TaskQuickAdd` (`components/tasks/task-quick-add.tsx`)

Simple input field. Press Enter to create a task with the typed title (defaults to "todo" status, "none" priority).

**Props:** `onAdd: (title: string) => void`, `autoFocus?: boolean`

#### `TaskItem` (`components/tasks/task-item.tsx`)

A single task row/card used across views.

**Features:**

- Checkbox to toggle between "todo" and "done"
- Priority badge (colored: red=urgent, orange=high, yellow=medium, blue=low)
- Labels as small badges
- Due date display
- Subtask count indicator
- 3-dot dropdown menu: change status, change priority, delete

**Exports:** `PRIORITY_CONFIG` object mapping priority levels to colors and labels.

**Props:** `task`, `subtaskCount`, `onToggle`, `onUpdate`, `onDelete`, `onClick`

#### `TaskListView` (`components/tasks/task-list-view.tsx`)

Groups tasks into collapsible sections: "To Do", "In Progress", "Done". Each section shows task count and can be collapsed/expanded. Uses `Collapsible` from shadcn.

**Props:** `tasks`, `onToggle`, `onUpdate`, `onDelete`, `onClick`, `getSubtasks`

#### `TaskKanbanView` (`components/tasks/task-kanban-view.tsx`)

Three-column board layout. Each column (To Do / In Progress / Done) contains task cards. Right-click a card for a context menu to move it to a different status.

**Props:** `tasksByStatus`, `onToggle`, `onMove`, `onDelete`, `onClick`

#### `TaskCalendarView` (`components/tasks/task-calendar-view.tsx`)

Left side: calendar widget (shadcn `Calendar`). Dates with tasks are styled bold/underlined. Right side: task list for the selected date. Click a date to see its tasks.

**Props:** `tasksByDate`, `onClick`

#### `TaskDetailSheet` (`components/tasks/task-detail-sheet.tsx`)

A side sheet (shadcn `Sheet`) that slides in from the right for full task editing.

**Editable fields:**

- Title (inline editable)
- Description (textarea)
- Status (select dropdown)
- Priority (select dropdown)
- Due date (date picker)
- Estimated time (minutes input)
- Labels (add/remove tags)
- Subtasks (add subtask, toggle completion)
- Delete button (with destructive styling)

**Props:** `task`, `open`, `onOpenChange`, `onUpdate`, `onDelete`, `subtasks`, `onAddSubtask`

---

### Focus Section

**File:** `components/sections/focus-section.tsx`

Dedicated focus/time tracking page. Self-contained — uses `useFocusSessions()` and reads tasks from localStorage.

**Layout:** Daily budget card at top, timer and stopwatch side-by-side, session log below.

**Components used:**

| Component          | Location   | Description                                              |
| ------------------ | ---------- | -------------------------------------------------------- |
| `FocusDailyBudget` | Top        | Progress bar: today's minutes vs 480min (8hr) budget     |
| `FocusTimer`       | Left card  | Pomodoro-style countdown with task linking               |
| `FocusStopwatch`   | Right card | Simple stopwatch with start/stop/save                    |
| `FocusSessionLog`  | Bottom     | Table of recent sessions with date, type, duration, task |

#### `FocusDailyBudget` (`components/focus/focus-daily-budget.tsx`)

Card showing a progress bar of today's total focus minutes against an 8-hour goal. Displays minutes and percentage.

**Props:** `todayMinutes: number`, `budgetMinutes: number`

#### `FocusTimer` (`components/focus/focus-timer.tsx`)

A pomodoro-style timer card dedicated to focused work.

**Features:**

- Task selector dropdown (choose which task you're working on)
- Configurable work duration (15-60 min, slider)
- Configurable break duration (3-15 min, slider)
- Start/pause/reset controls
- Work/break phase display
- Logs a FocusSession on completion

**Props:** `tasks: Task[]`, `onSessionComplete: (session: FocusSession) => void`

#### `FocusStopwatch` (`components/focus/focus-stopwatch.tsx`)

A simple stopwatch for open-ended focus sessions.

**Features:**

- Counting-up display
- Start, stop, save buttons
- Logs a FocusSession when saved

**Props:** `onSessionComplete: (session: FocusSession) => void`

#### `FocusSessionLog` (`components/focus/focus-session-log.tsx`)

Table of recent focus sessions.

**Columns:** Date, Type (badge: "pomodoro" or "stopwatch"), Duration, Linked Task name.

**Props:** `sessions: FocusSession[]`, `taskNames: Record<string, string>`

---

### Habits Section

**File:** `components/sections/habits-section.tsx`

Self-contained habit tracking page. Uses `useHabits()` hook internally.

**Layout:** Add button at top, today's habits grid, stats cards, 30-day dot grids.

**State:** `dialogOpen`, `editingHabit`, `selectedHabitId` for add/edit dialog.

**Components used:**

| Component           | Location  | Description                                     |
| ------------------- | --------- | ----------------------------------------------- |
| `HabitList`         | Top grid  | Today's habits as colored toggle cards          |
| `HabitStats`        | Middle    | 3-card grid with streak, completion rate, total |
| `HabitDotGrid`      | Per habit | 30-day completion dot grid                      |
| `HabitDetailDialog` | Dialog    | Add/edit habit form                             |

#### `HabitList` (`components/habits/habit-list.tsx`)

Grid of today's habits as cards with:

- Colored circle button to toggle completion
- Habit title
- Streak badge (fire icon + count)
- Click card to select for detailed view

**Props:** `habits: HabitWithStatus[]`, `streaks: Record<string, number>`, `onToggle`, `onClick`

#### `HabitStats` (`components/habits/habit-stats.tsx`)

Three stat cards in a grid:

1. **Current Streak** — consecutive days completed
2. **30-Day Rate** — percentage completion over last 30 days
3. **Total Completions** — all-time count

**Props:** `streak: number`, `completionRate: number`, `totalCompletions: number`

#### `HabitDotGrid` (`components/habits/habit-dot-grid.tsx`)

A 10×3 grid (30 days) of dots showing daily completion. Each dot is colored using the habit's color when completed, gray when missed. Tooltip on hover shows the date and completion count.

**Props:** `habitId`, `habitTitle`, `habitColor`, `getCompletion`, `targetCount`

#### `HabitDetailDialog` (`components/habits/habit-detail-dialog.tsx`)

Dialog form for adding or editing a habit.

**Fields:**

- Title (text input)
- Description (textarea)
- Frequency (select: daily / weekly / custom)
- Target count (number input)
- Color picker (8 color options: red, orange, yellow, green, teal, blue, purple, pink)

**Props:** `habit?: Habit`, `open`, `onOpenChange`, `onSave`

---

### Notes Section

**File:** `components/sections/notes-section.tsx`

Two-panel notes system using `ResizablePanelGroup` (horizontal split). Uses `useNotes()` hook internally.

**Layout:** Note list on the left (~35%), note editor on the right (~65%).

**Components used:**

| Component    | Location    | Description                          |
| ------------ | ----------- | ------------------------------------ |
| `NoteList`   | Left panel  | Searchable, filterable list of notes |
| `NoteEditor` | Right panel | Full editor with Markdown preview    |

#### `NoteList` (`components/notes/note-list.tsx`)

List sidebar for browsing notes.

**Features:**

- Search input for filtering by title/content
- "Show Archived" toggle
- "New Note" button
- Note cards showing: title, first line preview, tags as badges, pin icon
- Selected note is highlighted
- Pinned notes appear first

**Props:** `notes`, `selectedId`, `searchQuery`, `showArchived`, `onSearch`, `onSelect`, `onAdd`, `onToggleArchived`

#### `NoteEditor` (`components/notes/note-editor.tsx`)

Full note editor with Markdown support.

**Toolbar buttons:**

- Pin / Unpin (Pin/PinOff icons)
- Archive / Unarchive (Archive/ArchiveRestore icons)
- Write / Preview toggle (Pencil/Eye icons)
- Delete (Trash2 icon, destructive red)

**Body sections:**

- **Title** — borderless input, large font
- **Tags** — inline tag badges with remove button, plus "Add tag..." input
- **Content** — switches between:
    - **Write mode:** `<Textarea>` with monospace font, Markdown input
    - **Preview mode:** `<ReactMarkdown>` with `remark-gfm` plugin, rendered in `prose prose-sm dark:prose-invert` styling

Content changes are debounced by 500ms before saving.

**Props:** `note`, `onUpdate`, `onDelete`, `onTogglePinned`, `onToggleArchived`

---

### Dashboard Section

**File:** `components/sections/dashboard-section.tsx`

Analytics overview. Reads directly from localStorage (tasks, focus sessions, habits, habit logs) — does not use section-specific hooks.

**Layout:** 2-column grid for stats + score, full-width heatmap, full-width habit overview.

**Components used:**

| Component                    | Location   | Description                          |
| ---------------------------- | ---------- | ------------------------------------ |
| `DashboardTaskStats`         | Top left   | 7-day task completion bar chart      |
| `DashboardProductivityScore` | Top right  | 30-day productivity score line chart |
| `DashboardFocusHeatmap`      | Full width | 90-day GitHub-style focus heatmap    |
| `DashboardHabitOverview`     | Full width | Per-habit 14-day dots + streak info  |

#### `DashboardTaskStats` (`components/dashboard/dashboard-task-stats.tsx`)

Card with a Recharts `BarChart` showing tasks completed per day over the last 7 days. A badge shows today's count. Uses `date-fns` for date formatting.

**Props:** `tasks: Task[]`

#### `DashboardProductivityScore` (`components/dashboard/dashboard-productivity-score.tsx`)

Card with a Recharts `LineChart` showing a composite productivity score over 30 days.

**Score formula:** `(tasksCompleted × 10) + (focusMinutes × 0.5) + (habitsCompleted × 15)`

**Props:** `tasks: Task[]`, `sessions: FocusSession[]`, `habitLogs: HabitLog[]`

#### `DashboardFocusHeatmap` (`components/dashboard/dashboard-focus-heatmap.tsx`)

Card with a 90-day grid (GitHub contribution graph style). Each cell represents a day, colored by intensity based on total focus minutes. Tooltip shows date and minutes. Color scale: gray (0) → light green → dark green.

**Props:** `sessions: FocusSession[]`

#### `DashboardHabitOverview` (`components/dashboard/dashboard-habit-overview.tsx`)

Card showing each habit with a 14-day mini dot grid and streak badge. Visual summary of recent habit adherence.

**Props:** `habits: Habit[]`, `habitLogs: HabitLog[]`

---

### Plan Section

**File:** `components/sections/plan-section.tsx`

Planning tools organized in tabs. Uses `usePlanning()` hook plus direct localStorage reads for tasks/sessions/habitLogs.

**Layout:** Three tabs: Today, Goals, Weekly Review.

**Components used:**

| Component          | Tab    | Description                              |
| ------------------ | ------ | ---------------------------------------- |
| `PlanDailyTop3`    | Today  | Pick your top 3 priority tasks for today |
| `PlanGoals`        | Goals  | CRUD for goals with milestones           |
| `PlanWeeklyReview` | Review | 3-step reflection wizard                 |

#### `PlanDailyTop3` (`components/plan/plan-daily-top3.tsx`)

Card with 3 numbered slots (1, 2, 3). Each slot has a dropdown to select a task from your task list, or an X button to clear the slot. Helps focus on what matters most today.

**Props:** `priorityTaskIds: string[]`, `tasks: Task[]`, `onUpdate: (taskIds: string[]) => void`

#### `PlanGoals` (`components/plan/plan-goals.tsx`)

Goal management with accordion UI.

**Features:**

- Add Goal button → dialog with title, description, target date
- Each goal as an accordion item:
    - Progress bar (based on completed milestones)
    - Status badge (active/completed/archived)
    - Milestone list with checkboxes
    - "Add Milestone" input
    - Delete goal button

**Props:** `goals`, `onAdd`, `onUpdate`, `onDelete`, `onAddMilestone`, `onToggleMilestone`

#### `PlanWeeklyReview` (`components/plan/plan-weekly-review.tsx`)

3-step wizard card with progress bar.

**Steps:**

1. **What went well?** — Auto-populated with completed tasks count, total focus time, habits completed this week
2. **What needs work?** — Lists overdue or incomplete tasks from the week
3. **Plan next week** — Tips/prompts for planning ahead

Navigation: Back/Next buttons.

**Props:** `tasks: Task[]`, `sessions: FocusSession[]`, `habitLogs: HabitLog[]`

---

## Persistent Header Components

### `AppHeader` (`components/app-header.tsx`)

Top header bar, always visible.

**Layout:**

```
[MobileNav] [ZonePro logo] [/ Section Title] -------- [children] [ThemeToggle] [UserMenu]
```

- **ZonePro logo:** `<span>` with "Zone" in primary color + "Pro" in muted foreground
- **Section title:** Hidden on mobile (`hidden sm:block`)
- **children slot:** Used for `MiniPomodoro` + `MiniMusicPlayer`

**Props:** `title: string`, `children?: ReactNode`, `mobileNav?: ReactNode`

**Sub-components:** `ThemeToggle`, `UserMenu`

### `MiniPomodoro` (`components/mini-pomodoro.tsx`)

Compact pomodoro display in the header.

**States:**

| State  | Display                                                    |
| ------ | ---------------------------------------------------------- |
| Idle   | Clock icon button (click to start)                         |
| Active | Colored dot + time + play/pause button in a pill container |
| Paused | Gray dot + time + play button                              |

**Color coding:**

- Green + pulse = pomodoro (work phase)
- Blue + pulse = pomodoro (break phase)
- Orange + pulse = stopwatch running
- Purple + pulse = timer running
- Gray = paused

**Time display:** Stopwatch shows `elapsed`, timer/pomodoro show `timeLeft`.

**Props:** `pomodoro: PomodoroSession`, `onStart`, `onPause`

### `MiniMusicPlayer` (`components/mini-music-player.tsx`)

Compact music controls in the header that expand into a full popover.

**Trigger (always visible):** Pill-shaped button showing Music icon, truncated track name, and play/pause icon.

**Popover content (on click):**

```
┌──────────────────────────────┐
│  🎵 Track Title              │
├──────────────────────────────┤
│  ⏮  ▶/⏸  ⏭                  │
│  🔇 ━━━━━━━━━━━━━━━ 🔊      │  (volume slider)
│  🔀 Shuffle  🔁 Repeat       │
├──────────────────────────────┤
│  ▼ Queue (N tracks)          │
│  [Add YouTube URL input]     │
│  ┌─────────────────────────┐ │
│  │ Track 1          ▶  🗑  │ │
│  │ Track 2          ▶  🗑  │ │
│  │ Track 3          ▶  🗑  │ │
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

**Features:**

- Transport controls: previous, play/pause, next
- Volume: mute toggle button + slider (0-100)
- Shuffle and repeat toggle buttons
- Queue section (collapsible):
    - Add track input (YouTube URL)
    - Scrollable track list (max-h 48) with play and delete buttons
- Default lofi track initialization (Lofi Girl stream) when playlist is empty

**Props:** `musicPlayer`, `isActuallyPlaying`, `onPlay`, `onPause`, `onNext`, `onPrev`, `showMusicQueue`, `newMusicUrl`, `onToggleQueue`, `onUpdateMusicPlayer`, `onSetNewMusicUrl`, `onPlayTrack`, `onDeleteTrack`

---

## Navigation Components

### `FloatingNav` (`components/floating-nav.tsx`)

Desktop floating navigation bar, fixed at bottom center.

**Appearance:** Glassmorphic pill (`backdrop-blur-xl`, `bg-background/80`) with tooltip-wrapped icon buttons. Settings gear icon at the trailing end.

**Nav items:**

| Icon        | Section   |
| ----------- | --------- |
| BookOpen    | Learn     |
| CheckSquare | Tasks     |
| Timer       | Focus     |
| Flame       | Habits    |
| StickyNote  | Notes     |
| BarChart2   | Dashboard |
| Target      | Plan      |

**Props:** `active: string`, `onNavigate: (section: string) => void`, `trailing?: ReactNode`

### `MobileNav` (`components/floating-nav.tsx` — same file)

Hamburger menu button that opens a bottom Sheet with all navigation items and trailing content (settings).

**Props:** Same as `FloatingNav`.

### `CommandPalette` (`components/command-palette.tsx`)

`Ctrl+K` command dialog using shadcn `CommandDialog`.

**Commands:**

- "Add New Task" (Ctrl+N) — navigates to Tasks and focuses quick-add
- Navigation to all 7 sections (shortcut keys 1-7)
- Grouped under "Quick Actions" and "Navigation"

**Props:** `open`, `onOpenChange`, `onNavigate`, `onQuickAddTask`

---

## Shared / Utility Components

### `SettingsSheet` (`components/settings-sheet.tsx`)

Side sheet accessible from the navigation bar's gear icon.

**Sections:**

1. **Pomodoro Settings** — sliders for work time (5-60), break time (5-30), total sessions (1-8), with Save button
2. **Session Management** — Export (JSON download), Import (JSON upload), Clear All Data (with AlertDialog confirmation)
3. **Session Stats** — courses count and music tracks count display

**Props:** `settings`, `pomodoro`, `coursesCount`, `musicTracksCount`, `onUpdateSettings`, `onUpdatePomodoro`, `onExportSession`, `onImportSession`

### `ThemeToggle` (`components/theme-toggle.tsx`)

Sun/Moon icon button. Toggles between light and dark themes via `next-themes` `useTheme()`.

### `UserMenu` (`components/user-menu.tsx`)

Avatar dropdown menu.

- **Logged out:** Shows "Login" and "Sign Up" links
- **Logged in:** Shows user email, avatar, and "Sign Out" button
- Uses Supabase `getUser()` for auth state

### `SyncStatusIndicator` (`components/sync-status.tsx`)

Small text/icon indicator showing cloud sync status.

**States:** idle (hidden), syncing (spinner + "Syncing..."), synced (check + "Synced"), error (alert + "Sync error")

**Props:** `status: SyncStatus`

### `ThemeProvider` (`components/theme-provider.tsx`)

Thin wrapper around `next-themes` `ThemeProvider`. Standard shadcn boilerplate.

---

## Hooks

| Hook                    | File                               | Persistence Key                             | Description                                             |
| ----------------------- | ---------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| `useLocalStorage<T>`    | `hooks/use-local-storage.ts`       | (generic)                                   | Typed localStorage with SSR safety                      |
| `useYouTubeAPI`         | `hooks/use-youtube-api.ts`         | —                                           | Loads YouTube IFrame script, tracks readiness           |
| `useCourses`            | `hooks/use-courses.ts`             | `zonepro-courses`                           | Course CRUD, current course, add dialog state           |
| `usePomodoro`           | `hooks/use-pomodoro.ts`            | `zonepro-pomodoro`                          | 3-mode timer state machine (pomodoro/timer/stopwatch)   |
| `useMusicPlayer`        | `hooks/use-music-player.ts`        | `zonepro-music`                             | Playlist state, volume, shuffle, repeat, track ops      |
| `useMusicPlayerEngine`  | `hooks/use-music-player-engine.ts` | —                                           | Bridges state → YouTube IFrame API for actual playback  |
| `useSessionPersistence` | `hooks/use-session-persistence.ts` | `zonepro-data`                              | Auto-save all state to localStorage, export/import      |
| `useCloudSync`          | `hooks/use-cloud-sync.ts`          | Supabase `user_sessions`                    | Optional cloud push/pull for authenticated users        |
| `useTasks`              | `hooks/use-tasks.ts`               | `zonepro-tasks`                             | Full task CRUD, filtering, sorting, status ops          |
| `useFocusSessions`      | `hooks/use-focus-sessions.ts`      | `zonepro-focus-sessions`                    | Focus session logging, today's minutes, recent sessions |
| `useHabits`             | `hooks/use-habits.ts`              | `zonepro-habits`, `zonepro-habit-logs`      | Habit CRUD, completion, streaks, rates                  |
| `useNotes`              | `hooks/use-notes.ts`               | `zonepro-notes`                             | Note CRUD, search, pin/archive toggle                   |
| `usePlanning`           | `hooks/use-planning.ts`            | `zonepro-goals`, `zonepro-daily-priorities` | Goals/milestones CRUD, daily top-3                      |
| `useKeyboardShortcuts`  | `hooks/use-keyboard-shortcuts.ts`  | —                                           | Ctrl+K, Ctrl+N, number keys 1-7 navigation              |
| `useMobile`             | `hooks/use-mobile.tsx`             | —                                           | `isMobile` boolean (width < 768px)                      |
| `useToast`              | `hooks/use-toast.ts`               | —                                           | Toast notifications (sonner/shadcn pattern)             |

---

## Types

All types defined in `types/index.ts`:

### Core Data Types

| Type              | Key Fields                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `CourseProgress`  | id, title, url, videoId, currentTime, duration, completed, playlistId, playlistProgress, notes                                                  |
| `PomodoroSession` | workTime, breakTime, currentSession, totalSessions, isActive, isBreak, timeLeft, mode, timerDuration, elapsed                                   |
| `MusicTrack`      | id, title, videoId, duration                                                                                                                    |
| `MusicPlayer`     | currentTrack, playlist, volume, isPlaying, isMuted, currentTime, shuffle, repeat, currentIndex                                                  |
| `Task`            | id, title, description, status, priority, labels, dueDate, parentId, dependsOn, recurrence, estimatedMinutes, sortOrder, createdAt, completedAt |
| `FocusSession`    | id, taskId, type, startedAt, endedAt, plannedMinutes, actualMinutes, completed, date                                                            |
| `Habit`           | id, title, description, frequency, targetDays, targetCount, color, icon, sortOrder, archivedAt                                                  |
| `HabitLog`        | id, habitId, date, count, note                                                                                                                  |
| `Note`            | id, title, content, tags, isPinned, isArchived, linkedTaskIds, linkedCourseId                                                                   |
| `Goal`            | id, title, description, targetDate, milestones, status                                                                                          |
| `Milestone`       | id, title, completed, linkedTaskIds, sortOrder                                                                                                  |
| `DailyPriority`   | date, taskIds                                                                                                                                   |
| `TimeBlock`       | id, date, startHour, startMinute, durationMinutes, title, taskId, color                                                                         |
| `AppSettings`     | autoMusicPause, defaultView, taskDefaultView, dailyTimeBudgetMinutes, weekStartsOn                                                              |

### Enum Types

| Type                   | Values                                     |
| ---------------------- | ------------------------------------------ |
| `TaskPriority`         | "urgent", "high", "medium", "low", "none"  |
| `TaskStatus`           | "todo", "in_progress", "done", "cancelled" |
| `PomodoroSession.mode` | "pomodoro", "timer", "stopwatch"           |

### YouTube Types

| Type             | Purpose                             |
| ---------------- | ----------------------------------- |
| `YTPlayer`       | YouTube IFrame player instance      |
| `YTPlayerEvent`  | Player event callback data          |
| `YTPlayerConfig` | Configuration for creating a player |

---

## Utilities & Libraries

| File                                  | Exports                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `lib/utils.ts`                        | `cn()` — clsx + tailwind-merge utility                 |
| `lib/constants.ts`                    | Storage keys, default pomodoro times, default lofi ID  |
| `lib/date-utils.ts`                   | `formatShortDate(dateStr)` via date-fns                |
| `lib/export-utils.ts`                 | `exportToJSON(data, filename)`, `importFromJSON(file)` |
| `lib/supabase/client.ts`              | Browser-side Supabase client                           |
| `lib/supabase/server.ts`              | Server-side Supabase client with SSR cookies           |
| `lib/supabase/middleware.ts`          | Auth token refresh middleware                          |
| `lib/supabase/sync.ts`                | `pushSessionToCloud`, `pullSessionFromCloud`           |
| `utils/youtube.ts`                    | `getYouTubeVideoId(url)`, `formatTime(seconds)`        |
| `utils/youtube-playlist-extractor.ts` | `extractPlaylistId(url)`, `getPlaylistItems(id)`       |

### shadcn/ui Components (`components/ui/`)

Pre-built components from shadcn/ui: accordion, alert-dialog, avatar, badge, button, calendar, card, chart, checkbox, collapsible, command, context-menu, dialog, dropdown-menu, input, label, popover, progress, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, table, tabs, textarea, toggle, toggle-group, tooltip.

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    page.tsx                          │
│              (state orchestrator)                    │
│                                                     │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐          │
│  │useCourses│  │usePomodoro│  │useMusic  │          │
│  └────┬─────┘  └────┬──────┘  └────┬─────┘          │
│       │             │              │                 │
│       ▼             ▼              ▼                 │
│  LearnSection  MiniPomodoro  MiniMusicPlayer        │
│                                                     │
│  ┌───────────────────────────────────────┐          │
│  │  useSessionPersistence (auto-save)    │──► localStorage
│  │  useCloudSync (optional)              │──► Supabase
│  └───────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          Self-Contained Sections                    │
│                                                     │
│  TasksSection ──► useTasks() ──► localStorage       │
│  FocusSection ──► useFocusSessions() ──► localStorage│
│  HabitsSection ──► useHabits() ──► localStorage     │
│  NotesSection ──► useNotes() ──► localStorage       │
│  PlanSection ──► usePlanning() ──► localStorage     │
│  DashboardSection ──► reads all keys directly       │
└─────────────────────────────────────────────────────┘
```

**Key architectural notes:**

- `page.tsx` orchestrates courses, pomodoro, and music because they share state across sections (header mini controls persist everywhere)
- Tasks, Focus, Habits, Notes, and Planning are self-contained — they own their hooks and localStorage keys
- Dashboard reads from all localStorage keys directly (no hooks) to aggregate analytics
- All data persists to localStorage via `useLocalStorage` hook
- Cloud sync is additive — pushes the combined session data to Supabase for authenticated users
