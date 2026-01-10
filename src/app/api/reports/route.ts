import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ReportData {
    period: string;
    startDate: string;
    endDate: string;
    summary: {
        totalTrades: number;
        wins: number;
        losses: number;
        breakeven: number;
        winRate: number;
        avgRiskReward: number;
    };
    byInstrument: Array<{
        instrument: string;
        trades: number;
        wins: number;
        winRate: number;
    }>;
    bySession: {
        asian: { trades: number; wins: number; winRate: number };
        london: { trades: number; wins: number; winRate: number };
        ny: { trades: number; wins: number; winRate: number };
        londonClose: { trades: number; wins: number; winRate: number };
    };
    emotionBreakdown: Array<{
        emotion: string;
        trades: number;
        wins: number;
        winRate: number;
    }>;
    topWins: Array<{
        id: string;
        instrument: string;
        riskReward: number;
        date: string;
    }>;
    biggestLosses: Array<{
        id: string;
        instrument: string;
        reason: string;
        date: string;
    }>;
    dailyBreakdown: Array<{
        date: string;
        trades: number;
        wins: number;
        losses: number;
    }>;
}

// GET - Generate report
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week'; // day, week, month, custom
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        let startDate: Date;
        let endDate: Date = new Date();

        switch (period) {
            case 'day':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'custom':
                if (!startDateStr) {
                    return NextResponse.json({ error: 'Start date required for custom period' }, { status: 400 });
                }
                startDate = new Date(startDateStr);
                if (endDateStr) endDate = new Date(endDateStr);
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
        }

        const entries = await prisma.journalEntry.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Summary stats
        const wins = entries.filter(e => e.outcome === 'WIN').length;
        const losses = entries.filter(e => e.outcome === 'LOSS').length;
        const breakeven = entries.filter(e => e.outcome === 'BE').length;
        const completed = wins + losses;
        const winRate = completed > 0 ? Math.round((wins / completed) * 100) : 0;

        const tradesWithRR = entries.filter(e => e.riskReward && e.riskReward > 0);
        const avgRR = tradesWithRR.length > 0
            ? Math.round((tradesWithRR.reduce((sum, e) => sum + (e.riskReward || 0), 0) / tradesWithRR.length) * 100) / 100
            : 0;

        // By instrument
        const instrumentMap = new Map<string, { trades: number; wins: number }>();
        entries.forEach(e => {
            const inst = e.instrument || 'Unknown';
            if (!instrumentMap.has(inst)) instrumentMap.set(inst, { trades: 0, wins: 0 });
            const stats = instrumentMap.get(inst)!;
            stats.trades++;
            if (e.outcome === 'WIN') stats.wins++;
        });
        const byInstrument = Array.from(instrumentMap.entries())
            .map(([instrument, stats]) => ({
                instrument,
                trades: stats.trades,
                wins: stats.wins,
                winRate: stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0,
            }))
            .sort((a, b) => b.trades - a.trades)
            .slice(0, 5);

        // By session
        const calcSession = (filter: (e: typeof entries[0]) => boolean) => {
            const sessionEntries = entries.filter(filter);
            const sessionWins = sessionEntries.filter(e => e.outcome === 'WIN').length;
            return {
                trades: sessionEntries.length,
                wins: sessionWins,
                winRate: sessionEntries.length > 0 ? Math.round((sessionWins / sessionEntries.length) * 100) : 0,
            };
        };

        const bySession = {
            asian: calcSession(e => e.asianSession),
            london: calcSession(e => e.londonSession),
            ny: calcSession(e => e.nySession),
            londonClose: calcSession(e => e.londonClose),
        };

        // Emotion breakdown
        const emotionMap = new Map<string, { trades: number; wins: number }>();
        entries.filter(e => e.emotionState).forEach(e => {
            if (!emotionMap.has(e.emotionState!)) emotionMap.set(e.emotionState!, { trades: 0, wins: 0 });
            const stats = emotionMap.get(e.emotionState!)!;
            stats.trades++;
            if (e.outcome === 'WIN') stats.wins++;
        });
        const emotionBreakdown = Array.from(emotionMap.entries()).map(([emotion, stats]) => ({
            emotion,
            trades: stats.trades,
            wins: stats.wins,
            winRate: stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0,
        }));

        // Top wins (by R:R)
        const topWins = entries
            .filter(e => e.outcome === 'WIN' && e.riskReward)
            .sort((a, b) => (b.riskReward || 0) - (a.riskReward || 0))
            .slice(0, 3)
            .map(e => ({
                id: e.id,
                instrument: e.instrument || 'Unknown',
                riskReward: e.riskReward || 0,
                date: e.createdAt.toISOString().split('T')[0],
            }));

        // Biggest losses
        const biggestLosses = entries
            .filter(e => e.outcome === 'LOSS')
            .slice(0, 3)
            .map(e => ({
                id: e.id,
                instrument: e.instrument || 'Unknown',
                reason: e.whatWentWrong || e.tradeReason || 'No reason logged',
                date: e.createdAt.toISOString().split('T')[0],
            }));

        // Daily breakdown
        const dailyMap = new Map<string, { trades: number; wins: number; losses: number }>();
        entries.forEach(e => {
            const date = e.createdAt.toISOString().split('T')[0];
            if (!dailyMap.has(date)) dailyMap.set(date, { trades: 0, wins: 0, losses: 0 });
            const stats = dailyMap.get(date)!;
            stats.trades++;
            if (e.outcome === 'WIN') stats.wins++;
            if (e.outcome === 'LOSS') stats.losses++;
        });
        const dailyBreakdown = Array.from(dailyMap.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const report: ReportData = {
            period,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            summary: {
                totalTrades: entries.length,
                wins,
                losses,
                breakeven,
                winRate,
                avgRiskReward: avgRR,
            },
            byInstrument,
            bySession,
            emotionBreakdown,
            topWins,
            biggestLosses,
            dailyBreakdown,
        };

        return NextResponse.json(report);
    } catch (error: any) {
        console.error('Report generation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
