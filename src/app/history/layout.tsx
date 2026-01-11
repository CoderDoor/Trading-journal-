import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trade History',
    description: 'Browse, search, and analyze your complete trade history. Filter by outcome, instrument, and strategy with TrackEdge.',
    openGraph: {
        title: 'Trade History | TrackEdge',
        description: 'Complete trading history with advanced filtering and export options.',
    },
};

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
