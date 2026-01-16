'use client';

import { useState, useMemo } from 'react';

// SVG Icons
const CalculatorIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;

// Currency pair pip values (per standard lot)
const currencyPairs = [
    { pair: 'EUR/USD', pipValue: 10, pipDigit: 4 },
    { pair: 'GBP/USD', pipValue: 10, pipDigit: 4 },
    { pair: 'USD/JPY', pipValue: 9.20, pipDigit: 2 },
    { pair: 'USD/CHF', pipValue: 11.30, pipDigit: 4 },
    { pair: 'AUD/USD', pipValue: 10, pipDigit: 4 },
    { pair: 'NZD/USD', pipValue: 10, pipDigit: 4 },
    { pair: 'USD/CAD', pipValue: 7.40, pipDigit: 4 },
    { pair: 'EUR/GBP', pipValue: 12.65, pipDigit: 4 },
    { pair: 'EUR/JPY', pipValue: 9.20, pipDigit: 2 },
    { pair: 'GBP/JPY', pipValue: 9.20, pipDigit: 2 },
    { pair: 'XAU/USD', pipValue: 10, pipDigit: 2, name: 'Gold' },
    { pair: 'XAG/USD', pipValue: 50, pipDigit: 3, name: 'Silver' },
    { pair: 'US30', pipValue: 1, pipDigit: 0, name: 'Dow Jones' },
    { pair: 'NAS100', pipValue: 1, pipDigit: 2, name: 'Nasdaq' },
    { pair: 'BTC/USD', pipValue: 1, pipDigit: 0, name: 'Bitcoin' },
];

export default function CalculatorPage() {
    // Position Size Calculator
    const [accountSize, setAccountSize] = useState<number>(10000);
    const [riskPercent, setRiskPercent] = useState<number>(1);
    const [stopLossPips, setStopLossPips] = useState<number>(20);
    const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');

    // R:R Calculator
    const [entryPrice, setEntryPrice] = useState<number>(1.1000);
    const [stopLoss, setStopLoss] = useState<number>(1.0980);
    const [takeProfit, setTakeProfit] = useState<number>(1.1040);

    // Get selected pair info
    const pairInfo = currencyPairs.find(p => p.pair === selectedPair) || currencyPairs[0];

    // Position Size Calculation
    const positionCalc = useMemo(() => {
        const riskAmount = accountSize * (riskPercent / 100);
        const lotSize = riskAmount / (stopLossPips * pairInfo.pipValue);
        const miniLots = lotSize * 10;
        const microLots = lotSize * 100;
        const units = lotSize * 100000;
        return { riskAmount, lotSize, miniLots, microLots, units };
    }, [accountSize, riskPercent, stopLossPips, pairInfo.pipValue]);

    // R:R Calculation
    const rrCalc = useMemo(() => {
        const multiplier = pairInfo.pipDigit === 2 ? 100 : pairInfo.pipDigit === 3 ? 1000 : 10000;
        const slDistance = Math.abs(entryPrice - stopLoss);
        const tpDistance = Math.abs(takeProfit - entryPrice);
        const ratio = slDistance > 0 ? (tpDistance / slDistance).toFixed(2) : '0';
        const slPips = (slDistance * multiplier).toFixed(1);
        const tpPips = (tpDistance * multiplier).toFixed(1);
        return { ratio, slPips, tpPips, slDistance, tpDistance };
    }, [entryPrice, stopLoss, takeProfit, pairInfo.pipDigit]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                <span style={{ color: 'var(--color-accent)' }}><CalculatorIcon /></span>
                Trade Calculator
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Calculate position size, risk/reward ratio, and pip values
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Position Size Calculator */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                        📐 Position Size Calculator
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Currency Pair Selector */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Currency Pair / Instrument
                            </label>
                            <select
                                value={selectedPair}
                                onChange={(e) => setSelectedPair(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                }}
                            >
                                {currencyPairs.map(p => (
                                    <option key={p.pair} value={p.pair}>
                                        {p.pair} {p.name ? `(${p.name})` : ''} - ${p.pipValue}/pip
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Account Size ($)
                            </label>
                            <input
                                type="number"
                                value={accountSize}
                                onChange={(e) => setAccountSize(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Risk Per Trade (%)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={riskPercent}
                                onChange={(e) => setRiskPercent(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Stop Loss (Pips)
                            </label>
                            <input
                                type="number"
                                value={stopLossPips}
                                onChange={(e) => setStopLossPips(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.1))',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Risk Amount</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-loss)' }}>
                                    ${positionCalc.riskAmount.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Pip Value</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                                    ${pairInfo.pipValue}/pip
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Standard</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {positionCalc.lotSize.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Mini</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {positionCalc.miniLots.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Micro</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {positionCalc.microLots.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--color-bg-tertiary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Units</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                    {positionCalc.units.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk/Reward Calculator */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                        📊 Risk/Reward Calculator
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Entry Price
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Stop Loss Price
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Take Profit Price
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={takeProfit}
                                onChange={(e) => setTakeProfit(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                    </div>

                    {/* R:R Visual */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.1))',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Risk:Reward Ratio</div>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #8b5cf6, #10b981)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                1:{rrCalc.ratio}
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{
                                flex: 1,
                                height: '12px',
                                background: 'var(--color-loss)',
                                borderRadius: '6px 0 0 6px',
                            }} />
                            <div style={{
                                width: '4px',
                                height: '20px',
                                background: 'var(--color-text)',
                                borderRadius: '2px',
                            }} />
                            <div style={{
                                flex: Number(rrCalc.ratio),
                                height: '12px',
                                background: 'var(--color-profit)',
                                borderRadius: '0 6px 6px 0',
                            }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-loss)' }}>Stop Loss</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-loss)' }}>
                                    {rrCalc.slPips} pips
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-profit)' }}>Take Profit</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-profit)' }}>
                                    {rrCalc.tpPips} pips
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pip Value Reference */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
                    💡 Pip Value Reference (Standard Lot = 100,000 units)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {currencyPairs.map(item => (
                        <div
                            key={item.pair}
                            onClick={() => setSelectedPair(item.pair)}
                            style={{
                                padding: '0.75rem',
                                background: selectedPair === item.pair ? 'rgba(139, 92, 246, 0.2)' : 'var(--color-bg-tertiary)',
                                border: selectedPair === item.pair ? '1px solid var(--color-accent)' : '1px solid transparent',
                                borderRadius: '8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.pair}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>${item.pipValue}/pip</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
