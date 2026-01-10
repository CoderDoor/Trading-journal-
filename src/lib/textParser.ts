import { ParsedTradeData } from '@/types/journal';

// Common trading instruments with spoken variations
const INSTRUMENTS = [
    // Indian Markets
    'NIFTY', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'NIFTY50', 'BANK NIFTY',
    // Major Forex Pairs
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    // Cross Pairs
    'EURGBP', 'EURJPY', 'GBPJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD', 'AUDNZD', 'AUDCAD', 'AUDCHF',
    'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'NZDCAD', 'NZDCHF', 'CADCHF',
    // Metals
    'XAUUSD', 'XAGUSD', 'GOLD', 'SILVER',
    // Crypto
    'BTC', 'BTCUSD', 'BTCUSDT', 'ETH', 'ETHUSD', 'ETHUSDT', 'BITCOIN', 'ETHEREUM',
    // Indian Stocks
    'RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI', 'SBIN', 'TATAMOTORS', 'BAJFINANCE',
    // US Stocks
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
];

// Spoken variations for forex pairs (how people say them)
const SPOKEN_FOREX_MAP: Record<string, string> = {
    'euro dollar': 'EURUSD',
    'eurodollar': 'EURUSD',
    'euro usd': 'EURUSD',
    'fiber': 'EURUSD',
    'pound dollar': 'GBPUSD',
    'cable': 'GBPUSD',
    'gbp usd': 'GBPUSD',
    'dollar yen': 'USDJPY',
    'usd yen': 'USDJPY',
    'dollar swiss': 'USDCHF',
    'swissy': 'USDCHF',
    'aussie dollar': 'AUDUSD',
    'aud usd': 'AUDUSD',
    'aussie': 'AUDUSD',
    'loonie': 'USDCAD',
    'dollar cad': 'USDCAD',
    'kiwi': 'NZDUSD',
    'nzd usd': 'NZDUSD',
    'euro pound': 'EURGBP',
    'euro yen': 'EURJPY',
    'pound yen': 'GBPJPY',
    'guppy': 'GBPJPY',
    'gold': 'XAUUSD',
    'xau': 'XAUUSD',
    'silver': 'XAGUSD',
    'xag': 'XAGUSD',
    'bitcoin': 'BTCUSD',
    'btc': 'BTCUSD',
    'ethereum': 'ETHUSD',
    'eth': 'ETHUSD',
};

// Trade type patterns
const TRADE_TYPES: Record<string, string> = {
    'buy': 'BUY',
    'bought': 'BUY',
    'long': 'BUY',
    'bullish': 'BUY',
    'sell': 'SELL',
    'sold': 'SELL',
    'short': 'SELL',
    'bearish': 'SELL',
    'call': 'CALL',
    'ce': 'CALL',
    'put': 'PUT',
    'pe': 'PUT',
};

// Timeframe patterns
const TIMEFRAMES: Record<string, string> = {
    '1 minute': '1M',
    '1m': '1M',
    '1min': '1M',
    '5 minute': '5M',
    '5m': '5M',
    '5min': '5M',
    '15 minute': '15M',
    '15m': '15M',
    '15min': '15M',
    '30 minute': '30M',
    '30m': '30M',
    '1 hour': '1H',
    '1h': '1H',
    'hourly': '1H',
    '4 hour': '4H',
    '4h': '4H',
    'daily': 'D',
    '1d': 'D',
    'weekly': 'W',
    '1w': 'W',
};

// ICT Strategy patterns
const STRATEGY_PATTERNS = [
    { pattern: /\b(bos|break of structure)\b/gi, name: 'BOS' },
    { pattern: /\b(choch|change of character)\b/gi, name: 'CHoCH' },
    { pattern: /\b(order block|ob)\b/gi, name: 'Order Block' },
    { pattern: /\b(fvg|fair value gap|imbalance)\b/gi, name: 'FVG' },
    { pattern: /\b(liquidity grab|liquidity sweep|liq grab|swept liquidity)\b/gi, name: 'Liquidity Grab' },
    { pattern: /\b(kill zone|killzone|london session|new york session|asian session)\b/gi, name: 'Kill Zone' },
    { pattern: /\b(poi|point of interest)\b/gi, name: 'POI' },
    { pattern: /\b(equal highs|equal lows|eqh|eql)\b/gi, name: 'Equal Highs/Lows' },
    { pattern: /\b(mitigation|mitigated)\b/gi, name: 'Mitigation' },
    { pattern: /\b(displacement)\b/gi, name: 'Displacement' },
    { pattern: /\b(breaker block|breaker)\b/gi, name: 'Breaker Block' },
    { pattern: /\b(premium|discount)\b/gi, name: 'Premium/Discount' },
    { pattern: /\b(inducement)\b/gi, name: 'Inducement' },
];

export function parseTradeText(text: string): ParsedTradeData {
    const result: ParsedTradeData = {};
    const lowerText = text.toLowerCase();

    // Extract instrument - first check spoken variations
    for (const [spoken, symbol] of Object.entries(SPOKEN_FOREX_MAP)) {
        if (lowerText.includes(spoken)) {
            result.instrument = symbol;
            break;
        }
    }

    // If not found, check exact instrument names
    if (!result.instrument) {
        for (const instrument of INSTRUMENTS) {
            if (lowerText.includes(instrument.toLowerCase())) {
                result.instrument = instrument.toUpperCase().replace(' ', '');
                break;
            }
        }
    }

    // Extract trade type
    for (const [keyword, type] of Object.entries(TRADE_TYPES)) {
        if (lowerText.includes(keyword)) {
            result.tradeType = type;
            break;
        }
    }

    // Extract timeframe
    for (const [keyword, tf] of Object.entries(TIMEFRAMES)) {
        if (lowerText.includes(keyword)) {
            result.timeframe = tf;
            break;
        }
    }

    // Extract prices (entry, stop loss, target)
    // Patterns: "at 21500", "entry at 21500", "entered at 21500"
    const entryPatterns = [
        /(?:entry|entered|at|price)\s*(?:at|of|is|was)?\s*(\d+(?:\.\d+)?)/gi,
        /(\d+(?:\.\d+)?)\s*(?:entry|price)/gi,
    ];

    for (const pattern of entryPatterns) {
        const match = pattern.exec(text);
        if (match && !result.entryPrice) {
            result.entryPrice = parseFloat(match[1]);
            break;
        }
    }

    // Stop loss patterns
    const slPatterns = [
        /(?:stop loss|stoploss|sl|stop)\s*(?:at|of|is|was)?\s*(\d+(?:\.\d+)?)/gi,
        /(\d+(?:\.\d+)?)\s*(?:stop loss|stoploss|sl)/gi,
    ];

    for (const pattern of slPatterns) {
        const match = pattern.exec(text);
        if (match) {
            result.stopLoss = parseFloat(match[1]);
            break;
        }
    }

    // Target patterns
    const tpPatterns = [
        /(?:target|tp|take profit|targeting)\s*(?:at|of|is|was)?\s*(\d+(?:\.\d+)?)/gi,
        /(\d+(?:\.\d+)?)\s*(?:target|tp)/gi,
    ];

    for (const pattern of tpPatterns) {
        const match = pattern.exec(text);
        if (match) {
            result.target = parseFloat(match[1]);
            break;
        }
    }

    // Calculate risk-reward if we have entry, SL, and target
    if (result.entryPrice && result.stopLoss && result.target) {
        const risk = Math.abs(result.entryPrice - result.stopLoss);
        const reward = Math.abs(result.target - result.entryPrice);
        if (risk > 0) {
            result.riskReward = Math.round((reward / risk) * 100) / 100;
        }
    }

    // Extract strategy logic
    const foundStrategies: string[] = [];
    for (const { pattern, name } of STRATEGY_PATTERNS) {
        if (pattern.test(text)) {
            foundStrategies.push(name);
        }
    }
    if (foundStrategies.length > 0) {
        result.strategyLogic = foundStrategies.join(', ');
    }

    // Extract trade reason (everything after "because", "reason", "due to")
    const reasonPatterns = [
        /(?:because|reason|due to|since)\s+(.+?)(?:\.|$)/gi,
    ];

    for (const pattern of reasonPatterns) {
        const match = pattern.exec(text);
        if (match) {
            result.tradeReason = match[1].trim();
            break;
        }
    }

    return result;
}

export function formatRiskReward(rr: number | null | undefined): string {
    if (rr === null || rr === undefined) return '-';
    return `1:${rr.toFixed(2)}`;
}

export function getOutcomeColor(outcome: string | null): string {
    switch (outcome) {
        case 'WIN':
            return 'var(--color-profit)';
        case 'LOSS':
            return 'var(--color-loss)';
        case 'BE':
            return 'var(--color-neutral)';
        case 'RUNNING':
            return 'var(--color-accent)';
        default:
            return 'var(--color-text-secondary)';
    }
}
