import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Punishment templates based on severity
const PUNISHMENTS = {
    LOW: [
        { type: 'WRITING', task: 'Write 3 reasons why this rule exists and how it protects your capital' },
        { type: 'REVIEW', task: 'Review your last winning trade and document what you did right' },
    ],
    MEDIUM: [
        { type: 'NO_TRADING', task: 'No live trading for 24 hours - use this time to study your rules', daysBlocked: 1 },
        { type: 'REVIEW', task: 'Review 5 past trades and identify similar mistakes' },
    ],
    HIGH: [
        { type: 'PAPER_TRADE', task: 'Paper trade only for 3 days before resuming live trading', daysBlocked: 3 },
        { type: 'WRITING', task: 'Write a detailed journal entry about this mistake and your action plan' },
    ],
    CRITICAL: [
        { type: 'NO_TRADING', task: 'No trading for 1 week - complete strategy review required', daysBlocked: 7 },
        { type: 'REVIEW', task: 'Create a full strategy review document with updated rules' },
    ],
};

// GET - Fetch all rules
export async function GET() {
    try {
        const rules = await (prisma as any).tradingRule.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ rules });
    } catch (error) {
        console.error('Failed to fetch rules:', error);
        return NextResponse.json({ error: 'Failed to fetch rules', rules: [] }, { status: 200 });
    }
}

// POST - Create new rule
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const rule = await (prisma as any).tradingRule.create({
            data: {
                name: data.name,
                description: data.description || null,
                category: data.category || 'GENERAL',
                condition: JSON.stringify(data.condition || {}),
                severity: data.severity || 'MEDIUM',
                isActive: data.isActive !== false,
            },
        });

        return NextResponse.json(rule, { status: 201 });
    } catch (error) {
        console.error('Failed to create rule:', error);
        return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
    }
}

// Helper to get random punishment for severity
export function getPunishmentForSeverity(severity: string) {
    const punishments = PUNISHMENTS[severity as keyof typeof PUNISHMENTS] || PUNISHMENTS.MEDIUM;
    return punishments[Math.floor(Math.random() * punishments.length)];
}
