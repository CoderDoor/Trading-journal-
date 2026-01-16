'use client';

import { useState, useEffect } from 'react';

interface NewsEvent {
    id: string;
    time: string;
    date: string;
    currency: string;
    impact: 'high' | 'medium' | 'low';
    event: string;
    forecast?: string;
    previous?: string;
    actual?: string;
}

export default function EconomicCalendarPage() {
    const [events, setEvents] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [currencyFilter, setCurrencyFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('all');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const currencies = ['all', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

    // Fetch events from API
    useEffect(() => {
        async function fetchEvents() {
            try {
                setLoading(true);
                const res = await fetch('/api/economic-calendar');
                const data = await res.json();
                setEvents(data.events || []);
                setLastUpdated(data.lastUpdated);
            } catch (error) {
                console.error('Failed to fetch calendar:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const filteredEvents = events
        .filter(e => filter === 'all' || e.impact === filter)
        .filter(e => currencyFilter === 'all' || e.currency === currencyFilter)
        .filter(e => {
            if (dateFilter === 'today') return e.date === today;
            if (dateFilter === 'tomorrow') return e.date === tomorrow;
            return true;
        })
        .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
            case 'medium': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' };
            case 'low': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' };
            default: return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.4)' };
        }
    };

    const getCurrencyFlag = (currency: string) => {
        const flags: Record<string, string> = {
            'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
            'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭', 'NZD': '🇳🇿'
        };
        return flags[currency] || '🌐';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (dateStr === today) return 'Today';
        if (dateStr === tomorrow) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        📅 Economic Calendar
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {todayDisplay} • High-impact news that moves the markets
                    </p>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Auto-updating</div>
                    <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>🟢 Live</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                {/* Date Filter */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'today', 'tomorrow'] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setDateFilter(d)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: dateFilter === d ? 'none' : '1px solid var(--color-border)',
                                background: dateFilter === d ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                                color: dateFilter === d ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                textTransform: 'capitalize',
                            }}
                        >
                            {d === 'all' ? 'All Days' : d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />

                {/* Impact Filter */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'high', 'medium', 'low'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                border: filter === level ? 'none' : '1px solid var(--color-border)',
                                background: filter === level
                                    ? level === 'high' ? '#ef4444'
                                        : level === 'medium' ? '#fbbf24'
                                            : level === 'low' ? '#22c55e'
                                                : 'var(--color-accent)'
                                    : 'var(--color-bg-secondary)',
                                color: filter === level ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                            }}
                        >
                            {level === 'all' ? 'All' : level.charAt(0).toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Currency Filter */}
                <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                    }}
                >
                    {currencies.map(c => (
                        <option key={c} value={c}>
                            {c === 'all' ? '🌍 All' : `${getCurrencyFlag(c)} ${c}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Events List */}
            <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 80px 70px 1fr 90px 90px',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    background: 'var(--color-bg-tertiary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    <div>Date</div>
                    <div>Time</div>
                    <div>Currency</div>
                    <div>Event</div>
                    <div>Forecast</div>
                    <div>Previous</div>
                </div>

                {/* Events */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Loading economic events...
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No events match your filters
                    </div>
                ) : (
                    filteredEvents.map(event => {
                        const colors = getImpactColor(event.impact);
                        return (
                            <div
                                key={event.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px 80px 70px 1fr 90px 90px',
                                    gap: '0.75rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    borderTop: '1px solid var(--color-border)',
                                    background: colors.bg,
                                    transition: 'background 0.2s',
                                }}
                            >
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: event.date === today ? 'var(--color-accent)' : 'var(--color-text-muted)'
                                }}>
                                    {formatDate(event.date)}
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontFamily: 'monospace' }}>
                                    {event.time}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{getCurrencyFlag(event.currency)}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.85rem' }}>{event.currency}</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                        {event.event}
                                    </div>
                                    <span style={{
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        background: colors.bg,
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`,
                                    }}>
                                        {event.impact}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--color-text)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {event.forecast || '-'}
                                </div>
                                <div style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {event.previous || '-'}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Info Card */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-accent)' }}>
                    💡 Trading Tips for News Events
                </h3>
                <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0, paddingLeft: '1.25rem' }}>
                    <li><strong style={{ color: '#ef4444' }}>High Impact:</strong> Expect significant volatility. Consider avoiding new trades 30 min before/after.</li>
                    <li><strong style={{ color: '#fbbf24' }}>Medium Impact:</strong> May cause short-term spikes. Tighten stops if holding positions.</li>
                    <li><strong style={{ color: '#22c55e' }}>Low Impact:</strong> Usually minimal market reaction. Safe to trade as normal.</li>
                </ul>
            </div>
        </div>
    );
}
