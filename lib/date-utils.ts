import {
    format,
    startOfWeek,
    differenceInDays,
    subDays,
    isToday,
} from "date-fns";

export function getToday(): string {
    return format(new Date(), "yyyy-MM-dd");
}

export function getWeekStart(weekStartsOn: 0 | 1 = 1): Date {
    return startOfWeek(new Date(), { weekStartsOn });
}

export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMM d, yyyy");
}

export function formatShortDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMM d");
}

export function daysBetween(a: string | Date, b: string | Date): number {
    const dateA = typeof a === "string" ? new Date(a) : a;
    const dateB = typeof b === "string" ? new Date(b) : b;
    return Math.abs(differenceInDays(dateA, dateB));
}

export function isDueToday(date?: string): boolean {
    if (!date) return false;
    return isToday(new Date(date));
}

export function isOverdue(date?: string): boolean {
    if (!date) return false;
    const due = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
}

export function getLast30Days(): string[] {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
        days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return days;
}

export function getLast90Days(): string[] {
    const days: string[] = [];
    for (let i = 89; i >= 0; i--) {
        days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return days;
}

/**
 * Calculate streak - consecutive days a condition is true going backwards from today
 */
export function getStreak(
    dates: Set<string>,
    fromDate: Date = new Date(),
): number {
    let streak = 0;
    let current = fromDate;

    for (let i = 0; i < 365; i++) {
        const dateStr = format(current, "yyyy-MM-dd");
        if (dates.has(dateStr)) {
            streak++;
            current = subDays(current, 1);
        } else {
            // If it's today and not completed yet, check from yesterday
            if (i === 0) {
                current = subDays(current, 1);
                continue;
            }
            break;
        }
    }

    return streak;
}
