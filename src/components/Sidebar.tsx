'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { href: '/', label: 'Journal', icon: '🎙️' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/history', label: 'History', icon: '📜' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/templates', label: 'Templates', icon: '📋' },
    { href: '/ai-review', label: 'AI Review', icon: '🤖' },
    { href: '/mt5-import', label: 'MT5 Import', icon: '📥' },
    { href: '/sync', label: 'Sync', icon: '☁️' },
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
                            <span style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
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
