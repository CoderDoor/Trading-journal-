import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Strategy Backtest | TrackEdge',
    description: 'Backtest your trading strategies with historical data replay and AI analysis',
};

export default function BacktestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
