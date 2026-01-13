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

// Clean, simple SVG Icons
const JournalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const TemplateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const AIIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
        <circle cx="15" cy="14" r="1" fill="currentColor" />
    </svg>
);

const ImportIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const SyncIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

const BacktestIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </svg>
);

const RulebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M9 10h6" />
        <path d="M9 14h6" />
    </svg>
);

// TrackEdge Logo - Bull head with TE letters
const TrackEdgeLogo = () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        {/* Bull horns pointing up and outward */}
        <path
            d="M8 12 L4 4 M8 12 L12 8"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M32 12 L36 4 M32 12 L28 8"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Bull head outline */}
        <path
            d="M10 14 C8 18, 8 24, 12 30 L16 34 L20 32 L24 34 L28 30 C32 24, 32 18, 30 14"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />

        {/* T letter */}
        <path
            d="M12 18 L18 18 M15 18 L15 28"
            stroke="var(--color-text)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />

        {/* E letter */}
        <path
            d="M22 18 L28 18 M22 23 L26 23 M22 28 L28 28 M22 18 L22 28"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
    </svg>
);

export default function Sidebar() {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const isExpanded = isHovered;

    const navItems: NavItem[] = [
        { href: '/journal', label: 'Journal', icon: <JournalIcon /> },
        { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { href: '/history', label: 'History', icon: <HistoryIcon /> },
        { href: '/calendar', label: 'Calendar', icon: <CalendarIcon /> },
        { href: '/backtest', label: 'Backtest', icon: <BacktestIcon /> },
        { href: '/rulebook', label: 'Rulebook', icon: <RulebookIcon /> },
        { href: '/templates', label: 'Templates', icon: <TemplateIcon /> },
        { href: '/ai-review', label: 'AI Review', icon: <AIIcon /> },
        { href: '/mt5-import', label: 'MT5 Import', icon: <ImportIcon /> },
        { href: '/sync', label: 'Sync', icon: <SyncIcon /> },
    ];

    return (
        <>
            <style jsx global>{`
                .nav-link {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .nav-link:hover {
                    transform: translateX(4px);
                    background: rgba(59, 130, 246, 0.08) !important;
                }
                .nav-link:hover .nav-icon {
                    transform: scale(1.1);
                    color: #3b82f6 !important;
                }
                .nav-link:active {
                    transform: translateX(2px) scale(0.98);
                }
                .nav-icon {
                    transition: all 0.2s ease !important;
                }
                .nav-link.active:hover {
                    transform: translateX(4px);
                }
                .logo-container:hover .logo-icon {
                    transform: scale(1.05);
                }
                .logo-icon {
                    transition: transform 0.3s ease !important;
                }
            `}</style>
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: isExpanded ? '200px' : '64px',
                    height: 'calc(100vh - 32px)',
                    position: 'fixed',
                    left: '12px',
                    top: '16px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.2s ease',
                    zIndex: 100,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
            >
                {/* Logo */}
                <Link href="/" className="logo-container" style={{
                    padding: '14px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    minHeight: '68px',
                }}>
                    <div className="logo-icon" style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <TrackEdgeLogo />
                    </div>
                    {isExpanded && (
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            whiteSpace: 'nowrap',
                        }}>
                            Track<span style={{ color: '#3b82f6' }}>Edge</span>
                        </span>
                    )}
                </Link>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isItemHovered = hoveredItem === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.label}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onMouseEnter={() => setHoveredItem(item.href)}
                                onMouseLeave={() => setHoveredItem(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    color: isActive || isItemHovered ? '#3b82f6' : 'var(--color-text-muted)',
                                    background: isActive
                                        ? 'rgba(59, 130, 246, 0.12)'
                                        : isItemHovered
                                            ? 'rgba(59, 130, 246, 0.06)'
                                            : 'transparent',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.875rem',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                                }}
                            >
                                <span
                                    className="nav-icon"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isActive || isItemHovered ? '#3b82f6' : 'var(--color-text-muted)',
                                    }}
                                >
                                    {item.icon}
                                </span>
                                {isExpanded && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle */}
                <div style={{
                    padding: '12px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <ThemeToggle />
                    {isExpanded && (
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                        }}>
                            Theme
                        </span>
                    )}
                </div>
            </aside>
        </>
    );
}
