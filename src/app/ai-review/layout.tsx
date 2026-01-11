import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Trade Review',
    description: 'Get AI-powered insights on your trading performance. Receive personalized recommendations to improve your trading edge.',
    openGraph: {
        title: 'AI Trade Review | TrackEdge',
        description: 'AI-powered trading analysis and personalized improvement suggestions.',
    },
};

export default function AIReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
