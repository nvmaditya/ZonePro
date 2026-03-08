# ZonePro Architecture Review
**Identified Issues, Interlinking Gaps & Recommended Corrections**

---

## Executive Summary

This document catalogs all structural, interlinking, and data-flow problems found in the ZonePro `ARCHITECTURE.md`. Issues are grouped by theme and severity.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 6 |
| 🟡 Medium | 7 |
| ⚪ Low | 3 |

---

## 1. Interlinking Problems

### 1.1 Dashboard reads localStorage directly — 🔴 Critical

**File:** `components/sections/dashboard-section.tsx`

**Problem:**
- `DashboardSection` bypasses all hooks and reads raw localStorage keys (`zonepro-tasks`, `zonepro-focus-sessions`, etc.) to aggregate analytics.
- React has no knowledge of these reads, so any change made inside `TasksSection`, `FocusSection`, or `HabitsSection` while the user is on the Dashboard will **not** trigger a re-render.
- On the server (SSR), `localStorage` is `undefined` and will throw a `ReferenceError`, causing a hydration mismatch or crash.

**Correction:**
- Lift `useTasks()`, `useFocusSessions()`, `useHabits()`, and `useHabitLogs()` into `page.tsx` alongside the existing course/pomodoro/music hooks.
- Pass the resulting data arrays as props into `DashboardSection` (`tasks`, `sessions`, `habits`, `habitLogs`).
- Alternatively, create a shared `AppDataContext` that all sections consume so state is single-source-of-truth.

---

### 1.2 FocusSection reads tasks from localStorage — 🟠 High

**File:** `components/sections/focus-section.tsx`

**Problem:**
- `FocusTimer` needs a task list for its dropdown, so `FocusSection` reads `zonepro-tasks` from localStorage directly instead of using `useTasks()`.
- If the user adds or modifies tasks in `TasksSection` and then switches to Focus, the dropdown may show stale entries until the page reloads.

**Correction:**
- Lift `useTasks()` into `page.tsx` and pass `tasks: Task[]` to `FocusSection` as a prop (same pattern as courses for `LearnSection`).
- `FocusTimer` already accepts `tasks: Task[]` — only the source needs to change.

---

### 1.3 PlanSection reads tasks/sessions/habitLogs from localStorage — 🟠 High

**File:** `components/sections/plan-section.tsx`

**Problem:**
- `PlanWeeklyReview` and `PlanDailyTop3` need live task data, yet `PlanSection` reads this from localStorage directly.
- Weekly Review numbers (completed task count, focus time, habits done) will be stale if changes occurred in the current session without a reload.

**Correction:**
- Same pattern as `FocusSection`: lift the necessary hooks into `page.tsx` and pass `tasks`, `sessions`, `habitLogs` as props.

---

### 1.4 CommandPalette → TasksSection quick-add is a broken link — 🟠 High

**Files:** `components/command-palette.tsx`, `components/sections/tasks-section.tsx`

**Problem:**
- `CommandPalette` receives an `onQuickAddTask` callback from `page.tsx` (triggered by `Ctrl+N`).
- `TasksSection` is self-contained and does not expose any mechanism to remotely focus or trigger its `TaskQuickAdd` input.
- `page.tsx` has no way to fulfil the callback — the command would navigate to Tasks but the quick-add field would not be focused.

**Correction:**
- Add a `focusQuickAdd` ref (or exposed callback) to `TasksSection` via `React.useImperativeHandle` / `forwardRef`.
- In `page.tsx`, store a ref to `TasksSection` and call `ref.current.focusQuickAdd()` inside the `onQuickAddTask` handler.

---

### 1.5 NoteEditor cannot resolve linkedTaskIds / linkedCourseId — 🟠 High

**Files:** `types/index.ts` (Note), `components/notes/note-editor.tsx`

**Problem:**
- The `Note` type carries `linkedTaskIds: string[]` and `linkedCourseId: string`, but `NoteEditor` props are only: `note`, `onUpdate`, `onDelete`, `onTogglePinned`, `onToggleArchived`.
- No `tasks` or `courses` are passed in, so the editor cannot display linked item titles, navigate to a linked course, or offer UI to add/remove links. The fields exist in the type but are completely inert in the UI.

**Correction:**
- Pass `tasks: Task[]` and `courses: CourseProgress[]` to `NoteEditor` (or to `NotesSection`, which passes them down).
- Add a "Linked items" section in the editor to attach/detach tasks and courses.

---

### 1.6 Milestone.linkedTaskIds cannot be resolved in PlanGoals — 🟡 Medium

**Files:** `types/index.ts` (Milestone), `components/plan/plan-goals.tsx`

**Problem:**
- `Milestone` has a `linkedTaskIds: string[]` field, but `PlanGoals` receives no `tasks` prop.
- Linked task titles cannot be shown next to milestones.

**Correction:**
- Pass `tasks: Task[]` to `PlanGoals` so milestone task links can be resolved and optionally navigated.

---

### 1.7 FocusSessionLog task resolution is based on a stale snapshot — 🟡 Medium

**File:** `components/focus/focus-session-log.tsx`

**Problem:**
- `FocusSection` builds `taskNames: Record<string, string>` from a localStorage read and passes it to `FocusSessionLog`.
- If a task is renamed after sessions are logged, the session table shows the old name indefinitely.

**Correction:**
- Build `taskNames` from the live `tasks` array (sourced from the lifted `useTasks()` as described in fix 1.2) so names always reflect current task titles.

---

## 2. Settings & Constants Problems

### 2.1 FocusDailyBudget ignores AppSettings.dailyTimeBudgetMinutes — 🟠 High

**File:** `components/focus/focus-daily-budget.tsx`

**Problem:**
- The `budgetMinutes` prop is always `480` (hardcoded in `focus-section.tsx`), making the `AppSettings` field `dailyTimeBudgetMinutes` non-functional. The user-configurable setting is silently ignored.

**Correction:**
- Pass `settings.dailyTimeBudgetMinutes` as the `budgetMinutes` prop. `FocusDailyBudget` already accepts the prop — the caller just needs to provide the settings value instead of the hardcoded constant.

---

### 2.2 SettingsSheet exposes only a subset of AppSettings — 🟡 Medium

**Files:** `components/settings-sheet.tsx`, `types/index.ts`

**Problem:**
- `AppSettings` defines: `autoMusicPause`, `defaultView`, `taskDefaultView`, `dailyTimeBudgetMinutes`, `weekStartsOn`.
- `SettingsSheet` only surfaces Pomodoro sliders + export/import. The other four settings have no UI controls — users cannot change them at all.

**Correction:**
- Add a **General Settings** section to `SettingsSheet` with controls for:
  - `defaultView` (select)
  - `taskDefaultView` (select: list / board / calendar)
  - `dailyTimeBudgetMinutes` (number input or slider)
  - `weekStartsOn` (select: Sunday / Monday)

---

### 2.3 page.tsx settings object is partial — 🟡 Medium

**File:** `app/page.tsx`

**Problem:**
- The architecture documents `settings` in `page.tsx` as `{ autoMusicPause: boolean }` only.
- The orchestrator holds a cut-down settings object and cannot pass full settings to child sections that need them.

**Correction:**
- Store the full `AppSettings` object via `useLocalStorage<AppSettings>('zonepro-settings', defaultSettings)` and thread it through to sections that need it (e.g. `FocusSection` for `dailyTimeBudgetMinutes`).

---

## 3. Data Persistence Conflict

### 3.1 Dual persistence — useSessionPersistence vs. individual hooks — 🟠 High

**Files:** `hooks/use-session-persistence.ts`, `hooks/use-tasks.ts`, et al.

**Problem:**
- `useTasks` writes to `zonepro-tasks`; `useHabits` writes to `zonepro-habits`; etc. These hooks persist on every change.
- `useSessionPersistence` also auto-saves all state to `zonepro-data` on change.
- On **export**, `SettingsSheet` exports only `zonepro-data`. On **import** it restores only `zonepro-data`, but the individual hook keys remain set. On the next page load, hooks read from their own keys (stale) and `zonepro-data` may be overwritten by the next auto-save — creating a split-brain state.

**Correction:**
- **Option A (Recommended):** Make `useSessionPersistence` the single writer. Individual hooks get their initial state from it on mount and delegate saves to it. Export/import then covers everything.
- **Option B:** Remove `useSessionPersistence`. Export/import iterates all known localStorage keys. Document the canonical key per data type in `lib/constants.ts` to avoid overlaps.
- Either way, ensure only one system writes each key.

---

## 4. Component-Level Issues

### 4.1 LearnSection prop drilling (~20 props) — 🟡 Medium

**File:** `components/sections/learn-section.tsx`

**Problem:**
- `LearnSection` receives approximately 20 props from `page.tsx` while all other sections are self-contained.
- Every refactor (e.g., adding a new course field) requires simultaneous edits to both `page.tsx` and `learn-section.tsx` signatures.

**Correction:**
- Create a `LearnContext` (or composite `useLearning()` hook) that bundles course state, pomodoro state, music controls, settings, and sync status.
- `LearnSection` consumes the context and passes only relevant slices to child components.

---

### 4.2 TaskCalendarView missing action props — 🟡 Medium

**File:** `components/tasks/task-calendar-view.tsx`

**Problem:**
- `TaskCalendarView` props are `tasksByDate` and `onClick` only.
- Tasks cannot be toggled complete, edited, or deleted inline from the calendar — the detail sheet must be opened for every action.
- `TaskListView` and `TaskKanbanView` both receive `onToggle`, `onUpdate`, `onDelete` — the calendar view is inconsistent.

**Correction:**
- Add `onToggle` and `onDelete` to `TaskCalendarView` so users can act on tasks without opening the full detail sheet every time.

---

### 4.3 HabitStats scope is ambiguous — 🟡 Medium

**File:** `components/habits/habit-stats.tsx`

**Problem:**
- `HabitsSection` has a `selectedHabitId` state, but `HabitStats` receives flat numbers: `streak`, `completionRate`, `totalCompletions`.
- It is undocumented whether these are aggregated across all habits or scoped to the selected habit.
- If global, the "Current Streak" card is misleading — streaks are inherently per-habit.

**Correction:**
- Clarify in documentation and component comments. If stats are per-habit, accept `habitId` as a prop and derive stats from the hook. If global, rename the card to "Best Active Streak" or similar.

---

### 4.4 MobileNav co-located in FloatingNav file — ⚪ Low

**File:** `components/floating-nav.tsx`

**Problem:**
- `MobileNav` is exported from the same file as `FloatingNav`, making one file responsible for two distinct navigation paradigms.

**Correction:**
- Extract `MobileNav` to `components/mobile-nav.tsx`. Update imports in `app/page.tsx` accordingly.

---

## 5. Type Definition Issues

### 5.1 PomodoroSession.mode listed as a standalone enum — ⚪ Low

**File:** `types/index.ts`

**Problem:**
- The Types table lists `PomodoroSession.mode` under "Enum Types" as if it were a standalone exported type, but it is just a field on `PomodoroSession`.
- Developers searching for `PomodoroMode` as an importable type won't find it.

**Correction:**
```ts
// Extract into a standalone exported type
export type PomodoroMode = 'pomodoro' | 'timer' | 'stopwatch';

// Reference in PomodoroSession
mode: PomodoroMode;
```

---

## 6. Consolidated Issue Table

| # | Location | Problem | Correction | Severity |
|---|----------|---------|------------|----------|
| 1 | `DashboardSection` | Reads localStorage directly — no reactivity, SSR crash risk | Lift hooks into `page.tsx`, pass as props | 🔴 Critical |
| 2 | `FocusSection` | Reads tasks from localStorage directly | Lift `useTasks()` into `page.tsx`, pass `tasks` as prop | 🟠 High |
| 3 | `PlanSection` | Reads tasks/sessions/habitLogs from localStorage directly | Lift hooks into `page.tsx`, pass as props | 🟠 High |
| 4 | `CommandPalette → TasksSection` | No mechanism to remotely focus the quick-add input | Add `focusQuickAdd` via `useImperativeHandle`/`forwardRef` | 🟠 High |
| 5 | `NoteEditor` | `linkedTaskIds`/`linkedCourseId` can't be resolved — no tasks/courses props | Pass `tasks` and `courses` to `NoteEditor` | 🟠 High |
| 6 | `FocusDailyBudget` | Hardcodes 480 min; ignores `AppSettings.dailyTimeBudgetMinutes` | Pass `settings.dailyTimeBudgetMinutes` as the `budgetMinutes` prop | 🟠 High |
| 7 | `useSessionPersistence` vs hooks | Dual persistence causes split-brain state on import | Designate single writer per key; fix export/import scope | 🟠 High |
| 8 | `FocusSessionLog` | Task names built from stale localStorage snapshot | Build `taskNames` from live `useTasks()` data | 🟡 Medium |
| 9 | `SettingsSheet` | `defaultView`, `taskDefaultView`, `dailyTimeBudgetMinutes`, `weekStartsOn` have no UI | Add General Settings section to `SettingsSheet` | 🟡 Medium |
| 10 | `page.tsx` | `settings` object is partial (`{ autoMusicPause }` only) | Store and use full `AppSettings` object | 🟡 Medium |
| 11 | `LearnSection` | ~20 props drilled from `page.tsx` | Introduce `LearnContext` or composite hook | 🟡 Medium |
| 12 | `TaskCalendarView` | Missing `onToggle`/`onDelete` — inconsistent with list/kanban views | Add action props to match other task views | 🟡 Medium |
| 13 | `HabitStats` | Scope (per-habit vs. global) is undocumented and potentially misleading | Clarify scope; add `habitId` prop if per-habit | 🟡 Medium |
| 14 | `Milestone` | `linkedTaskIds` can't be resolved — no `tasks` prop in `PlanGoals` | Pass `tasks` to `PlanGoals` | 🟡 Medium |
| 15 | `types/index.ts` | `PomodoroSession.mode` not a standalone exportable type | Extract `PomodoroMode` as a named type | ⚪ Low |
| 16 | `components/floating-nav.tsx` | `MobileNav` co-located in `FloatingNav` file | Extract to `components/mobile-nav.tsx` | ⚪ Low |

---

## 7. Recommended Fix Priority

### Phase 1 — Reactivity & Correctness
*Fix these before any new features*

- **#1** Dashboard localStorage → hooks (unblocks correct analytics)
- **#7** Dual persistence conflict (prevents data corruption on import)
- **#4** CommandPalette → TasksSection broken callback
- **#2 & #3** FocusSection / PlanSection stale reads

### Phase 2 — Data Freshness
*Eliminate all remaining stale-read patterns*

- **#6** FocusDailyBudget ignores settings
- **#8** FocusSessionLog stale task names
- **#10** `page.tsx` partial settings object

### Phase 3 — Feature Completeness
*Make linked-data fields actually work*

- **#5** NoteEditor linked tasks/courses
- **#14** Milestone linked tasks
- **#9** SettingsSheet missing settings UI

### Phase 4 — Refactoring & Polish

- **#11** LearnSection prop drilling → context
- **#12** TaskCalendarView missing action props
- **#13** HabitStats scope ambiguity
- **#15 & #16** Type and file naming cleanup
