export interface JournalEntry {
    id: string;
    createdAt: Date;
    updatedAt?: Date;

    // Trade Details
    instrument: string | null;
    tradeType: 'BUY' | 'SELL' | 'CALL' | 'PUT' | null;
    timeframe: string | null;
    entryPrice: number | null;
    stopLoss: number | null;
    target: number | null;
    riskReward: number | null;
    outcome: 'WIN' | 'LOSS' | 'BE' | 'RUNNING' | null;

    // Analysis
    tradeReason: string | null;
    strategyLogic: string | null;

    // Pre-Trade Checklist
    htfBiasAligned: boolean;
    liquidityTaken: boolean;
    entryAtPOI: boolean;
    riskManaged: boolean;

    // ICT Strategy Checklist
    bosConfirmed: boolean;
    mssConfirmed: boolean;
    chochConfirmed: boolean;
    orderBlockEntry: boolean;
    fvgEntry: boolean;
    killZoneEntry: boolean;

    // Trading Sessions
    asianSession: boolean;
    londonSession: boolean;
    nySession: boolean;
    londonClose: boolean;

    // Emotion & Reflection
    emotionState: 'CALM' | 'FEAR' | 'FOMO' | 'REVENGE' | 'CONFIDENT' | 'ANXIOUS' | null;
    whatWentWell: string | null;
    whatWentWrong: string | null;
    improvement: string | null;

    // Screenshot
    screenshot: string | null;

    // Raw Data
    rawTranscript: string;
}

export interface ParsedTradeData {
    instrument?: string;
    tradeType?: string;
    timeframe?: string;
    entryPrice?: number;
    stopLoss?: number;
    target?: number;
    riskReward?: number;
    strategyLogic?: string;
    tradeReason?: string;
}

export interface JournalFormData {
    instrument: string;
    tradeType: string;
    timeframe: string;
    entryPrice: string;
    stopLoss: string;
    target: string;
    riskReward: string;
    outcome: string;
    tradeReason: string;
    strategyLogic: string;
    // Pre-Trade Checklist
    htfBiasAligned: boolean;
    liquidityTaken: boolean;
    entryAtPOI: boolean;
    riskManaged: boolean;
    // ICT Strategy Checklist
    bosConfirmed: boolean;
    mssConfirmed: boolean;
    chochConfirmed: boolean;
    orderBlockEntry: boolean;
    fvgEntry: boolean;
    killZoneEntry: boolean;
    // Trading Session Checklist
    asianSession: boolean;
    londonSession: boolean;
    nySession: boolean;
    londonClose: boolean;
    // Emotion & Reflection
    emotionState: string;
    whatWentWell: string;
    whatWentWrong: string;
    improvement: string;
    screenshot: string;
    rawTranscript: string;
}
