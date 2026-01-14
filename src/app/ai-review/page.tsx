'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types/journal';

export default function AIReviewPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [review, setReview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetch('/api/journal')
            .then(res => res.json())
            .then(data => {
                setEntries(data.entries || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const analyzeAllTrades = async () => {
        if (entries.length === 0) return;
        setAnalyzing(true);
        setReview(null);

        try {
            const response = await fetch('/api/ai-analyze', { method: 'POST' });
            const data = await response.json();

            if (data.error && !data.patterns) {
                setReview(`## ⚠️ ${data.error}\n\nAdd more trades to get personalized AI insights.`);
            } else {
                setReview(`## 🤖 AI Analysis of Your ${data.totalTrades || entries.length} Trades

### 📊 Win Rate: ${data.winRate}%
${data.summary || ''}

### 📈 Patterns Detected
${data.patterns?.map((p: string) => `- ${p}`).join('\n') || '- No patterns detected yet'}

### ✅ Your Strengths
${data.strengths?.map((s: string) => `- ${s}`).join('\n') || '- Keep trading to find your strengths'}

### ⚠️ Areas to Improve
${data.weaknesses?.map((w: string) => `- ${w}`).join('\n') || '- No specific weaknesses identified'}

### 💡 Suggestions
${data.suggestions?.map((s: string) => `- ${s}`).join('\n') || '- Continue building your trade history'}

### 🎯 Risk Management Score: ${data.riskScore || 5}/10

---
_Analysis generated: ${new Date().toLocaleString()}_`);
            }
        } catch (error) {
            console.error('AI Analysis error:', error);
            setReview('## ❌ Analysis Failed\n\nPlease try again. Make sure you have an internet connection.');
        }

        setAnalyzing(false);
    };

    const analyzeSingleTrade = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        setAnalyzing(true);

        setTimeout(() => {
            const isWin = entry.outcome === 'WIN';
            setReview(`## 📈 Trade Analysis: ${entry.instrument || 'Unknown'}

### Trade Details
- **Type:** ${entry.tradeType || 'N/A'}
- **Timeframe:** ${entry.timeframe || 'N/A'}
- **Entry:** ${entry.entryPrice || 'N/A'}
- **Stop Loss:** ${entry.stopLoss || 'N/A'}
- **Target:** ${entry.target || 'N/A'}
- **Outcome:** ${entry.outcome || 'Running'}

### What You Did ${isWin ? 'Right ✅' : 'Wrong ❌'}
${entry.whatWentWell || 'No notes recorded'}

### Areas for Improvement
${entry.whatWentWrong || 'No notes recorded'}

### Strategy Used
${entry.strategyLogic || 'Not specified'}

### Trade Reasoning
${entry.tradeReason || 'Not documented'}

### AI Feedback
${isWin ? 'Great trade! Make sure to document what made this setup work so you can replicate it.' : 'Review this trade carefully. What could you have done differently? Consider if the setup met all your criteria before entry.'}

### Next Steps
${entry.improvement || 'Add improvement notes to get personalized recommendations'}`);
            setAnalyzing(false);
        }, 1000);
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                🤖 AI Trade Review
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Get AI-powered analysis of your trading performance
            </p>

            {/* Analyze All Button */}
            <button
                onClick={analyzeAllTrades}
                disabled={analyzing || entries.length === 0}
                style={{
                    width: '100%',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #b794f6 0%, #9f7aea 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: analyzing ? 'wait' : 'pointer',
                    opacity: entries.length === 0 ? 0.5 : 1,
                }}
            >
                {analyzing ? '🔄 Analyzing...' : `✨ Analyze All ${entries.length} Trades`}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                {/* Trade List */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '1rem',
                    maxHeight: '500px',
                    overflowY: 'auto',
                }}>
                    <h3 style={{ color: 'var(--color-text)', marginBottom: '1rem', fontSize: '1rem' }}>Select Trade to Analyze</h3>
                    {loading ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>Loading trades...</p>
                    ) : entries.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)' }}>No trades found. Add trades first!</p>
                    ) : (
                        entries.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => analyzeSingleTrade(entry)}
                                style={{
                                    padding: '0.75rem',
                                    marginBottom: '0.5rem',
                                    background: selectedEntry?.id === entry.id ? 'rgba(183, 148, 246, 0.15)' : 'var(--color-bg-tertiary)',
                                    border: selectedEntry?.id === entry.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{entry.instrument || 'Unknown'}</span>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: entry.outcome === 'WIN' ? 'var(--color-profit)' : entry.outcome === 'LOSS' ? 'var(--color-loss)' : 'var(--color-accent)',
                                        color: 'white',
                                    }}>
                                        {entry.outcome || 'OPEN'}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    {entry.tradeType} • {new Date(entry.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Review Results */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    minHeight: '400px',
                }}>
                    {review ? (
                        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {review}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <p>Click "Analyze All Trades" or select a trade to get AI insights</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
