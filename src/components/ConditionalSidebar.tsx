'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalSidebar() {
    const pathname = usePathname();

    // Don't show sidebar on landing pages
    if (pathname === '/' || pathname === '/landing') {
        return null;
    }

    return <Sidebar />;
}
