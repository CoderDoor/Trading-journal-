import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type definitions for query filters
interface WhereClause {
    OR?: Array<{ [key: string]: { contains: string } }>;
    instrument?: { contains: string };
    outcome?: string;
    createdAt?: { gte?: Date; lte?: Date };
}

interface JournalEntryInput {
    instrument?: string;
    tradeType?: string;
    timeframe?: string;
    entryPrice?: string | number;
    stopLoss?: string | number;
    target?: string | number;
    riskReward?: string | number;
    outcome?: string;
    tradeReason?: string;
    strategyLogic?: string;
    htfBiasAligned?: boolean;
    liquidityTaken?: boolean;
    entryAtPOI?: boolean;
    riskManaged?: boolean;
    bosConfirmed?: boolean;
    mssConfirmed?: boolean;
    chochConfirmed?: boolean;
    orderBlockEntry?: boolean;
    fvgEntry?: boolean;
    killZoneEntry?: boolean;
    asianSession?: boolean;
    londonSession?: boolean;
    nySession?: boolean;
    londonClose?: boolean;
    emotionState?: string;
    whatWentWell?: string;
    whatWentWrong?: string;
    improvement?: string;
    screenshot?: string;
    rawTranscript?: string;
    tags?: string[];
    brokenRuleIds?: string[]; // Manually selected rule violations
}

// Validation helper
function validateJournalEntry(body: JournalEntryInput): { valid: boolean; error?: string } {
    if (body.entryPrice && isNaN(parseFloat(String(body.entryPrice)))) {
        return { valid: false, error: 'Invalid entry price' };
    }
    if (body.stopLoss && isNaN(parseFloat(String(body.stopLoss)))) {
        return { valid: false, error: 'Invalid stop loss' };
    }
    if (body.target && isNaN(parseFloat(String(body.target)))) {
        return { valid: false, error: 'Invalid target' };
    }
    if (body.outcome && !['WIN', 'LOSS', 'BE', 'RUNNING'].includes(body.outcome)) {
        return { valid: false, error: 'Invalid outcome value' };
    }
    if (body.tradeType && !['BUY', 'SELL', 'CALL', 'PUT'].includes(body.tradeType)) {
        return { valid: false, error: 'Invalid trade type' };
    }
    return { valid: true };
}

// GET - List all journal entries with optional search/filter and pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const instrument = searchParams.get('instrument');
        const outcome = searchParams.get('outcome');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const timeframe = searchParams.get('timeframe');
        const emotionState = searchParams.get('emotionState');
        const tags = searchParams.get('tags');

        // Pagination params
        const cursor = searchParams.get('cursor');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

        // Build where clause with proper typing
        const where: WhereClause = {};

        if (search) {
            where.OR = [
                { instrument: { contains: search } },
                { rawTranscript: { contains: search } },
                { strategyLogic: { contains: search } },
                { tradeReason: { contains: search } },
            ];
        }

        if (instrument) {
            where.instrument = { contains: instrument };
        }

        if (outcome) {
            where.outcome = outcome;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Extended filters
        const extendedWhere: Record<string, unknown> = { ...where };
        if (timeframe) extendedWhere.timeframe = timeframe;
        if (emotionState) extendedWhere.emotionState = emotionState;

        const entries = await prisma.journalEntry.findMany({
            where: extendedWhere,
            orderBy: { createdAt: 'desc' },
            take: limit + 1, // Fetch one extra to determine if there's a next page
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });

        // Determine if there are more results
        const hasNextPage = entries.length > limit;
        const results = hasNextPage ? entries.slice(0, limit) : entries;
        const nextCursor = hasNextPage ? results[results.length - 1]?.id : null;

        return NextResponse.json({
            entries: results,
            pagination: {
                hasNextPage,
                nextCursor,
                limit,
            },
        });
    } catch (error) {
        console.error('Failed to fetch journal entries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entries' },
            { status: 500 }
        );
    }
}

// Punishment templates based on severity
const PUNISHMENTS = {
    LOW: [
        { type: 'WRITING', task: 'Write 3 reasons why this rule exists and how it protects your capital' },
        { type: 'REVIEW', task: 'Review your last winning trade and document what you did right' },
    ],
    MEDIUM: [
        { type: 'NO_TRADING', task: 'No live trading for 24 hours - use this time to study your rules' },
        { type: 'REVIEW', task: 'Review 5 past trades and identify similar mistakes' },
    ],
    HIGH: [
        { type: 'PAPER_TRADE', task: 'Paper trade only for 3 days before resuming live trading' },
        { type: 'WRITING', task: 'Write a detailed journal entry about this mistake and your action plan' },
    ],
    CRITICAL: [
        { type: 'NO_TRADING', task: 'No trading for 1 week - complete strategy review required' },
        { type: 'REVIEW', task: 'Create a full strategy review document with updated rules' },
    ],
};

function getPunishment(severity: string) {
    const list = PUNISHMENTS[severity as keyof typeof PUNISHMENTS] || PUNISHMENTS.MEDIUM;
    return list[Math.floor(Math.random() * list.length)];
}

// Check if a rule is violated by the trade data
function checkRuleViolation(rule: any, tradeData: JournalEntryInput): boolean {
    try {
        const condition = JSON.parse(rule.condition || '{}');
        const { field, operator, value } = condition;

        if (!field || !operator) return false;

        const tradeValue = (tradeData as any)[field];

        switch (operator) {
            case 'eq': return tradeValue === value;
            case 'neq': return tradeValue !== value;
            case 'lt': return typeof tradeValue === 'number' && tradeValue < value;
            case 'lte': return typeof tradeValue === 'number' && tradeValue <= value;
            case 'gt': return typeof tradeValue === 'number' && tradeValue > value;
            case 'gte': return typeof tradeValue === 'number' && tradeValue >= value;
            case 'is_false': return tradeValue === false;
            case 'is_true': return tradeValue === true;
            default: return false;
        }
    } catch {
        return false;
    }
}

// POST - Create new journal entry
export async function POST(request: NextRequest) {
    try {
        const body: JournalEntryInput = await request.json();

        // Validate input
        const validation = validateJournalEntry(body);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const entry = await prisma.journalEntry.create({
            data: {
                instrument: body.instrument || null,
                tradeType: body.tradeType || null,
                timeframe: body.timeframe || null,
                entryPrice: body.entryPrice ? parseFloat(String(body.entryPrice)) : null,
                stopLoss: body.stopLoss ? parseFloat(String(body.stopLoss)) : null,
                target: body.target ? parseFloat(String(body.target)) : null,
                riskReward: body.riskReward ? parseFloat(String(body.riskReward)) : null,
                outcome: body.outcome || null,
                tradeReason: body.tradeReason || null,
                strategyLogic: body.strategyLogic || null,
                htfBiasAligned: Boolean(body.htfBiasAligned),
                liquidityTaken: Boolean(body.liquidityTaken),
                entryAtPOI: Boolean(body.entryAtPOI),
                riskManaged: Boolean(body.riskManaged),
                bosConfirmed: Boolean(body.bosConfirmed),
                mssConfirmed: Boolean(body.mssConfirmed),
                chochConfirmed: Boolean(body.chochConfirmed),
                orderBlockEntry: Boolean(body.orderBlockEntry),
                fvgEntry: Boolean(body.fvgEntry),
                killZoneEntry: Boolean(body.killZoneEntry),
                asianSession: Boolean(body.asianSession),
                londonSession: Boolean(body.londonSession),
                nySession: Boolean(body.nySession),
                londonClose: Boolean(body.londonClose),
                emotionState: body.emotionState || null,
                whatWentWell: body.whatWentWell || null,
                whatWentWrong: body.whatWentWrong || null,
                improvement: body.improvement || null,
                screenshot: body.screenshot || null,
                rawTranscript: body.rawTranscript || '',
            },
        });

        // Create violations for manually selected broken rules
        const violations: any[] = [];
        try {
            if (body.brokenRuleIds && body.brokenRuleIds.length > 0) {
                // Get the rules that user marked as broken
                const brokenRules = await (prisma as any).tradingRule.findMany({
                    where: { id: { in: body.brokenRuleIds } },
                });

                for (const rule of brokenRules) {
                    const punishment = getPunishment(rule.severity);
                    const violation = await (prisma as any).ruleViolation.create({
                        data: {
                            ruleId: rule.id,
                            ruleName: rule.name,
                            journalEntryId: entry.id,
                            punishment: punishment.task,
                            punishmentType: punishment.type,
                            severity: rule.severity,
                            status: 'PENDING',
                        },
                    });
                    violations.push(violation);
                }
            }
        } catch (ruleError) {
            console.error('Rule violation creation failed (non-critical):', ruleError);
        }

        return NextResponse.json({
            entry,
            violations,
            violationsCount: violations.length
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to create journal entry' },
            { status: 500 }
        );
    }
}
