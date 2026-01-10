'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Journal' },
        { href: '/history', label: 'History' },
        { href: '/analytics', label: 'Analytics' },
        { href: '/calendar', label: 'Calendar' },
        { href: '/ai-review', label: 'AI Review' },
        { href: '/reports', label: 'Reports' },
        { href: '/import', label: 'Import' },
        { href: '/templates', label: 'Templates' },
        { href: '/sync', label: '☁️ Sync' },
    ];

    return (
        <nav className="nav-links">
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
