import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Save a backtest trade
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const trade = await prisma.journalEntry.create({
            data: {
                instrument: data.symbol || data.instrument,
                tradeType: data.type || data.tradeType,
                entryPrice: data.entryPrice,
                stopLoss: data.stopLoss,
                target: data.takeProfit || data.target,
                outcome: data.outcome,
                riskReward: data.riskReward,
                rawTranscript: `Backtest trade: ${data.type} ${data.symbol} @ ${data.entryPrice}`,
                isBacktest: true,
                backtestSessionId: data.sessionId,
                simulatedEntryTime: data.entryTime ? new Date(data.entryTime * 1000) : null,
                simulatedExitTime: data.exitTime ? new Date(data.exitTime * 1000) : null,
                simulatedPnL: data.pnl,
            },
        });

        return NextResponse.json(trade, { status: 201 });
    } catch (error) {
        console.error('Failed to save backtest trade:', error);
        return NextResponse.json(
            { error: 'Failed to save backtest trade' },
            { status: 500 }
        );
    }
}

// GET - Fetch backtest trades
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        const where: any = { isBacktest: true };
        if (sessionId) {
            where.backtestSessionId = sessionId;
        }

        const trades = await prisma.journalEntry.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ trades });
    } catch (error) {
        console.error('Failed to fetch backtest trades:', error);
        return NextResponse.json(
            { error: 'Failed to fetch backtest trades' },
            { status: 500 }
        );
    }
}
