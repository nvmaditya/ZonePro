import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseProgress, MusicTrack, PomodoroSession } from "@/types";

// Sync courses to Supabase
export async function syncCoursesToCloud(
    supabase: SupabaseClient,
    userId: string,
    courses: CourseProgress[],
) {
    for (const course of courses) {
        const { error } = await supabase.from("courses").upsert(
            {
                user_id: userId,
                local_id: course.id,
                title: course.title,
                url: course.url,
                video_id: course.videoId,
                current_time: course.currentTime,
                duration: course.duration,
                completed: course.completed,
                last_watched: course.lastWatched,
                playlist_id: course.playlistId || null,
                playlist_index: course.playlistIndex || 0,
                playlist_progress: course.playlistProgress || {},
                playlist_metadata: course.playlistMetadata || null,
                notes: course.notes || [],
            },
            { onConflict: "user_id,local_id" },
        );
        if (error) {
            // Sync error handled by caller
        }
    }
}

// Fetch courses from Supabase
export async function fetchCoursesFromCloud(
    supabase: SupabaseClient,
    userId: string,
): Promise<CourseProgress[]> {
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", userId)
        .order("last_watched", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
        id: row.local_id,
        title: row.title,
        url: row.url,
        videoId: row.video_id,
        currentTime: row.current_time,
        duration: row.duration,
        completed: row.completed,
        lastWatched: new Date(row.last_watched),
        playlistId: row.playlist_id || undefined,
        playlistIndex: row.playlist_index || 0,
        playlistProgress: row.playlist_progress || {},
        playlistMetadata: row.playlist_metadata || undefined,
        notes: (row.notes || []).map((note: Record<string, unknown>) => ({
            ...note,
            createdAt: new Date(note.createdAt as string),
        })),
    }));
}

// Sync settings to Supabase
export async function syncSettingsToCloud(
    supabase: SupabaseClient,
    userId: string,
    settings: { autoMusicPause: boolean },
    pomodoro: PomodoroSession,
) {
    const { error } = await supabase.from("user_settings").upsert(
        {
            user_id: userId,
            pomodoro_work_time: pomodoro.workTime,
            pomodoro_break_time: pomodoro.breakTime,
            pomodoro_total_sessions: pomodoro.totalSessions,
            auto_music_pause: settings.autoMusicPause,
        },
        { onConflict: "user_id" },
    );
    if (error) {
        // Sync error handled by caller
    }
}

// Fetch settings from Supabase
export async function fetchSettingsFromCloud(
    supabase: SupabaseClient,
    userId: string,
) {
    const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;

    return {
        settings: {
            autoMusicPause: data.auto_music_pause,
        },
        pomodoro: {
            workTime: data.pomodoro_work_time,
            breakTime: data.pomodoro_break_time,
            totalSessions: data.pomodoro_total_sessions,
        },
    };
}

// Sync music tracks to Supabase
export async function syncMusicToCloud(
    supabase: SupabaseClient,
    userId: string,
    tracks: MusicTrack[],
) {
    // Delete tracks that no longer exist locally
    const localIds = tracks.map((t) => t.id);
    await supabase
        .from("music_tracks")
        .delete()
        .eq("user_id", userId)
        .not("local_id", "in", `(${localIds.join(",")})`);

    // Upsert current tracks
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const { error } = await supabase.from("music_tracks").upsert(
            {
                user_id: userId,
                local_id: track.id,
                title: track.title,
                video_id: track.videoId,
                duration: track.duration,
                sort_order: i,
            },
            { onConflict: "user_id,local_id" },
        );
        if (error) {
            // Sync error handled by caller
        }
    }
}

// Fetch music tracks from Supabase
export async function fetchMusicFromCloud(
    supabase: SupabaseClient,
    userId: string,
): Promise<MusicTrack[]> {
    const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
        id: row.local_id,
        title: row.title,
        videoId: row.video_id,
        duration: row.duration,
    }));
}

// Delete a course from cloud
export async function deleteCourseFromCloud(
    supabase: SupabaseClient,
    userId: string,
    localId: string,
) {
    await supabase
        .from("courses")
        .delete()
        .eq("user_id", userId)
        .eq("local_id", localId);
}
