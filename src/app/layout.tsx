import type { Metadata } from 'next';
import '@/styles/globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
    title: 'TrackEdge | Smart Trading Journal',
    description: 'Professional voice-first trading journal. Speak your trades, get structured entries. Track your edge to consistent profitability.',
    keywords: ['trading journal', 'track edge', 'forex', 'stocks', 'crypto', 'ICT', 'SMC'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body>
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                    <Sidebar />
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
                </div>
            </body>
        </html>
    );
}
