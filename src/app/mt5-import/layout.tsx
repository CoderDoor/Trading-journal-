import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'MT5 Import',
    description: 'Import trades directly from MetaTrader 5. Automatically sync your MT5 trading history with TrackEdge journal.',
    openGraph: {
        title: 'MT5 Import | TrackEdge',
        description: 'Seamless MetaTrader 5 trade history import.',
    },
};

export default function MT5ImportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
