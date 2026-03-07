-- ZonePro Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the required tables.

-- Courses table
create table if not exists public.courses (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    local_id text not null,
    title text not null,
    url text not null,
    video_id text not null default '',
    current_time float default 0,
    duration float default 0,
    completed boolean default false,
    last_watched timestamptz default now(),
    playlist_id text,
    playlist_index integer default 0,
    playlist_progress jsonb default '{}',
    playlist_metadata jsonb,
    notes jsonb default '[]',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, local_id)
);

-- User settings table
create table if not exists public.user_settings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique not null,
    pomodoro_work_time integer default 25,
    pomodoro_break_time integer default 5,
    pomodoro_total_sessions integer default 4,
    auto_music_pause boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Music tracks table
create table if not exists public.music_tracks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    local_id text not null,
    title text not null,
    video_id text not null,
    duration float default 0,
    sort_order integer default 0,
    created_at timestamptz default now(),
    unique(user_id, local_id)
);

-- Enable Row Level Security
alter table public.courses enable row level security;
alter table public.user_settings enable row level security;
alter table public.music_tracks enable row level security;

-- RLS policies: users can only access their own data
create policy "Users can CRUD own courses"
    on public.courses for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can CRUD own settings"
    on public.user_settings for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can CRUD own music tracks"
    on public.music_tracks for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger courses_updated_at
    before update on public.courses
    for each row execute function update_updated_at();

create trigger settings_updated_at
    before update on public.user_settings
    for each row execute function update_updated_at();
