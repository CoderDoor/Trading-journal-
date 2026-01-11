import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'View your trading performance at a glance. Track win rate, profit/loss, and analyze your trading patterns with TrackEdge dashboard.',
    openGraph: {
        title: 'Trading Dashboard | TrackEdge',
        description: 'Comprehensive trading analytics dashboard. Monitor your performance and improve your edge.',
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
