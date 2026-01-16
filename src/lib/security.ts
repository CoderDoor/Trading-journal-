/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input - remove XSS vectors
 */
export function sanitizeString(input: string | null | undefined): string {
    if (!input) return '';
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Validate and sanitize email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: any): number | null {
    if (input === null || input === undefined || input === '') return null;
    const num = parseFloat(String(input));
    return isNaN(num) ? null : num;
}

/**
 * Validate trade instrument
 */
export function isValidInstrument(instrument: string | null): boolean {
    if (!instrument) return true; // Optional field
    const allowed = /^[A-Z0-9]{2,10}$/;
    return allowed.test(instrument.toUpperCase());
}

/**
 * Validate trade type
 */
export function isValidTradeType(tradeType: string | null): boolean {
    if (!tradeType) return true;
    return ['BUY', 'SELL', 'CALL', 'PUT'].includes(tradeType.toUpperCase());
}

/**
 * Validate outcome
 */
export function isValidOutcome(outcome: string | null): boolean {
    if (!outcome) return true;
    return ['WIN', 'LOSS', 'BE', 'RUNNING'].includes(outcome.toUpperCase());
}

/**
 * Sanitize journal entry input
 */
export function sanitizeJournalInput(data: Record<string, any>): Record<string, any> {
    return {
        ...data,
        instrument: data.instrument ? sanitizeString(data.instrument).toUpperCase() : null,
        tradeType: data.tradeType ? sanitizeString(data.tradeType).toUpperCase() : null,
        timeframe: data.timeframe ? sanitizeString(data.timeframe) : null,
        outcome: data.outcome ? sanitizeString(data.outcome).toUpperCase() : null,
        tradeReason: sanitizeString(data.tradeReason),
        strategyLogic: sanitizeString(data.strategyLogic),
        whatWentWell: sanitizeString(data.whatWentWell),
        whatWentWrong: sanitizeString(data.whatWentWrong),
        improvement: sanitizeString(data.improvement),
        emotionState: data.emotionState ? sanitizeString(data.emotionState).toUpperCase() : null,
        entryPrice: sanitizeNumber(data.entryPrice),
        stopLoss: sanitizeNumber(data.stopLoss),
        target: sanitizeNumber(data.target),
        riskReward: sanitizeNumber(data.riskReward),
    };
}

/**
 * Rate limit check helper
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return function isAllowed(key: string): boolean {
        const now = Date.now();
        const windowStart = now - windowMs;

        const timestamps = requests.get(key) || [];
        const recentRequests = timestamps.filter(t => t > windowStart);

        if (recentRequests.length >= maxRequests) {
            return false;
        }

        recentRequests.push(now);
        requests.set(key, recentRequests);
        return true;
    };
}
