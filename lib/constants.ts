import type { AppSettings } from "@/types";

export const STORAGE_KEY = "zonepro-data";
export const OLD_STORAGE_KEY = "focusedLearningData";

export const DEFAULT_WORK_TIME = 25;
export const DEFAULT_BREAK_TIME = 5;
export const DEFAULT_TOTAL_SESSIONS = 4;

export const DEFAULT_LOFI_VIDEO_ID = "jfKfPfyJRdk";
export const DEFAULT_LOFI_TITLE = "Lofi Hip Hop - Study Music";

export const ALL_STORAGE_KEYS = [
    "zonepro-data",
    "zonepro-tasks",
    "zonepro-focus-sessions",
    "zonepro-habits",
    "zonepro-habit-logs",
    "zonepro-notes",
    "zonepro-goals",
    "zonepro-daily-priorities",
    "zonepro-time-blocks",
] as const;

export const DEFAULT_APP_SETTINGS: AppSettings = {
    autoMusicPause: true,
    defaultView: "learn",
    taskDefaultView: "list",
    dailyTimeBudgetMinutes: 480,
    weekStartsOn: 1,
};
