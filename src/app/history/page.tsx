'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { JournalEntry } from '@/types/journal';

// Delete Confirmation Modal Component
function DeleteModal({ isOpen, onClose, onConfirm, entryName }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    entryName: string;
}) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-loss)' }}>🗑️ Delete Entry</h3>
                <p style={{ marginBottom: '1.5rem' }}>
                    Are you sure you want to delete <strong>{entryName || 'this entry'}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn" style={{ background: 'var(--color-loss)', color: 'white' }} onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}

// Image Lightbox Modal Component
function ImageModal({ images, currentIndex, onClose, onNext, onPrev }: {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}) {
    if (currentIndex < 0 || !images.length) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }} onClick={onClose}>
            {/* Close Button */}
            <button onClick={onClose} style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'white', fontSize: '1.5rem', width: '50px', height: '50px',
                borderRadius: '50%', cursor: 'pointer',
            }}>✕</button>

            {/* Previous Button */}
            {images.length > 1 && currentIndex > 0 && (
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: 'white', fontSize: '2rem', width: '60px', height: '60px',
                    borderRadius: '50%', cursor: 'pointer',
                }}>←</button>
            )}

            {/* Image */}
            <img
                src={images[currentIndex]}
                alt={`Screenshot ${currentIndex + 1}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                }}
            />

            {/* Next Button */}
            {images.length > 1 && currentIndex < images.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: 'white', fontSize: '2rem', width: '60px', height: '60px',
                    borderRadius: '50%', cursor: 'pointer',
                }}>→</button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <div style={{
                    position: 'absolute', bottom: '1.5rem',
                    color: 'white', fontSize: '0.9rem',
                    background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '20px',
                }}>
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}

// Edit Modal Component - Premium Design
function EditModal({ isOpen, onClose, entry, onSave }: {
    isOpen: boolean;
    onClose: () => void;
    entry: JournalEntry | null;
    onSave: (data: Partial<JournalEntry>) => void;
}) {
    const [formData, setFormData] = useState({
        instrument: '', tradeType: '', timeframe: '', entryPrice: '', stopLoss: '', target: '',
        outcome: '', tradeReason: '', whatWentWell: '', whatWentWrong: '', improvement: '',
    });

    useEffect(() => {
        if (entry) {
            setFormData({
                instrument: entry.instrument || '', tradeType: entry.tradeType || '', timeframe: entry.timeframe || '',
                entryPrice: entry.entryPrice?.toString() || '', stopLoss: entry.stopLoss?.toString() || '',
                target: entry.target?.toString() || '', outcome: entry.outcome || '', tradeReason: entry.tradeReason || '',
                whatWentWell: entry.whatWentWell || '', whatWentWrong: entry.whatWentWrong || '', improvement: entry.improvement || '',
            });
        }
    }, [entry]);

    if (!isOpen || !entry) return null;

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        color: 'var(--color-text)',
        fontSize: '0.9rem',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--color-text-muted)',
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '2rem',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✏️ Edit Trade Entry
                </h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        instrument: formData.instrument || null,
                        tradeType: (formData.tradeType as any) || null,
                        timeframe: formData.timeframe || null,
                        outcome: (formData.outcome as any) || null,
                        tradeReason: formData.tradeReason || null,
                        whatWentWell: formData.whatWentWell || null,
                        whatWentWrong: formData.whatWentWrong || null,
                        improvement: formData.improvement || null,
                        entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : null,
                        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
                        target: formData.target ? parseFloat(formData.target) : null,
                    });
                }}>
                    {/* Trade Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={labelStyle}>Instrument</label>
                            <input style={inputStyle} value={formData.instrument} onChange={(e) => setFormData({ ...formData, instrument: e.target.value })} placeholder="EURUSD, XAUUSD..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Trade Type</label>
                            <select style={inputStyle} value={formData.tradeType} onChange={(e) => setFormData({ ...formData, tradeType: e.target.value })}>
                                <option value="">Select</option><option>BUY</option><option>SELL</option><option>CALL</option><option>PUT</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Timeframe</label>
                            <input style={inputStyle} value={formData.timeframe} onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })} placeholder="1H, 4H, D..." />
                        </div>
                    </div>

                    {/* Prices Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={labelStyle}>Entry Price</label>
                            <input style={inputStyle} type="number" step="any" value={formData.entryPrice} onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Stop Loss</label>
                            <input style={{ ...inputStyle, borderColor: 'rgba(255,107,138,0.3)' }} type="number" step="any" value={formData.stopLoss} onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Target</label>
                            <input style={{ ...inputStyle, borderColor: 'rgba(72,229,183,0.3)' }} type="number" step="any" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Outcome</label>
                            <select style={inputStyle} value={formData.outcome} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}>
                                <option value="">Select</option><option>WIN</option><option>LOSS</option><option>BE</option><option>RUNNING</option>
                            </select>
                        </div>
                    </div>

                    {/* Text Areas */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>📝 Trade Reason</label>
                        <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={formData.tradeReason} onChange={(e) => setFormData({ ...formData, tradeReason: e.target.value })} placeholder="Why did you take this trade?" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ ...labelStyle, color: 'var(--color-profit)' }}>✅ What Went Well</label>
                            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={formData.whatWentWell} onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, color: 'var(--color-loss)' }}>❌ What Went Wrong</label>
                            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={formData.whatWentWrong} onChange={(e) => setFormData({ ...formData, whatWentWrong: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ ...labelStyle, color: 'var(--color-accent)' }}>💡 Improvement</label>
                        <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={formData.improvement} onChange={(e) => setFormData({ ...formData, improvement: e.target.value })} placeholder="What will you do better next time?" />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '0.75rem 1.5rem', background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)', borderRadius: '10px',
                            color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer',
                        }}>Cancel</button>
                        <button type="submit" style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #b794f6 0%, #9f7aea 100%)',
                            border: 'none', borderRadius: '10px',
                            color: 'white', fontWeight: 600, cursor: 'pointer',
                        }}>💾 Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [outcomeFilter, setOutcomeFilter] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; entry: JournalEntry | null }>({ isOpen: false, entry: null });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; entry: JournalEntry | null }>({ isOpen: false, entry: null });
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number }>({ images: [], index: -1 });

    useEffect(() => { fetchEntries(); }, []);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (outcomeFilter) params.set('outcome', outcomeFilter);
            Object.entries(advancedFilters).forEach(([key, value]) => { if (value) params.set(key, value); });

            const response = await fetch(`/api/journal?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setEntries(data.entries || data);
            }
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoading(false);
        }
    }, [search, outcomeFilter, advancedFilters]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchEntries(); };

    const handleExport = async (format: 'csv' | 'json') => {
        window.open(`/api/export?format=${format}`, '_blank');
    };

    const handleDeleteClick = (entry: JournalEntry) => setDeleteModal({ isOpen: true, entry });
    const handleDeleteConfirm = async () => {
        if (!deleteModal.entry) return;
        try {
            const response = await fetch(`/api/journal/${deleteModal.entry.id}`, { method: 'DELETE' });
            if (response.ok) {
                setEntries(entries.filter((e) => e.id !== deleteModal.entry!.id));
                setDeleteModal({ isOpen: false, entry: null });
            }
        } catch (error) { console.error('Failed to delete entry:', error); }
    };

    const handleEditClick = (entry: JournalEntry) => setEditModal({ isOpen: true, entry });
    const handleEditSave = async (data: Partial<JournalEntry>) => {
        if (!editModal.entry) return;
        try {
            const response = await fetch(`/api/journal/${editModal.entry.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
            });
            if (response.ok) {
                const updatedEntry = await response.json();
                setEntries(entries.map((e) => e.id === editModal.entry!.id ? updatedEntry : e));
                setEditModal({ isOpen: false, entry: null });
            }
        } catch (error) { console.error('Failed to update entry:', error); }
    };

    const stats = useMemo(() => {
        const wins = entries.filter((e) => e.outcome === 'WIN').length;
        const losses = entries.filter((e) => e.outcome === 'LOSS').length;
        const total = wins + losses;
        return { total: entries.length, wins, losses, winRate: total > 0 ? Math.round((wins / total) * 100) : 0 };
    }, [entries]);

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return { day: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() };
    };

    const getOutcomeStyle = (outcome: string | null) => {
        switch (outcome) {
            case 'WIN': return { background: 'var(--color-profit)', color: 'white' };
            case 'LOSS': return { background: 'var(--color-loss)', color: 'white' };
            case 'BE': return { background: 'var(--color-neutral)', color: 'white' };
            case 'RUNNING': return { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' };
            default: return { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <DeleteModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, entry: null })} onConfirm={handleDeleteConfirm} entryName={deleteModal.entry?.instrument || ''} />
            <EditModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, entry: null })} entry={editModal.entry} onSave={handleEditSave} />

            {/* Header with Title and Export Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                    📚 Journal History
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => handleExport('csv')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📊 CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => handleExport('json')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📁 JSON
                    </button>
                </div>
            </div>

            {/* Search Bar Row */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search by instrument, strategy..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--color-text)' }}
                />
                <select
                    className="form-select"
                    value={outcomeFilter}
                    onChange={(e) => setOutcomeFilter(e.target.value)}
                    style={{ background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', minWidth: '140px', cursor: 'pointer' }}
                >
                    <option value="">All Outcomes</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="BE">Break Even</option>
                    <option value="RUNNING">Running</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🔍 Search
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ▼ More
                </button>
            </form>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Trade Type</label>
                            <select className="form-select" value={advancedFilters.tradeType || ''} onChange={(e) => setAdvancedFilters({ ...advancedFilters, tradeType: e.target.value })}>
                                <option value="">All</option>
                                <option>BUY</option>
                                <option>SELL</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Timeframe</label>
                            <select className="form-select" value={advancedFilters.timeframe || ''} onChange={(e) => setAdvancedFilters({ ...advancedFilters, timeframe: e.target.value })}>
                                <option value="">All</option>
                                <option>1m</option><option>5m</option><option>15m</option><option>1H</option><option>4H</option><option>1D</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Emotion</label>
                            <select className="form-select" value={advancedFilters.emotionState || ''} onChange={(e) => setAdvancedFilters({ ...advancedFilters, emotionState: e.target.value })}>
                                <option value="">All</option>
                                <option>Confident</option><option>Calm</option><option>Anxious</option><option>FOMO</option><option>Revenge</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Date Range</label>
                            <select className="form-select" value={advancedFilters.dateRange || ''} onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateRange: e.target.value })}>
                                <option value="">All Time</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards Row */}
            <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text)' }}>{stats.total}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Trades</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-profit)' }}>{stats.wins}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Wins</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-loss)' }}>{stats.losses}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Losses</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text)' }}>{stats.winRate}%</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Win Rate</div>
                </div>
            </div>

            {/* Entries List */}
            {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h3>No Entries Found</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Start journaling your trades to see them here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {entries.map((entry) => {
                        const isExpanded = expandedId === entry.id;
                        const dateInfo = formatDate(entry.createdAt);
                        return (
                            <div key={entry.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden' }} onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                                {/* Collapsed View - Matching Original Design */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
                                    {/* Date Column */}
                                    <div style={{ textAlign: 'center', minWidth: '45px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: 1, color: 'var(--color-text)' }}>{dateInfo.day}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{dateInfo.month}</div>
                                    </div>

                                    {/* Instrument & Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{entry.instrument || 'Unknown'}</strong>
                                            {entry.tradeType && (
                                                <span style={{ background: entry.tradeType === 'BUY' ? 'var(--color-profit)' : 'var(--color-loss)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>
                                                    {entry.tradeType}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                            {entry.timeframe && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    ⏱️ {entry.timeframe}
                                                </span>
                                            )}
                                            {entry.strategyLogic && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    📊 {entry.strategyLogic.length > 30 ? entry.strategyLogic.substring(0, 30) + '...' : entry.strategyLogic}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Outcome Badge */}
                                    <div style={{ ...getOutcomeStyle(entry.outcome), padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        {entry.outcome === 'WIN' && '✓'} {entry.outcome || 'RUNNING'}
                                    </div>
                                </div>

                                {/* Expanded View */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                                        {/* Price Info */}
                                        <div className="grid grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                                            <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-tertiary)' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Entry</div>
                                                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-text)' }}>{entry.entryPrice ?? '—'}</div>
                                            </div>
                                            <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-tertiary)' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Stop Loss</div>
                                                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-loss)' }}>{entry.stopLoss ?? '—'}</div>
                                            </div>
                                            <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-tertiary)' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Target</div>
                                                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-profit)' }}>{entry.target ?? '—'}</div>
                                            </div>
                                            <div className="card" style={{ padding: '1rem', textAlign: 'center', background: 'var(--color-bg-tertiary)' }}>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>R:R</div>
                                                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--color-accent)' }}>{entry.riskReward ?? '—'}</div>
                                            </div>
                                        </div>

                                        {/* Emotion */}
                                        {entry.emotionState && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <strong style={{ color: 'var(--color-text)' }}>😊 Emotion:</strong>
                                                <span className="tag" style={{ marginLeft: '0.5rem', background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
                                                    {entry.emotionState}
                                                </span>
                                            </div>
                                        )}

                                        {/* ICT Checklist */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong style={{ color: 'var(--color-text)' }}>✅ ICT Checklist:</strong>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                {entry.htfBiasAligned && <span className="tag" style={{ background: 'var(--color-profit-glow)', color: 'var(--color-profit)' }}>HTF Bias</span>}
                                                {entry.liquidityTaken && <span className="tag" style={{ background: 'var(--color-profit-glow)', color: 'var(--color-profit)' }}>Liquidity</span>}
                                                {entry.entryAtPOI && <span className="tag" style={{ background: 'var(--color-profit-glow)', color: 'var(--color-profit)' }}>POI Entry</span>}
                                                {entry.riskManaged && <span className="tag" style={{ background: 'var(--color-profit-glow)', color: 'var(--color-profit)' }}>Risk Managed</span>}
                                                {entry.bosConfirmed && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>BOS</span>}
                                                {entry.mssConfirmed && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>MSS</span>}
                                                {entry.chochConfirmed && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>CHoCH</span>}
                                                {entry.orderBlockEntry && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>OB</span>}
                                                {entry.fvgEntry && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>FVG</span>}
                                                {entry.killZoneEntry && <span className="tag" style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>Kill Zone</span>}
                                            </div>
                                        </div>

                                        {/* Sessions */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong style={{ color: 'var(--color-text)' }}>🕐 Sessions:</strong>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                {entry.asianSession && <span className="tag">Asian</span>}
                                                {entry.londonSession && <span className="tag">London</span>}
                                                {entry.nySession && <span className="tag">NY</span>}
                                                {entry.londonClose && <span className="tag">London Close</span>}
                                            </div>
                                        </div>

                                        {/* Trade Reason */}
                                        {entry.tradeReason && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <strong style={{ color: 'var(--color-text)' }}>📝 Trade Reason:</strong>
                                                <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{entry.tradeReason}</p>
                                            </div>
                                        )}

                                        {/* Strategy Logic */}
                                        {entry.strategyLogic && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <strong style={{ color: 'var(--color-text)' }}>🎯 Strategy:</strong>
                                                <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{entry.strategyLogic}</p>
                                            </div>
                                        )}

                                        {/* Post Trade Reflection */}
                                        <div style={{ background: 'var(--color-bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                            <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-accent)' }}>📝 Post Trade Reflection</h4>
                                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                                <div>
                                                    <strong style={{ color: 'var(--color-profit)' }}>✅ What Went Well:</strong>
                                                    <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{entry.whatWentWell || '—'}</p>
                                                </div>
                                                <div>
                                                    <strong style={{ color: 'var(--color-loss)' }}>❌ What Went Wrong:</strong>
                                                    <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{entry.whatWentWrong || '—'}</p>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '1rem' }}>
                                                <strong style={{ color: 'var(--color-accent)' }}>💡 Improvement:</strong>
                                                <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{entry.improvement || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Screenshots */}
                                        {entry.screenshot && (() => {
                                            const screenshots = entry.screenshot.split('|||').filter(Boolean);
                                            return (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <strong style={{ color: 'var(--color-text)' }}>📸 Trade Screenshot{screenshots.length > 1 ? 's' : ''}: <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({screenshots.length} image{screenshots.length > 1 ? 's' : ''} - click to enlarge)</span></strong>
                                                    <div style={{
                                                        marginTop: '0.5rem',
                                                        display: 'grid',
                                                        gridTemplateColumns: screenshots.length > 1 ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr',
                                                        gap: '0.75rem'
                                                    }}>
                                                        {screenshots.map((img, idx) => (
                                                            <div key={idx} style={{
                                                                borderRadius: '12px',
                                                                overflow: 'hidden',
                                                                border: '2px solid var(--color-border)',
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.2s, border-color 0.2s',
                                                            }}
                                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setLightbox({ images: screenshots, index: idx });
                                                                }}>
                                                                <img
                                                                    src={img}
                                                                    alt={`Trade screenshot ${idx + 1}`}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: screenshots.length > 1 ? '120px' : '300px',
                                                                        objectFit: 'cover',
                                                                        background: 'var(--color-bg-tertiary)',
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Raw Transcript */}
                                        {entry.rawTranscript && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <strong>🎙️ Original Transcript:</strong>
                                                <p style={{ marginTop: '0.25rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>{entry.rawTranscript}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleEditClick(entry); }} style={{ padding: '0.5rem 1rem' }}>✏️ Edit</button>
                                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleDeleteClick(entry); }} style={{ padding: '0.5rem 1rem', color: 'var(--color-loss)' }}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Image Lightbox */}
            <ImageModal
                images={lightbox.images}
                currentIndex={lightbox.index}
                onClose={() => setLightbox({ images: [], index: -1 })}
                onNext={() => setLightbox(prev => ({ ...prev, index: prev.index + 1 }))}
                onPrev={() => setLightbox(prev => ({ ...prev, index: prev.index - 1 }))}
            />
        </div>
    );
}
