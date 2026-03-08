# ZonePro User Guide

## Overview

ZonePro is an all-in-one productivity web application that combines learning, task management, focus tools, habit tracking, note-taking, analytics, and planning into a single connected workspace. All data is stored locally in your browser with optional cloud sync via Supabase.

The app uses the Poppins font throughout for a clean, modern aesthetic. Light and dark themes are supported via the theme toggle in the header.

---

## Features

### 1. Learn

The Learn section is a YouTube-based course management system. Add courses or playlists by URL, and ZonePro tracks your progress per video (timestamps, completion status). A playlist sidebar shows all videos with progress indicators. The pomodoro timer is also available in the sidebar for focused study.

**How to use:**

- Click the "+" button to add a new course (paste a YouTube video or playlist URL)
- Click a course to start watching; your timestamp is saved automatically
- For playlists, use the sidebar to jump between videos
- Mark videos as complete as you go
- Use the pomodoro timer in the sidebar for timed study blocks

### 2. Tasks

Full-featured task management with three views:

- **List view** -- collapsible sections grouped by status (To Do / In Progress / Done)
- **Kanban view** -- three-column board with context menus to move tasks between columns
- **Calendar view** -- see tasks by due date; dates with tasks are bold/underlined

Tasks support subtasks, priority levels (Urgent/High/Medium/Low/None), labels/tags, due dates, estimated time, and dependencies. Click any task to open a detail sheet for editing all fields.

**How to use:**

- Type in the quick-add bar at the top to create a task instantly
- Use the search bar and sort dropdown to filter/organize
- Click a task to open the detail sheet and edit title, description, priority, due date, labels, and subtasks
- Right-click tasks in Kanban view for quick status changes

### 3. Focus

A dedicated focus mode with both a pomodoro timer and a stopwatch, integrated with your task list. Unlike the pomodoro in Learn (which is for general study), the Focus section lets you link sessions to specific tasks for time tracking.

**Components:**

- **Daily Budget** -- progress bar showing today's focus minutes vs an 8-hour goal
- **Focus Timer** -- pomodoro-style countdown with configurable work/break durations (15-60 min work, 3-15 min break), linkable to a task
- **Focus Stopwatch** -- simple start/stop timer for open-ended sessions
- **Session Log** -- table of recent sessions with date, type, duration, and linked task

**How to use:**

- Select a task from the dropdown to link your focus session
- Choose Timer or Stopwatch depending on your preference
- Start working; sessions are automatically logged when completed
- Check the daily budget card to track your overall focus time

### 4. Habits

Daily habit tracking with streak counting, completion rates, and visual history.

**Components:**

- **Today's Habits** -- cards with colored circle toggles and streak badges
- **Stats Cards** -- current streak, 30-day completion rate, total completions
- **Dot Grid** -- 30-day visual history (10x3 grid) per habit, colored by habit color

**How to use:**

- Click "Add Habit" to create a new habit with title, description, frequency, target count, and color
- Check them off daily by clicking the circle
- View your streak count and completion rates in the stats cards
- Click a habit to see its 30-day dot grid history
- Supports daily, weekly, and custom frequency habits

### 5. Notes

A two-panel note system with Markdown support, tagging, search, pin, and archive.

**Components:**

- **Note List** (left panel, ~35%) -- searchable list with pin icons, tag badges, archive toggle, and add button
- **Note Editor** (right panel, ~65%) -- toolbar (pin/archive/delete), title input, tag management, and content area with Write/Preview toggle

**How to use:**

- Create notes and organize with tags
- Pin important notes to the top of the list
- Archive notes you don't need frequently
- Use the search bar to find notes by content or title
- Toggle between **Write** (Markdown editor) and **Preview** (rendered Markdown) modes
- Markdown supports GitHub Flavored Markdown (GFM): tables, strikethrough, task lists, etc.

### 6. Dashboard

Analytics and metrics aggregated from all your tools.

**Components:**

- **Task Stats** -- bar chart of tasks completed over the last 7 days
- **Productivity Score** -- line chart of a composite score over 30 days (formula: tasks×10 + focus minutes×0.5 + habits×15)
- **Focus Heatmap** -- 90-day GitHub-style heatmap grid for focus time
- **Habit Overview** -- per-habit 14-day mini dot grids with streak badges

### 7. Plan

Goal-setting and planning tools organized in three tabs.

**Tabs:**

- **Today** -- "Top 3" priority picker (select up to 3 tasks from your task list)
- **Goals** -- create goals with milestones, track progress with progress bars and checkboxes
- **Weekly Review** -- 3-step guided wizard: "What went well?" (auto-populated from completed tasks/focus time), "What needs work?" (overdue tasks), "Plan next week" (tips)

---

## Navigation

### Header

The header bar shows the **ZonePro** logo (left), section title, and persistent mini controls:

- **Mini Pomodoro** -- compact timer with color-coded status dot (green=focus, blue=break, orange=stopwatch, purple=timer)
- **Mini Music Player** -- compact controls that expand into a full popover (see below)
- **Theme Toggle** -- switch between light and dark modes
- **User Menu** -- login/signup or profile/sign-out

### Desktop

A floating glassmorphic navigation bar sits at the bottom center of the screen with icons for all 7 sections. A settings gear icon is at the right end.

### Mobile

A hamburger menu button appears in the top-left of the header. Tap it to open a bottom sheet with all navigation options.

### Command Palette

Press `Ctrl+K` to open the command palette for quick navigation and task creation.

---

## Keyboard Shortcuts

| Shortcut | Action                                  |
| -------- | --------------------------------------- |
| `Ctrl+K` | Open command palette                    |
| `Ctrl+N` | Quick add task (jumps to Tasks section) |
| `1`      | Navigate to Learn                       |
| `2`      | Navigate to Tasks                       |
| `3`      | Navigate to Focus                       |
| `4`      | Navigate to Habits                      |
| `5`      | Navigate to Notes                       |
| `6`      | Navigate to Dashboard                   |
| `7`      | Navigate to Plan                        |

---

## Persistent Tools

### Music Player (Header Popover)

A compact music player lives in the header bar and persists across all sections. It displays the current track name and a play/pause icon. **Click the pill** to open a popover with full controls:

- **Transport** -- previous, play/pause, next buttons
- **Volume** -- mute toggle + volume slider
- **Shuffle & Repeat** -- toggle buttons
- **Add Track** -- paste a YouTube URL to add to the queue
- **Queue** -- scrollable track list with play and delete buttons per track

**Default:** Starts with a lofi hip-hop stream (Lofi Girl). Add custom YouTube URLs via the popover queue.

### Pomodoro Timer (Header + Learn Sidebar)

The mini pomodoro in the header shows as a clock icon when idle. Once started, it shows a colored status dot, countdown/elapsed time, and play/pause button.

The full pomodoro timer (in Learn sidebar) supports **three modes**:

- **Pomodoro** -- work/break cycles with session counter. Includes "Skip to Break" and "Skip to Work" buttons.
- **Timer** -- standalone countdown with preset buttons (5, 10, 15, 30, 60 minutes).
- **Stopwatch** -- counting-up timer with start/pause/reset.

Settings (work time, break time, sessions) are configurable via the Settings panel.

---

## Settings

Access settings via the gear icon in the bottom navigation bar (desktop) or the mobile navigation menu. Settings include:

- **Pomodoro configuration** -- work time (5-60 min), break time (5-30 min), total sessions (1-8)
- **Auto music pause** -- automatically pause music during course video playback
- **Session export/import** -- export all data as JSON, import from a previous export
- **Clear all data** -- delete everything and start fresh (with confirmation dialog)
- **Current session stats** -- view course count and music track count

---

## Data Management

- **Auto-save:** All changes save to browser localStorage automatically (debounced)
- **Cloud sync:** When logged in (Supabase auth), data syncs to the cloud with a 5-second debounce
- **Export:** Download a JSON file of all your data via Settings
- **Import:** Upload a previously exported JSON file to restore data

---

## How Features Interlink

| From            | To             | Integration                                                    |
| --------------- | -------------- | -------------------------------------------------------------- |
| Focus           | Tasks          | Select a task to track time against during a focus session     |
| Plan            | Tasks          | Daily "Top 3" picks from your task list                        |
| Dashboard       | All            | Aggregates data from Tasks, Focus, and Habits for analytics    |
| Learn           | Pomodoro       | Full pomodoro timer in the Learn sidebar for study sessions    |
| Header          | Music/Pomodoro | Mini controls persist across all sections                      |
| Command Palette | All            | Quick access to navigate anywhere or create tasks              |
| Notes           | Markdown       | Write/Preview toggle with full GFM support                     |

---

## Example Workflows

### Student Study Session

1. Go to **Learn** and add your course playlist
2. Start the **Pomodoro timer** (sidebar) for focused study blocks
3. Click the **music player** in the header to play lofi beats
4. Navigate to **Tasks** during breaks to plan homework
5. Check **Dashboard** at week's end to see study hours

### Developer Sprint

1. Create tasks in **Tasks** with priorities and due dates
2. Use the **Kanban view** to manage your sprint board
3. Start **Focus** sessions linked to specific tasks
4. Track daily standup habits in **Habits**
5. Use **Plan** for weekly sprint review

### Daily Productivity

1. Open **Plan** and set your Top 3 priorities
2. Work through tasks using **Focus** timer
3. Check off **Habits** throughout the day
4. Review **Dashboard** analytics in the evening
5. Write reflections in **Notes** using Markdown
