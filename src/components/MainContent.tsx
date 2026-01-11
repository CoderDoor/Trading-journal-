'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/' || pathname === '/landing';

    // Landing page: FULL SCREEN, no constraints
    if (isLandingPage) {
        return (
            <div style={{
                width: '100vw',
                minHeight: '100vh',
                marginLeft: 0,
                padding: 0,
            }}>
                {children}
            </div>
        );
    }

    // Regular pages: with sidebar margin
    return (
        <main style={{
            marginLeft: '80px',
            flex: 1,
            padding: '2rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
            }}>
                {children}
            </div>
        </main>
    );
}
