'use client';

import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell
} from 'recharts';

interface TradeData {
    id: string;
    outcome?: string | null;
    riskReward?: number | null;
    instrument?: string | null;
    emotionState?: string | null;
    createdAt: Date | string;
}

interface PerformanceChartsProps {
    trades: TradeData[];
}

// Theme colors
const colors = {
    profit: '#22c55e',
    loss: '#ef4444',
    neutral: '#fbbf24',
    accent: '#8b5cf6',
    text: '#e2e8f0',
    grid: '#334155'
};

export default function PerformanceCharts({ trades }: PerformanceChartsProps) {
    // Calculate equity curve data
    const equityCurve = useMemo(() => {
        let cumulative = 0;
        return trades
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((trade, index) => {
                const rr = trade.riskReward || 1;
                if (trade.outcome === 'WIN') cumulative += rr;
                else if (trade.outcome === 'LOSS') cumulative -= 1;
                return {
                    trade: index + 1,
                    date: new Date(trade.createdAt).toLocaleDateString(),
                    pnl: parseFloat(cumulative.toFixed(2)),
                    outcome: trade.outcome
                };
            });
    }, [trades]);

    // Calculate drawdown
    const drawdownData = useMemo(() => {
        let peak = 0;
        return equityCurve.map(point => {
            if (point.pnl > peak) peak = point.pnl;
            const drawdown = peak > 0 ? ((peak - point.pnl) / peak) * 100 : 0;
            return {
                ...point,
                drawdown: parseFloat(drawdown.toFixed(2))
            };
        });
    }, [equityCurve]);

    // Win rate by instrument
    const instrumentStats = useMemo(() => {
        const stats: Record<string, { wins: number; total: number }> = {};
        trades.forEach(trade => {
            const inst = trade.instrument || 'Unknown';
            if (!stats[inst]) stats[inst] = { wins: 0, total: 0 };
            stats[inst].total++;
            if (trade.outcome === 'WIN') stats[inst].wins++;
        });
        return Object.entries(stats)
            .map(([name, data]) => ({
                name,
                winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
                total: data.total
            }))
            .filter(d => d.total >= 1)
            .sort((a, b) => b.winRate - a.winRate)
            .slice(0, 8);
    }, [trades]);

    // Monthly heatmap data
    const monthlyData = useMemo(() => {
        const months: Record<string, { wins: number; losses: number; pnl: number }> = {};
        trades.forEach(trade => {
            const date = new Date(trade.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key]) months[key] = { wins: 0, losses: 0, pnl: 0 };
            const rr = trade.riskReward || 1;
            if (trade.outcome === 'WIN') {
                months[key].wins++;
                months[key].pnl += rr;
            } else if (trade.outcome === 'LOSS') {
                months[key].losses++;
                months[key].pnl -= 1;
            }
        });
        return Object.entries(months)
            .map(([month, data]) => ({
                month,
                ...data,
                winRate: data.wins + data.losses > 0 ? Math.round((data.wins / (data.wins + data.losses)) * 100) : 0
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);
    }, [trades]);

    // Emotion analysis
    const emotionStats = useMemo(() => {
        const stats: Record<string, { wins: number; total: number }> = {};
        trades.forEach(trade => {
            const emotion = trade.emotionState || 'Unknown';
            if (!stats[emotion]) stats[emotion] = { wins: 0, total: 0 };
            stats[emotion].total++;
            if (trade.outcome === 'WIN') stats[emotion].wins++;
        });
        return Object.entries(stats)
            .map(([name, data]) => ({
                name,
                winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
                total: data.total
            }))
            .filter(d => d.total >= 1)
            .sort((a, b) => b.total - a.total);
    }, [trades]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ margin: '4px 0 0', color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (trades.length < 2) {
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
            }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    📊 Need at least 2 trades to display performance charts
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Equity Curve */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📈 Equity Curve (R)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
                        <XAxis
                            dataKey="trade"
                            stroke={colors.text}
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke={colors.text}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="pnl"
                            stroke={colors.accent}
                            strokeWidth={2}
                            dot={false}
                            name="Cumulative R"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Win Rate by Pair */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💹 Win Rate by Pair
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={instrumentStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke={colors.text} fontSize={12} />
                            <YAxis type="category" dataKey="name" stroke={colors.text} fontSize={12} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="winRate" name="Win Rate %" radius={[0, 4, 4, 0]}>
                                {instrumentStats.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.winRate >= 50 ? colors.profit : colors.loss}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Emotion Analysis */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🧠 Win Rate by Emotion
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={emotionStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke={colors.text} fontSize={12} />
                            <YAxis type="category" dataKey="name" stroke={colors.text} fontSize={12} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="winRate" name="Win Rate %" radius={[0, 4, 4, 0]}>
                                {emotionStats.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.winRate >= 50 ? colors.profit : colors.loss}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Performance */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--color-border)'
            }}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📅 Monthly Performance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {monthlyData.map(month => (
                        <div
                            key={month.month}
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: month.pnl >= 0
                                    ? `rgba(34, 197, 94, ${Math.min(0.3 + (month.winRate / 200), 0.6)})`
                                    : `rgba(239, 68, 68, ${Math.min(0.3 + ((100 - month.winRate) / 200), 0.6)})`,
                                textAlign: 'center',
                                border: '1px solid transparent',
                                transition: 'transform 0.2s',
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                                {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                {month.pnl >= 0 ? '+' : ''}{month.pnl.toFixed(1)}R
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                {month.winRate}% | {month.wins}W/{month.losses}L
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
