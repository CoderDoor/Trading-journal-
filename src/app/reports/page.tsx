'use client';

import { useState, useEffect } from 'react';

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
    byInstrument: Array<{ instrument: string; trades: number; wins: number; winRate: number }>;
    bySession: {
        asian: { trades: number; wins: number; winRate: number };
        london: { trades: number; wins: number; winRate: number };
        ny: { trades: number; wins: number; winRate: number };
        londonClose: { trades: number; wins: number; winRate: number };
    };
    emotionBreakdown: Array<{ emotion: string; trades: number; wins: number; winRate: number }>;
    topWins: Array<{ id: string; instrument: string; riskReward: number; date: string }>;
    biggestLosses: Array<{ id: string; instrument: string; reason: string; date: string }>;
    dailyBreakdown: Array<{ date: string; trades: number; wins: number; losses: number }>;
}

function StatBox({ label, value, subtext, color }: { label: string; value: string | number; subtext?: string; color?: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'var(--color-text-primary)' }}>{value}</div>
            {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{subtext}</div>}
        </div>
    );
}

export default function ReportsPage() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

    useEffect(() => { fetchReport(); }, [period]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reports?period=${period}`);
            if (response.ok) setReport(await response.json());
        } catch (e) { console.error('Failed to fetch report:', e); }
        finally { setLoading(false); }
    };

    const handlePrint = () => {
        window.print();
    };

    const emotionIcons: Record<string, string> = { CALM: '😌', FEAR: '😰', FOMO: '😬', REVENGE: '😤' };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>📊 Performance Report</h1>
                <div className="card skeleton" style={{ height: '400px', marginTop: '1.5rem' }} />
            </div>
        );
    }

    if (!report || report.summary.totalTrades === 0) {
        return (
            <div style={{ padding: '2rem' }}>
                <h1>📊 Performance Report</h1>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
                    <p style={{ color: 'var(--color-text-muted)' }}>No trades found for this period</p>
                </div>
            </div>
        );
    }

    const periodLabels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };

    return (
        <div style={{ paddingBottom: '2rem' }} className="print-report">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>📊 {periodLabels[period]} Report</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['day', 'week', 'month'] as const).map(p => (
                        <button key={p} className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setPeriod(p)} style={{ padding: '0.5rem 1rem' }}>
                            {periodLabels[p]}
                        </button>
                    ))}
                    <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print</button>
                </div>
            </div>

            {/* Period Info */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                        📅 {report.startDate} → {report.endDate}
                    </span>
                    <span style={{ fontWeight: '600' }}>{report.summary.totalTrades} trades</span>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📈 Summary</h3>
                <div className="grid grid-6" style={{ gap: '0.75rem' }}>
                    <StatBox label="Total" value={report.summary.totalTrades} />
                    <StatBox label="Wins" value={report.summary.wins} color="var(--color-profit)" />
                    <StatBox label="Losses" value={report.summary.losses} color="var(--color-loss)" />
                    <StatBox label="Breakeven" value={report.summary.breakeven} color="var(--color-neutral)" />
                    <StatBox label="Win Rate" value={`${report.summary.winRate}%`}
                        color={report.summary.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'} />
                    <StatBox label="Avg R:R" value={`1:${report.summary.avgRiskReward}`} color="var(--color-accent)" />
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* By Instrument */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>📊 By Instrument</h4>
                    {report.byInstrument.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8rem' }}>Pair</th>
                                    <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>Trades</th>
                                    <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>Wins</th>
                                    <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.8rem' }}>Win%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.byInstrument.map(inst => (
                                    <tr key={inst.instrument} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                        <td style={{ padding: '0.5rem', fontWeight: '500' }}>{inst.instrument}</td>
                                        <td style={{ textAlign: 'center', padding: '0.5rem' }}>{inst.trades}</td>
                                        <td style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--color-profit)' }}>{inst.wins}</td>
                                        <td style={{
                                            textAlign: 'right', padding: '0.5rem', fontWeight: '600',
                                            color: inst.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'
                                        }}>
                                            {inst.winRate}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>No instrument data</p>
                    )}
                </div>

                {/* By Session */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>🕐 By Session</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { key: 'asian', label: '🌏 Asian', data: report.bySession.asian },
                            { key: 'london', label: '🇬🇧 London', data: report.bySession.london },
                            { key: 'ny', label: '🇺🇸 New York', data: report.bySession.ny },
                            { key: 'londonClose', label: '🌅 London Close', data: report.bySession.londonClose },
                        ].filter(s => s.data.trades > 0).map(session => (
                            <div key={session.key} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)',
                            }}>
                                <span>{session.label}</span>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {session.data.wins}/{session.data.trades}
                                    </span>
                                    <span style={{
                                        fontWeight: '600',
                                        color: session.data.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'
                                    }}>
                                        {session.data.winRate}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Top Wins */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-profit)' }}>🏆 Top Wins</h4>
                    {report.topWins.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {report.topWins.map((win, i) => (
                                <div key={win.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.5rem', background: 'var(--color-profit-glow)', borderRadius: 'var(--radius-sm)',
                                }}>
                                    <div>
                                        <span style={{ fontWeight: '600' }}>{i + 1}. {win.instrument}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                            {win.date}
                                        </span>
                                    </div>
                                    <span style={{ color: 'var(--color-profit)', fontWeight: '700' }}>1:{win.riskReward.toFixed(1)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>No wins yet</p>
                    )}
                </div>

                {/* Emotion Breakdown */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>🧠 Emotion Impact</h4>
                    {report.emotionBreakdown.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {report.emotionBreakdown.map(emo => (
                                <div key={emo.emotion} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)',
                                }}>
                                    <span>{emotionIcons[emo.emotion] || '😐'} {emo.emotion}</span>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {emo.trades} trades
                                        </span>
                                        <span style={{
                                            fontWeight: '600',
                                            color: emo.winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'
                                        }}>
                                            {emo.winRate}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)' }}>Log emotions to see impact</p>
                    )}
                </div>
            </div>

            {/* Daily Breakdown Chart */}
            {report.dailyBreakdown.length > 1 && (
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>📆 Daily Activity</h4>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100px' }}>
                        {report.dailyBreakdown.map(day => {
                            const maxTrades = Math.max(...report.dailyBreakdown.map(d => d.trades));
                            const height = (day.trades / maxTrades) * 100;
                            const winPct = day.trades > 0 ? (day.wins / day.trades) * 100 : 0;
                            return (
                                <div key={day.date} style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        minHeight: day.trades > 0 ? '10px' : '2px',
                                        background: winPct >= 50 ? 'var(--color-profit)' : winPct > 0 ? 'var(--color-loss)' : 'var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                    }} title={`${day.date}: ${day.wins}W/${day.losses}L`} />
                                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(day.date).getDate()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .print-report {
                        padding: 1rem !important;
                    }
                    .btn, button {
                        display: none !important;
                    }
                    .card {
                        break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
