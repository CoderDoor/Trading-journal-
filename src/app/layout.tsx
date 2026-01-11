import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ConditionalSidebar from '@/components/ConditionalSidebar';
import MainContent from '@/components/MainContent';

// Comprehensive SEO metadata
export const metadata: Metadata = {
    title: {
        default: 'TrackEdge | Smart Trading Journal',
        template: '%s | TrackEdge'
    },
    description: 'Professional voice-first trading journal for forex, stocks, and crypto traders. Speak your trades, get structured entries, and track your edge to consistent profitability. Free ICT & SMC strategy tracking.',
    keywords: [
        'trading journal',
        'forex journal',
        'trading diary',
        'trade tracker',
        'ICT trading',
        'SMC trading',
        'smart money concepts',
        'forex trading',
        'stock trading',
        'crypto trading',
        'trading analytics',
        'trading performance',
        'voice trading journal',
        'trade analysis',
        'risk management',
        'trading psychology',
        'trading edge',
        'TrackEdge',
    ],
    authors: [{ name: 'TrackEdge Team' }],
    creator: 'TrackEdge',
    publisher: 'TrackEdge',
    applicationName: 'TrackEdge Trading Journal',
    category: 'Finance',

    // Open Graph for social sharing
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://trackedge.app',
        siteName: 'TrackEdge',
        title: 'TrackEdge | Smart Trading Journal',
        description: 'Professional voice-first trading journal. Speak your trades, get structured entries. Track ICT/SMC strategies and improve your trading performance.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'TrackEdge Trading Journal',
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: 'TrackEdge | Smart Trading Journal',
        description: 'Professional voice-first trading journal for forex, stocks, and crypto traders.',
        images: ['/og-image.png'],
        creator: '@trackedgeapp',
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Icons
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },

    // Manifest for PWA
    manifest: '/manifest.json',

    // Additional meta
    metadataBase: new URL('https://trackedge.app'),
    alternates: {
        canonical: '/',
    },

    // Verification (add your IDs when ready)
    verification: {
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
    },
};

// Viewport configuration
export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TrackEdge Trading Journal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, Windows, macOS',
    description: 'Professional voice-first trading journal for forex, stocks, and crypto traders. Track your trades with ICT and SMC strategies.',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                {/* Preconnect for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body suppressHydrationWarning>
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                    <ConditionalSidebar />
                    <MainContent>
                        {children}
                    </MainContent>
                </div>
            </body>
        </html>
    );
}
