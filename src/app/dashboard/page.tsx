'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JournalEntry } from '@/types/journal';

// Stats Card Component
function StatCard({ label, value, icon, color, trend }: {
    label: string; value: string; icon: string; color: string; trend?: string;
}) {
    return (
        <div style={{
            background: 'var(--gradient-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</span>
                {trend && (
                    <span style={{ fontSize: '0.85rem', color: trend.startsWith('+') ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

// Calendar Day Component
function CalendarDay({ date, pnl, trades }: { date: Date; pnl: number; trades: number }) {
    const isToday = new Date().toDateString() === date.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();

    return (
        <div style={{
            background: isToday ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-bg-tertiary)',
            border: isToday ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minWidth: '120px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>{dayNum}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{dayName}</span>
            </div>
            <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: pnl > 0 ? 'var(--color-profit)' : pnl < 0 ? 'var(--color-loss)' : 'var(--color-text-muted)',
            }}>
                {pnl > 0 ? `+${pnl}W` : pnl < 0 ? `${pnl}L` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {trades} trade{trades !== 1 ? 's' : ''}
            </div>
        </div>
    );
}

// Recent Trade Card
function RecentTradeCard({ entry }: { entry: JournalEntry }) {
    const isWin = entry.outcome === 'WIN';
    const isLoss = entry.outcome === 'LOSS';

    return (
        <div style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: isWin ? 'rgba(16, 185, 129, 0.2)' : isLoss ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: isWin ? 'var(--color-profit)' : isLoss ? 'var(--color-loss)' : 'var(--color-neutral)',
                }}>
                    {entry.outcome || 'PENDING'}
                </span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {entry.instrument || 'Unknown'}
            </div>
            {/* Mini Chart Placeholder */}
            <div style={{
                height: '40px',
                background: `linear-gradient(90deg, transparent 0%, ${isWin ? 'rgba(16, 185, 129, 0.3)' : isLoss ? 'rgba(244, 63, 94, 0.3)' : 'rgba(139, 92, 246, 0.3)'} 50%, transparent 100%)`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <svg width="100%" height="30" viewBox="0 0 100 30">
                    <path
                        d={isWin
                            ? "M0,20 Q25,25 40,15 T70,10 T100,5"
                            : "M0,10 Q25,5 40,15 T70,20 T100,25"}
                        fill="none"
                        stroke={isWin ? '#10b981' : isLoss ? '#f43f5e' : '#8b5cf6'}
                        strokeWidth="2"
                    />
                </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>{entry.tradeType || '-'}</span>
                <span>{entry.timeframe || '-'}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        // Get user from Firebase auth
        import('@/lib/firebase').then(({ onAuthChange }) => {
            onAuthChange((user) => {
                if (user) {
                    setUserName(user.displayName || user.email?.split('@')[0] || 'Trader');
                }
            });
        });

        fetch('/api/journal')
            .then(res => res.json())
            .then(data => {
                setEntries(data.entries || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Calculate stats
    const totalTrades = entries.length;
    const wins = entries.filter(e => e.outcome === 'WIN').length;
    const losses = entries.filter(e => e.outcome === 'LOSS').length;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

    // Generate calendar days (last 7 days)
    const calendarDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayEntries = entries.filter(e =>
            new Date(e.createdAt).toDateString() === date.toDateString()
        );
        const dayWins = dayEntries.filter(e => e.outcome === 'WIN').length;
        const dayLosses = dayEntries.filter(e => e.outcome === 'LOSS').length;
        // Real P&L: count wins/losses (no fake values)
        const pnl = dayWins - dayLosses;
        return { date, pnl, trades: dayEntries.length, wins: dayWins, losses: dayLosses };
    });

    // Recent trades (last 4)
    const recentTrades = entries.slice(0, 4);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Welcome back{userName ? `, ${userName}` : ''}! Here's your trading overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                <StatCard label="Total Trades" value={totalTrades.toString()} icon="📊" color="var(--color-accent)" />
                <StatCard label="Win Rate" value={`${winRate}%`} icon="🎯" color={winRate >= 50 ? 'var(--color-profit)' : 'var(--color-loss)'} />
                <StatCard label="Wins" value={wins.toString()} icon="✅" color="var(--color-profit)" />
                <StatCard label="Losses" value={losses.toString()} icon="❌" color="var(--color-loss)" />
            </div>

            {/* Calendar Section */}
            <div style={{
                background: 'var(--gradient-card)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '2rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                        📅 Weekly P&L
                    </h2>
                    <Link href="/calendar" style={{
                        color: 'var(--color-accent)',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                    }}>
                        View Full Calendar →
                    </Link>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.75rem',
                }}>
                    {calendarDays.map((day, i) => (
                        <CalendarDay key={i} {...day} />
                    ))}
                </div>
            </div>

            {/* Recent Trades */}
            <div style={{
                background: 'var(--gradient-card)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                        📈 Recent Trades
                    </h2>
                    <Link href="/history" style={{
                        color: 'var(--color-accent)',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                    }}>
                        View All →
                    </Link>
                </div>
                {loading ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
                ) : recentTrades.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1rem',
                    }}>
                        {recentTrades.map((entry) => (
                            <RecentTradeCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        <p>No trades yet. Start journaling!</p>
                        <Link href="/" style={{
                            display: 'inline-block',
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            + New Trade
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
