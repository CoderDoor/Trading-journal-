import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get single entry by ID
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const entry = await prisma.journalEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            return NextResponse.json(
                { error: 'Journal entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Failed to fetch journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch journal entry' },
            { status: 500 }
        );
    }
}

// PUT - Update entry
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const entry = await prisma.journalEntry.update({
            where: { id },
            data: {
                instrument: body.instrument,
                tradeType: body.tradeType,
                timeframe: body.timeframe,
                entryPrice: body.entryPrice ? parseFloat(body.entryPrice) : null,
                stopLoss: body.stopLoss ? parseFloat(body.stopLoss) : null,
                target: body.target ? parseFloat(body.target) : null,
                riskReward: body.riskReward ? parseFloat(body.riskReward) : null,
                outcome: body.outcome,
                tradeReason: body.tradeReason,
                strategyLogic: body.strategyLogic,
                htfBiasAligned: Boolean(body.htfBiasAligned),
                liquidityTaken: Boolean(body.liquidityTaken),
                entryAtPOI: Boolean(body.entryAtPOI),
                riskManaged: Boolean(body.riskManaged),
                emotionState: body.emotionState,
                whatWentWell: body.whatWentWell,
                whatWentWrong: body.whatWentWrong,
                improvement: body.improvement,
                screenshot: body.screenshot,
            },
        });

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Failed to update journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to update journal entry' },
            { status: 500 }
        );
    }
}

// DELETE - Delete entry
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        await prisma.journalEntry.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete journal entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete journal entry' },
            { status: 500 }
        );
    }
}
