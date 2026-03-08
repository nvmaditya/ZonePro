-- ============================================================
-- ZonePro Supabase Database Setup
-- Run these queries in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. COURSES TABLE
-- Stores YouTube course/playlist progress per user
-- ============================================================
create table public.courses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  url text not null default '',
  video_id text not null default '',
  current_seconds integer not null default 0,
  duration integer not null default 0,
  completed boolean not null default false,
  last_watched timestamptz not null default now(),
  playlist_id text,
  playlist_index integer not null default 0,
  playlist_progress jsonb not null default '{}'::jsonb,
  playlist_metadata jsonb,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, local_id)
);

-- 2. USER SETTINGS TABLE
-- Stores pomodoro config and app preferences per user
-- ============================================================
create table public.user_settings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  pomodoro_work_time integer not null default 25,
  pomodoro_break_time integer not null default 5,
  pomodoro_total_sessions integer not null default 4,
  auto_music_pause boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. MUSIC TRACKS TABLE
-- Stores the user's music playlist (YouTube tracks)
-- ============================================================
create table public.music_tracks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  video_id text not null default '',
  duration integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================================

-- Enable RLS on all tables
alter table public.courses enable row level security;
alter table public.user_settings enable row level security;
alter table public.music_tracks enable row level security;

-- COURSES policies
create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- USER SETTINGS policies
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own settings"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- MUSIC TRACKS policies
create policy "Users can view their own music tracks"
  on public.music_tracks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own music tracks"
  on public.music_tracks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own music tracks"
  on public.music_tracks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own music tracks"
  on public.music_tracks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
create index idx_courses_user_id on public.courses(user_id);
create index idx_courses_last_watched on public.courses(user_id, last_watched desc);
create index idx_music_tracks_user_id on public.music_tracks(user_id);
create index idx_music_tracks_sort on public.music_tracks(user_id, sort_order asc);

-- ============================================================
-- 4. TASKS TABLE
-- Stores task management data per user
-- ============================================================
create table public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  description text,
  status text not null default 'todo',
  priority text not null default 'none',
  labels jsonb not null default '[]'::jsonb,
  due_date text,
  parent_id text,
  depends_on jsonb not null default '[]'::jsonb,
  linked_note_ids jsonb not null default '[]'::jsonb,
  linked_focus_session_ids jsonb not null default '[]'::jsonb,
  recurrence jsonb,
  estimated_minutes integer,
  actual_minutes integer,
  sort_order integer not null default 0,
  created_at text not null,
  completed_at text,
  updated_at text not null,
  unique (user_id, local_id)
);

-- 5. FOCUS SESSIONS TABLE
-- Stores focus/pomodoro session logs per user
-- ============================================================
create table public.focus_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  task_id text,
  type text not null default 'pomodoro',
  started_at text not null,
  ended_at text,
  planned_minutes integer not null default 0,
  actual_minutes integer not null default 0,
  completed boolean not null default false,
  notes text,
  date text not null,
  unique (user_id, local_id)
);

-- 6. HABITS TABLE
-- Stores habit definitions per user
-- ============================================================
create table public.habits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  description text,
  frequency text not null default 'daily',
  target_days jsonb,
  target_count integer not null default 1,
  color text not null default '#3b82f6',
  icon text,
  created_at text not null,
  archived_at text,
  sort_order integer not null default 0,
  unique (user_id, local_id)
);

-- 7. HABIT LOGS TABLE
-- Stores daily habit completion logs per user
-- ============================================================
create table public.habit_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  habit_id text not null,
  date text not null,
  count integer not null default 0,
  note text,
  unique (user_id, local_id)
);

-- 8. NOTES TABLE
-- Stores user notes with tags and links
-- ============================================================
create table public.notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  content text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  linked_task_ids jsonb not null default '[]'::jsonb,
  linked_course_id text,
  created_at text not null,
  updated_at text not null,
  unique (user_id, local_id)
);

-- 9. GOALS TABLE
-- Stores goals with embedded milestones per user
-- ============================================================
create table public.goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default '',
  description text,
  target_date text,
  milestones jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at text not null,
  updated_at text not null,
  unique (user_id, local_id)
);

-- 10. DAILY PRIORITIES TABLE
-- Stores daily priority task ordering per user
-- ============================================================
create table public.daily_priorities (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  task_ids jsonb not null default '[]'::jsonb,
  unique (user_id, date)
);

-- 11. TIME BLOCKS TABLE
-- Stores time block scheduling per user
-- ============================================================
create table public.time_blocks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  date text not null,
  start_hour integer not null default 0,
  start_minute integer not null default 0,
  duration_minutes integer not null default 30,
  title text not null default '',
  task_id text,
  color text,
  unique (user_id, local_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) for new tables
-- ============================================================

alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.daily_priorities enable row level security;
alter table public.time_blocks enable row level security;

-- TASKS policies
create policy "Users can view their own tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks"
  on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- FOCUS SESSIONS policies
create policy "Users can view their own focus sessions"
  on public.focus_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own focus sessions"
  on public.focus_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own focus sessions"
  on public.focus_sessions for update using (auth.uid() = user_id);
create policy "Users can delete their own focus sessions"
  on public.focus_sessions for delete using (auth.uid() = user_id);

-- HABITS policies
create policy "Users can view their own habits"
  on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits"
  on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits"
  on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits"
  on public.habits for delete using (auth.uid() = user_id);

-- HABIT LOGS policies
create policy "Users can view their own habit logs"
  on public.habit_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own habit logs"
  on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own habit logs"
  on public.habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own habit logs"
  on public.habit_logs for delete using (auth.uid() = user_id);

-- NOTES policies
create policy "Users can view their own notes"
  on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes"
  on public.notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes"
  on public.notes for delete using (auth.uid() = user_id);

-- GOALS policies
create policy "Users can view their own goals"
  on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals"
  on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals"
  on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals"
  on public.goals for delete using (auth.uid() = user_id);

-- DAILY PRIORITIES policies
create policy "Users can view their own daily priorities"
  on public.daily_priorities for select using (auth.uid() = user_id);
create policy "Users can insert their own daily priorities"
  on public.daily_priorities for insert with check (auth.uid() = user_id);
create policy "Users can update their own daily priorities"
  on public.daily_priorities for update using (auth.uid() = user_id);
create policy "Users can delete their own daily priorities"
  on public.daily_priorities for delete using (auth.uid() = user_id);

-- TIME BLOCKS policies
create policy "Users can view their own time blocks"
  on public.time_blocks for select using (auth.uid() = user_id);
create policy "Users can insert their own time blocks"
  on public.time_blocks for insert with check (auth.uid() = user_id);
create policy "Users can update their own time blocks"
  on public.time_blocks for update using (auth.uid() = user_id);
create policy "Users can delete their own time blocks"
  on public.time_blocks for delete using (auth.uid() = user_id);

-- ============================================================
-- INDEXES for new tables
-- ============================================================
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_status on public.tasks(user_id, status);
create index idx_tasks_due_date on public.tasks(user_id, due_date);
create index idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index idx_focus_sessions_date on public.focus_sessions(user_id, date);
create index idx_habits_user_id on public.habits(user_id);
create index idx_habit_logs_user_id on public.habit_logs(user_id);
create index idx_habit_logs_date on public.habit_logs(user_id, date);
create index idx_habit_logs_habit on public.habit_logs(user_id, habit_id);
create index idx_notes_user_id on public.notes(user_id);
create index idx_goals_user_id on public.goals(user_id);
create index idx_daily_priorities_user_id on public.daily_priorities(user_id);
create index idx_daily_priorities_date on public.daily_priorities(user_id, date);
create index idx_time_blocks_user_id on public.time_blocks(user_id);
create index idx_time_blocks_date on public.time_blocks(user_id, date);
