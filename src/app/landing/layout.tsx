import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TrackEdge | Smart Trading Journal for ICT & SMC Traders',
    description: 'The voice-first trading journal for forex, stocks, and crypto traders. Speak your trades, track ICT/SMC strategies, and find your edge with AI-powered insights. 100% free.',
    openGraph: {
        title: 'TrackEdge | Smart Trading Journal',
        description: 'Voice-first trading journal for ICT & SMC traders. Find your edge.',
        images: ['/og-image.png'],
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Landing page has no sidebar
    return (
        <div style={{ marginLeft: 0 }}>
            {children}
        </div>
    );
}
