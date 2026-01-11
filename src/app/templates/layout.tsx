import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trade Templates',
    description: 'Create and manage trade templates for quick journaling. Save your favorite setups and strategies for faster trade entry.',
    openGraph: {
        title: 'Trade Templates | TrackEdge',
        description: 'Reusable trade templates for efficient journaling.',
    },
};

export default function TemplatesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
