'use client';

import { useState, useRef } from 'react';

interface TradeData {
    id: string;
    instrument?: string | null;
    tradeType?: string | null;
    timeframe?: string | null;
    riskReward?: number | null;
    outcome?: string | null;
    strategyLogic?: string | null;
    tradeReason?: string | null;
    createdAt: Date | string;
}

interface ShareableTradeCardProps {
    trade: TradeData;
    onClose: () => void;
}

export default function ShareableTradeCard({ trade, onClose }: ShareableTradeCardProps) {
    const [copying, setCopying] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isWin = trade.outcome === 'WIN';
    const isLoss = trade.outcome === 'LOSS';

    const handleCopyLink = async () => {
        setCopying(true);
        const shareText = `🎯 Trade Setup: ${trade.instrument || 'Unknown'}
📊 Type: ${trade.tradeType || '-'} | TF: ${trade.timeframe || '-'}
📈 R:R: ${trade.riskReward?.toFixed(1) || '-'}
${isWin ? '✅ WIN' : isLoss ? '❌ LOSS' : '⏳ Running'}

Strategy: ${trade.strategyLogic || 'ICT Concepts'}

#Trading #Forex #TradingJournal`;

        try {
            await navigator.clipboard.writeText(shareText);
            setTimeout(() => setCopying(false), 1500);
        } catch (e) {
            setCopying(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
            });
            const link = document.createElement('a');
            link.download = `trade-${trade.instrument || 'setup'}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Failed to generate image:', e);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '100%' }}>
                {/* Shareable Card */}
                <div
                    ref={cardRef}
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: `2px solid ${isWin ? '#22c55e' : isLoss ? '#ef4444' : '#8b5cf6'}`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Glow Effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%', right: '-50%',
                        width: '100%', height: '100%',
                        background: `radial-gradient(circle, ${isWin ? 'rgba(34, 197, 94, 0.15)' : isLoss ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)'} 0%, transparent 70%)`,
                        pointerEvents: 'none'
                    }} />

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>TRADE SETUP</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
                                {trade.instrument || 'Unknown'}
                            </div>
                        </div>
                        <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            background: isWin ? '#22c55e' : isLoss ? '#ef4444' : '#8b5cf6',
                            color: 'white'
                        }}>
                            {isWin ? '✓ WIN' : isLoss ? '✗ LOSS' : '⏳ RUNNING'}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>TYPE</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: trade.tradeType === 'BUY' ? '#22c55e' : '#ef4444' }}>
                                {trade.tradeType || '-'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>TIMEFRAME</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                                {trade.timeframe || '-'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem' }}>R:R</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                                {trade.riskReward?.toFixed(1) || '-'}
                            </div>
                        </div>
                    </div>

                    {/* Strategy */}
                    {trade.strategyLogic && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            borderLeft: '3px solid #8b5cf6'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginBottom: '0.25rem' }}>STRATEGY</div>
                            <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                                {trade.strategyLogic}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            📅 {new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'white'
                        }}>
                            TrackEdge
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '1rem'
                }}>
                    <button
                        onClick={handleCopyLink}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: copying ? '#22c55e' : '#334155',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {copying ? '✓ Copied!' : '📋 Copy Text'}
                    </button>
                    <button
                        onClick={handleDownloadImage}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📸 Save Image
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
