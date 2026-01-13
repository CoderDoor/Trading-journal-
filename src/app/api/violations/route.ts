import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch violations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status) where.status = status;

        const violations = await (prisma as any).ruleViolation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ violations });
    } catch (error) {
        console.error('Failed to fetch violations:', error);
        return NextResponse.json({ violations: [] }, { status: 200 });
    }
}

// POST - Create violation (called internally when rule is broken)
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const violation = await (prisma as any).ruleViolation.create({
            data: {
                ruleId: data.ruleId,
                ruleName: data.ruleName,
                journalEntryId: data.journalEntryId,
                punishment: data.punishment,
                punishmentType: data.punishmentType,
                severity: data.severity,
                status: 'PENDING',
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
        });

        return NextResponse.json(violation, { status: 201 });
    } catch (error) {
        console.error('Failed to create violation:', error);
        return NextResponse.json({ error: 'Failed to create violation' }, { status: 500 });
    }
}

// PUT - Update violation status (complete or dismiss)
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        const violation = await (prisma as any).ruleViolation.update({
            where: { id: data.id },
            data: {
                status: data.status,
                completedAt: data.status === 'COMPLETED' ? new Date() : null,
                notes: data.notes || null,
            },
        });

        return NextResponse.json(violation);
    } catch (error) {
        console.error('Failed to update violation:', error);
        return NextResponse.json({ error: 'Failed to update violation' }, { status: 500 });
    }
}
