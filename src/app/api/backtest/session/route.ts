import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Create a new backtest session
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const session = await (prisma as any).backtestSession.create({
            data: {
                name: data.name || 'Backtest Session',
                symbol: data.symbol,
                timeframe: data.timeframe,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                totalTrades: data.totalTrades || 0,
                winRate: data.winRate,
                profitFactor: data.profitFactor,
                maxDrawdown: data.maxDrawdown,
                netPnL: data.netPnL,
            },
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error('Failed to create backtest session:', error);
        return NextResponse.json(
            { error: 'Failed to create backtest session' },
            { status: 500 }
        );
    }
}

// GET - Fetch all backtest sessions
export async function GET() {
    try {
        const sessions = await (prisma as any).backtestSession.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Failed to fetch backtest sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch backtest sessions' },
            { status: 500 }
        );
    }
}
