'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Types
interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface Trade {
    id: string;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    entryTime: number;
    stopLoss: number;
    takeProfit: number;
    exitPrice?: number;
    exitTime?: number;
    pnl?: number;
    outcome?: 'WIN' | 'LOSS' | 'BE';
}

interface BacktestState {
    isPlaying: boolean;
    speed: number;
    currentIndex: number;
    candles: CandleData[];
    trades: Trade[];
    sessionName: string;
}

// Icons
const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const ResetIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const UploadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const ChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </svg>
);

const AIIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        <circle cx="8" cy="14" r="1" />
        <circle cx="16" cy="14" r="1" />
    </svg>
);

// Sample data for demo
const generateSampleData = (): CandleData[] => {
    const data: CandleData[] = [];
    let price = 1.0850;
    const startTime = new Date('2024-01-02T09:00:00').getTime() / 1000;

    for (let i = 0; i < 200; i++) {
        const volatility = 0.0005 + Math.random() * 0.001;
        const trend = Math.sin(i / 20) * 0.0003;
        const change = (Math.random() - 0.5) * volatility + trend;

        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.push({
            time: startTime + i * 900, // 15-min candles
            open: parseFloat(open.toFixed(5)),
            high: parseFloat(high.toFixed(5)),
            low: parseFloat(low.toFixed(5)),
            close: parseFloat(close.toFixed(5)),
            volume: Math.floor(1000 + Math.random() * 5000),
        });

        price = close;
    }
    return data;
};

// Theme colors
const theme = {
    bg: '#0a0a0f',
    bgSecondary: '#111118',
    bgCard: '#1a1a24',
    text: '#ffffff',
    textMuted: '#8b8b9a',
    border: 'rgba(255,255,255,0.1)',
    accent: '#6366f1',
    profit: '#22c55e',
    loss: '#ef4444',
};

export default function BacktestPage() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [state, setState] = useState<BacktestState>({
        isPlaying: false,
        speed: 1,
        currentIndex: 0,
        candles: [],
        trades: [],
        sessionName: 'New Session',
    });

    const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [metrics, setMetrics] = useState({
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        netPnL: 0,
        maxDrawdown: 0,
    });

    // Initialize chart
    useEffect(() => {
        if (typeof window === 'undefined' || !chartContainerRef.current) return;

        const initChart = async () => {
            const lc = await import('lightweight-charts');

            const chart = lc.createChart(chartContainerRef.current!, {
                width: chartContainerRef.current!.clientWidth,
                height: 500,
                layout: {
                    background: { type: lc.ColorType.Solid, color: theme.bgSecondary },
                    textColor: theme.textMuted,
                },
                grid: {
                    vertLines: { color: 'rgba(255,255,255,0.05)' },
                    horzLines: { color: 'rgba(255,255,255,0.05)' },
                },
                crosshair: {
                    mode: lc.CrosshairMode.Normal,
                },
                timeScale: {
                    borderColor: theme.border,
                    timeVisible: true,
                },
                rightPriceScale: {
                    borderColor: theme.border,
                },
            });

            const candleSeries = chart.addSeries(lc.CandlestickSeries, {
                upColor: theme.profit,
                downColor: theme.loss,
                borderUpColor: theme.profit,
                borderDownColor: theme.loss,
                wickUpColor: theme.profit,
                wickDownColor: theme.loss,
            });

            chartRef.current = chart;
            seriesRef.current = candleSeries;

            // Load sample data with some initial candles visible
            const sampleData = generateSampleData();
            setState(s => ({ ...s, candles: sampleData, currentIndex: 20 }));

            // Handle resize
            const handleResize = () => {
                if (chartContainerRef.current && chartRef.current) {
                    chartRef.current.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                    });
                }
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        };

        initChart();
    }, []);

    // Update chart when currentIndex changes
    useEffect(() => {
        if (seriesRef.current && state.candles.length > 0) {
            const visibleCandles = state.candles.slice(0, state.currentIndex + 1);
            seriesRef.current.setData(visibleCandles);
        }
    }, [state.currentIndex, state.candles]);

    // Playback logic
    useEffect(() => {
        if (state.isPlaying && state.currentIndex < state.candles.length - 1) {
            intervalRef.current = setInterval(() => {
                setState(s => {
                    const newIndex = s.currentIndex + 1;

                    // Check active trade hit SL/TP
                    if (activeTrade && s.candles[newIndex]) {
                        const candle = s.candles[newIndex];
                        checkTradeExit(activeTrade, candle, newIndex);
                    }

                    if (newIndex >= s.candles.length - 1) {
                        return { ...s, currentIndex: newIndex, isPlaying: false };
                    }
                    return { ...s, currentIndex: newIndex };
                });
            }, 1000 / state.speed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [state.isPlaying, state.speed, activeTrade]);

    const checkTradeExit = (trade: Trade, candle: CandleData, index: number) => {
        let exitPrice: number | undefined;
        let outcome: 'WIN' | 'LOSS' | 'BE' | undefined;

        if (trade.type === 'BUY') {
            if (candle.low <= trade.stopLoss) {
                exitPrice = trade.stopLoss;
                outcome = 'LOSS';
            } else if (candle.high >= trade.takeProfit) {
                exitPrice = trade.takeProfit;
                outcome = 'WIN';
            }
        } else {
            if (candle.high >= trade.stopLoss) {
                exitPrice = trade.stopLoss;
                outcome = 'LOSS';
            } else if (candle.low <= trade.takeProfit) {
                exitPrice = trade.takeProfit;
                outcome = 'WIN';
            }
        }

        if (exitPrice && outcome) {
            const pnl = trade.type === 'BUY'
                ? (exitPrice - trade.entryPrice) * 10000
                : (trade.entryPrice - exitPrice) * 10000;

            const closedTrade: Trade = {
                ...trade,
                exitPrice,
                exitTime: candle.time,
                pnl: parseFloat(pnl.toFixed(2)),
                outcome,
            };

            setState(s => ({
                ...s,
                trades: [...s.trades, closedTrade],
            }));
            setActiveTrade(null);
            updateMetrics([...state.trades, closedTrade]);
        }
    };

    const updateMetrics = (trades: Trade[]) => {
        const closedTrades = trades.filter(t => t.outcome);
        const wins = closedTrades.filter(t => t.outcome === 'WIN').length;
        const losses = closedTrades.filter(t => t.outcome === 'LOSS').length;
        const netPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

        setMetrics({
            totalTrades: closedTrades.length,
            wins,
            losses,
            winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0,
            netPnL: parseFloat(netPnL.toFixed(2)),
            maxDrawdown: 0, // TODO: Calculate properly
        });
    };

    const handlePlay = () => setState(s => ({ ...s, isPlaying: !s.isPlaying }));

    const handleReset = () => {
        setState(s => ({ ...s, currentIndex: 0, isPlaying: false, trades: [] }));
        setActiveTrade(null);
        setMetrics({ totalTrades: 0, wins: 0, losses: 0, winRate: 0, netPnL: 0, maxDrawdown: 0 });
    };

    const handleSpeedChange = (speed: number) => setState(s => ({ ...s, speed }));

    const handleTrade = (type: 'BUY' | 'SELL') => {
        if (activeTrade || state.candles.length === 0) return;

        const currentCandle = state.candles[state.currentIndex];
        const price = currentCandle.close;
        const pipDistance = 0.0020; // 20 pips default

        const trade: Trade = {
            id: Date.now().toString(),
            type,
            entryPrice: price,
            entryTime: currentCandle.time,
            stopLoss: type === 'BUY' ? price - pipDistance : price + pipDistance,
            takeProfit: type === 'BUY' ? price + pipDistance * 2 : price - pipDistance * 2,
        };

        setActiveTrade(trade);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').slice(1); // Skip header
                const candles: CandleData[] = [];

                for (const line of lines) {
                    const parts = line.split(',');
                    if (parts.length >= 5) {
                        const time = new Date(parts[0]).getTime() / 1000;
                        candles.push({
                            time,
                            open: parseFloat(parts[1]),
                            high: parseFloat(parts[2]),
                            low: parseFloat(parts[3]),
                            close: parseFloat(parts[4]),
                            volume: parts[5] ? parseFloat(parts[5]) : undefined,
                        });
                    }
                }

                if (candles.length > 0) {
                    setState(s => ({ ...s, candles, currentIndex: 0 }));
                    setShowImportModal(false);
                }
            } catch (err) {
                console.error('Failed to parse CSV:', err);
            }
        };
        reader.readAsText(file);
    };

    const currentPrice = state.candles[state.currentIndex]?.close || 0;
    const currentTime = state.candles[state.currentIndex]?.time
        ? new Date(state.candles[state.currentIndex].time * 1000).toLocaleString()
        : '--';

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.bg,
            color: theme.text,
            padding: '1.5rem',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${theme.accent}, #a855f7)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <ChartIcon />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                            Strategy Backtester
                        </h1>
                        <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                            Replay history & test your edge
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setShowImportModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '10px',
                            color: theme.text,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        <UploadIcon /> Import Data
                    </button>
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: `${theme.accent}20`,
                            border: `1px solid ${theme.accent}50`,
                            borderRadius: '10px',
                            color: theme.accent,
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        <AIIcon /> AI Analysis
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                {/* Chart Section */}
                <div>
                    {/* Chart Container */}
                    <div style={{
                        background: theme.bgSecondary,
                        borderRadius: '16px',
                        border: `1px solid ${theme.border}`,
                        overflow: 'hidden',
                        marginBottom: '1rem',
                    }}>
                        <div ref={chartContainerRef} style={{ width: '100%' }} />
                    </div>

                    {/* Playback Controls */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: theme.bgCard,
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                    }}>
                        <button
                            onClick={handlePlay}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: state.isPlaying ? theme.loss : theme.profit,
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {state.isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        <button
                            onClick={handleReset}
                            style={{
                                padding: '0.75rem',
                                background: theme.bgSecondary,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '10px',
                                color: theme.textMuted,
                                cursor: 'pointer',
                            }}
                        >
                            <ResetIcon />
                        </button>

                        {/* Speed Controls */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[0.5, 1, 2, 5, 10].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: state.speed === speed ? theme.accent : theme.bgSecondary,
                                        border: `1px solid ${state.speed === speed ? theme.accent : theme.border}`,
                                        borderRadius: '8px',
                                        color: state.speed === speed ? 'white' : theme.textMuted,
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        {/* Timeline */}
                        <div style={{ flex: 1 }}>
                            <input
                                type="range"
                                min={0}
                                max={state.candles.length - 1}
                                value={state.currentIndex}
                                onChange={(e) => setState(s => ({ ...s, currentIndex: parseInt(e.target.value), isPlaying: false }))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                            <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                                {state.currentIndex + 1} / {state.candles.length}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: theme.text }}>
                                {currentTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Current Price */}
                    <div style={{
                        padding: '1.25rem',
                        background: theme.bgCard,
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                    }}>
                        <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            CURRENT PRICE
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                            {currentPrice.toFixed(5)}
                        </div>
                    </div>

                    {/* Trade Buttons */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                    }}>
                        <button
                            onClick={() => handleTrade('BUY')}
                            disabled={!!activeTrade}
                            style={{
                                padding: '1rem',
                                background: activeTrade ? theme.bgSecondary : theme.profit,
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: activeTrade ? 'not-allowed' : 'pointer',
                                opacity: activeTrade ? 0.5 : 1,
                            }}
                        >
                            BUY
                        </button>
                        <button
                            onClick={() => handleTrade('SELL')}
                            disabled={!!activeTrade}
                            style={{
                                padding: '1rem',
                                background: activeTrade ? theme.bgSecondary : theme.loss,
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: activeTrade ? 'not-allowed' : 'pointer',
                                opacity: activeTrade ? 0.5 : 1,
                            }}
                        >
                            SELL
                        </button>
                    </div>

                    {/* Active Trade */}
                    {activeTrade && (
                        <div style={{
                            padding: '1rem',
                            background: `${activeTrade.type === 'BUY' ? theme.profit : theme.loss}15`,
                            border: `1px solid ${activeTrade.type === 'BUY' ? theme.profit : theme.loss}50`,
                            borderRadius: '12px',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                Active: {activeTrade.type} @ {activeTrade.entryPrice.toFixed(5)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>
                                SL: {activeTrade.stopLoss.toFixed(5)} | TP: {activeTrade.takeProfit.toFixed(5)}
                            </div>
                        </div>
                    )}

                    {/* Metrics */}
                    <div style={{
                        padding: '1.25rem',
                        background: theme.bgCard,
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                    }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Session Metrics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>TRADES</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metrics.totalTrades}</div>
                            </div>
                            <div>
                                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>WIN RATE</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: metrics.winRate >= 50 ? theme.profit : theme.loss }}>
                                    {metrics.winRate.toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>WINS/LOSSES</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                    <span style={{ color: theme.profit }}>{metrics.wins}</span>
                                    <span style={{ color: theme.textMuted }}>/</span>
                                    <span style={{ color: theme.loss }}>{metrics.losses}</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>NET P&L (pips)</div>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    color: metrics.netPnL >= 0 ? theme.profit : theme.loss,
                                }}>
                                    {metrics.netPnL >= 0 ? '+' : ''}{metrics.netPnL}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trade History */}
                    <div style={{
                        padding: '1.25rem',
                        background: theme.bgCard,
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        flex: 1,
                        overflow: 'auto',
                    }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Trade History
                        </h3>
                        {state.trades.length === 0 ? (
                            <div style={{ color: theme.textMuted, fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                                No trades yet. Click BUY or SELL to simulate a trade.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {state.trades.slice().reverse().map(trade => (
                                    <div
                                        key={trade.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: theme.bgSecondary,
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        <div>
                                            <span style={{
                                                color: trade.type === 'BUY' ? theme.profit : theme.loss,
                                                fontWeight: 600,
                                            }}>
                                                {trade.type}
                                            </span>
                                            <span style={{ color: theme.textMuted, marginLeft: '0.5rem' }}>
                                                @ {trade.entryPrice.toFixed(5)}
                                            </span>
                                        </div>
                                        <div style={{
                                            color: trade.outcome === 'WIN' ? theme.profit : theme.loss,
                                            fontWeight: 600,
                                        }}>
                                            {trade.pnl && (trade.pnl >= 0 ? '+' : '')}{trade.pnl} pips
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }} onClick={() => setShowImportModal(false)}>
                    <div
                        style={{
                            background: theme.bgCard,
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '500px',
                            maxWidth: '90vw',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Import Historical Data</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: theme.textMuted, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                CSV Format
                            </h4>
                            <div style={{
                                padding: '1rem',
                                background: theme.bgSecondary,
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                            }}>
                                Date,Open,High,Low,Close,Volume<br />
                                2024-01-02 09:00,1.0850,1.0855,1.0845,1.0852,1000
                            </div>
                        </div>

                        <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '2rem',
                            border: `2px dashed ${theme.border}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                        }}>
                            <UploadIcon />
                            <span style={{ marginTop: '0.5rem', color: theme.textMuted }}>
                                Click to upload CSV file
                            </span>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowImportModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: theme.bgSecondary,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: '10px',
                                    color: theme.text,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const sampleData = generateSampleData();
                                    setState(s => ({ ...s, candles: sampleData, currentIndex: 10 }));
                                    setShowImportModal(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: theme.accent,
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                Use Sample Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
