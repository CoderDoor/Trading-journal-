import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trading Rulebook | TrackEdge',
    description: 'Define your trading rules and stay disciplined',
};

export default function RulebookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
