'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

// SVG Icons
const MicIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);
const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);
const HistoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);
const TemplateIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
);
const AIIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);
const ImportIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);
const SyncIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
    </svg>
);

const navItems: NavItem[] = [
    { href: '/', label: 'Journal', icon: <MicIcon /> },
    { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/history', label: 'History', icon: <HistoryIcon /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarIcon /> },
    { href: '/templates', label: 'Templates', icon: <TemplateIcon /> },
    { href: '/ai-review', label: 'AI Review', icon: <AIIcon /> },
    { href: '/mt5-import', label: 'MT5 Import', icon: <ImportIcon /> },
    { href: '/sync', label: 'Sync', icon: <SyncIcon /> },
];

// TrackEdge Logo SVG Component
const TrackEdgeLogo = () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        {/* Bull head outline */}
        <path d="M8 8 L4 4 M8 8 L12 6 L16 10 L20 8 L24 10 L28 6 L32 8 M32 8 L36 4"
            stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 12 L10 28 L14 32 L20 30 L26 32 L30 28 L28 12"
            stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* T letter */}
        <path d="M14 16 L20 16 M17 16 L17 26" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" />
        {/* E letter */}
        <path d="M22 16 L28 16 M22 21 L26 21 M22 26 L28 26 M22 16 L22 26"
            stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

export default function Sidebar() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = isHovered;

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: isExpanded ? '200px' : '64px',
                height: 'calc(100vh - 32px)',
                position: 'fixed',
                left: '8px',
                top: '16px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                zIndex: 100,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
        >
            {/* Logo */}
            <Link href="/" style={{
                padding: '1rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                minHeight: '64px',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <TrackEdgeLogo />
                </div>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                }}>
                    Track<span style={{ color: '#2563eb' }}>Edge</span>
                </span>
            </Link>

            {/* Nav - NO SCROLLBAR */}
            <nav style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                overflowY: 'hidden',
                overflowX: 'hidden',
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                color: isActive ? '#2563eb' : 'var(--color-text)',
                                background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                border: isActive ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.85rem',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span style={{ minWidth: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.icon}
                            </span>
                            <span style={{
                                opacity: isExpanded ? 1 : 0,
                                transition: 'opacity 0.15s ease',
                            }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle */}
            <div style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}>
                <ThemeToggle />
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    whiteSpace: 'nowrap',
                }}>
                    Theme
                </span>
            </div>
        </aside>
    );
}
