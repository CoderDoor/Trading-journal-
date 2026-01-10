import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface AnalyticsData {
    totalTrades: number;
    wins: number;
    losses: number;
    breakeven: number;
    running: number;
    winRate: number;
    avgRiskReward: number;

    // Performance by instrument
    byInstrument: Array<{
        instrument: string;
        total: number;
        wins: number;
        losses: number;
        winRate: number;
    }>;

    // Performance by session
    bySession: {
        asian: { total: number; wins: number; winRate: number };
        london: { total: number; wins: number; winRate: number };
        ny: { total: number; wins: number; winRate: number };
        londonClose: { total: number; wins: number; winRate: number };
    };

    // Performance by emotion
    byEmotion: Array<{
        emotion: string;
        total: number;
        wins: number;
        winRate: number;
    }>;

    // Performance by strategy
    byStrategy: Array<{
        strategy: string;
        total: number;
        wins: number;
        winRate: number;
    }>;

    // Checklist correlation with wins
    checklistCorrelation: {
        htfBiasAligned: { withCheck: number; withoutCheck: number };
        liquidityTaken: { withCheck: number; withoutCheck: number };
        entryAtPOI: { withCheck: number; withoutCheck: number };
        riskManaged: { withCheck: number; withoutCheck: number };
    };

    // Monthly performance
    monthlyPerformance: Array<{
        month: string;
        total: number;
        wins: number;
        losses: number;
        winRate: number;
    }>;

    // Recent trades
    recentTrades: Array<{
        id: string;
        instrument: string | null;
        outcome: string | null;
        createdAt: Date;
        riskReward: number | null;
    }>;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter
        const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.lte = new Date(endDate);
        }

        // Fetch all entries for analytics
        const entries = await prisma.journalEntry.findMany({
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
        });

        // Basic stats
        const totalTrades = entries.length;
        const wins = entries.filter(e => e.outcome === 'WIN').length;
        const losses = entries.filter(e => e.outcome === 'LOSS').length;
        const breakeven = entries.filter(e => e.outcome === 'BE').length;
        const running = entries.filter(e => e.outcome === 'RUNNING').length;
        const completedTrades = wins + losses;
        const winRate = completedTrades > 0 ? Math.round((wins / completedTrades) * 100) : 0;

        // Average Risk Reward
        const tradesWithRR = entries.filter(e => e.riskReward && e.riskReward > 0);
        const avgRiskReward = tradesWithRR.length > 0
            ? Math.round((tradesWithRR.reduce((sum, e) => sum + (e.riskReward || 0), 0) / tradesWithRR.length) * 100) / 100
            : 0;

        // Performance by instrument
        const instrumentMap = new Map<string, { total: number; wins: number; losses: number }>();
        entries.forEach(e => {
            const inst = e.instrument || 'Unknown';
            if (!instrumentMap.has(inst)) instrumentMap.set(inst, { total: 0, wins: 0, losses: 0 });
            const stats = instrumentMap.get(inst)!;
            stats.total++;
            if (e.outcome === 'WIN') stats.wins++;
            if (e.outcome === 'LOSS') stats.losses++;
        });
        const byInstrument = Array.from(instrumentMap.entries())
            .map(([instrument, stats]) => ({
                instrument,
                total: stats.total,
                wins: stats.wins,
                losses: stats.losses,
                winRate: (stats.wins + stats.losses) > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Performance by session
        const calcSessionStats = (filter: (e: typeof entries[0]) => boolean) => {
            const sessionEntries = entries.filter(filter);
            const sessionWins = sessionEntries.filter(e => e.outcome === 'WIN').length;
            const sessionLosses = sessionEntries.filter(e => e.outcome === 'LOSS').length;
            const sessionCompleted = sessionWins + sessionLosses;
            return {
                total: sessionEntries.length,
                wins: sessionWins,
                winRate: sessionCompleted > 0 ? Math.round((sessionWins / sessionCompleted) * 100) : 0,
            };
        };

        const bySession = {
            asian: calcSessionStats(e => e.asianSession),
            london: calcSessionStats(e => e.londonSession),
            ny: calcSessionStats(e => e.nySession),
            londonClose: calcSessionStats(e => e.londonClose),
        };

        // Performance by emotion
        const emotionMap = new Map<string, { total: number; wins: number }>();
        entries.filter(e => e.emotionState).forEach(e => {
            const emotion = e.emotionState!;
            if (!emotionMap.has(emotion)) emotionMap.set(emotion, { total: 0, wins: 0 });
            const stats = emotionMap.get(emotion)!;
            stats.total++;
            if (e.outcome === 'WIN') stats.wins++;
        });
        const byEmotion = Array.from(emotionMap.entries())
            .map(([emotion, stats]) => ({
                emotion,
                total: stats.total,
                wins: stats.wins,
                winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
            }));

        // Performance by strategy
        const strategyMap = new Map<string, { total: number; wins: number }>();
        entries.filter(e => e.strategyLogic).forEach(e => {
            const strategies = e.strategyLogic!.split(',').map(s => s.trim());
            strategies.forEach(strategy => {
                if (!strategyMap.has(strategy)) strategyMap.set(strategy, { total: 0, wins: 0 });
                const stats = strategyMap.get(strategy)!;
                stats.total++;
                if (e.outcome === 'WIN') stats.wins++;
            });
        });
        const byStrategy = Array.from(strategyMap.entries())
            .map(([strategy, stats]) => ({
                strategy,
                total: stats.total,
                wins: stats.wins,
                winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Checklist correlation
        const calcChecklistCorrelation = (field: keyof typeof entries[0]) => {
            const withCheck = entries.filter(e => e[field] && e.outcome === 'WIN').length;
            const withCheckTotal = entries.filter(e => e[field] && (e.outcome === 'WIN' || e.outcome === 'LOSS')).length;
            const withoutCheck = entries.filter(e => !e[field] && e.outcome === 'WIN').length;
            const withoutCheckTotal = entries.filter(e => !e[field] && (e.outcome === 'WIN' || e.outcome === 'LOSS')).length;
            return {
                withCheck: withCheckTotal > 0 ? Math.round((withCheck / withCheckTotal) * 100) : 0,
                withoutCheck: withoutCheckTotal > 0 ? Math.round((withoutCheck / withoutCheckTotal) * 100) : 0,
            };
        };

        const checklistCorrelation = {
            htfBiasAligned: calcChecklistCorrelation('htfBiasAligned'),
            liquidityTaken: calcChecklistCorrelation('liquidityTaken'),
            entryAtPOI: calcChecklistCorrelation('entryAtPOI'),
            riskManaged: calcChecklistCorrelation('riskManaged'),
        };

        // Monthly performance
        const monthlyMap = new Map<string, { total: number; wins: number; losses: number }>();
        entries.forEach(e => {
            const date = new Date(e.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, { total: 0, wins: 0, losses: 0 });
            const stats = monthlyMap.get(monthKey)!;
            stats.total++;
            if (e.outcome === 'WIN') stats.wins++;
            if (e.outcome === 'LOSS') stats.losses++;
        });
        const monthlyPerformance = Array.from(monthlyMap.entries())
            .map(([month, stats]) => ({
                month,
                total: stats.total,
                wins: stats.wins,
                losses: stats.losses,
                winRate: (stats.wins + stats.losses) > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0,
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);

        // Recent trades
        const recentTrades = entries.slice(0, 10).map(e => ({
            id: e.id,
            instrument: e.instrument,
            outcome: e.outcome,
            createdAt: e.createdAt,
            riskReward: e.riskReward,
        }));

        const analytics: AnalyticsData = {
            totalTrades,
            wins,
            losses,
            breakeven,
            running,
            winRate,
            avgRiskReward,
            byInstrument,
            bySession,
            byEmotion,
            byStrategy,
            checklistCorrelation,
            monthlyPerformance,
            recentTrades,
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
