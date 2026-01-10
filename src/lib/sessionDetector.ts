// Trading session detection based on time
// All times are in UTC

interface TradingSession {
    name: string;
    key: 'asianSession' | 'londonSession' | 'nySession' | 'londonClose';
    startHour: number;
    endHour: number;
    emoji: string;
}

const TRADING_SESSIONS: TradingSession[] = [
    { name: 'Asian Session', key: 'asianSession', startHour: 0, endHour: 8, emoji: '🌏' },
    { name: 'London Session', key: 'londonSession', startHour: 7, endHour: 16, emoji: '🇬🇧' },
    { name: 'New York Session', key: 'nySession', startHour: 12, endHour: 21, emoji: '🇺🇸' },
    { name: 'London Close', key: 'londonClose', startHour: 15, endHour: 17, emoji: '🌅' },
];

/**
 * Detects the current trading session based on the provided date
 * @param date - The date/time to check (defaults to now)
 * @returns Object with session flags
 */
export function detectTradingSession(date: Date = new Date()): {
    asianSession: boolean;
    londonSession: boolean;
    nySession: boolean;
    londonClose: boolean;
    activeSessions: string[];
} {
    const utcHour = date.getUTCHours();

    const result = {
        asianSession: false,
        londonSession: false,
        nySession: false,
        londonClose: false,
        activeSessions: [] as string[],
    };

    for (const session of TRADING_SESSIONS) {
        let isActive = false;

        if (session.startHour <= session.endHour) {
            // Normal case: start < end
            isActive = utcHour >= session.startHour && utcHour < session.endHour;
        } else {
            // Wrapping case: e.g., 22:00 - 08:00
            isActive = utcHour >= session.startHour || utcHour < session.endHour;
        }

        if (isActive) {
            result[session.key] = true;
            result.activeSessions.push(`${session.emoji} ${session.name}`);
        }
    }

    return result;
}

/**
 * Gets the primary trading session for display purposes
 * Priority: London Close > NY > London > Asian
 */
export function getPrimarySession(date: Date = new Date()): string | null {
    const sessions = detectTradingSession(date);

    if (sessions.londonClose) return '🌅 London Close';
    if (sessions.nySession) return '🇺🇸 New York';
    if (sessions.londonSession) return '🇬🇧 London';
    if (sessions.asianSession) return '🌏 Asian';

    return null;
}

/**
 * Returns the kill zone times for ICT traders
 * Kill zones are specific high-probability trading windows
 */
export function getKillZones(): { name: string; utcStart: string; utcEnd: string; description: string }[] {
    return [
        { name: 'Asian Kill Zone', utcStart: '00:00', utcEnd: '04:00', description: 'Tokyo/Sydney overlap' },
        { name: 'London Kill Zone', utcStart: '07:00', utcEnd: '10:00', description: 'London open volatility' },
        { name: 'NY Kill Zone (Morning)', utcStart: '12:00', utcEnd: '15:00', description: 'NY open, London overlap' },
        { name: 'NY Kill Zone (Afternoon)', utcStart: '18:00', utcEnd: '20:00', description: 'NY afternoon reversal' },
    ];
}

/**
 * Checks if current time is within a kill zone
 */
export function isInKillZone(date: Date = new Date()): boolean {
    const utcHour = date.getUTCHours();

    // Kill zone hours (simplified)
    const killZoneHours = [0, 1, 2, 3, 7, 8, 9, 12, 13, 14, 18, 19];

    return killZoneHours.includes(utcHour);
}

/**
 * Formats session info for display
 */
export function formatSessionInfo(date: Date = new Date()): {
    currentSession: string;
    isKillZone: boolean;
    localTime: string;
    utcTime: string;
} {
    const sessions = detectTradingSession(date);

    return {
        currentSession: sessions.activeSessions.join(', ') || 'Off-Hours',
        isKillZone: isInKillZone(date),
        localTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        utcTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
    };
}
