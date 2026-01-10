'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types/journal';

export default function CalendarPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetch('/api/journal')
            .then(res => res.json())
            .then(data => {
                setEntries(data.entries || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const goToday = () => setCurrentMonth(new Date());

    const getEntriesForDate = (date: Date) => entries.filter(e => new Date(e.createdAt).toDateString() === date.toDateString());
    const selectedEntries = selectedDate ? getEntriesForDate(selectedDate) : [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div style={{ display: 'flex', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Calendar Section */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                        Trading Calendar
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Click a date to see trades</p>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={prevMonth} style={{ padding: '0.5rem 1rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', cursor: 'pointer' }}>← Prev</button>
                        <button onClick={nextMonth} style={{ padding: '0.5rem 1rem', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', cursor: 'pointer' }}>Next →</button>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{monthName}</h2>
                    <button onClick={goToday} style={{ padding: '0.5rem 1rem', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Today</button>
                </div>

                {/* Calendar Grid */}
                <div style={{ background: 'var(--gradient-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {dayNames.map(name => (
                            <div key={name} style={{ textAlign: 'center', padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{name}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                        {days.map((date, i) => {
                            if (!date) return <div key={`empty-${i}`} style={{ minHeight: '80px' }} />;
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            const dayEntries = getEntriesForDate(date);
                            const wins = dayEntries.filter(e => e.outcome === 'WIN').length;
                            const losses = dayEntries.filter(e => e.outcome === 'LOSS').length;

                            return (
                                <div key={date.toISOString()} onClick={() => setSelectedDate(date)} style={{
                                    minHeight: '80px',
                                    background: isSelected ? 'rgba(183, 148, 246, 0.2)' : isToday ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-bg-tertiary)',
                                    border: isSelected ? '2px solid var(--color-accent)' : isToday ? '2px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isToday ? 'var(--color-accent)' : 'var(--color-text)' }}>{date.getDate()}</div>
                                    {dayEntries.length > 0 && (
                                        <div style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                                            {wins > 0 && <span style={{ color: 'var(--color-profit)' }}>{wins}W </span>}
                                            {losses > 0 && <span style={{ color: 'var(--color-loss)' }}>{losses}L</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Trades Panel */}
            <div style={{ width: '350px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.25rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a Date'}
                </h3>
                {!selectedDate ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>👈 Click a date to see trades</p>
                ) : selectedEntries.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No trades on this day</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {selectedEntries.map(entry => (
                            <div key={entry.id} style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'var(--color-text)' }}>{entry.instrument || 'Unknown'}</strong>
                                    <span style={{
                                        padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                                        background: entry.outcome === 'WIN' ? 'var(--color-profit)' : entry.outcome === 'LOSS' ? 'var(--color-loss)' : 'var(--color-neutral)',
                                        color: 'white',
                                    }}>{entry.outcome || 'OPEN'}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                    {entry.tradeType} • {entry.timeframe || '-'}
                                </div>
                                {entry.tradeReason && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                        {entry.tradeReason.length > 100 ? entry.tradeReason.substring(0, 100) + '...' : entry.tradeReason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
