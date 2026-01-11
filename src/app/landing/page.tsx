'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ===== ICONS =====
const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);
const ChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
);
const BrainIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
    </svg>
);
const TargetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);
const TagIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" />
    </svg>
);
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);
const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
);
const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

// TrackEdge Logo
const Logo = () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <path d="M8 12 L4 4 M8 12 L12 8" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 12 L36 4 M32 12 L28 8" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14 C8 18, 8 24, 12 30 L16 34 L20 32 L24 34 L28 30 C32 24, 32 18, 30 14" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 18 L18 18 M15 18 L15 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 18 L28 18 M22 23 L26 23 M22 28 L28 28 M22 18 L22 28" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

// Large Logo for Loading Screen
const LargeLogo = () => (
    <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
        <path d="M8 12 L4 4 M8 12 L12 8" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 12 L36 4 M32 12 L28 8" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14 C8 18, 8 24, 12 30 L16 34 L20 32 L24 34 L28 30 C32 24, 32 18, 30 14" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 18 L18 18 M15 18 L15 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 18 L28 18 M22 23 L26 23 M22 28 L28 28 M22 18 L22 28" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

const features = [
    { icon: <MicIcon />, title: 'Voice-Based Logging', desc: 'Speak your trades naturally and let AI extract all the details.' },
    { icon: <ChartIcon />, title: 'Smart Analytics', desc: 'Visual dashboards showing win rate, P&L, and performance trends.' },
    { icon: <TagIcon />, title: 'ICT / SMC Tagging', desc: 'Built-in Order Block, FVG, BOS, CHoCH tracking.' },
    { icon: <TargetIcon />, title: 'Performance Insights', desc: 'AI-powered analysis of your patterns and improvement areas.' },
    { icon: <HeartIcon />, title: 'Emotion Tracking', desc: 'Log your psychological state and correlate with outcomes.' },
    { icon: <BrainIcon />, title: 'Discipline Score', desc: 'Track rule following and build consistent habits.' },
];

const stats = [
    { value: '10K+', label: 'Trades Logged' },
    { value: '98%', label: 'Accuracy' },
    { value: '4.9', label: 'User Rating' },
    { value: 'Free', label: 'Forever' },
];

const mockTrades = [
    { pair: 'EUR/USD', type: 'BUY', pips: '+45', result: 'win', time: '09:32 AM' },
    { pair: 'GBP/JPY', type: 'SELL', pips: '-23', result: 'loss', time: '11:15 AM' },
    { pair: 'XAU/USD', type: 'BUY', pips: '+78', result: 'win', time: '02:45 PM' },
    { pair: 'USD/CAD', type: 'SELL', pips: '+32', result: 'win', time: '04:20 PM' },
];

type RightView = 'dashboard' | 'features' | 'pricing';

export default function LandingPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [rightView, setRightView] = useState<RightView>('dashboard');
    const [isLoading, setIsLoading] = useState(false);

    const handleGetStarted = () => {
        setIsLoading(true);
        setTimeout(() => {
            router.push('/');
        }, 2000);
    };

    const t = {
        bg: isDark ? '#0f0f17' : '#f8fafc',
        bgSecondary: isDark ? '#1a1a2e' : '#ffffff',
        bgCard: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
        text: isDark ? '#ffffff' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        accent: '#6366f1',
        profit: '#22c55e',
        loss: '#ef4444',
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: isDark
                ? 'linear-gradient(135deg, #0f0f17 0%, #1a1a2e 50%, #0f0f17 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)',
            color: t.text,
            fontFamily: 'Inter, system-ui, sans-serif',
            transition: 'all 0.4s ease',
            overflow: 'hidden',
        }}>
            {/* ===== LOADING SCREEN ===== */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: isDark
                        ? 'linear-gradient(135deg, #0f0f17 0%, #1a1a2e 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <div style={{ animation: 'pulse 1.5s infinite', marginBottom: '1.5rem' }}>
                        <LargeLogo />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Track<span style={{ color: t.accent }}>Edge</span>
                    </h2>
                    <p style={{ color: t.textMuted, marginBottom: '2rem' }}>Preparing your journal...</p>
                    <div style={{
                        width: '200px',
                        height: '4px',
                        background: t.border,
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, ${t.accent}, #a855f7)`,
                            borderRadius: '4px',
                            animation: 'loadingBar 2s ease-in-out',
                        }} />
                    </div>
                </div>
            )}
            {/* ===== NAVIGATION ===== */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '1rem 4rem',
                background: isDark ? 'rgba(15,15,23,0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${t.border}`,
            }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Logo />
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Track<span style={{ color: t.accent }}>Edge</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <button
                            onClick={() => setRightView('features')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: rightView === 'features' ? t.accent : t.textMuted,
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: rightView === 'features' ? 600 : 400,
                            }}
                        >Features</button>
                        <button
                            onClick={() => setRightView('pricing')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: rightView === 'pricing' ? t.accent : t.textMuted,
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: rightView === 'pricing' ? 600 : 400,
                            }}
                        >Pricing</button>
                        <button onClick={() => setIsDark(!isDark)} style={{
                            background: t.bgCard,
                            border: `1px solid ${t.border}`,
                            borderRadius: '10px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: t.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button onClick={handleGetStarted} style={{
                            padding: '0.65rem 1.5rem',
                            background: `linear-gradient(135deg, ${t.accent} 0%, #8b5cf6 100%)`,
                            color: 'white',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* ===== MAIN CONTENT - 50/50 SPLIT ===== */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                minHeight: '100vh',
                padding: '5rem 4rem 2rem',
                maxWidth: '1600px',
                margin: '0 auto',
                gap: '4rem',
                alignItems: 'center',
            }}>
                {/* ===== LEFT SIDE - HERO (Always Visible) ===== */}
                <div style={{ position: 'relative' }}>
                    {/* Gradient blob */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-20%',
                        width: '500px',
                        height: '500px',
                        background: `radial-gradient(circle, ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'} 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }} />

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: `${t.accent}15`,
                        border: `1px solid ${t.accent}40`,
                        borderRadius: '100px',
                        fontSize: '0.875rem',
                        color: t.accent,
                        marginBottom: '1.5rem',
                        position: 'relative',
                    }}>
                        <span style={{ width: '8px', height: '8px', background: t.accent, borderRadius: '50%' }} />
                        100% Free Trading Journal
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 4vw, 3.75rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        position: 'relative',
                    }}>
                        <span style={{
                            background: `linear-gradient(135deg, ${t.accent} 0%, #a855f7 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Speak Your Trades,</span>
                        <br />Track Your Edge
                    </h1>

                    <p style={{
                        fontSize: '1.15rem',
                        color: t.textMuted,
                        marginBottom: '2rem',
                        lineHeight: 1.7,
                        maxWidth: '480px',
                        position: 'relative',
                    }}>
                        The voice-first trading journal for ICT & SMC traders. Record trades by speaking, get AI-powered insights, and find your edge.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', position: 'relative' }}>
                        <button onClick={handleGetStarted} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 2rem',
                            background: `linear-gradient(135deg, ${t.accent} 0%, #8b5cf6 100%)`,
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: `0 15px 40px ${t.accent}40`,
                        }}>Start Free <ArrowRightIcon /></button>
                        <button onClick={() => setRightView('features')} style={{
                            padding: '1rem 2rem',
                            background: t.bgSecondary,
                            border: `1px solid ${t.border}`,
                            borderRadius: '12px',
                            color: t.text,
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}>Learn More</button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        padding: '1.25rem 1.75rem',
                        background: t.bgSecondary,
                        border: `1px solid ${t.border}`,
                        borderRadius: '16px',
                        position: 'relative',
                    }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: t.accent }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: t.textMuted }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== RIGHT SIDE - DYNAMIC CONTENT ===== */}
                <div style={{ position: 'relative', minHeight: '600px' }}>
                    {/* Dashboard View */}
                    {rightView === 'dashboard' && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                            {/* Main Dashboard Card */}
                            <div style={{
                                background: t.bgSecondary,
                                borderRadius: '24px',
                                padding: '1.75rem',
                                border: `1px solid ${t.border}`,
                                boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(0,0,0,0.08)',
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Total', value: '24', color: t.accent },
                                        { label: 'Win Rate', value: '67%', color: t.profit },
                                        { label: 'Wins', value: '16', color: t.profit },
                                        { label: 'Losses', value: '8', color: t.loss },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: t.bgCard, borderRadius: '12px', padding: '1rem', textAlign: 'center', border: `1px solid ${t.border}` }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart */}
                                <div style={{
                                    background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
                                    borderRadius: '14px',
                                    padding: '1rem',
                                    height: '120px',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: '6px',
                                    marginBottom: '1.5rem',
                                }}>
                                    {[35, 50, 40, 70, 55, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                                        <div key={i} style={{
                                            flex: 1,
                                            height: `${h}%`,
                                            background: `linear-gradient(180deg, ${t.profit} 0%, ${t.profit}80 100%)`,
                                            borderRadius: '4px 4px 0 0',
                                        }} />
                                    ))}
                                </div>

                                {/* Trades */}
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginBottom: '0.75rem' }}>RECENT TRADES</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {mockTrades.map((tr, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.875rem 1rem',
                                            background: t.bgCard,
                                            borderRadius: '12px',
                                            border: `1px solid ${t.border}`,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: tr.result === 'win' ? `${t.profit}20` : `${t.loss}20`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: tr.result === 'win' ? t.profit : t.loss,
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                }}>{tr.type}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{tr.pair}</div>
                                                    <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{tr.time}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: tr.result === 'win' ? t.profit : t.loss }}>{tr.pips}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating cards */}
                            <div style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '-20px',
                                background: t.bgSecondary,
                                borderRadius: '14px',
                                padding: '0.75rem 1rem',
                                border: `1px solid ${t.border}`,
                                boxShadow: isDark ? '0 15px 40px rgba(0,0,0,0.3)' : '0 15px 40px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><MicIcon /></div>
                                <span style={{ fontSize: '0.8rem', color: t.textMuted }}>Recording...</span>
                                <div style={{ width: '8px', height: '8px', background: t.loss, borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        </div>
                    )}

                    {/* Features View */}
                    {rightView === 'features' && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                                Powerful <span style={{ color: t.accent }}>Features</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {features.map((f, i) => (
                                    <div key={i} style={{
                                        padding: '1.5rem',
                                        background: t.bgSecondary,
                                        border: `1px solid ${t.border}`,
                                        borderRadius: '16px',
                                    }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: t.accent, marginBottom: '0.875rem',
                                        }}>{f.icon}</div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{f.title}</h3>
                                        <p style={{ color: t.textMuted, fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setRightView('dashboard')} style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                background: t.bgCard,
                                border: `1px solid ${t.border}`,
                                borderRadius: '10px',
                                color: t.textMuted,
                                cursor: 'pointer',
                            }}>← Back to Dashboard</button>
                        </div>
                    )}

                    {/* Pricing View */}
                    {rightView === 'pricing' && (
                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                <span style={{ color: t.profit }}>Free</span> Forever
                            </h2>
                            <p style={{ color: t.textMuted, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Free for all loving traders forever.
                            </p>
                            <div style={{
                                padding: '2rem',
                                background: t.bgSecondary,
                                border: `2px solid ${t.accent}`,
                                borderRadius: '20px',
                            }}>
                                <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                                    $0 <span style={{ fontSize: '1rem', color: t.textMuted, fontWeight: 400 }}>/forever</span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                                    {['Unlimited trades', 'Voice journaling', 'ICT/SMC checklists', 'AI insights', 'Cloud sync', 'Export data'].map((item, i) => (
                                        <li key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.65rem 0',
                                            borderBottom: `1px solid ${t.border}`
                                        }}>
                                            <span style={{ color: t.profit }}><CheckIcon /></span>{item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/" style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '1rem',
                                    background: `linear-gradient(135deg, ${t.accent} 0%, #8b5cf6 100%)`,
                                    color: 'white',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}>Get Started Free</Link>
                            </div>
                            <button onClick={() => setRightView('dashboard')} style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                background: t.bgCard,
                                border: `1px solid ${t.border}`,
                                borderRadius: '10px',
                                color: t.textMuted,
                                cursor: 'pointer',
                            }}>← Back to Dashboard</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ padding: '2rem 4rem', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>© 2024 TrackEdge. Built for traders, Build by trader.</p>
            </footer>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
                @keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
                
                /* Hide scrollbars */
                body::-webkit-scrollbar { display: none; }
                body { -ms-overflow-style: none; scrollbar-width: none; }
                *::-webkit-scrollbar { display: none; }
                * { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
