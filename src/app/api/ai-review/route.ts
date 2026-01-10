import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface TradePattern {
    type: 'strength' | 'weakness' | 'suggestion';
    title: string;
    description: string;
    metric?: string;
}

interface AIReviewResult {
    summary: string;
    overallScore: number;
    strengths: TradePattern[];
    weaknesses: TradePattern[];
    suggestions: TradePattern[];
    bestPerforming: {
        instrument?: string;
        session?: string;
        emotion?: string;
        strategy?: string;
    };
    worstPerforming: {
        instrument?: string;
        session?: string;
        emotion?: string;
    };
}

// GET - Generate AI trade review
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Get entries from the specified period
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const entries = await prisma.journalEntry.findMany({
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
        });

        if (entries.length < 3) {
            return NextResponse.json({
                error: 'Need at least 3 trades for meaningful analysis',
                minRequired: 3,
                currentCount: entries.length,
            }, { status: 400 });
        }

        // Analyze trades
        const review = analyzeTradesWithAI(entries);

        return NextResponse.json(review);
    } catch (error: any) {
        console.error('AI Review failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function analyzeTradesWithAI(entries: any[]): AIReviewResult {
    const strengths: TradePattern[] = [];
    const weaknesses: TradePattern[] = [];
    const suggestions: TradePattern[] = [];

    // Basic stats
    const wins = entries.filter(e => e.outcome === 'WIN').length;
    const losses = entries.filter(e => e.outcome === 'LOSS').length;
    const total = wins + losses;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    // Risk:Reward analysis
    const tradesWithRR = entries.filter(e => e.riskReward && e.riskReward > 0);
    const avgRR = tradesWithRR.length > 0
        ? tradesWithRR.reduce((sum, e) => sum + e.riskReward, 0) / tradesWithRR.length
        : 0;

    // Session analysis
    const sessionStats = {
        asian: { wins: 0, total: 0 },
        london: { wins: 0, total: 0 },
        ny: { wins: 0, total: 0 },
        londonClose: { wins: 0, total: 0 },
    };

    entries.forEach(e => {
        if (e.asianSession) { sessionStats.asian.total++; if (e.outcome === 'WIN') sessionStats.asian.wins++; }
        if (e.londonSession) { sessionStats.london.total++; if (e.outcome === 'WIN') sessionStats.london.wins++; }
        if (e.nySession) { sessionStats.ny.total++; if (e.outcome === 'WIN') sessionStats.ny.wins++; }
        if (e.londonClose) { sessionStats.londonClose.total++; if (e.outcome === 'WIN') sessionStats.londonClose.wins++; }
    });

    // Emotion analysis
    const emotionStats: Record<string, { wins: number; total: number }> = {};
    entries.filter(e => e.emotionState).forEach(e => {
        if (!emotionStats[e.emotionState]) emotionStats[e.emotionState] = { wins: 0, total: 0 };
        emotionStats[e.emotionState].total++;
        if (e.outcome === 'WIN') emotionStats[e.emotionState].wins++;
    });

    // Checklist correlation
    const checklistAnalysis = {
        htfBias: { withWins: 0, withTotal: 0, withoutWins: 0, withoutTotal: 0 },
        liquidity: { withWins: 0, withTotal: 0, withoutWins: 0, withoutTotal: 0 },
        poi: { withWins: 0, withTotal: 0, withoutWins: 0, withoutTotal: 0 },
        risk: { withWins: 0, withTotal: 0, withoutWins: 0, withoutTotal: 0 },
    };

    entries.forEach(e => {
        const isWin = e.outcome === 'WIN';
        const isComplete = e.outcome === 'WIN' || e.outcome === 'LOSS';

        if (isComplete) {
            if (e.htfBiasAligned) { checklistAnalysis.htfBias.withTotal++; if (isWin) checklistAnalysis.htfBias.withWins++; }
            else { checklistAnalysis.htfBias.withoutTotal++; if (isWin) checklistAnalysis.htfBias.withoutWins++; }

            if (e.liquidityTaken) { checklistAnalysis.liquidity.withTotal++; if (isWin) checklistAnalysis.liquidity.withWins++; }
            else { checklistAnalysis.liquidity.withoutTotal++; if (isWin) checklistAnalysis.liquidity.withoutWins++; }

            if (e.entryAtPOI) { checklistAnalysis.poi.withTotal++; if (isWin) checklistAnalysis.poi.withWins++; }
            else { checklistAnalysis.poi.withoutTotal++; if (isWin) checklistAnalysis.poi.withoutWins++; }

            if (e.riskManaged) { checklistAnalysis.risk.withTotal++; if (isWin) checklistAnalysis.risk.withWins++; }
            else { checklistAnalysis.risk.withoutTotal++; if (isWin) checklistAnalysis.risk.withoutWins++; }
        }
    });

    // Instrument analysis
    const instrumentStats: Record<string, { wins: number; total: number }> = {};
    entries.filter(e => e.instrument).forEach(e => {
        if (!instrumentStats[e.instrument]) instrumentStats[e.instrument] = { wins: 0, total: 0 };
        instrumentStats[e.instrument].total++;
        if (e.outcome === 'WIN') instrumentStats[e.instrument].wins++;
    });

    // Generate insights

    // Win Rate Analysis
    if (winRate >= 50) {
        strengths.push({
            type: 'strength',
            title: 'Solid Win Rate',
            description: `Your ${winRate.toFixed(1)}% win rate shows consistent edge in the market.`,
            metric: `${winRate.toFixed(1)}%`,
        });
    } else if (winRate >= 40) {
        suggestions.push({
            type: 'suggestion',
            title: 'Win Rate Needs Improvement',
            description: 'Focus on trade selection and confirmation before entry.',
            metric: `${winRate.toFixed(1)}%`,
        });
    } else {
        weaknesses.push({
            type: 'weakness',
            title: 'Low Win Rate',
            description: 'Your win rate is below 40%. Review your entry criteria and consider being more selective.',
            metric: `${winRate.toFixed(1)}%`,
        });
    }

    // Risk:Reward Analysis
    if (avgRR >= 2) {
        strengths.push({
            type: 'strength',
            title: 'Excellent Risk:Reward',
            description: `Average R:R of 1:${avgRR.toFixed(1)} - you're letting winners run!`,
            metric: `1:${avgRR.toFixed(1)}`,
        });
    } else if (avgRR >= 1.5) {
        suggestions.push({
            type: 'suggestion',
            title: 'R:R Could Be Better',
            description: 'Try to aim for at least 1:2 R:R on trades.',
            metric: `1:${avgRR.toFixed(1)}`,
        });
    } else if (avgRR > 0) {
        weaknesses.push({
            type: 'weakness',
            title: 'Poor Risk:Reward',
            description: 'Your average R:R is too low. Consider wider targets or tighter stops.',
            metric: `1:${avgRR.toFixed(1)}`,
        });
    }

    // Emotion Analysis
    const calmTrades = emotionStats['CALM'];
    const fearTrades = emotionStats['FEAR'];
    const fomoTrades = emotionStats['FOMO'];
    const revengeTrades = emotionStats['REVENGE'];

    if (calmTrades && calmTrades.total > 0) {
        const calmWinRate = (calmTrades.wins / calmTrades.total) * 100;
        if (calmWinRate > winRate + 10) {
            strengths.push({
                type: 'strength',
                title: 'Calm Trading Works',
                description: `You win ${calmWinRate.toFixed(0)}% of trades when calm vs ${winRate.toFixed(0)}% overall.`,
            });
        }
    }

    if (revengeTrades && revengeTrades.total >= 2) {
        const revengeWinRate = (revengeTrades.wins / revengeTrades.total) * 100;
        if (revengeWinRate < 40) {
            weaknesses.push({
                type: 'weakness',
                title: 'Revenge Trading Hurts',
                description: `Only ${revengeWinRate.toFixed(0)}% win rate on revenge trades. Step away after losses.`,
            });
        }
    }

    if (fomoTrades && fomoTrades.total >= 2) {
        const fomoWinRate = (fomoTrades.wins / fomoTrades.total) * 100;
        if (fomoWinRate < 40) {
            weaknesses.push({
                type: 'weakness',
                title: 'FOMO Trading Fails',
                description: `FOMO trades have only ${fomoWinRate.toFixed(0)}% win rate. Wait for your setup.`,
            });
        }
    }

    // Checklist Correlation
    Object.entries(checklistAnalysis).forEach(([key, data]) => {
        if (data.withTotal >= 3 && data.withoutTotal >= 3) {
            const withWR = (data.withWins / data.withTotal) * 100;
            const withoutWR = (data.withoutWins / data.withoutTotal) * 100;

            const labels: Record<string, string> = {
                htfBias: 'HTF Bias Alignment',
                liquidity: 'Liquidity Taken',
                poi: 'Entry at POI',
                risk: 'Risk Management',
            };

            if (withWR > withoutWR + 15) {
                strengths.push({
                    type: 'strength',
                    title: `${labels[key]} Matters`,
                    description: `${withWR.toFixed(0)}% win rate when checked vs ${withoutWR.toFixed(0)}% when not.`,
                });
            }

            if (data.withTotal < data.withoutTotal * 0.3) {
                suggestions.push({
                    type: 'suggestion',
                    title: `Use ${labels[key]} More`,
                    description: `You only check this ${((data.withTotal / (data.withTotal + data.withoutTotal)) * 100).toFixed(0)}% of the time.`,
                });
            }
        }
    });

    // Session Performance
    const bestSession = Object.entries(sessionStats)
        .filter(([_, s]) => s.total >= 3)
        .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];

    const worstSession = Object.entries(sessionStats)
        .filter(([_, s]) => s.total >= 3)
        .sort((a, b) => (a[1].wins / a[1].total) - (b[1].wins / b[1].total))[0];

    // Instrument Performance
    const instruments = Object.entries(instrumentStats).filter(([_, s]) => s.total >= 3);
    const bestInstrument = instruments.sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];
    const worstInstrument = instruments.sort((a, b) => (a[1].wins / a[1].total) - (b[1].wins / b[1].total))[0];

    if (bestInstrument && bestInstrument[1].total >= 3) {
        const wr = (bestInstrument[1].wins / bestInstrument[1].total) * 100;
        if (wr > winRate + 10) {
            strengths.push({
                type: 'strength',
                title: `${bestInstrument[0]} is Your Best Pair`,
                description: `${wr.toFixed(0)}% win rate on ${bestInstrument[0]} - consider focusing here.`,
            });
        }
    }

    if (worstInstrument && worstInstrument[1].total >= 3) {
        const wr = (worstInstrument[1].wins / worstInstrument[1].total) * 100;
        if (wr < winRate - 15) {
            weaknesses.push({
                type: 'weakness',
                title: `Avoid ${worstInstrument[0]}`,
                description: `Only ${wr.toFixed(0)}% win rate - consider avoiding this pair.`,
            });
        }
    }

    // Generate overall score (0-100)
    let score = 50; // Base score
    score += (winRate - 50) * 0.5; // Win rate contribution
    score += Math.min(avgRR - 1, 2) * 10; // R:R contribution
    score += strengths.length * 5;
    score -= weaknesses.length * 7;
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Summary
    const summaryParts: string[] = [];
    if (winRate >= 50) summaryParts.push(`solid ${winRate.toFixed(0)}% win rate`);
    if (avgRR >= 2) summaryParts.push(`excellent 1:${avgRR.toFixed(1)} R:R`);
    if (weaknesses.length === 0) summaryParts.push('no major issues detected');

    let summary = `Based on ${entries.length} trades over the last ${Math.ceil((Date.now() - entries[entries.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24))} days`;
    if (summaryParts.length > 0) {
        summary += `: ${summaryParts.join(', ')}.`;
    } else {
        summary += `. Focus on the suggestions below to improve your performance.`;
    }

    // Best/Worst performers
    const bestEmotion = Object.entries(emotionStats)
        .filter(([_, s]) => s.total >= 2)
        .sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total))[0];

    const worstEmotion = Object.entries(emotionStats)
        .filter(([_, s]) => s.total >= 2)
        .sort((a, b) => (a[1].wins / a[1].total) - (b[1].wins / b[1].total))[0];

    return {
        summary,
        overallScore: score,
        strengths,
        weaknesses,
        suggestions,
        bestPerforming: {
            instrument: bestInstrument?.[0],
            session: bestSession?.[0]?.replace('londonClose', 'London Close'),
            emotion: bestEmotion?.[0],
        },
        worstPerforming: {
            instrument: worstInstrument?.[0],
            session: worstSession?.[0]?.replace('londonClose', 'London Close'),
            emotion: worstEmotion?.[0],
        },
    };
}
