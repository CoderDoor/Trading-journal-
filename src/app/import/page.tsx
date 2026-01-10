'use client';

import { useState, useRef } from 'react';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState('csv');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);

            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult({ success: true, message: `Successfully imported ${data.imported} trades!`, count: data.imported });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setResult({ success: false, message: data.error || 'Import failed' });
            }
        } catch (error: any) {
            setResult({ success: false, message: error.message || 'Import failed' });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>📥 Import Trades from Broker</h1>

            {/* Instructions */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📋 How to Export from Your Broker</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>MT4 (MetaTrader 4)</h4>
                    <ol style={{ marginLeft: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        <li>Open MT4 → Click <strong>View</strong> → <strong>Terminal</strong> (Ctrl+T)</li>
                        <li>Go to <strong>Account History</strong> tab</li>
                        <li>Right-click → <strong>Save as Detailed Report</strong></li>
                        <li>Save as HTML file and upload below</li>
                    </ol>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>MT5 (MetaTrader 5)</h4>
                    <ol style={{ marginLeft: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                        <li>Open MT5 → Click <strong>View</strong> → <strong>Toolbox</strong> (Ctrl+T)</li>
                        <li>Go to <strong>History</strong> tab</li>
                        <li>Right-click → <strong>Report</strong> → <strong>HTML</strong></li>
                        <li>Save the file and upload below</li>
                    </ol>
                </div>

                <div>
                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Other Brokers (CSV)</h4>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Export your trade history as CSV with columns: Symbol, Type, Open Price, Close Price, Profit, etc.
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>📤 Upload Trade History</h3>

                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">File Format</label>
                        <select className="input-field select-field" value={format} onChange={(e) => setFormat(e.target.value)}>
                            <option value="csv">CSV (Generic)</option>
                            <option value="mt4html">MT4 HTML Report</option>
                            <option value="mt5html">MT5 HTML Report</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Select File</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.html,.htm"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="input-field"
                            style={{ padding: '0.5rem' }}
                        />
                    </div>
                </div>

                {file && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <strong>📄 Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={handleImport}
                    disabled={!file || importing}
                    style={{ width: '100%' }}
                >
                    {importing ? '⏳ Importing...' : '📥 Import Trades'}
                </button>

                {result && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: result.success ? 'var(--color-profit-glow)' : 'var(--color-loss-glow)',
                        color: result.success ? 'var(--color-profit)' : 'var(--color-loss)',
                    }}>
                        {result.success ? '✅' : '❌'} {result.message}
                        {result.success && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <a href="/history" className="btn btn-secondary" style={{ display: 'inline-block' }}>
                                    View Imported Trades →
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Supported Formats */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>✅ Supported Formats</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['MT4 HTML', 'MT5 HTML', 'Generic CSV', 'cTrader CSV', 'TradingView CSV'].map(fmt => (
                        <span key={fmt} className="tag">{fmt}</span>
                    ))}
                </div>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    💡 <strong>Free forever!</strong> No API fees - we import from files you export from your broker.
                </p>
            </div>
        </div>
    );
}
