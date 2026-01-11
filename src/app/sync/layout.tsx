import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cloud Sync',
    description: 'Sync your trading journal across all devices. Secure cloud backup for your trade data with TrackEdge.',
    openGraph: {
        title: 'Cloud Sync | TrackEdge',
        description: 'Secure cross-device sync for your trading journal.',
    },
};

export default function SyncLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
