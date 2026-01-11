import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trading Calendar',
    description: 'Visual calendar view of your trading activity. Track daily P&L, identify patterns, and optimize your trading schedule.',
    openGraph: {
        title: 'Trading Calendar | TrackEdge',
        description: 'Calendar-based trade tracking for pattern recognition and performance analysis.',
    },
};

export default function CalendarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
