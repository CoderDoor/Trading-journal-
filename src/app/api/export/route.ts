import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Export journal entries as CSV or JSON
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv'; // csv or json
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter
        const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.lte = new Date(endDate);
        }

        const entries = await prisma.journalEntry.findMany({
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
        });

        if (format === 'json') {
            // Return JSON with proper headers for download
            return new NextResponse(JSON.stringify(entries, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="trading-journal-${new Date().toISOString().split('T')[0]}.json"`,
                },
            });
        }

        // Generate CSV
        const csvHeaders = [
            'Date',
            'Instrument',
            'Trade Type',
            'Timeframe',
            'Entry Price',
            'Stop Loss',
            'Target',
            'Risk:Reward',
            'Outcome',
            'Strategy',
            'Trade Reason',
            'HTF Bias',
            'Liquidity Taken',
            'Entry at POI',
            'Risk Managed',
            'BOS',
            'MSS',
            'CHoCH',
            'Order Block',
            'FVG',
            'Kill Zone',
            'Asian Session',
            'London Session',
            'NY Session',
            'London Close',
            'Emotion State',
            'What Went Well',
            'What Went Wrong',
            'Improvement',
        ];

        const escapeCSV = (value: string | null | undefined | number | boolean): string => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = entries.map(entry => [
            new Date(entry.createdAt).toISOString().split('T')[0],
            entry.instrument,
            entry.tradeType,
            entry.timeframe,
            entry.entryPrice,
            entry.stopLoss,
            entry.target,
            entry.riskReward,
            entry.outcome,
            entry.strategyLogic,
            entry.tradeReason,
            entry.htfBiasAligned ? 'Yes' : 'No',
            entry.liquidityTaken ? 'Yes' : 'No',
            entry.entryAtPOI ? 'Yes' : 'No',
            entry.riskManaged ? 'Yes' : 'No',
            entry.bosConfirmed ? 'Yes' : 'No',
            entry.mssConfirmed ? 'Yes' : 'No',
            entry.chochConfirmed ? 'Yes' : 'No',
            entry.orderBlockEntry ? 'Yes' : 'No',
            entry.fvgEntry ? 'Yes' : 'No',
            entry.killZoneEntry ? 'Yes' : 'No',
            entry.asianSession ? 'Yes' : 'No',
            entry.londonSession ? 'Yes' : 'No',
            entry.nySession ? 'Yes' : 'No',
            entry.londonClose ? 'Yes' : 'No',
            entry.emotionState,
            entry.whatWentWell,
            entry.whatWentWrong,
            entry.improvement,
        ].map(escapeCSV).join(','));

        const csv = [csvHeaders.join(','), ...csvRows].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="trading-journal-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Failed to export data:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
}
