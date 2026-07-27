import { FocusSession } from '../../shared/types';

/**
 * Format total seconds into MM:SS format (e.g. 1500 -> "25:00")
 */
export function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Format total seconds into human readable text (e.g. 3900 -> "1h 05m", 1200 -> "20m")
 */
export function formatHumanDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  return `${minutes}m`;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date string falls within the current calendar week (starting Sunday)
 */
export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

  return date >= firstDayOfWeek && date < lastDayOfWeek;
}

/**
 * Check if a date string falls within the current calendar month
 */
export function isThisMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Calculate total focus time in seconds for today
 */
export function calculateTodayFocusTime(sessions: FocusSession[]): number {
  return (sessions || [])
    .filter((s) => s.type !== 'break' && isToday(s.startTime))
    .reduce((acc, s) => acc + (s.duration || 0), 0);
}

/**
 * Calculate total focus time in seconds for this week
 */
export function calculateWeeklyFocusTime(sessions: FocusSession[]): number {
  return (sessions || [])
    .filter((s) => s.type !== 'break' && isThisWeek(s.startTime))
    .reduce((acc, s) => acc + (s.duration || 0), 0);
}

/**
 * Calculate total focus time in seconds for this month
 */
export function calculateMonthlyFocusTime(sessions: FocusSession[]): number {
  return (sessions || [])
    .filter((s) => s.type !== 'break' && isThisMonth(s.startTime))
    .reduce((acc, s) => acc + (s.duration || 0), 0);
}

/**
 * Calculate consecutive study streak days ending today or yesterday
 */
export function calculateStreakDays(sessions: FocusSession[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Filter out break sessions and collect unique YYYY-MM-DD dates
  const workSessions = sessions.filter((s) => s.type !== 'break');
  if (workSessions.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      workSessions.map((s) => {
        const d = new Date(s.startTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse(); // newest first

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let checkDate = new Date(today);

  // If top date is neither today nor yesterday, streak is zero
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  if (uniqueDates[0] === yesterdayStr) {
    checkDate = yesterday;
  }

  for (let i = 0; i < 365; i++) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (uniqueDates.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
