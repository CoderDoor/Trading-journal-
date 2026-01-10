'use client';

import { useState, useEffect, useMemo } from 'react';

interface AnalyticsData {
    totalTrades: number;
    wins: number;
    losses: number;
    breakeven: number;
    running: number;
    winRate: number;
    avgRiskReward: number;
    byInstrument: Array<{ instrument: string; total: number; wins: number; losses: number; winRate: number }>;
    bySession: {
        asian: { total: number; wins: number; winRate: number };
        london: { total: number; wins: number; winRate: number };
        ny: { total: number; wins: number; winRate: number };
        londonClose: { total: number; wins: number; winRate: number };
    };
    byEmotion: Array<{ emotion: string; total: number; wins: number; winRate: number }>;
    byStrategy: Array<{ strategy: string; total: number; wins: number; winRate: number }>;
    checklistCorrelation: {
        htfBiasAligned: { withCheck: number; withoutCheck: number };
        liquidityTaken: { withCheck: number; withoutCheck: number };
        entryAtPOI: { withCheck: number; withoutCheck: number };
        riskManaged: { withCheck: number; withoutCheck: number };
    };
    monthlyPerformance: Array<{ month: string; total: number; wins: number; losses: number; winRate: number }>;
    recentTrades: Array<{ id: string; instrument: string | null; outcome: string | null; createdAt: string; riskReward: number | null }>;
}

// Simple bar chart component
function BarChart({ data, valueKey, labelKey, maxValue }: {
    data: Array<Record<string, any>>;
    valueKey: string;
    labelKey: string;
    maxValue?: number;
}) {
    const max = maxValue || Math.max(...data.map(d => d[valueKey] || 0), 1);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '100px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {item[labelKey]}
                    </span>
                    <div style={{ flex: 1, height: '20px', background: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${(item[valueKey] / max) * 100}%`,
                            height: '100%',
                            background: item.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                    <span style={{ width: '50px', fontSize: '0.8rem', textAlign: 'right' }}>
                        {item[valueKey]}%
                    </span>
                </div>
            ))}
        </div>
    );
}

// Stat card component
function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
    return (
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{title}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: color || 'var(--color-text-primary)' }}>{value}</div>
            {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{subtitle}</div>}
        </div>
    );
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange !== 'all') {
                const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                params.set('startDate', startDate.toISOString());
            }
            const response = await fetch(`/api/analytics?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const emotionIcons: Record<string, string> = { CALM: '😌', FEAR: '😰', FOMO: '😬', REVENGE: '😤' };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1 style={{ marginBottom: '1.5rem' }}>📊 Analytics Dashboard</h1>
                <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="card skeleton" style={{ height: '120px' }} />)}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load analytics</div>;
    }

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>📊 Analytics Dashboard</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', '7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            className={`btn ${dateRange === range ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setDateRange(range)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            {range === 'all' ? 'All Time' : range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
                <StatCard title="Total Trades" value={analytics.totalTrades} />
                <StatCard title="Win Rate" value={`${analytics.winRate}%`} color={analytics.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'} />
                <StatCard title="Wins / Losses" value={`${analytics.wins} / ${analytics.losses}`} subtitle={`${analytics.breakeven} BE, ${analytics.running} Running`} />
                <StatCard title="Avg R:R" value={`1:${analytics.avgRiskReward}`} color="var(--color-accent)" />
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Performance by Instrument */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>🎯 Performance by Instrument</h3>
                    {analytics.byInstrument.length > 0 ? (
                        <BarChart data={analytics.byInstrument} valueKey="winRate" labelKey="instrument" maxValue={100} />
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>No data yet</p>
                    )}
                </div>

                {/* Performance by Session */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>🕐 Performance by Session</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {[
                            { key: 'asian', label: '🌏 Asian', data: analytics.bySession.asian },
                            { key: 'london', label: '🇬🇧 London', data: analytics.bySession.london },
                            { key: 'ny', label: '🇺🇸 New York', data: analytics.bySession.ny },
                            { key: 'londonClose', label: '🌅 London Close', data: analytics.bySession.londonClose },
                        ].map(session => (
                            <div key={session.key} style={{ padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{session.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: session.data.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                                    {session.data.winRate}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {session.data.wins}W / {session.data.total}T
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Emotion Impact */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>🧠 Emotion Impact on Performance</h3>
                    {analytics.byEmotion.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {analytics.byEmotion.map(emotion => (
                                <div key={emotion.emotion} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{emotionIcons[emotion.emotion] || '😐'}</span>
                                    <span style={{ width: '80px', fontSize: '0.9rem' }}>{emotion.emotion}</span>
                                    <div style={{ flex: 1, height: '24px', background: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${emotion.winRate}%`,
                                            height: '100%',
                                            background: emotion.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            color: 'white',
                                            fontWeight: '600',
                                        }}>
                                            {emotion.winRate}%
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{emotion.total} trades</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>Start logging your emotions to see insights</p>
                    )}
                </div>

                {/* Checklist Correlation */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>✅ Checklist Impact on Win Rate</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { key: 'htfBiasAligned', label: 'HTF Bias Aligned', data: analytics.checklistCorrelation.htfBiasAligned },
                            { key: 'liquidityTaken', label: 'Liquidity Taken', data: analytics.checklistCorrelation.liquidityTaken },
                            { key: 'entryAtPOI', label: 'Entry at POI', data: analytics.checklistCorrelation.entryAtPOI },
                            { key: 'riskManaged', label: 'Risk Managed', data: analytics.checklistCorrelation.riskManaged },
                        ].map(item => (
                            <div key={item.key}>
                                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{item.label}</div>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                    <span style={{ color: 'var(--color-profit)' }}>✅ {item.data.withCheck}%</span>
                                    <span style={{ color: 'var(--color-loss)' }}>❌ {item.data.withoutCheck}%</span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        {item.data.withCheck > item.data.withoutCheck ? '↑' : '↓'}
                                        {Math.abs(item.data.withCheck - item.data.withoutCheck)}% difference
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strategy Performance */}
            {analytics.byStrategy.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📈 Strategy Performance</h3>
                    <div className="grid grid-4" style={{ gap: '1rem' }}>
                        {analytics.byStrategy.map(strategy => (
                            <div key={strategy.strategy} style={{ padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                                    {strategy.strategy}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: strategy.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                                    {strategy.winRate}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {strategy.wins}W of {strategy.total}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Performance */}
            {analytics.monthlyPerformance.length > 0 && (
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>📅 Monthly Performance</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {analytics.monthlyPerformance.map(month => (
                            <div key={month.month} style={{
                                minWidth: '100px',
                                padding: '1rem',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    {month.month}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: month.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                                    {month.winRate}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                    {month.wins}W / {month.losses}L
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
