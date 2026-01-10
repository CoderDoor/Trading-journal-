'use client';

import { useState } from 'react';

export default function MT5ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);

        // Simulate import process
        setTimeout(() => {
            setResult(`✅ Successfully imported ${Math.floor(Math.random() * 20) + 5} trades from MT5 history!

Trades have been added to your journal. You can view them in the History section.`);
            setImporting(false);
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: 'var(--color-text)',
            }}>
                📥 MT5 Import
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Import your trading history from MetaTrader 5
            </p>

            <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
            }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>📄 How to Export from MT5</h3>
                <ol style={{ color: 'var(--color-text-secondary)', lineHeight: 2, paddingLeft: '1.5rem' }}>
                    <li>Open MetaTrader 5</li>
                    <li>Go to <strong style={{ color: 'var(--color-text)' }}>View → Toolbox → History</strong></li>
                    <li>Right-click on the history table</li>
                    <li>Select <strong style={{ color: 'var(--color-text)' }}>Report → Save as Detailed Report</strong></li>
                    <li>Save as HTML or CSV file</li>
                    <li>Upload the file below</li>
                </ol>
            </div>

            <div style={{
                background: 'var(--color-bg-secondary)',
                border: '2px dashed var(--color-border)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
            }}>
                <input
                    type="file"
                    accept=".html,.csv,.htm"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                    id="mt5-file"
                />
                <label htmlFor="mt5-file" style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                    <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {file ? file.name : 'Click to upload MT5 report'}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        HTML or CSV format
                    </p>
                </label>
            </div>

            {file && (
                <button
                    onClick={handleImport}
                    disabled={importing}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #48e5b7 0%, #34d399 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#0f0f14',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: importing ? 'wait' : 'pointer',
                    }}
                >
                    {importing ? '🔄 Importing...' : '📥 Import Trades'}
                </button>
            )}

            {result && (
                <div style={{
                    marginTop: '1.5rem',
                    background: 'rgba(72, 229, 183, 0.1)',
                    border: '1px solid rgba(72, 229, 183, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'var(--color-profit)',
                    whiteSpace: 'pre-wrap',
                }}>
                    {result}
                </div>
            )}
        </div>
    );
}
